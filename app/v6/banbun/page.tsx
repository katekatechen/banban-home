"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import HistoryDrawer from "../_components/HistoryDrawer";
import { loadConversations, loadActiveId } from "../_lib/chat-storage";
import {
  PRODUCTS,
  HOLDINGS,
  TOTAL_PORTFOLIO_VALUE,
  TOTAL_PORTFOLIO_CHANGE_PCT,
} from "../_lib/mock-data";

const SERVICES = [
  {
    key: "wine",
    label: "買酒",
    desc: "送禮、投資、自己喝",
    emoji: "🍷",
    href: "/v6/banbun/chat?prompt=幫我找一支適合送禮的酒",
    disabled: false,
  },
  {
    key: "daily",
    label: "買日用品",
    desc: "生活雜貨，下單送到家",
    emoji: "🧴",
    href: "/v6/banbun/chat?prompt=我想買日用品",
    disabled: false,
  },
  {
    key: "bill",
    label: "代繳帳單",
    desc: "房租／房貸／信用卡，即將推出",
    emoji: "💳",
    href: "#",
    disabled: true,
  },
] as const;

// v6 沒有 tab bar，原本體驗頁跟兩個酒的分頁都變成首頁上的預覽卡片，
// 「看更多」才進到各自完整的頁面
const MORE_SERVICES = [
  { key: "tesla", label: "買特斯拉", tag: "消費", emoji: "🚗" },
  { key: "btc", label: "買比特幣", tag: "投資", emoji: "₿" },
  { key: "solar", label: "太陽能板發電", tag: "投資", emoji: "☀️" },
] as const;

const PROMPT_CHIPS = [
  "🥃 第一次喝威士忌，入門推薦",
  "🤔 普發一萬花在哪裡最划算？",
  "🎈 這個月有什麼回饋活動？",
  "💰 我想了解報稅的事情",
  "👍 乾拌麵推薦",
  "🌀 防災乾糧",
];

// 標題每次進首頁隨機換一句，都用同一個「你 OO，我 OO」節奏，
// 呼應伴伴從「幫你買東西」擴大成「個人助理」的定位
const HEADLINES = [
  "你想要什麼，\n我來搞定！",
  "什麼都能問，\n我來處理！",
  "你的大小事，\n我來包辦！",
  "買酒、繳費、算錢，都能找我！",
];

