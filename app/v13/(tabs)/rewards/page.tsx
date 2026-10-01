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

// 這版回饋分頁沒有探索／許願池子分頁——許願池搬去兌換分頁了，
// 回饋分頁本身是 tabbar 的三個根路由之一，不是推頁進來的，
// 所以沒有返回鍵，是「回饋」置左的標題＋右上角頭像
// 大數字捲出去多少之後，才讓上方導覽列冒出回饋數字——用大數字區塊
// 自己的高度當門檻，不用寫死一個猜的 px 值
const REVEAL_THRESHOLD = 64;

// 導覽列改成浮在內容上面的漸層，不是佔自己一排空間的實色色塊——
// 內容捲上來的時候是自然淡出、不是撞到一條硬邊界。頭部實際內容高度
// 在桌機預覽（sm+，StatusBar 有假的 9:41 那行）跟真手機瀏覽器
// （<sm，StatusBar 只留安全區、沒有文字行）差了一大截——量出來分別是
// 96px 跟 56px，兩邊要分開設 GRADIENT 高度＋內容 paddingTop，不然真手機
// 會照桌機的 112px 留白，跟真正的頭部高度差了 56px，看起來間距過大。
// GRADIENT 高度都比實際內容高一截（+16px），讓漸層尾巴有地方淡出；
// 內容的 paddingTop 對齊 GRADIENT 高度，不是實際內容高度，不然靜止狀態
// 的內容會被半透明的漸層尾巴洗到
const HEADER_GRADIENT_CLASS =
  "h-[72px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95)_78%,rgba(255,255,255,0)_100%)] sm:h-[112px] sm:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95)_85.7%,rgba(255,255,255,0)_100%)]";
const HEADER_PADDING_CLASS = "pt-[72px] sm:pt-[112px]";

export default function RewardsTabPage() {
  const router = useRouter();
  const [showBalancePill, setShowBalancePill] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayIncrease = useCountUp(TODAY_REWARD_AMOUNT);

  const handleScroll = () => {
    const top = scrollRef.current?.scrollTop ?? 0;
    setShowBalancePill(top > REVEAL_THRESHOLD);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 ${HEADER_GRADIENT_CLASS}`}
      >
        <div className="pointer-events-auto">
          <StatusBar />
          <div className="relative flex shrink-0 items-center justify-between px-5 pb-2 pt-1">
            <p className="text-[20px] font-bold text-gray-900">回饋</p>
            <div className="flex items-center gap-2">
              {/* 往下滑超過大數字區塊才會出現，跟兌換頁常駐的那顆藥丸是同一顆，
                  捲動時淡入淡出，不是瞬間跳出來 */}
              <button
                onClick={() => router.push("/v13/reward-history")}
                className={`flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)] transition-opacity duration-200 ${
                  showBalancePill ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
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
                <span className="text-[14px] font-medium text-gray-800">
                  {REWARD_BALANCE.toLocaleString()}
                </span>
              </button>
              <button
                onClick={() => router.push("/v13/account")}
                aria-label="帳號"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
              >
                <img src="/figma/v12-profile.svg" alt="" className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto overscroll-contain px-5 pb-[110px] ${HEADER_PADDING_CLASS}`}
      >
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
          <button
            onClick={() => router.push("/v13/reward-history")}
            className="flex flex-1 flex-col items-start gap-2"
          >
            <p className="text-[14px] font-semibold text-gray-800">今天增加</p>
            <div className="flex items-center gap-1">
              <img
                src="/figma/reward-icon-hero.svg"
                alt=""
                className="size-6"
              />
              <p className="text-[24px] font-semibold leading-[32px] text-brand">
                {todayIncrease.toFixed(1)}
              </p>
            </div>
          </button>
          <button
            onClick={() => router.push("/v13/reward-history")}
            className="flex flex-1 flex-col items-end gap-2"
          >
            <p className="text-[14px] font-semibold text-gray-800">我的回饋</p>
            <div className="flex items-center">
              <p className="text-[24px] font-semibold leading-[32px] text-gray-800">
                {REWARD_BALANCE.toLocaleString()}
              </p>
              <img src="/figma/nav-arrow-right.svg" alt="" className="size-6" />
            </div>
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-6">
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
            <p className="text-[14px] font-bold text-gray-800">智能雲會員</p>
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
                <p className="text-[13px] text-white/80">{MEMBERSHIP_LEVEL} 級</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
