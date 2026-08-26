"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import HistoryDrawer from "../_components/HistoryDrawer";
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

export default function BanbunHomePage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 在首頁打開的是「快速預覽」：只有實際選了對話/開新對話/看訂單才會離開首頁，
  // 純粹打開看一眼、按 X 關掉的話會留在首頁，不會憑空多一個空對話。
  const conversations = drawerOpen ? loadConversations() : [];
  const activeId = drawerOpen ? (loadActiveId() ?? undefined) : undefined;

  return (
    <div className="relative flex flex-col bg-white">
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
        {/* reminder card — 呼應「伴伴主動提醒待辦任務」story */}
        <Link
          href="/v1/account"
          className="flex items-center gap-3 rounded-2xl bg-gray-800 px-4 py-3 text-white"
        >
          <span className="text-[20px]">⚠️</span>
          <div className="flex-1">
            <p className="text-[14px] font-semibold">
              你上次那筆身分驗證卡住了
            </p>
            <p className="text-[12px] text-gray-300">要不要現在弄一下？</p>
          </div>
          <span className="text-gray-400">›</span>
        </Link>

        {/* banner — 沿用既有 Figma 設計的伴伴入口視覺 */}
        <Link
          href="/v1/banbun/chat"
          className="relative flex h-[180px] w-full flex-col justify-center overflow-hidden rounded-2xl px-5 text-white"
          style={{
            backgroundImage:
              "linear-gradient(168deg, #0b2250 10%, #001133 85%), linear-gradient(90deg, #ff3b3b 0%, #ff3b3b 100%)",
            backgroundBlendMode: "screen",
          }}
        >
          <p className="text-[14px] text-white/90">嗨，我是伴伴</p>
          <p className="mt-1 text-[24px] font-black leading-[1.25]">
            你想要什麼，
            <br />
            我來買！
          </p>
          <span className="absolute bottom-4 right-4 text-[64px] opacity-90">
            🦦
          </span>
        </Link>

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
    </div>
  );
}
