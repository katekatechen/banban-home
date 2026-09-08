"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import StatusBar from "./StatusBar";
import {
  PRODUCTS,
  TODAY_REWARD_AMOUNT,
  REWARD_BALANCE,
  AI_SELECT_FRESH,
  AI_SELECT_AGED,
  AI_SELECT_HOLDING,
  RATE_FORECAST_POOL,
  MEMBERSHIP_LEVEL,
} from "../_lib/mock-data";

// 最新願望：橫向捲動的大卡，圖片＋文案照 Figma 版本
const LATEST_WISHES = [
  {
    name: "Apple Vision Pro",
    subtitle: "現實與虛擬完美融合的新體驗",
    price: "$399",
    image: "/wishes/vision-pro.png",
  },
  {
    name: "Tesla Model 3 煥新版",
    subtitle: "馭電未來，駛向自由之境",
    price: "$899",
    image: "/wishes/tesla-model3.png",
  },
  {
    name: "虹夕諾雅谷關 雙人房型住宿一晚",
    subtitle: "彷彿置身日本山林的溫泉旅行",
    price: "$299",
    image: "/wishes/hoshinoya.png",
  },
];

// 即將實現：跟 /v9/reward-marketplace 頁面同一批 mock 內容，照 Figma 版本補了圖片跟進度條
const UPCOMING_WISHES = [
  { name: "Ricoh GR III 相機", diff: "1,200", progressPct: 70, image: "/wishes/ricoh-gr3.png" },
  { name: "斑比跳跳頂級豪華露營", diff: "3,400", progressPct: 55, image: "/wishes/camping.png" },
  { name: "日本 SNOW PEAK Amenity", diff: "800", progressPct: 85, image: "/wishes/snowpeak.png" },
  { name: "饗 A Joy 晚餐乙客餐券", diff: "2,100", progressPct: 65, image: "/wishes/dinner.png" },
  { name: "虹夕諾雅 水明雙人房型住宿一晚", diff: "5,600", progressPct: 40, image: "/wishes/hoshinoya.png" },
];

const HERO_HEIGHT = 108; // px，回饋數字大字block在 progress=0 時的高度
const COLLAPSE_DISTANCE = 90; // px，捲動多少距離讓大字完全收進右上角

type SubTab = "earn" | "spend";
const SUB_TAB_ORDER: SubTab[] = ["earn", "spend"];

