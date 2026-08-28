"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import LottiePlayer from "../_components/LottiePlayer";
import { useDrawer } from "../_components/DrawerContext";

const SERVICES = [
  {
    key: "wine",
    label: "買酒",
    desc: "送禮、投資、自己喝",
    emoji: "🍷",
    href: "/v3/banbun/chat?prompt=幫我找一支適合送禮的酒",
    disabled: false,
  },
  {
    key: "daily",
    label: "買日用品",
    desc: "生活雜貨，下單送到家",
    emoji: "🧴",
    href: "/v3/banbun/chat?prompt=我想買日用品",
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
  href: "/v3/account",
};

export default function BanbunHomePage() {
  const router = useRouter();
  const { openDrawer } = useDrawer();
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
    router.push(`/v3/banbun/chat?prompt=${encodeURIComponent(text)}`);
  };

  return (
    <div className="flex min-h-full flex-col bg-white">
      <StatusBar />

      {/* header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={openDrawer}
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

      {/* 可捲動內容：提醒、招呼語、伴伴可以幫你 */}
      <div className="flex flex-1 flex-col gap-6 px-4 pb-4 pt-2">
        <div className="flex flex-col gap-3">
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

          {/* hero — 招呼語 + 標題，輸入框跟 chips 都移到最下面，像常見的 AI 對話 app */}
          <div className="relative flex w-full flex-col overflow-hidden rounded-2xl bg-brand px-5 py-6 text-white">
            <Link href="/v3/banbun/chat" className="block pr-20">
              <p className="text-[14px] text-white/90">嗨，我是伴伴</p>
              <p className="mt-1 whitespace-pre-line text-[28px] font-black leading-[1.2]">
                {headline}
              </p>
            </Link>

            <LottiePlayer
              src="/lottie/otter-typing.json"
              className="pointer-events-none absolute -bottom-6 right-1 z-0 size-[140px]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[16px] font-semibold text-gray-800">
            伴伴可以幫你
          </p>
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
                  <p className="text-[11px] leading-tight text-gray-500">
                    {s.desc}
                  </p>
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      {/* 底部固定的對話框，跟一般常見的 AI 對話 app 一樣：快速提問在輸入框正上方 */}
      <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-gray-100 bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {chips.map((p) => (
            <Link
              key={p}
              href={`/v3/banbun/chat?prompt=${encodeURIComponent(p)}`}
              className="shrink-0 rounded-full border border-gray-300 px-3.5 py-2 text-[13px] text-gray-700"
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
          className="flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1.5"
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
  );
}
