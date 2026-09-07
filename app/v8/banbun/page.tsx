"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import Icon from "../_components/Icon";
import SidebarPanel from "./SidebarPanel";
import { PRODUCTS, HOLDINGS } from "../_lib/mock-data";
import { getOrders, type Order } from "../_lib/orders";

type Panel = "sidebar" | "home";
const PANEL_INDEX: Record<Panel, number> = { sidebar: 0, home: 1 };
const STORAGE_LAST_PANEL = "banbun-v8-last-panel";

function loadLastPanel(): Panel {
  try {
    const saved = sessionStorage.getItem(STORAGE_LAST_PANEL);
    return saved === "sidebar" ? "sidebar" : "home";
  } catch {
    return "home";
  }
}

// 被關掉/略過的建議卡，記在 sessionStorage，這次瀏覽就不會再出現
const STORAGE_DISMISSED_CARDS = "banbun-v8-dismissed-cards";

function loadDismissedCards(): Set<string> {
  try {
    const saved = sessionStorage.getItem(STORAGE_DISMISSED_CARDS);
    if (saved) return new Set(JSON.parse(saved));
  } catch {
    // ignore
  }
  return new Set();
}

function saveDismissedCards(keys: Set<string>) {
  try {
    sessionStorage.setItem(STORAGE_DISMISSED_CARDS, JSON.stringify([...keys]));
  } catch {
    // ignore
  }
}

const HEADLINE = "嗨 Ben，\n你今天可能會需要";

const HERO_CTA =
  "mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-bold text-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.12)]";

const HOME_RECEDE_MS = 220;