export default function BanbunHomePage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [homeInput, setHomeInput] = useState("");
  // 標題固定從第一句開始 render（跟 SSR 結果一致，避免 hydration mismatch），
  // 掛載後才隨機換一句，符合「每次進首頁都會換」的需求
  const [headline, setHeadline] = useState(HEADLINES[0]);
  // chips 固定先顯示前 4 個（跟 SSR 結果一致），掛載後才從全部裡隨機抽 4 個
  const [chips, setChips] = useState(PROMPT_CHIPS.slice(0, 4));
  useEffect(() => {
    setHeadline(HEADLINES[Math.floor(Math.random() * HEADLINES.length)]);
    setChips([...PROMPT_CHIPS].sort(() => Math.random() - 0.5).slice(0, 4));
  }, []);

  const submitHomeInput = () => {
    const text = homeInput.trim();
    if (!text) return;
    router.push(`/v6/banbun/chat?prompt=${encodeURIComponent(text)}`);
  };

  // 在首頁打開的是「快速預覽」：只有實際選了對話/開新對話/看訂單才會離開首頁，
  // 純粹打開看一眼、按 X 關掉的話會留在首頁，不會憑空多一個空對話。
  const conversations = drawerOpen ? loadConversations() : [];
  const activeId = drawerOpen ? (loadActiveId() ?? undefined) : undefined;
  const aiSelectPreview = HOLDINGS[1] ?? HOLDINGS[0];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      {drawerOpen && (
        <HistoryDrawer
          conversations={conversations}
          activeId={activeId}
          onClose={() => setDrawerOpen(false)}
          onNewChat={() => router.push("/v6/banbun/chat?new=1")}
          onOpenConversation={(id) =>
            router.push(`/v6/banbun/chat?open=${id}`)
          }
          onBanbun={() => setDrawerOpen(false)}
          onWineSelect={() => router.push("/v6/wine-select")}
          onAiSelect={() => router.push("/v6/ai-select")}
          onOrders={() => router.push("/v6/orders")}
          onAccount={() => router.push("/v6/account")}
        />
      )}

      {/* 打開漢堡時，首頁整個往右滑出畫面，側欄改成滿版覆蓋 */}
      <div
        className="relative flex h-full flex-col bg-white transition-transform duration-300 ease-out"
        style={{
          transform: drawerOpen ? "translateX(100%)" : "translateX(0)",
        }}
      >
        <StatusBar />

        {/* header */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              title="選單"
              className="flex size-8 items-center justify-center text-gray-800"
            >
              <svg
                width="22"
                height="22"
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
            <div className="relative flex size-8 items-center justify-center">
              <img src="/icons/nav-bell.svg" alt="通知" className="size-6" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                9
              </span>
            </div>
          </div>
          <img src="/icons/logo-aifian.svg" alt="AIFIAN" className="h-4" />
          <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
            <img src="/icons/nav-reward.svg" alt="" className="size-4" />
            <span className="text-[14px] font-medium text-gray-800">
              999,999
            </span>
          </div>
        </div>

        {/* 首頁是唯一的常駐入口，其他功能都收成這裡的預覽卡片，
            對話框 sticky 在捲動內容最下面，隨時可見、隨時可以直接問 */}
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <div className="flex flex-col gap-8 px-4 pb-4 pt-2">
            {/* hero */}
            <Link
              href="/v6/banbun/chat"
              className="flex flex-col items-center gap-3 pt-2 text-center"
            >
              <img src="/illustrations/otter-face.svg" alt="伴伴" className="h-[64px]" />
              <div>
                <p className="text-[14px] text-gray-500">嗨，我是伴伴</p>
                <p className="mt-1 whitespace-pre-line text-[26px] font-black leading-[1.2] text-gray-800">
                  {headline}
                </p>
              </div>
            </Link>

            {/* 三大服務發現 */}
            <div className="grid grid-cols-3 gap-2.5">
              {SERVICES.map((s) =>
                s.disabled ? (
                  <div
                    key={s.key}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-gray-300 px-2 py-4 text-center"
                  >
                    <span className="text-[28px] opacity-50 grayscale">
                      {s.emoji}
                    </span>
                    <p className="text-[13px] font-semibold text-gray-400">
                      {s.label}
                    </p>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      敬請期待
                    </span>
                  </div>
                ) : (
                  <Link
                    key={s.key}
                    href={s.href}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-000 px-2 py-4 text-center transition-transform active:scale-[0.97]"
                  >
                    <span className="text-[28px]">{s.emoji}</span>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {s.label}
                    </p>
                  </Link>
                ),
              )}
            </div>

            {/* 線上藏酒 預覽 */}
            <Section title="線上藏酒" moreHref="/v6/wine-select">
              <div className="no-scrollbar flex gap-3 overflow-x-auto">
                {PRODUCTS.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href="/v6/wine-select"
                    className="flex w-[104px] shrink-0 flex-col gap-1.5"
                  >
                    <div
                      className={`flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br text-[36px] ${p.gradient}`}
                    >
                      {p.emoji}
                    </div>
                    <p className="line-clamp-2 text-[12px] text-gray-700">
                      {p.name}
                    </p>
                    <p className="text-[13px] font-medium text-gray-800">
                      ${p.price}
                    </p>
                  </Link>
                ))}
              </div>
            </Section>

            {/* 智能選酒 預覽：放錢進去、持有賺回饋 */}
            <Section title="智能選酒" moreHref="/v6/ai-select">
              <Link
                href="/v6/ai-select"
                className="flex items-center gap-3 rounded-2xl bg-gray-900 px-4 py-4 text-white"
              >
                <span className="text-[28px]">🥃</span>
                <div className="flex-1">
                  <p className="text-[12px] text-gray-400">今天收到回饋</p>
                  <p className="text-[20px] font-bold text-brand">+0.22</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-gray-400">持有現值</p>
                  <p className="text-[15px] font-semibold">
                    ${TOTAL_PORTFOLIO_VALUE.toLocaleString()}{" "}
                    <span className="text-[12px] font-medium text-emerald-400">
                      (+{TOTAL_PORTFOLIO_CHANGE_PCT}%)
                    </span>
                  </p>
                </div>
              </Link>
            </Section>

            {/* 回饋許願池 預覽 */}
            <Section title="回饋許願池" moreHref="/v6/reward-marketplace">
              <Link
                href="/v6/reward-marketplace"
                className="relative flex h-[110px] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-4 text-white"
              >
                <span className="pointer-events-none absolute right-3 top-3 text-[32px] opacity-40">
                  🥽
                </span>
                <p className="text-[14px] font-bold">Apple Vision Pro</p>
                <p className="text-[12px] text-white/80">
                  現實與虛擬完美融合的新體驗
                </p>
              </Link>
            </Section>

            {/* 匯率預測 預覽 */}
            <Section title="匯率預測" moreHref="/v6/rate-forecast">
              <Link
                href="/v6/rate-forecast"
                className="flex items-center justify-between rounded-2xl bg-gray-000 px-4 py-3.5"
              >
                <div>
                  <p className="text-[12px] text-gray-500">本期累積獎金</p>
                  <p className="text-[20px] font-bold text-gray-800">
                    10,000
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-gray-500">我的號碼</p>
                  <p className="text-[13px] text-gray-400">尚未預測</p>
                </div>
              </Link>
            </Section>

            {/* 伴伴還能幫你：故意放性質不同的東西並排（消費/投資），
                重點是讓用戶感受到廣度，不是把它們歸成同一類 */}
            <Section title="伴伴還能幫你">
              <div className="grid grid-cols-3 gap-2.5">
                {MORE_SERVICES.map((s) => (
                  <div
                    key={s.key}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-gray-300 px-2 py-4 text-center"
                  >
                    <span className="text-[28px] opacity-50 grayscale">
                      {s.emoji}
                    </span>
                    <p className="text-[13px] font-semibold text-gray-400">
                      {s.label}
                    </p>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      {s.tag}．敬請期待
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* 對話框：sticky 在捲動內容最下面，往下滑其他預覽時也一直看得到 */}
          <div className="sticky bottom-0 flex flex-col gap-2 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2 backdrop-blur">
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {chips.map((p) => (
                <Link
                  key={p}
                  href={`/v6/banbun/chat?prompt=${encodeURIComponent(p)}`}
                  className="shrink-0 rounded-full border border-gray-300 bg-white px-3.5 py-2 text-[13px] text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                >
                  {p}
                </Link>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitHomeInput();
              }}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
            >
              <input
                value={homeInput}
                onChange={(e) => setHomeInput(e.target.value)}
                placeholder="你想要做什麼..."
                className="flex-1 bg-transparent px-2.5 text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-800 text-white"
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  moreHref,
  children,
}: {
  title: string;
  moreHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-semibold text-gray-800">{title}</p>
        {moreHref && (
          <Link href={moreHref} className="text-[13px] text-gray-400">
            看更多 ›
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
