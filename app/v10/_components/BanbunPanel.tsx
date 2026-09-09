"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "./StatusBar";
import TopNav from "./TopNav";
import Icon from "./Icon";
import { PRODUCTS, HOLDINGS } from "../_lib/mock-data";
import { getOrders, type Order } from "../_lib/orders";

const EYEBROW = "嗨，Ben";
const HEADLINE = "你今天可能會需要";
const HOME_RECEDE_MS = 220;
const MAX_SUGGESTIONS = 4;

// 建議改成標籤（tag）樣式：統一灰階、不再每個分類配一種顏色，
// 文案也從完整句子縮成 4 個字左右的方向詞，一眼掃過去就知道每個標籤在講什麼；
// 實際的完整問句留給進聊天室之後由伴伴回答，標籤本身只負責「指方向」。
type Suggestion = {
  key: string;
  // 訂單媒合中直接連到訂單詳情，其他都是丟一句 prompt 進聊天室
  href?: string;
  prompt?: string;
  iconColor: string;
  icon: React.ReactNode;
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
  // 首頁的輸入框現在是真的可以打字，打完送出才進聊天室（帶著這句話），
  // 不是點下去就直接跳轉
  const [homeInput, setHomeInput] = useState("");

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

  useEffect(() => {
    const content = homeContentRef.current;
    if (content) content.style.animation = "homeApproach 220ms ease-out";

    const trackedProduct = PRODUCTS.find((p) => p.id === "macallan-12")!;
    const trackedProduct2 = PRODUCTS.find((p) => p.id === "louve-cortez")!;
    const sellCandidate = HOLDINGS.find((h) => h.id === "kinmen-58")!;
    const activeOrder = getOrders().find((o) => o.status === "進行中") ?? null;

    const orderCard: Suggestion | null = activeOrder
      ? {
          key: "order",
          href: `/v10/orders/${activeOrder.id}`,
          iconColor: "text-gray-800",
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 8.5-9-4.5-9 4.5v8l9 4.5 9-4.5Z" />
              <path d="m3 8.5 9 4.5 9-4.5" />
              <path d="M12 13v8" />
            </svg>
          ),
          label: `你的${activeOrder.name}還在媒合中，再等等喔`,
        }
      : null;

    const pool: Suggestion[] = [
      {
        key: "price-watch",
        prompt: `${trackedProduct.name}降價了嗎？`,
        iconColor: "text-gray-600",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.59 2.59 4 11.17V20a2 2 0 0 0 2 2h8.83l8.58-8.59a2 2 0 0 0 0-2.82l-8.4-8.4a2 2 0 0 0-2.42-.6Z" />
            <path d="M7.5 7.5h.01" />
          </svg>
        ),
        label: `你在看的${trackedProduct.name}降價囉，要不要入手？`,
      },
      {
        key: "price-watch-2",
        prompt: `${trackedProduct2.name}現在多少錢？`,
        iconColor: "text-gray-500",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
        label: `還在幫你盯著${trackedProduct2.name}的價格`,
      },
      {
        key: "sell-advice",
        prompt: `${sellCandidate.name}可以獲利了結了嗎？`,
        iconColor: "text-gray-700",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l6-6 4 4 8-8" />
            <path d="M15 7h6v6" />
          </svg>
        ),
        label: `你的${sellCandidate.name}漲不少，考慮賣掉嗎？`,
      },
      {
        key: "weekend-wine",
        prompt: "推薦適合週末喝的酒",
        iconColor: "text-gray-500",
        icon: <Icon src="/icons/cat-redwine.svg" className="size-5" />,
        label: "週末想喝點什麼？這支梅酒不錯",
      },
      {
        key: "zero-coke",
        prompt: "我想買零卡可樂",
        iconColor: "text-gray-600",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="7" y="4" width="10" height="16" rx="2" />
            <path d="M9 8h6" />
          </svg>
        ),
        label: "零卡可樂喝完了嗎？要不要補貨",
      },
      {
        key: "new-things",
        prompt: "最近大家都在買什麼？",
        iconColor: "text-gray-500",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
          </svg>
        ),
        label: "最近大家都在搶 PS5，要看看嗎？",
      },
    ];

    // 訂單媒合中優先固定露出，剩下的名額才從其他建議隨機抽
    const remainingSlots = orderCard ? MAX_SUGGESTIONS - 1 : MAX_SUGGESTIONS;
    const picked = shuffle(pool).slice(0, remainingSlots);
    setSuggestions(orderCard ? [orderCard, ...picked] : picked);
  }, []);

  return (
    <div
      ref={homeContentRef}
      className="no-scrollbar flex h-full flex-col overflow-y-auto bg-gradient-to-br from-white via-gray-100 to-gray-300"
    >
      <StatusBar />
      <TopNav />

      {/* 標題＋標籤這一整組在 TopNav 跟輸入框之間垂直置中，
          用 flex-1 + justify-center 讓上下留白平均分配，而不是貼齊上緣 */}
      <div className="flex flex-1 flex-col justify-center gap-5 px-4">
        <div>
          <p className="text-[13px] font-medium text-gray-600">{EYEBROW}</p>
          <p className="mt-1 text-[30px] font-bold leading-[1.2] tracking-tight text-gray-900">
            {HEADLINE}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3">
          {suggestions.map((s) => (
            <button
              key={s.key}
              onClick={() => (s.href ? router.push(s.href) : openChat(s.prompt))}
              className="flex max-w-[88%] items-center gap-3 rounded-full bg-white/90 px-5 py-3.5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.06)] active:opacity-70"
            >
              <span className={`flex size-5 shrink-0 items-center justify-center ${s.iconColor}`}>
                {s.icon}
              </span>
              <span className="line-clamp-1 min-w-0 text-[14px] font-medium text-gray-800">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+86px)] pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const text = homeInput.trim();
            if (!text) return;
            setHomeInput("");
            openChat(text);
          }}
          className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-3 pr-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="shrink-0 text-gray-800">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          <input
            value={homeInput}
            onChange={(e) => setHomeInput(e.target.value)}
            placeholder="想做什麼，跟伴伴說"
            className="flex-1 px-1 text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-800">
            <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <path d="M12 18v4" />
          </svg>
          <button
            type="submit"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