export default function BanbunHomePage() {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const homeContentRef = useRef<HTMLDivElement>(null);
  // 進行中的訂單，用來在首頁顯示「你自己的」狀態，掛載後才讀 sessionStorage
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  // 被關掉/略過的建議卡，掛載後才讀 sessionStorage（避免 SSR/CSR 不一致）
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());
  // 卡片全部被關掉時，先顯示骨架卡片，模擬伴伴正在重新生成建議
  const [regenerating, setRegenerating] = useState(false);
  // 卡片重新生成的世代編號，混進 key 裡強迫 React 真的卸載重掛卡片節點，
  // 進場動畫才會重播（單純改 dismissedCards 的話，同 key 節點只會更新不會重新進場）
  const [cardCycle, setCardCycle] = useState(0);

  const dismissCard = (key: string) => {
    setDismissedCards((prev) => {
      const next = new Set(prev).add(key);
      saveDismissedCards(next);
      return next;
    });
  };

  useEffect(() => {
    setActiveOrder(getOrders().find((o) => o.status === "進行中") ?? null);
    setDismissedCards(loadDismissedCards());
    // 一開始定位在「上次離開時的那一格」——如果是從側邊欄的功能項目點進去，
    // 按返回應該回到側邊欄，而不是每次都被拉回伴伴首頁。
    // 直接寫 scrollLeft，不能用 scrollTo({behavior:"instant"})：
    // 部分瀏覽器對 instant 的支援不穩定，會讓這次定位變成看得到的滑動動畫
    const el = scrollerRef.current;
    if (el) el.scrollLeft = el.clientWidth * PANEL_INDEX[loadLastPanel()];
    // 每次回到首頁（不管是從聊天室按返回、還是從功能頁），內容都用
    // 跟 openChat() 對稱的模糊淡入效果進場，呼應離開時的模糊淡出
    const content = homeContentRef.current;
    if (content) content.style.animation = "homeApproach 220ms ease-out";
  }, []);

  const scrollToPanel = (panel: Panel) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * PANEL_INDEX[panel], behavior: "smooth" });
  };

  // 點輸入框進聊天室前，讓首頁內容先往後模糊淡出，
  // 動畫播完才真的導航離開，呼應功能頁 pageIn/pageOut 的轉場感
  const openChat = () => {
    const el = homeContentRef.current;
    if (!el) {
      router.push("/v8/banbun/chat");
      return;
    }
    el.style.animation = `homeRecede ${HOME_RECEDE_MS}ms ease-in forwards`;
    setTimeout(() => router.push("/v8/banbun/chat"), HOME_RECEDE_MS);
  };

  // 個人化建議：直式清單，訂單媒合中/回饋來源用實色卡凸顯優先序，
  // 其他都用統一的白底卡片＋彩色 icon 圓點做出區隔，避免整排都是飽和色太吵
  const trackedProduct = PRODUCTS.find((p) => p.id === "macallan-12")!;
  const trackedProduct2 = PRODUCTS.find((p) => p.id === "louve-cortez")!;
  const sellCandidate = HOLDINGS.find((h) => h.id === "kinmen-58")!;

  const suggestionCards = [
    ...(activeOrder
      ? [
          {
            key: "order",
            href: `/v8/orders/${activeOrder.id}`,
            bg: "bg-[#2B3A55]",
            text: "text-white",
            subtext: "text-white/80",
            iconBg: "bg-white/15",
            iconColor: "text-white",
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21 8.5-9-4.5-9 4.5v8l9 4.5 9-4.5Z" />
                <path d="m3 8.5 9 4.5 9-4.5" />
                <path d="M12 13v8" />
              </svg>
            ),
            title: "訂單媒合中",
            description: activeOrder.name,
            cta: "查看訂單進度",
          },
        ]
      : []),
    {
      key: "price-watch",
      href: "/v8/banbun/chat?prompt=我追蹤的酒降價了嗎？",
      image: "/products/macallan-12.jpg",
      bg: "bg-gray-000",
      text: "text-gray-800",
      subtext: "text-gray-500",
      iconBg: "bg-red-50",
      iconColor: "text-brand",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.59 2.59 4 11.17V20a2 2 0 0 0 2 2h8.83l8.58-8.59a2 2 0 0 0 0-2.82l-8.4-8.4a2 2 0 0 0-2.42-.6Z" />
          <path d="M7.5 7.5h.01" />
        </svg>
      ),
      title: "追蹤的酒款降價了",
      description: `${trackedProduct.name}現在 $${trackedProduct.price}，比你上次追蹤時更划算`,
      cta: `$${trackedProduct.price} 入手`,
    },
    {
      key: "price-watch-2",
      href: "/v8/banbun/chat?prompt=我關注的另一支酒現在多少錢？",
      bg: "bg-gray-000",
      text: "text-gray-800",
      subtext: "text-gray-500",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      title: "持續幫你盯緊價格",
      description: `${trackedProduct2.name}現在 $${trackedProduct2.price}，我會持續幫你留意`,
      cta: `$${trackedProduct2.price} 查看`,
    },
    {
      key: "sell-advice",
      href: "/v8/banbun/chat?prompt=我手上的酒可以獲利了結了嗎？",
      image: "/products/kinmen-58.jpg",
      bg: "bg-gray-000",
      text: "text-gray-800",
      subtext: "text-gray-500",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        </svg>
      ),
      title: "建議獲利了結",
      description: `${sellCandidate.name}上漲 ${sellCandidate.changePct}%，可以考慮賣出`,
      cta: `漲 ${sellCandidate.changePct}% 賣出`,
    },
    {
      key: "weekend-wine",
      href: "/v8/banbun/chat?prompt=推薦適合週末喝的酒",
      image: "/products/plum-wine.jpg",
      bg: "bg-gray-000",
      text: "text-gray-800",
      subtext: "text-gray-500",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      icon: <Icon src="/icons/cat-redwine.svg" className="size-6 text-rose-500" />,
      title: "推薦週末適合的酒",
      description: "你之前看過的梅酒，現在有新選擇",
      cta: "看看這款梅酒",
    },
    {
      key: "zero-coke",
      href: "/v8/banbun/chat?prompt=我想買零卡可樂",
      image: "/products/coke-zero.jpg",
      bg: "bg-gray-000",
      text: "text-gray-800",
      subtext: "text-gray-500",
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="4" width="10" height="16" rx="2" />
          <path d="M9 8h6" />
        </svg>
      ),
      title: "零卡可樂",
      description: "上次買的零卡可樂要不要補貨？",
      cta: "馬上補貨",
    },
    {
      key: "new-things",
      href: "/v8/banbun/chat?prompt=最近大家都在買什麼？",
      image: "/products/ps5.jpg",
      bg: "bg-gray-000",
      text: "text-gray-800",
      subtext: "text-gray-500",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
        </svg>
      ),
      title: "看看新東西",
      description: "大家都在買這個",
      cta: "看看這台 PS5",
    },
  ];

  const visibleCards = suggestionCards.filter((c) => !dismissedCards.has(c.key));

  // 卡片全部被關掉／略過後，模擬伴伴重新生成一批新建議：
  // 先跳出跑動漸層的骨架卡撐一下場面，延遲結束後把 dismissed 清空，讓卡片重新出現。
  // 依賴陣列只放 visibleCards.length，不能加 regenerating——效果內部會呼叫
  // setRegenerating(true)，若把它列進依賴，state 一變就會立刻觸發 cleanup
  // 把剛設的 timer 清掉，卡片就會卡在骨架畫面永遠回不來。
  useEffect(() => {
    if (visibleCards.length > 0) return;
    setRegenerating(true);
    const timer = setTimeout(() => {
      setDismissedCards(new Set());
      saveDismissedCards(new Set());
      setRegenerating(false);
      setCardCycle((n) => n + 1);
    }, 1100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCards.length]);

  return (
    <div
      ref={scrollerRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        const panel: Panel =
          Math.round(el.scrollLeft / el.clientWidth) === PANEL_INDEX.sidebar
            ? "sidebar"
            : "home";
        try {
          sessionStorage.setItem(STORAGE_LAST_PANEL, panel);
        } catch {
          // ignore
        }
      }}
      // touch-pan-x：只認橫向手勢，垂直手勢交給裡面的內容自己滾動——
      // 沒有這個，橫向 snap carousel 會把垂直捲動手勢也搶走
      className="no-scrollbar flex h-full w-full touch-pan-x snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
    >
      {/* 左格：側邊欄，功能清單 + 帳號設定（v8 沒有對話紀錄，訂單紀錄收進帳號頁） */}
      <div className="h-full w-full shrink-0 snap-center">
        <SidebarPanel
          onBackToHome={() => scrollToPanel("home")}
          onAccount={() => router.push("/v8/account")}
        />
      </div>

      {/* 中格：伴伴首頁 */}
      <div className="relative h-full w-full shrink-0 snap-center">
        <div
          ref={homeContentRef}
          className="no-scrollbar flex h-full flex-col overflow-y-auto bg-white"
        >
          <StatusBar />

          {/* header：拿掉 AIFIAN logo，回饋數字也不用灰底大膠囊，
              避免搶了「伴伴」本身的存在感——只有這個首頁的 header 這樣調整，
              其他頁面的共用 header 不動 */}
          <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-1">
            <button
              onClick={() => scrollToPanel("sidebar")}
              title="選單"
              className="flex size-11 items-center justify-center rounded-full bg-white text-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              >
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                <img src="/icons/nav-reward.svg" alt="" className="size-7" />
                <span className="text-[15px] font-semibold text-gray-800">
                  999,999
                </span>
              </div>
              <button
                title="通知"
                className="relative flex size-11 items-center justify-center rounded-full bg-white text-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
              >
                <img src="/icons/nav-bell.svg" alt="通知" className="size-5" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand" />
              </button>
            </div>
          </div>

          {/* 個人化問候：固定在卡片區上方，不隨卡片捲動——
              呼應參考圖「What Are You Kraving」那種常駐標題感 */}
          <p className="shrink-0 whitespace-pre-line px-4 pb-3 text-[26px] font-black leading-[1.25] text-gray-800">
            {HEADLINE}
          </p>

          {/* 建議卡：改成一次一張的大卡＋明確 CTA（參考 Kraving 那組大卡片設計），
              直式 snap 捲動，捲到下一張時上一張的下緣會先探出頭，暗示還可以往下滑。
              賺回饋收進側邊欄，不再佔用首頁版面，首頁只剩個人化建議 */}
          <div className="relative min-h-0 flex-1">
            {/* 頂部漸層遮罩：起始色要跟標題背景（白色）完全一致，才不會自己變成
                一條看得出來的分隔線——卡片滑到這裡會先融進背景再淡出，
                而不是撞上一塊顏色不一樣的色塊 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-9 bg-gradient-to-b from-white to-transparent" />
            <div className="no-scrollbar h-full touch-pan-y snap-y snap-mandatory overflow-y-auto px-4 pb-4">
              {/* 純粹的留白，不能用 padding-top 代替：snap-mandatory 一律會找
                  最近的 snap 對齊點靠齊，padding 不是有效的 snap 點，一載入
                  就會被直接跳過（scrollTop 自動變成 padding 的量，卡片還是貼齊
                  遮罩底下）。這裡额外給 snap-start，讓「留白本身」變成合法的
                  第一個停靠點，捲動起始位置才會真的停在這裡而不是被跳過 */}
              <div className="h-9 shrink-0 snap-start" />
              {regenerating &&
              [0, 1, 2].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="shimmer-card mb-4 h-[260px] shrink-0 rounded-[32px]"
                />
              ))}
            {visibleCards.map((c, i) =>
              c.image ? (
                // 有實際商品圖的卡：圖片滿版鋪底，上面疊一層由下往上的黑色漸層
                // 讓白色文字在任何圖片上都維持可讀性，CTA 膠囊維持白底黑字不變。
                // key 帶入 cardCycle：卡片重新生成時強迫重新掛載，進場動畫才會重播
                <div
                  key={`${c.key}-${cardCycle}`}
                  className="card-enter relative mb-4 h-[260px] shrink-0 snap-start"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <Link
                    href={c.href}
                    className="relative flex h-full flex-col justify-end overflow-hidden rounded-[32px] border border-gray-100 text-white transition-transform active:scale-[0.98]"
                  >
                    <img
                      src={c.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                    <div className="relative z-10 p-5">
                      <p className="text-[19px] font-black leading-tight">
                        {c.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-[13px] leading-snug text-white/85">
                        {c.description}
                      </p>
                      <span className={HERO_CTA}>
                        {c.cta}
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      dismissCard(c.key);
                    }}
                    title="略過"
                    className="absolute right-3 top-3 z-20 flex size-7 items-center justify-center text-white"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="m6 6 12 12" />
                      <path d="m18 6-12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                // 目前只有訂單媒合中會走這個分支（其餘建議卡都已經換成商品圖），
                // 高度跟著文字內容走，不用跟其他大卡一樣固定 260px
                <div
                  key={`${c.key}-${cardCycle}`}
                  className="card-enter mb-4 shrink-0 snap-start"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <Link
                    href={c.href}
                    className={`flex items-center gap-4 overflow-hidden rounded-[32px] border border-gray-100 ${c.bg} p-5 ${c.text} transition-transform active:scale-[0.98]`}
                  >
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${c.iconBg} ${c.iconColor} shadow-[0_2px_8px_rgba(0,0,0,0.08)]`}>
                      {c.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] font-black leading-tight">
                        {c.title}
                      </p>
                      <p className={`mt-0.5 line-clamp-1 text-[13px] leading-snug ${c.subtext}`}>
                        {c.description}
                      </p>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              ),
            )}
            </div>
          </div>

          {/* 對話框：固定在畫面最下面，不隨內容捲動。
              首頁這顆是「點了就換頁進聊天室」的觸發器，不是真的輸入框——
              過去的對話紀錄只會在聊天室頁面看到，首頁保持乾淨、
              不用煩惱歷史訊息要不要塞進來 */}
          <div className="flex shrink-0 flex-col gap-2 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
            <button
              onClick={openChat}
              className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-3 pr-1.5 text-left shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                className="shrink-0 text-gray-800"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              <span className="flex-1 px-1 text-[14px] text-gray-400">
                想做什麼，跟伴伴說
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-gray-800"
              >
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <path d="M12 18v4" />
              </svg>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5" />
                  <path d="m5 12 7-7 7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