// 回饋頁的定位是「回饋入口」：把錢／資產投入這裡才會生回饋——
// 線上藏酒買一瓶就有登入回饋資格，跟智能選酒的回饋率是兩回事，所以分開一段講。
// 探索／許願池是同一層水平 carousel 的兩格，可以左右滑動切換（不像最外層
// 伴伴／回饋／帳號那個 tab bar，那個只能用點的），各自獨立垂直捲動——
// 捲動事件共用同一個 handler，不管在哪一格滑，都會驅動回饋大數字收合。
//
// 回饋數字是這頁的重心：一開始用大字放在標題下方，往上滑時逐漸縮小、淡出，
// 同時右上角的膠囊淡入接手，讓「這頁跟賺回饋有關」從一進來就很明確。
export default function RewardsPanel() {
  const [progress, setProgress] = useState(0);
  const [subTab, setSubTab] = useState<SubTab>("earn");
  const subScrollerRef = useRef<HTMLDivElement>(null);

  const handleVerticalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const p = Math.min(1, Math.max(0, e.currentTarget.scrollTop / COLLAPSE_DISTANCE));
    setProgress(p);
  };

  const handleSubTabScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setSubTab(SUB_TAB_ORDER[index] ?? "earn");
  };

  const goToSubTab = (tab: SubTab) => {
    const el = subScrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * SUB_TAB_ORDER.indexOf(tab), behavior: "smooth" });
    setSubTab(tab);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <StatusBar />
      <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-1">
        <p className="text-[20px] font-bold text-gray-800">回饋</p>
        <Link
          href="/v9/reward-history"
          className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
          style={{ opacity: progress, pointerEvents: progress > 0.4 ? "auto" : "none" }}
        >
          <img src="/icons/nav-reward.svg" alt="" className="size-7" />
          <span className="text-[15px] font-semibold text-gray-800">
            {REWARD_BALANCE.toLocaleString()}
          </span>
        </Link>
      </div>

      {/* 回饋數字大字：往上滑時高度跟透明度一起收，內容才會跟著往上補位，
          而不是留一塊空白——收完剛好接手右上角那顆膠囊。可以點進回饋紀錄 */}
      <Link
        href="/v9/reward-history"
        className="block shrink-0 overflow-hidden px-4"
        style={{
          height: (1 - progress) * HERO_HEIGHT,
          opacity: 1 - progress,
          pointerEvents: progress < 0.6 ? "auto" : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <img src="/icons/nav-reward.svg" alt="" className="size-8" />
          <span className="text-[42px] font-bold leading-none tracking-tight text-gray-900 tabular-nums">
            {REWARD_BALANCE.toLocaleString()}
          </span>
        </div>
        <p className="mt-2.5 text-[13px] font-medium tabular-nums text-gray-500">
          今天獲得 +{TODAY_REWARD_AMOUNT} 回饋
        </p>
      </Link>

      {/* 探索／許願池兩個 tab：探索是智能選酒／線上藏酒／匯率預測（做了會讓回饋增加），
          許願池是花既有回饋抽獎，兩邊性質相反，分頁切開看比較清楚——
          左靠齊、底線標示現在選到哪個，不用膠囊背景。
          只能點擊切換，不開放手勢滑動：許願池裡面本身就有橫向捲動的
          最新願望／即將實現，兩層水平手勢疊在一起會互搶，跟最外層
          伴伴／回饋／帳號 tab bar 同樣的處理方式。 */}
      <div className="mx-4 mb-3 flex shrink-0 items-baseline gap-6">
        <button onClick={() => goToSubTab("earn")} className="relative pb-2.5">
          <span
            className={`text-[17px] font-bold ${subTab === "earn" ? "text-gray-800" : "text-gray-300"}`}
          >
            探索
          </span>
          {subTab === "earn" && (
            <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-gray-800" />
          )}
        </button>
        <button onClick={() => goToSubTab("spend")} className="relative pb-2.5">
          <span
            className={`text-[17px] font-bold ${subTab === "spend" ? "text-gray-800" : "text-gray-300"}`}
          >
            許願池
          </span>
          {subTab === "spend" && (
            <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-gray-800" />
          )}
        </button>
      </div>

      <div
        ref={subScrollerRef}
        onScroll={handleSubTabScroll}
        className="no-scrollbar flex flex-1 overflow-x-hidden overflow-y-hidden"
      >
        {/* 探索 */}
        <div
          onScroll={handleVerticalScroll}
          className="no-scrollbar h-full w-full shrink-0 snap-center overflow-y-auto pb-[100px]"
        >
          {/* 智能選酒：把錢放進來持續生利的核心入口 */}
          <div className="mb-6">
            <p className="mb-2 px-4 text-[16px] font-bold text-gray-800">
              智能選酒
            </p>

            {/* 我的酒窖（智能選酒持有狀況）：跟線上藏酒是不同的酒窖，
                初釀／醇釀是持有時間長短的分級，醇釀持有越久回饋率越高 */}
            <Link
              href="/v9/ai-select"
              className="mx-4 flex h-[180px] flex-col justify-end rounded-[24px] bg-gray-100 p-5 text-gray-900"
            >
              <p className="text-[13px] text-gray-500">我的酒窖</p>
              <p className="mt-1.5 text-[32px] font-bold leading-none">
                {AI_SELECT_HOLDING} 瓶
              </p>
              <p className="mt-2 text-[13px] text-gray-500">
                初釀 {AI_SELECT_FRESH}．醇釀 {AI_SELECT_AGED}
              </p>
            </Link>
          </div>

          {/* 線上藏酒：買一瓶就有登入回饋資格，不是持續生利 */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between px-4">
              <p className="text-[16px] font-bold text-gray-800">線上藏酒</p>
              <Link href="/v9/wine-select" className="text-[13px] text-gray-400">
                看全部
              </Link>
            </div>

            <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
              {PRODUCTS.map((p) => (
                <Link
                  key={p.id}
                  href={`/v9/wine-select/${p.id}`}
                  className="flex w-[124px] shrink-0 flex-col gap-1.5"
                >
                  <div className="relative flex aspect-square items-center justify-center rounded-2xl bg-gray-100 text-[44px]">
                    {p.tag && (
                      <span className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-gray-000">
                        {p.tag}
                      </span>
                    )}
                    {p.emoji}
                  </div>
                  <p className="line-clamp-2 h-8 text-[12.5px] leading-snug text-gray-800">
                    {p.name}
                  </p>
                  <p className="text-[13px] font-semibold text-gray-800">
                    ${p.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* 匯率預測：不用花既有回饋，免費猜題贏回饋，仍算「賺」這一邊 */}
          <div className="mb-8 px-4">
            <p className="mb-2 text-[16px] font-bold text-gray-800">匯率預測</p>
            <Link
              href="/v9/rate-forecast"
              className="flex h-[180px] flex-col justify-end rounded-[24px] bg-gray-100 p-5 text-gray-900"
            >
              <p className="text-[13px] text-gray-500">本期累積獎金</p>
              <p className="mt-1.5 text-[32px] font-bold leading-none">
                {RATE_FORECAST_POOL.toLocaleString()}
              </p>
              <p className="mt-2 text-[13px] text-gray-500">
                我的號碼：尚未預測
              </p>
            </Link>
          </div>

          {/* 智能雲會員：即將下線的舊會員制度，功能雖然要收掉，露出還是先保留 */}
          <div className="mb-2 px-4">
            <p className="mb-2 text-[16px] font-bold text-gray-800">智能雲會員</p>
            <div className="flex h-[180px] flex-col justify-end rounded-[24px] bg-gray-100 p-5 text-gray-900">
              <p className="text-[13px] text-gray-500">智能雲會員</p>
              <p className="mt-1.5 text-[32px] font-bold leading-none">
                {MEMBERSHIP_LEVEL} 級
              </p>
              <p className="mt-2 text-[13px] text-gray-500">
                AIFIAN MEMBER ONLY
              </p>
            </div>
          </div>
        </div>

        {/* 許願池 */}
        <div
          onScroll={handleVerticalScroll}
          className="no-scrollbar flex h-full w-full shrink-0 snap-center flex-col gap-6 overflow-y-auto pb-[100px]"
        >
          <div>
            <p className="mb-2 px-4 text-[16px] font-bold text-gray-800">
              最新願望
            </p>
            <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 pr-4">
              <div className="w-1 shrink-0 snap-start" />
              {LATEST_WISHES.map((w) => (
                <Link
                  key={w.name}
                  href="/v9/reward-marketplace"
                  className="relative flex h-[180px] w-[calc(100%-32px)] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl text-white"
                >
                  <img
                    src={w.image}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="relative z-10 p-4">
                    <p className="text-[14px] font-semibold tracking-wide">
                      {w.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[16px] leading-snug">
                      {w.subtitle}
                    </p>
                    <p className="mt-2 text-[15px] font-bold">
                      中獎價 {w.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between px-4">
              <p className="text-[16px] font-bold text-gray-800">即將實現</p>
              <Link
                href="/v9/reward-marketplace"
                className="text-[13px] text-gray-400"
              >
                看全部
              </Link>
            </div>
            <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
              {UPCOMING_WISHES.map((u) => (
                <div key={u.name} className="flex w-[140px] shrink-0 flex-col gap-1.5">
                  <div className="relative flex h-[100px] flex-col justify-between overflow-hidden rounded-2xl">
                    <img
                      src={u.image}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/15" />
                    <span className="relative z-10 self-start rounded-br-2xl rounded-tl-2xl bg-gray-900 px-2 py-1 text-[11px] font-bold text-white">
                      差 {u.diff}
                    </span>
                    <div className="relative z-10 h-1 w-full bg-white/30">
                      <div
                        className="h-full bg-white"
                        style={{ width: `${u.progressPct}%` }}
                      />
                    </div>
                  </div>
                  <p className="line-clamp-1 text-[13px] text-gray-800">
                    {u.name}
                  </p>
                </div>
              ))}
              <Link
                href="/v9/reward-marketplace"
                className="flex h-[100px] w-[110px] shrink-0 items-center justify-center gap-0.5 rounded-2xl bg-gray-000 text-[13px] text-gray-400"
              >
                看全部
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
