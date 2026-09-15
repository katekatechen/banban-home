"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "./StatusBar";
import TopNav from "./TopNav";
import { PRODUCTS, HOLDINGS } from "../_lib/mock-data";
import { getOrders, type Order } from "../_lib/orders";

const HEADLINE = "嗨，今天想要做什麼？";
const HOME_RECEDE_MS = 220;
const MAX_SUGGESTIONS = 4;

// 建議維持標籤（tag）樣式：一句完整口氣的短句 + emoji，跟 Figma 首頁例圖
// （可樂補貨／每日回饋／中秋烤肉）同一種調性——實際的完整問句留給進聊天室
// 之後由伴伴回答，標籤本身只負責「指方向」。
type Suggestion = {
  key: string;
  // 訂單媒合中直接連到訂單詳情，其他都是丟一句 prompt 進聊天室
  href?: string;
  prompt?: string;
  emoji: string;
  label: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BanbunPanel() {
  const router = useRouter();
  const homeContentRef = useRef<HTMLDivElement>(null);
  // 只留最多 4 則，且每次進來都重新抽一批，貼在輸入框正上方——
  // 掛載後才計算（getOrders 讀 sessionStorage、抽籤也不能在 SSR 跟 CSR 兜不起來）
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  // 每次重新抽籤就 +1，讓標籤的 key 一定變動、逼 React 整批重新掛載，
  // 進場動畫（tag-enter）才會在按下「換一批」時重播，不會因為同名標籤
  // 剛好又被抽到、DOM 節點被沿用而跳過動畫
  const [batch, setBatch] = useState(0);
  // 首頁的輸入框現在是真的可以打字，打完送出才進聊天室（帶著這句話），
  // 不是點下去就直接跳轉
  const [homeInput, setHomeInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const hasInput = homeInput.trim().length > 0;

  // 「換一批」改成用往下拉標籤堆疊觸發，不再是常駐按鈕：手感參考 Threads
  // 串文底部那顆會隨拉動距離放大的圓形指示器。pull 是目前的拉動距離（px，
  // 含阻尼），只用來畫面渲染；真正判斷放手時要不要觸發一律讀 ref
  // （pullRef／draggingRef），避免快速滑動時 pointerup 讀到還沒 flush
  // 的舊 state、導致明明拉超過門檻卻沒有觸發
  const PULL_TRIGGER = 56;
  const PULL_MAX = 90;
  const [pull, setPull] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // 真的觸發換一批之後，讓指示器停在原地轉一圈再收回去，
  // 給使用者一個「有在重新整理」的明確回饋，不是拉過門檻就瞬間消失
  const [refreshing, setRefreshing] = useState(false);
  const pullRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartY = useRef<number | null>(null);

  const handlePullStart = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
  };

  const handlePullMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    if (!draggingRef.current) {
      // 8px 誤差範圍內先不接手，讓標籤原本的點擊（進聊天室）維持正常；
      // 往上滑則直接放棄這次手勢，不要跟原生滾動搶
      if (delta < 8) {
        if (delta < -8) dragStartY.current = null;
        return;
      }
      draggingRef.current = true;
      setIsDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    e.preventDefault();
    const damped =
      delta <= PULL_MAX ? delta : PULL_MAX + (delta - PULL_MAX) * 0.25;
    const next = Math.max(damped, 0);
    pullRef.current = next;
    setPull(next);
  };

  const handlePullEnd = () => {
    if (draggingRef.current && pullRef.current >= PULL_TRIGGER) {
      rollSuggestions();
      setRefreshing(true);
      window.setTimeout(() => setRefreshing(false), 550);
    }
    dragStartY.current = null;
    draggingRef.current = false;
    pullRef.current = 0;
    setIsDragging(false);
    setPull(0);
  };

  // 觸發後指示器／標籤堆疊改停在固定的門檻位置轉圈，放手瞬間的實際拉動
  // 距離（可能超過門檻）不再影響畫面，等 refreshing 結束才一起彈回原位
  const effectivePull = refreshing ? PULL_TRIGGER : pull;

  const openChat = (prompt?: string) => {
    const el = homeContentRef.current;
    // 帶一個每次都不一樣的 _t，逼 Next.js 的 router cache 認為這是全新網址、
    // 一定重新掛載聊天室頁面——不然同一個路徑再次進入會直接沿用快取的
    // 元件實例，ChatClient 的掛載 effect 不會重跑，「每次都像開新對話」
    // 這件事就會失效（歷史訊息還停在上次結束的狀態，往上滑自然滑不到東西）
    const params = new URLSearchParams();
    if (prompt) params.set("prompt", prompt);
    params.set("_t", Date.now().toString());
    const target = `/v10/banbun/chat?${params.toString()}`;
    if (!el) {
      router.push(target);
      return;
    }
    el.style.animation = `homeRecede ${HOME_RECEDE_MS}ms ease-in forwards`;
    setTimeout(() => router.push(target), HOME_RECEDE_MS);
  };

  const rollSuggestions = () => {
    const trackedProduct = PRODUCTS.find((p) => p.id === "macallan-12")!;
    const sellCandidate = HOLDINGS.find((h) => h.id === "kinmen-58")!;
    const activeOrder = getOrders().find((o) => o.status === "進行中") ?? null;

    const orderCard: Suggestion | null = activeOrder
      ? {
          key: "order",
          href: `/v10/orders/${activeOrder.id}`,
          emoji: "📦",
          label: `你的${activeOrder.name}還在媒合中，再等等喔`,
        }
      : null;

    const pool: Suggestion[] = [
      {
        key: "restock-drink",
        prompt: "我想買可樂",
        emoji: "🥤",
        label: "上次買的可樂喝完了嗎？要不要補貨",
      },
      {
        key: "daily-reward",
        prompt: "我想看智能選品",
        emoji: "🎉",
        label: "你的每日回饋突破 100 元！再買點智能選品？",
      },
      {
        key: "mid-autumn",
        prompt: "推薦適合中秋烤肉喝的酒",
        emoji: "🍖",
        label: "中秋烤肉想喝點什麼嗎？",
      },
      {
        key: "price-watch",
        prompt: `${trackedProduct.name}降價了嗎？`,
        emoji: "🏷️",
        label: `你在看的${trackedProduct.name}降價囉，要不要入手？`,
      },
      {
        key: "price-watch-2",
        prompt: "PS5 Pro 現在多少錢？",
        emoji: "👀",
        label: "監控 PS5 Pro 的價格",
      },
      {
        key: "sell-advice",
        prompt: `${sellCandidate.name}可以獲利了結了嗎？`,
        emoji: "📈",
        label: `你的${sellCandidate.name}漲不少，考慮賣掉嗎？`,
      },
    ];

    // 訂單媒合中優先固定露出，剩下的名額才從其他建議隨機抽
    const remainingSlots = orderCard ? MAX_SUGGESTIONS - 1 : MAX_SUGGESTIONS;
    const picked = shuffle(pool).slice(0, remainingSlots);
    setSuggestions(orderCard ? [orderCard, ...picked] : picked);
    setBatch((b) => b + 1);
  };

  useEffect(() => {
    rollSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={homeContentRef}
      className="flex h-full flex-col overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgb(249, 250, 251) 0%, rgb(249, 250, 251) 100%), linear-gradient(114.70823233200596deg, rgb(246, 244, 238) 14.286%, rgb(240, 242, 239) 53.571%, rgb(211, 223, 227) 85.714%)",
      }}
    >
      <StatusBar />
      <TopNav />

      {/* 只有大頭貼＋問候語＋標題在這個區塊垂直置中，標籤跟輸入框
          另外分到下面那組，固定貼在 tabbar 正上方，不會被這裡的置中邏輯影響 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        {/* 這份頭像檔本身就包含深色圓底＋陰影＋伴伴臉，不用再另外疊 bg/shadow */}
        <img src="/figma/hero-avatar-v2.png" alt="伴伴" className="size-[104px]" />
        <p className="text-[24px] font-bold leading-[32px] text-[#101828]">
          {HEADLINE}
        </p>
      </div>

      {/* 標籤＋輸入框固定在最下面、貼著 tabbar 上緣：標籤在輸入框正上方，
          輸入框本身不會因為上面內容多寡而被推來推去。101px = TabBar 那顆藥丸
          實際的高度（nav 的 py-0.5 + 分頁項目 py-9 + icon/label 內容 ≈ 59px）
          加上 TabBar 外層 pb-[34px] 的安全區留白，再加上要求的 8px 間距 */}
      <div className="flex shrink-0 flex-col gap-4 px-4 pb-[101px] pt-4">
        <div className="relative">
          {/* 往下拉標籤堆疊才會露出來的重新整理指示器：藏在標籤堆疊正上方，
              隨拉動距離淡入放大，拉超過 PULL_TRIGGER 會變成品牌紅；放手後
              若有觸發換一批，圖示會轉一圈才收回去，不是瞬間消失 */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
            style={{ transform: `translateY(${effectivePull / 2 - 16}px)` }}
          >
            <div
              className="flex size-8 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  refreshing || pull >= PULL_TRIGGER
                    ? "var(--color-primary)"
                    : "#1e2939",
                opacity: refreshing ? 1 : Math.min(pull / 24, 1),
                transform: `scale(${refreshing ? 1 : Math.min(0.5 + (pull / PULL_TRIGGER) * 0.5, 1)})`,
              }}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className={`size-3.5 ${refreshing ? "pull-spin" : ""}`}
                style={
                  refreshing
                    ? undefined
                    : {
                        transform: `rotate(${Math.min(pull / PULL_TRIGGER, 1) * 270}deg)`,
                      }
                }
                aria-hidden
              >
                <path
                  d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div
            className="flex flex-col items-start gap-2"
            onPointerDown={handlePullStart}
            onPointerMove={handlePullMove}
            onPointerUp={handlePullEnd}
            onPointerCancel={handlePullEnd}
            style={{
              transform: `translateY(${effectivePull}px)`,
              transition: isDragging
                ? "none"
                : "transform 320ms cubic-bezier(0.16, 1, 0.3, 1)",
              touchAction: "none",
            }}
          >
            {suggestions.map((s, index) => (
              <button
                key={`${batch}-${s.key}`}
                onClick={() =>
                  s.href ? router.push(s.href) : openChat(s.prompt)
                }
                className="tag-enter flex max-w-full items-center gap-2 rounded-[999px] bg-white px-4 py-2.5 text-left shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]"
                style={{
                  animationDelay: `${(suggestions.length - 1 - index) * 90}ms`,
                }}
              >
                <span className="w-5 shrink-0 text-[20px] leading-none">
                  {s.emoji}
                </span>
                <span className="line-clamp-1 min-w-0 text-[14px] text-gray-800">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 外層是會跑動的漸層「邊框」：真正的邊框只是內層白色表單跟外層之間
            露出的 1.5px 縫隙。顏色是一段比容器寬很多的橫向漸層，靠動畫把
            background-position 往同一個方向（往右）持續平移，所有顏色永遠
            往同一個方向跑，不會有旋轉造成兩端速度/方向看起來不一致的問題。
            輸入框 focus 時拿掉跑動的 class，漸層顏色停在當下那個瞬間的位置 */}
        <div
          className={`relative rounded-[999px] p-[1.5px] shadow-[0px_4px_36px_0px_rgba(0,0,0,0.12)] ${inputFocused ? "" : "input-gradient-flow"}`}
          style={{
            backgroundImage:
              "linear-gradient(90deg, #91fff8, #8b5cf6, #ff6ec7, #91fff8, #8b5cf6, #ff6ec7, #91fff8)",
            backgroundSize: "300% 100%",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = homeInput.trim();
              if (!text) return;
              setHomeInput("");
              openChat(text);
            }}
            className="relative flex items-center gap-2 rounded-[999px] bg-white p-3"
          >
            <img src="/figma/plus.svg" alt="" className="size-6 shrink-0" />
            <input
              value={homeInput}
              onChange={(e) => setHomeInput(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="什麼都可以問伴伴"
              className="flex-1 text-[14px] text-gray-800 outline-none placeholder:text-[#a1a6ab]"
            />
            <span className="flex size-9 shrink-0 items-center justify-center">
              <img src="/figma/mic.svg" alt="語音輸入" className="size-5" />
            </span>
            {/* 還沒輸入內容時按鈕是灰色，打字之後才變成品牌紅，讓「可以送出了」這件事
                一眼就看得出來，不用等按下去才發現沒反應 */}
            <button
              type="submit"
              disabled={!hasInput}
              className={`flex size-9 shrink-0 items-center justify-center rounded-[999px] transition-colors ${
                hasInput ? "bg-brand" : "bg-gray-400"
              }`}
            >
              <img src="/figma/arrow-up.svg" alt="送出" className="size-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
