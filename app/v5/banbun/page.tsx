"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import HistoryDrawer from "../_components/HistoryDrawer";
import { loadConversations, loadActiveId } from "../_lib/chat-storage";

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

// mock：呼應「伴伴主動提醒待辦任務」story，之後接真的帳號狀態
const REMINDER = {
  text: "交易跟提領功能已暫停，請重新提交身分驗證",
  href: "/v5/account",
};

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
    router.push(`/v5/banbun/chat?prompt=${encodeURIComponent(text)}`);
  };

  // 在首頁打開的是「快速預覽」：只有實際選了對話/開新對話/看訂單才會離開首頁，
  // 純粹打開看一眼、按 X 關掉的話會留在首頁，不會憑空多一個空對話。
  const conversations = drawerOpen ? loadConversations() : [];
  const activeId = drawerOpen ? (loadActiveId() ?? undefined) : undefined;

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-white">
      {drawerOpen && (
        <HistoryDrawer
          conversations={conversations}
          activeId={activeId}
          onClose={() => setDrawerOpen(false)}
          onNewChat={() => router.push("/v5/banbun/chat?new=1")}
          onOpenConversation={(id) =>
            router.push(`/v5/banbun/chat?open=${id}`)
          }
          onOrders={() => router.push("/v5/orders")}
        />
      )}

      {/* 打開漢堡時，首頁整個往右滑出畫面，側欄改成滿版覆蓋 */}
      <div
        className="relative flex min-h-full flex-col bg-white transition-transform duration-300 ease-out"
        style={{
          transform: drawerOpen ? "translateX(100%)" : "translateX(0)",
        }}
      >
        <StatusBar />

      {/* header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            title="對話紀錄"
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

      <div className="flex flex-col gap-6 px-4 pb-[140px] pt-2">
        {/* 待辦提醒，跟紅色區塊分開顯示 */}
        <Link
          href={REMINDER.href}
          className="flex w-fit items-center gap-1.5 rounded-full bg-red-50 py-1.5 pl-1.5 pr-3"
        >
          <span className="flex size-[18px] items-center justify-center rounded-full bg-brand text-[11px] text-white">
            !
          </span>
          <span className="text-[12px] font-medium text-brand">
            {REMINDER.text}
          </span>
          <span className="text-[13px] font-bold text-brand">&rsaquo;</span>
        </Link>

        {/* hero — 沿用 v3 排版：大頭貼跟標題置中，不用色塊卡片包住 */}
        <Link
          href="/v5/banbun/chat"
          className="flex flex-col items-center gap-3 pt-2 text-center"
        >
          <img src="/illustrations/otter-face.svg" alt="伴伴" className="h-[72px]" />
          <div>
            <p className="text-[14px] text-gray-500">嗨，我是伴伴</p>
            <p className="mt-1 whitespace-pre-line text-[28px] font-black leading-[1.2] text-gray-800">
              {headline}
            </p>
          </div>
        </Link>
      </div>

      {/* 對話框固定在 tab bar 正上方（用 layout.tsx 的 contain:layout 讓 fixed 定位在手機外框內） */}
      <div className="fixed inset-x-0 bottom-[76px] z-10 flex flex-col gap-2 px-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {chips.map((p) => (
            <Link
              key={p}
              href={`/v5/banbun/chat?prompt=${encodeURIComponent(p)}`}
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
  );
}
