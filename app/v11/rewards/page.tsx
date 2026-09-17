"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusBar from "../_components/StatusBar";
import { usePageSlide } from "../_lib/page-transition";
import {
  AI_SELECT_AGED,
  AI_SELECT_CAPACITY,
  AI_SELECT_FRESH,
  AI_SELECT_HOLDING,
  LATEST_WISH,
  MEMBERSHIP_LEVEL,
  MEMBERSHIP_TIER,
  RATE_FORECAST_POOL,
  REWARD_BALANCE,
  TODAY_REWARD_AMOUNT,
  UPCOMING_WISHES,
  WINE_PICKS,
} from "../_lib/mock-data";

type SubTab = "explore" | "wishlist";

export default function RewardsPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();
  const [tab, setTab] = useState<SubTab>("explore");

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white" style={style}>
      <StatusBar />
      <div className="relative flex shrink-0 items-center justify-center px-4 pb-2 pt-3">
        <button
          onClick={() => exit(() => router.back())}
          aria-label="返回"
          className="absolute left-4 flex size-9 items-center justify-center rounded-full bg-gray-100"
        >
          <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
        </button>
        <p className="text-[15px] font-semibold text-gray-900">我的回饋</p>
      </div>

      <button
        onClick={() => router.push("/v11/reward-history")}
        className="flex shrink-0 flex-col items-center gap-1 pb-4 pt-1"
      >
        <p className="flex items-center gap-1.5 text-[28px] font-bold text-gray-900">
          <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white">
            <svg viewBox="0 0 16 16" fill="none" className="size-3">
              <path
                d="M8 12.5V3.5M8 3.5L4 7.5M8 3.5l4 4"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {REWARD_BALANCE.toLocaleString()}
        </p>
        <p className="text-[12.5px] text-gray-400">
          今天增加 +{TODAY_REWARD_AMOUNT}
        </p>
      </button>

      <div className="flex shrink-0 justify-center px-5 pb-4">
        <div className="flex w-full rounded-full bg-gray-100 p-1">
          {(
            [
              { key: "explore", label: "探索" },
              { key: "wishlist", label: "許願池" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-full py-2 text-[13.5px] font-semibold transition-colors ${
                tab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {tab === "explore" ? (
          <div className="flex flex-col gap-6">
            <div>
              <p className="pb-3 text-[14px] font-bold text-gray-800">
                智能選品
              </p>
              <div className="flex h-[168px] gap-4 rounded-[24px] bg-[#101828] p-6">
                <span className="flex size-12 shrink-0 items-center justify-center">
                  <img
                    src="/figma/ai-select-icon.svg"
                    alt=""
                    className="size-10"
                  />
                </span>
                <div className="flex flex-1 flex-col items-end justify-between">
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-[14px] text-white/40">我的酒窖</p>
                    <p className="text-[40px] font-semibold leading-[48px] text-white">
                      {AI_SELECT_HOLDING}
                    </p>
                    <p className="whitespace-nowrap text-[14px] text-white/40">
                      / {AI_SELECT_CAPACITY.toLocaleString()} 瓶
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-end gap-4 text-[14px] text-white/40">
                    <p className="flex items-center gap-1.5">
                      <span className="size-3 rounded-full bg-[#dac3a6]" />
                      初醸 {AI_SELECT_FRESH}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="size-3 rounded-full bg-[#dac3a6]" />
                      純釀 {AI_SELECT_AGED}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="pb-3 text-[14px] font-bold text-gray-800">
                線上藏酒 ›
              </p>
              <div className="flex gap-4 overflow-x-auto">
                {WINE_PICKS.map((w) => (
                  <div key={w.id} className="w-[144px] shrink-0">
                    <div className="relative mb-2 aspect-[4/5] overflow-hidden rounded-2xl bg-[#EAE7DD]">
                      <img
                        src={w.image}
                        alt={w.name}
                        className="size-full object-cover"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                        {w.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">{w.subtitle}</p>
                    <p className="line-clamp-1 text-[13px] font-semibold text-gray-800">
                      {w.name}
                    </p>
                    <p className="text-[13px] text-gray-800">${w.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="pb-3 text-[14px] font-bold text-gray-800">
                匯率預測
              </p>
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-gray-100 text-[16px]">
                  🌐
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[12px] text-gray-400">本期累積獎金</p>
                    <p className="text-[24px] font-bold text-gray-900">
                      {RATE_FORECAST_POOL.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-gray-400">我的號碼</p>
                    <p className="text-[13px] text-gray-300">尚未預測</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="pb-3 text-[14px] font-bold text-gray-800">
                智能雲會員
              </p>
              <div
                className="relative overflow-hidden rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, #ff6b6b 0%, #ff3b3b 55%, #c92e2e 100%)",
                }}
              >
                <p className="text-[12px] font-semibold tracking-wide text-white/90">
                  AIFIAN +<br />
                  MEMBER ONLY
                </p>
                <div className="mt-6 flex items-end justify-between">
                  <p className="text-[36px] font-bold text-white">
                    {MEMBERSHIP_TIER}
                  </p>
                  <p className="text-[13px] text-white/80">
                    {MEMBERSHIP_LEVEL} 級
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <p className="pb-3 text-[14px] font-bold text-gray-800">
                最新願望
              </p>
              <div className="relative h-[168px] overflow-hidden rounded-2xl bg-gray-200">
                <img
                  src={LATEST_WISH.image}
                  alt={LATEST_WISH.name}
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[13px] font-semibold">
                    {LATEST_WISH.name}
                  </p>
                  <p className="line-clamp-2 text-[12px] text-white/85">
                    {LATEST_WISH.subtitle}
                  </p>
                  <p className="mt-1 text-[12.5px] font-semibold">
                    中獎價 ${LATEST_WISH.price}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="pb-3 text-[14px] font-bold text-gray-800">
                即將實現
              </p>
              <div className="flex gap-4">
                {UPCOMING_WISHES.map((w) => (
                  <div key={w.id} className="flex-1">
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-2xl bg-gray-200">
                      <img
                        src={w.image}
                        alt={w.name}
                        className="size-full object-cover"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                        差 {w.remaining}
                      </span>
                      <div className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-white/40">
                        <div className="h-full w-2/3 rounded-full bg-brand" />
                      </div>
                    </div>
                    <p className="line-clamp-1 text-[13px] text-gray-800">
                      {w.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
