"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import StatusBar from "../../_components/StatusBar";
import {
  AI_SELECT_AGED,
  AI_SELECT_CAPACITY,
  AI_SELECT_FRESH,
  AI_SELECT_HOLDING,
  MEMBERSHIP_LEVEL,
  MEMBERSHIP_TIER,
  RATE_FORECAST_POOL,
  REWARD_BALANCE,
  TODAY_REWARD_AMOUNT,
  WINE_SHOP_PRODUCTS,
} from "../../_lib/mock-data";

// 今天增加的數字進頁面時從 0 往上跳，強調「還在即時累積」的感覺，
// 跟下面靜態的總回饋餘額做出區隔——用 ease-out 讓它一開始跳得快、
// 快到終值時放慢，不是等速跑到底
function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

// v13 回饋分頁上方照 Figma 973:23614（第二版）：拿掉「回饋」標題列跟頭像，
// 左邊一句「今天拿到 X 的回饋！」大標，右邊是回饋數字膠囊。
// 膠囊等於是 v12 捲動時浮出的那顆：往下捲時大標捲走，膠囊改由上方的浮層
// 接手、停在同一個位置，看起來像黏在頂端，不會跟著內容一起捲掉
const PILL_TOP_PX = 8;

function BalancePill({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-[22px] bg-white py-1.5 pl-1.5 pr-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
    >
      <img src="/figma/reward-icon-hero.svg" alt="" className="size-7" />
      <span className="text-[16px] font-medium leading-6 text-gray-800">
        {REWARD_BALANCE.toLocaleString()}
      </span>
    </button>
  );
}

export default function RewardsTabPage() {
  const router = useRouter();
  const todayIncrease = useCountUp(TODAY_REWARD_AMOUNT);
  const [pinned, setPinned] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const goHistory = () => router.push("/v13/reward-history");

  const handleScroll = () => {
    setPinned((scrollRef.current?.scrollTop ?? 0) > PILL_TOP_PX);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <StatusBar />

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* 捲動後才出現的浮層：白色漸層淡入，膠囊放在跟大標旁那顆完全相同的位置 */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-[64px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95)_70%,rgba(255,255,255,0)_100%)] transition-opacity duration-200 ${
            pinned ? "opacity-100" : "opacity-0"
          }`}
        />
        {pinned && (
          <div className="absolute right-4 z-10" style={{ top: PILL_TOP_PX }}>
            <BalancePill onClick={goHistory} />
          </div>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+88px)] sm:pb-[110px]"
        >
          <div
            className="flex items-start justify-between px-4 pb-6"
            style={{ paddingTop: PILL_TOP_PX }}
          >
            <p className="text-[24px] font-semibold leading-9 text-gray-800">
              今天拿到
              <br />
              <span className="text-[28px] tabular-nums text-brand">
                {todayIncrease.toFixed(2)}
              </span>{" "}
              的回饋！
            </p>
            <div style={{ visibility: pinned ? "hidden" : "visible" }}>
              <BalancePill onClick={goHistory} />
            </div>
          </div>

          <div className="px-5">
            <div className="mt-4 flex flex-col gap-6">
              <div>
                <p className="text-[14px] font-bold text-gray-800">智能選品</p>
                <p className="mb-3 mt-1 text-[12.5px] text-gray-400">
                  AI 幫你選酒，每日回饋
                </p>
                <div className="flex flex-col gap-4 rounded-2xl bg-[#101828] p-4">
                  <p className="text-[14px] text-gray-400">總瓶數</p>
                  <div className="flex items-end justify-between">
                    <p className="text-[40px] font-semibold leading-[48px] text-white">
                      {AI_SELECT_HOLDING}
                    </p>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[12px] text-gray-400">剩餘</p>
                      <p className="text-[20px] font-bold leading-6 text-white">
                        {AI_SELECT_CAPACITY - AI_SELECT_HOLDING} 瓶
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* 進度條用百分比畫、不是照 Figma 匯出的固定 px——這樣不管
                    初釀／純釀的實際數字是多少，兩段顏色跟剩餘容量的灰色
                    尾巴都能正確按比例排列 */}
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#364153]">
                      <div
                        className="h-full bg-[#dac3a6]"
                        style={{
                          width: `${(AI_SELECT_FRESH / AI_SELECT_CAPACITY) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-[#ca9e62]"
                        style={{
                          width: `${(AI_SELECT_AGED / AI_SELECT_CAPACITY) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="size-3 rounded-full bg-[#dac3a6]" />
                        <span>初釀 {AI_SELECT_FRESH}</span>
                        <span className="size-3 rounded-full bg-[#ca9e62]" />
                        <span>純釀 {AI_SELECT_AGED}</span>
                      </div>
                      <p>{AI_SELECT_CAPACITY.toLocaleString()} 瓶</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => router.push("/v13/wine-select")}
                  className="block text-[14px] font-bold text-gray-800"
                >
                  線上藏酒 ›
                </button>
                <p className="mb-3 mt-1 text-[12.5px] text-gray-400">
                  自己挑選具備增值潛力的酒
                </p>
                {/* 卡寬用容器的百分比，不是寫死的 px——不管在哪個裝置寬度，
                兩張卡片放好之後都還會留一點空間，讓第三張卡片的邊緣
                露出來，才看得出「還可以往右滑」 */}
                <div className="no-scrollbar flex gap-4 overflow-x-auto">
                  {WINE_SHOP_PRODUCTS.map((w) => (
                    <div key={w.id} className="w-[44%] shrink-0">
                      <div className="relative mb-2 aspect-square overflow-hidden rounded-2xl bg-[#EAE7DD]">
                        <img
                          src={w.image}
                          alt={w.name}
                          className="size-full object-cover"
                        />
                        {w.tag && (
                          <span className="absolute left-2 top-2 rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                            {w.tag}
                          </span>
                        )}
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
                <p className="text-[14px] font-bold text-gray-800">匯率預測</p>
                <p className="mb-3 mt-1 text-[12.5px] text-gray-400">
                  參與活動獲得回饋
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
                <p className="text-[14px] font-bold text-gray-800">
                  智能雲會員
                </p>
                <p className="mb-3 mt-1 text-[12.5px] text-gray-400">
                  加入會員獲得每日回饋
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
          </div>
        </div>
      </div>
    </div>
  );
}
