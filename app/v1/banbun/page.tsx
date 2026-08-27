"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import HistoryDrawer from "../_components/HistoryDrawer";
import LottiePlayer from "../_components/LottiePlayer";
import { loadConversations, loadActiveId } from "../_lib/chat-storage";

const SERVICES = [
  {
    key: "wine",
    label: "買酒",
    desc: "送禮、投資、自己喝都行",
    emoji: "🍷",
    href: "/v1/banbun/chat?prompt=幫我找一支適合送禮的酒",
    disabled: false,
  },
  {
    key: "daily",
    label: "買日用品",
    desc: "生活雜貨，說一聲就好",
    emoji: "🧴",
    href: "/v1/banbun/chat?prompt=我想買日用品",
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

const PROMPT_CHIPS = [
  "幫我找一支送禮的威士忌",
  "這個月有什麼回饋活動？",
  "我想了解報稅的事",
];

// 標題每次進首頁隨機換一句，都用同一個「你 OO，我 OO」節奏，
// 呼應伴伴從「幫你買東西」擴大成「個人助理」的定位
const HEADLINES = [
  "你想要什麼，\n我來搞定！",
  "什麼都能問，\n我來處理！",
  "買酒、繳費、算錢，\n我都罩你！",
  "你的錢事，\n我來張羅！",
];

// mock：呼應「伴伴主動提醒待辦任務」story，之後接真的帳號狀態
const REMINDER = {
  text: "你上次那筆身分驗證卡住了，點一下",
  href: "/v1/account",
};

export default function BanbunHomePage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [homeInput, setHomeInput] = useState("");
  // 標題固定從第一句開始 render（跟 SSR 結果一致，避免 hydration mismatch），
  // 掛載後才隨機換一句，符合「每次進首頁都會換」的需求
  const [headline, setHeadline] = useState(HEADLINES[0]);
  useEffect(() => {
    setHeadline(HEADLINES[Math.floor(Math.random() * HEADLINES.length)]);
  }, []);

  const submitHomeInput = () => {
    const text = homeInput.trim();
    if (!text) return;
    router.push(`/v1/banbun/chat?prompt=${encodeURIComponent(text)}`);
  };

  // 在首頁打開的是「快速預覽」：只有實際選了對話/開新對話/看訂單才會離開首頁，
  // 純粹打開看一眼、按 X 關掉的話會留在首頁，不會憑空多一個空對話。
  const conversations = drawerOpen ? loadConversations() : [];
  const activeId = drawerOpen ? (loadActiveId() ?? undefined) : undefined;

  return (
    <div className="relative flex flex-col overflow-hidden bg-white">
      {drawerOpen && (
        <HistoryDrawer
          conversations={conversations}
          activeId={activeId}
          onClose={() => setDrawerOpen(false)}
          onNewChat={() => router.push("/v1/banbun/chat?new=1")}
          onOpenConversation={(id) =>
            router.push(`/v1/banbun/chat?open=${id}`)
          }
          onOrders={() => router.push("/v1/orders")}
        />
      )}

      {drawerOpen && (
        // fixed（不是 absolute）蓋住整個手機畫面高度，不受首頁內容實際高度限制，
        // 不然內容比畫面短時，下半部空白處會點不到關閉用的 overlay
        <button
          aria-label="關閉側欄"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-10"
        />
      )}

      {/* 打開漢堡時，首頁本身往右推開，露出左邊的側欄，
          呼應 ChatGPT 那種「內容推開、側欄從底下出現」的手感。
          陰影放在首頁這層的左邊，讓首頁看起來浮在側欄「上面」往右滑開，
          而不是側欄浮在首頁上面。 */}
      <div
        className="relative flex flex-col bg-white transition-transform duration-300 ease-out"
        style={{
          transform: drawerOpen ? "translateX(85%)" : "translateX(0)",
          boxShadow: drawerOpen
            ? "-8px 0 24px rgba(0,0,0,0.18)"
            : "none",
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

      <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
        {/* hero — 標題隨機換句、整合待辦提醒，輸入框放在標題下方 */}
        <div
          className="relative flex w-full flex-col overflow-hidden rounded-2xl px-5 pb-5 pt-5 text-white"
          style={{
            backgroundImage:
              "linear-gradient(168deg, #0b2250 10%, #001133 85%), linear-gradient(90deg, #ff3b3b 0%, #ff3b3b 100%)",
            backgroundBlendMode: "screen",
          }}
        >
          <LottiePlayer
            src="/lottie/otter-typing.json"
            className="pointer-events-none absolute right-0 top-0 size-[84px]"
          />

          {/* eyebrow：有待辦提醒就顯示提醒，沒有的話顯示問候語 */}
          <Link
            href={REMINDER.href}
            className="flex w-fit items-center gap-1.5 rounded-full bg-black/20 py-1 pl-1 pr-2.5"
          >
            <span className="flex size-[18px] items-center justify-center rounded-full bg-brand text-[11px]">
              !
            </span>
            <span className="text-[12px] font-medium text-white/95">
              {REMINDER.text}
            </span>
          </Link>

          <Link href="/v1/banbun/chat" className="mt-3 block pr-16">
            <p className="text-[14px] text-white/90">嗨，我是伴伴</p>
            <p className="mt-1 whitespace-pre-line text-[28px] font-black leading-[1.2]">
              {headline}
            </p>
          </Link>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitHomeInput();
            }}
            className="mt-5 flex items-center gap-2 rounded-full bg-white/95 px-2 py-1.5"
          >
            <input
              value={homeInput}
              onChange={(e) => setHomeInput(e.target.value)}
              placeholder="跟伴伴說你想要什麼..."
              className="flex-1 bg-transparent px-2.5 text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white"
            >
              ↑
            </button>
          </form>
        </div>

        {/* 三大服務發現 */}
        <div className="flex flex-col gap-3">
          <p className="text-[16px] font-semibold text-gray-800">
            伴伴可以幫你
          </p>
          <div className="flex flex-col gap-2.5">
            {SERVICES.map((s) =>
              s.disabled ? (
                <div
                  key={s.key}
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-3 opacity-60"
                >
                  <span className="text-[24px]">{s.emoji}</span>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-gray-700">
                      {s.label}
                    </p>
                    <p className="text-[12px] text-gray-400">{s.desc}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">
                    敬請期待
                  </span>
                </div>
              ) : (
                <Link
                  key={s.key}
                  href={s.href}
                  className="flex items-center gap-3 rounded-2xl bg-gray-000 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                >
                  <span className="text-[24px]">{s.emoji}</span>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-gray-800">
                      {s.label}
                    </p>
                    <p className="text-[12px] text-gray-500">{s.desc}</p>
                  </div>
                  <span className="text-gray-300">›</span>
                </Link>
              ),
            )}
          </div>
        </div>

        {/* 快速提問 chips */}
        <div className="flex flex-col gap-2">
          <p className="text-[16px] font-semibold text-gray-800">
            或直接問伴伴
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {PROMPT_CHIPS.map((p) => (
              <Link
                key={p}
                href={`/v1/banbun/chat?prompt=${encodeURIComponent(p)}`}
                className="shrink-0 rounded-full border border-gray-300 px-3.5 py-2 text-[13px] text-gray-700"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
