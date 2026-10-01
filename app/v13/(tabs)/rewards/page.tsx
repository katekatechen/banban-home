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

          {/* 以下四個區塊照 Figma 973:23671：每段都是「16px 粗體標題＋灰色副標」
              的區塊標題（上下各 16px），底下接內容卡片，左右統一 16px */}
          <section className="px-4">
            <SectionTitle title="智能選酒" subtitle="AI 幫你選酒，每日回饋" />
            <div className="flex flex-col gap-6 rounded-[24px] border border-black bg-[#101828] px-4 pb-6 pt-4 shadow-[0px_8px_12px_rgba(0,0,0,0.16)]">
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-[18px] text-gray-400">
                  總瓶數
                </p>
                <img
                  src="/figma/v13-nav-arrow-right.svg"
                  alt=""
                  className="size-6"
                />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[40px] font-semibold leading-[48px] text-white">
                  {AI_SELECT_HOLDING}
                </p>
                <div className="flex flex-col gap-2">
                  {/* 進度條用百分比畫、不是照 Figma 匯出的固定 px：初釀、純釀
                      兩段依實際數字排列，剩餘容量露出底下的深灰軌道 */}
                  <div className="flex h-2 w-full overflow-hidden rounded-[4px] bg-[#364153]">
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
                  <div className="flex items-center justify-between text-[12px] leading-4 text-gray-400">
                    <div className="flex items-center gap-1">
                      <img
                        src="/figma/v13-dot-fresh.svg"
                        alt=""
                        className="size-3"
                      />
                      <span>初釀 {AI_SELECT_FRESH}</span>
                      <img
                        src="/figma/v13-dot-aged.svg"
                        alt=""
                        className="size-3"
                      />
                      <span>純釀 {AI_SELECT_AGED}</span>
                    </div>
                    <p>{AI_SELECT_CAPACITY.toLocaleString()} 瓶</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4">
            <button
              onClick={() => router.push("/v13/wine-select")}
              className="block w-full px-4 py-4 text-left"
            >
              <span className="flex items-center gap-1">
                <span className="text-[16px] font-bold text-gray-800">
                  線上藏酒
                </span>
                <img
                  src="/figma/v13-nav-arrow-right-20.svg"
                  alt=""
                  className="size-5"
                />
              </span>
              <span className="mt-1 block text-[14px] leading-[18px] text-gray-400">
                自己挑選具備增值潛力的酒
              </span>
            </button>
            {/* 卡寬固定 168px（照 Figma），兩張排完會露出第三張的邊緣，
                看得出還可以往右滑 */}
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
              {WINE_SHOP_PRODUCTS.map((w) => (
                <div
                  key={w.id}
                  className="w-[168px] shrink-0 overflow-hidden rounded-[8px]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[16px] bg-[#EAE7DD]">
                    <img
                      src={w.image}
                      alt={w.name}
                      className="size-full object-cover"
                    />
                    {w.tag && (
                      <span className="absolute left-3 top-3 flex h-[22px] items-center rounded-[10px] bg-[rgba(27,31,38,0.6)] px-2 text-[12px] font-semibold leading-4 tracking-[0.12px] text-gray-000">
                        {w.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 px-2 py-3">
                    <p className="text-[12px] leading-4 tracking-[0.12px] text-gray-500">
                      {w.subtitle}
                    </p>
                    <p className="line-clamp-2 h-9 text-[14px] font-medium leading-[18px] tracking-[0.42px] text-gray-800">
                      {w.name}
                    </p>
                    <p className="text-[14px] leading-[18px] text-gray-800">
                      ${w.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <div className="px-4">
              <SectionTitle title="匯率預測" subtitle="每週參與活動獲得回饋" />
            </div>
            <div className="px-4">
              <div className="flex h-[168px] flex-col gap-12 rounded-[16px] border border-gray-200 bg-white p-4 drop-shadow-[0px_8px_8px_rgba(0,0,0,0.04)]">
                {/* 美元＋歐元兩面國旗疊在一起：美國國旗用 Figma 的圓形遮罩裁切，
                    歐盟國旗疊在右邊 */}
                <div className="relative h-7 w-10 overflow-hidden">
                  <div className="absolute left-0 top-px size-[26px] overflow-hidden">
                    <div
                      className="absolute inset-[0.21%_-87.18%_-0.45%_-24.06%]"
                      style={{
                        maskImage: 'url("/figma/fx-group.svg")',
                        WebkitMaskImage: 'url("/figma/fx-group.svg")',
                        maskSize: "26px 26px",
                        WebkitMaskSize: "26px 26px",
                        maskPosition: "6.256px -0.053px",
                        WebkitMaskPosition: "6.256px -0.053px",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                      }}
                    >
                      <img
                        src="/figma/fx-group1.svg"
                        alt=""
                        className="absolute inset-0 size-full max-w-none"
                      />
                    </div>
                  </div>
                  <img
                    src="/figma/v13-fx-flag-eu.svg"
                    alt=""
                    className="absolute left-3 top-0 size-7"
                  />
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-[14px] leading-[18px] text-gray-400">
                      本期累積獎金
                    </p>
                    <p className="text-[34px] font-semibold leading-10 text-gray-800">
                      {RATE_FORECAST_POOL.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[14px] leading-[18px] text-gray-400">
                      我的號碼
                    </p>
                    <p className="text-[24px] font-bold leading-8 text-gray-200">
                      尚未預測
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4">
            <div className="px-4">
              <SectionTitle
                title="智能雲會員"
                subtitle="加入會員獲得每日回饋"
              />
            </div>
            <div className="px-4">
              <div className="relative flex h-[160px] flex-col justify-end overflow-hidden rounded-[16px] bg-[#ff7875] p-4 shadow-[0px_2px_20px_0px_rgba(165,204,194,0.2)]">
                {/* 背景幾何圖形照 Figma 用 difference 混色疊在珊瑚紅底上 */}
                <img
                  src="/figma/aifi-bg-pattern.svg"
                  alt=""
                  className="pointer-events-none absolute left-[calc(50%-111.54px)] top-[calc(50%-18.22px)] h-[326.691px] w-[327.11px] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
                />
                <p className="absolute left-4 top-4 text-[10px] leading-[1.48] tracking-[0.8px] text-white">
                  <span className="font-black">AIFIAN ✦</span>
                  <br />
                  MEMBER ONLY
                </p>
                <div className="relative flex flex-col items-end gap-2 self-end p-2">
                  <p className="text-[40px] font-semibold leading-[48px] text-white">
                    {MEMBERSHIP_TIER}
                  </p>
                  <img
                    src="/figma/divider-line.svg"
                    alt=""
                    className="h-px w-16"
                  />
                  <p className="text-center text-[20px] font-semibold leading-6 text-[rgba(254,254,254,0.4)]">
                    {MEMBERSHIP_LEVEL} 級
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-1 py-4">
      <p className="text-[16px] font-bold text-gray-800">{title}</p>
      <p className="text-[14px] leading-[18px] text-gray-400">{subtitle}</p>
    </div>
  );
}
