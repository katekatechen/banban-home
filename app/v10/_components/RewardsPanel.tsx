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
  AI_SELECT_CAPACITY,
  RATE_FORECAST_POOL,
  MEMBERSHIP_TIER,
  MEMBERSHIP_LEVEL,
} from "../_lib/mock-data";

// 最新願望：橫向捲動的大卡，圖片＋文案照 Figma「回饋／許願池」節點還原
const LATEST_WISHES = [
  {
    name: "Apple Vision Pro",
    subtitle: "現實與虛擬完美融合的新體驗，標題超過兩行會點點點",
    price: "1890",
    image: "/figma/wish-visionpro.png",
  },
  {
    name: "Tesla Model 3 煥新版",
    subtitle: "馭電未來，駛向自由之境",
    price: "899",
    image: "/figma/wish-tesla.png",
  },
  {
    name: "虹夕諾雅谷關 雙人房型住宿一晚",
    subtitle: "彷彿置身日本山林的溫泉旅行",
    price: "299",
    image: "/figma/wish-onsen.png",
  },
];

// 即將實現：跟 /v10/reward-marketplace 頁面同一批內容
const UPCOMING_WISHES = [
  { name: "Ricoh GR III 相機", diff: "400", progressPct: 95, image: "/figma/wish-camera.png" },
  { name: "斑比跳跳頂級豪華露營", diff: "256", progressPct: 95, image: "/figma/wish-camping.png" },
  { name: "日本 SNOW PEAK Amenity", diff: "1,200", progressPct: 70, image: "/figma/wish-snowpeak.png" },
  { name: "饗 A Joy 晚餐乙客餐券", diff: "800", progressPct: 85, image: "/figma/wish-dinner.png" },
];

const HERO_HEIGHT = 104; // px，回饋數字大字block在 progress=0 時的高度
const SWITCHER_HEIGHT = 64; // px，探索／許願池切換鈕在 progress=0 時的高度
const COLLAPSE_DISTANCE = 90; // px，捲動多少距離讓大字完全收進右上角
const FIXED_HEADER_HEIGHT = 88; // px，StatusBar(44) + 標題列(44)，固定不透明的區域高度
const HEADER_GRADIENT_HEIGHT = 112; // px，連同下面漸層淡出的尾巴，疊在內容上方的總高度——
// 下面內容區塊的 paddingTop 一定要等於這個值（不是 FIXED_HEADER_HEIGHT），
// 內容才會整個避開漸層，不會被半透明的尾巴蓋到而看起來變淡

type SubTab = "earn" | "spend";
const SUB_TAB_ORDER: SubTab[] = ["earn", "spend"];

// 回饋頁的定位是「回饋入口」：把錢／資產投入這裡才會生回饋——
// 線上藏酒買一瓶就有登入回饋資格，跟智能選酒的回饋率是兩回事，所以分開一段講。
// 探索／許願池是同一層水平 carousel 的兩格，可以左右滑動切換（不像最外層
// 伴伴／回饋／帳號那個 tab bar，那個只能用點的），各自獨立垂直捲動——
// 捲動事件共用同一個 handler，不管在哪一格滑，都會驅動回饋大數字收合，
// 同時把上方的「回饋」標題換成探索／許願池切換鈕，照 Figma 捲動後的版面走。
export default function RewardsPanel() {
  const [progress, setProgress] = useState(0);
  const [subTab, setSubTab] = useState<SubTab>("earn");
  const subScrollerRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const wishlistRef = useRef<HTMLDivElement>(null);

  const handleVerticalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const p = Math.min(1, Math.max(0, e.currentTarget.scrollTop / COLLAPSE_DISTANCE));
    setProgress(p);
  };

  const handleSubTabScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setSubTab(SUB_TAB_ORDER[index] ?? "earn");
  };

  // 點擊切換分頁時，兩邊的垂直捲動位置跟 hero／切換鈕的收合狀態(progress)
  // 都要重置回頂端——不然從「探索」往下滑很多再切到「許願池」，許願池會
  // 帶著上一個分頁收合到一半的 progress 出現，畫面卡住、也捲不動
  const goToSubTab = (tab: SubTab) => {
    const el = subScrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * SUB_TAB_ORDER.indexOf(tab), behavior: "smooth" });
    setSubTab(tab);
    setProgress(0);
    exploreRef.current?.scrollTo({ top: 0 });
    wishlistRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      {/* 固定疊在內容上方的標題區塊：底色是白色漸層到透明（呼應 Figma 捲動後
          節點 415:26898 的 investmenthead），往上滑的時候，智能選品那張深色卡、
          酒瓶照片這些從底下經過的內容會平滑淡出，不會看到一條明顯的硬邊界。
          外層設 pointer-events-none，只讓真的有內容的那塊可以點擊。 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20"
        style={{
          height: HEADER_GRADIENT_HEIGHT,
          background: `linear-gradient(to bottom, rgba(255,255,255,0.9) ${
            (FIXED_HEADER_HEIGHT / HEADER_GRADIENT_HEIGHT) * 100
          }%, rgba(255,255,255,0) 100%)`,
        }}
      >
        <div className="pointer-events-auto">
          <StatusBar />

          {/* 標題列：預設顯示「回饋」，捲動超過 hero 之後淡出換成探索／許願池切換鈕，
              呼應 Figma 捲動後的節點（415:26898）把 sub-tab-switcher 搬進標題列的版面 */}
          <div className="flex h-11 shrink-0 items-center justify-between px-4">
            <div className="relative flex h-full flex-1 items-center">
              <p
                className="absolute left-0 text-[24px] font-medium text-gray-800"
                style={{ opacity: 1 - progress, pointerEvents: progress > 0.5 ? "none" : "auto" }}
              >
                回饋
              </p>
              <div
                className="absolute left-0 flex items-center gap-1 rounded-[24px] bg-[#e5e7eb] p-1"
                style={{ opacity: progress, pointerEvents: progress > 0.5 ? "auto" : "none" }}
              >
                <button
                  onClick={() => goToSubTab("earn")}
                  className={`rounded-[24px] px-3 py-2 text-[16px] ${subTab === "earn" ? "bg-white font-bold text-gray-800" : "font-normal text-[#99a1af]"}`}
                >
                  探索
                </button>
                <button
                  onClick={() => goToSubTab("spend")}
                  className={`rounded-[24px] px-3 py-2 text-[16px] ${subTab === "spend" ? "bg-white font-bold text-gray-800" : "font-normal text-[#99a1af]"}`}
                >
                  許願池
                </button>
              </div>
            </div>
            <Link
              href="/v10/reward-history"
              className="flex items-center gap-1.5 rounded-[22px] bg-white py-1.5 pl-1.5 pr-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
              style={{ opacity: progress, pointerEvents: progress > 0.4 ? "auto" : "none" }}
            >
              <img src="/figma/reward-otter.svg" alt="" className="size-7" />
              <span className="text-[16px] font-medium text-gray-800">
                {REWARD_BALANCE.toLocaleString()}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 內容整塊往下推，空出上面固定標題不透明的那段高度，
          剩下漸層淡出的尾巴會疊在這塊內容最上緣，兩者才會平滑接起來 */}
      <div className="flex flex-1 flex-col overflow-hidden" style={{ paddingTop: HEADER_GRADIENT_HEIGHT }}>
        {/* 回饋數字大字：往上滑時高度跟透明度一起收，內容才會跟著往上補位，
            而不是留一塊空白——收完剛好接手標題列。可以點進回饋紀錄 */}
        <Link
          href="/v10/reward-history"
          className="block shrink-0 overflow-hidden px-4"
          style={{
            height: (1 - progress) * HERO_HEIGHT,
            opacity: 1 - progress,
            pointerEvents: progress < 0.6 ? "auto" : "none",
          }}
        >
          <div className="flex items-center gap-1">
            <img src="/figma/reward-icon-hero.svg" alt="" className="size-7" />
            <span className="text-[34px] font-semibold leading-[40px] text-gray-800 tabular-nums">
              {REWARD_BALANCE.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[14px] font-medium text-[#4a5565] tabular-nums">
            今天增加 +{TODAY_REWARD_AMOUNT}
          </p>
        </Link>

        {/* 探索／許願池切換：這顆是唯一一份、放在水平 carousel 外面，切換分頁時
            水平捲動只會移動下面的內容，這顆本身不會跟著左右滑動。往下滑超過
            hero 之後用跟 hero 數字同一套 progress 讓它淡出、高度收合，改由
            標題列那份淡入接手，兩邊不會同時出現。只能點擊切換，不開放手勢滑動——
            許願池裡面本身就有橫向捲動的最新願望／即將實現，兩層水平手勢疊在一起
            會互搶，跟最外層伴伴／回饋／帳號 tab bar 同樣的處理方式 */}
        <div
          className="shrink-0 overflow-hidden px-4"
          style={{
            height: (1 - progress) * SWITCHER_HEIGHT,
            opacity: 1 - progress,
            pointerEvents: progress < 0.6 ? "auto" : "none",
          }}
        >
          <div className="pb-2">
            <SubTabSwitcher subTab={subTab} onSelect={goToSubTab} />
          </div>
        </div>

        <div
          ref={subScrollerRef}
          onScroll={handleSubTabScroll}
          className="no-scrollbar flex flex-1 overflow-x-hidden overflow-y-hidden"
        >
        {/* 探索 */}
        <div
          ref={exploreRef}
          onScroll={handleVerticalScroll}
          className="no-scrollbar h-full w-full shrink-0 snap-center overflow-y-auto pb-[100px]"
        >
          {/* 這條是貼在「這個分頁自己」捲動容器頂端的軟邊——不是套用在 hero
              文字上面（那樣會整段變淡看不清楚），是疊在底下內容最上緣，
              用 sticky 讓它捲動時一直貼著標題列下緣，不會被捲走，內容經過
              這個高度時邊界才會是漸層而不是一條硬線。-mb 把佔掉的高度吃回去，
              不會把底下內容往下推。 */}
          <div
            className="sticky top-0 z-10 -mb-6 h-6 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0))",
            }}
          />
          {/* 智能選品：把錢放進來持續生利的核心入口，深色卡跟其他白卡拉出差異 */}
          <div className="px-4">
            <p className="py-4 text-[16px] font-bold text-gray-800">智能選品</p>
            <Link
              href="/v10/ai-select"
              className="flex h-[168px] gap-4 rounded-[24px] bg-[#101828] p-6 shadow-[0px_8px_12px_0px_rgba(0,0,0,0.07)]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[20px]">
                <img src="/figma/ai-select-icon.svg" alt="" className="size-10" />
              </span>
              <div className="flex flex-1 flex-col items-end justify-between">
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[14px] text-white/40">我的酒窖</p>
                  <div className="flex items-end gap-1">
                    <p className="text-[40px] font-semibold leading-[48px] text-white">
                      {AI_SELECT_HOLDING}
                    </p>
                  </div>
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
            </Link>
          </div>

          {/* 線上藏酒：買一瓶就有登入回饋資格，不是持續生利 */}
          <div className="mt-2">
            <Link href="/v10/wine-select" className="flex items-center gap-1 px-4 py-4">
              <p className="text-[16px] font-bold text-gray-800">線上藏酒</p>
              <img src="/figma/nav-arrow-right.svg" alt="" className="size-6" />
            </Link>

            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
              {PRODUCTS.filter((p) => p.image).map((p) => (
                <Link
                  key={p.id}
                  href={`/v10/wine-select/${p.id}`}
                  className="flex w-[144px] shrink-0 flex-col overflow-hidden rounded-lg"
                >
                  <div className="relative aspect-square w-full rounded-2xl p-3">
                    <img
                      src={p.image}
                      alt=""
                      className="absolute inset-0 size-full rounded-2xl object-cover"
                    />
                    {p.tag && (
                      <span className="relative flex h-[22px] items-center justify-center rounded-[10px] bg-[rgba(27,31,38,0.6)] px-2 text-[12px] font-semibold tracking-[0.12px] text-gray-000">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 px-2 py-3">
                    <p className="text-[12px] tracking-[0.12px] text-[#6a7282]">
                      {p.subtitle}
                    </p>
                    <p className="line-clamp-2 h-9 text-[14px] font-medium tracking-[0.42px] text-gray-800">
                      {p.name}
                    </p>
                    <p className="text-[14px] text-gray-800">${p.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 匯率預測：不用花既有回饋，免費猜題贏回饋，仍算「賺」這一邊 */}
          <div className="px-4 pt-2">
            <p className="py-4 text-[16px] font-bold text-gray-800">匯率預測</p>
            <Link
              href="/v10/rate-forecast"
              className="flex h-[168px] flex-col gap-12 rounded-[24px] bg-white p-4 shadow-[0px_8px_12px_0px_rgba(0,0,0,0.07)]"
            >
              <img src="/figma/fx-group1.svg" alt="" className="h-7 w-10" />
              <div className="flex items-start gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-[14px] text-[#99a1af]">本期累積獎金</p>
                  <p className="text-[34px] font-semibold leading-[40px] text-gray-800 tabular-nums">
                    {RATE_FORECAST_POOL.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] text-[#99a1af]">我的號碼</p>
                  <p className="text-[24px] font-bold leading-[32px] text-gray-200">尚未預測</p>
                </div>
              </div>
            </Link>
          </div>

          {/* 智能雲會員：即將下線的舊會員制度，功能雖然要收掉，露出還是先保留 */}
          <div className="px-4 pt-2">
            <p className="py-4 text-[16px] font-bold text-gray-800">智能雲會員</p>
            <div
              className="relative flex h-[160px] flex-col justify-end overflow-hidden rounded-2xl bg-[#ff7875] p-4 shadow-[0px_2px_20px_0px_rgba(165,204,194,0.2)]"
            >
              <img
                src="/figma/aifi-bg-pattern.svg"
                alt=""
                className="pointer-events-none absolute -right-10 -top-10 size-[260px] opacity-25 mix-blend-multiply"
              />
              <p className="absolute left-4 top-4 text-[10px] font-black tracking-[0.8px] text-white">
                AIFIAN ✦
                <br />
                MEMBER ONLY
              </p>
              <div className="flex flex-col items-end gap-2">
                <p className="text-[40px] font-semibold leading-[48px] text-white">
                  {MEMBERSHIP_TIER}
                </p>
                <div className="h-px w-16 bg-white/60" />
                <p className="text-[20px] font-bold leading-[24px] text-white/40">
                  {MEMBERSHIP_LEVEL} 級
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 許願池 */}
        <div
          ref={wishlistRef}
          onScroll={handleVerticalScroll}
          className="no-scrollbar flex h-full w-full shrink-0 snap-center flex-col overflow-y-auto pb-[100px]"
        >
          {/* 跟探索分頁同一條軟邊，兩個分頁各自捲動所以要各放一份 */}
          <div
            className="sticky top-0 z-10 -mb-6 h-6 shrink-0 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0))",
            }}
          />
          <div>
            <p className="px-4 py-4 text-[16px] font-bold text-gray-800">
              最新願望
            </p>
            <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pr-4 pb-1">
              {/* 用實體的間隔區塊，不要單靠容器 padding-left——scroll-snap 容器的
                  padding 在部分瀏覽器不會穩定算進捲動範圍，第一張卡會直接貼齊
                  容器邊緣，用這個區塊保證左邊一定空出 16px */}
              <div className="w-4 shrink-0" aria-hidden />
              {LATEST_WISHES.map((w) => (
                <Link
                  key={w.name}
                  href="/v10/reward-marketplace"
                  className="relative flex h-[180px] w-[calc(100%-16px)] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl bg-[#f6f7f8] px-4 py-6 text-white"
                >
                  <img
                    src={w.image}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 flex flex-col gap-1">
                    <p className="text-[14px] font-semibold tracking-[1px]">
                      {w.name}
                    </p>
                    <p className="line-clamp-2 text-[20px] leading-6">
                      {w.subtitle}
                    </p>
                  </div>
                  <p className="relative z-10 text-[16px] font-bold">
                    中獎價 ＄{w.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="px-4 py-4 text-[16px] font-bold text-gray-800">即將實現</p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
              {UPCOMING_WISHES.map((u) => (
                <div key={u.name} className="flex w-[168px] shrink-0 flex-col gap-2">
                  <div className="relative flex size-[168px] flex-col justify-between overflow-hidden rounded-2xl">
                    <img
                      src={u.image}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="relative z-10 self-start rounded-br-2xl rounded-tl-2xl bg-gray-800 px-2 py-1 text-[14px] font-semibold text-white">
                      差 {u.diff}
                    </span>
                    <div className="relative z-10 h-2 w-full bg-white/30 backdrop-blur-[2.5px]">
                      <div
                        className="h-full bg-[#ff5958]"
                        style={{ width: `${u.progressPct}%` }}
                      />
                    </div>
                  </div>
                  <p className="line-clamp-1 text-[16px] text-gray-800">
                    {u.name}
                  </p>
                </div>
              ))}
              <Link
                href="/v10/reward-marketplace"
                className="flex size-[168px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#f3f4f6] text-[14px] text-[#99a1af]"
              >
                看全部
                <img src="/figma/nav-arrow-right.svg" alt="" className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function SubTabSwitcher({
  subTab,
  onSelect,
}: {
  subTab: SubTab;
  onSelect: (tab: SubTab) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-[24px] bg-[#f3f4f6] p-1">
      <button
        onClick={() => onSelect("earn")}
        className={`flex-1 rounded-[24px] px-3 py-2 text-[16px] ${subTab === "earn" ? "bg-white font-bold text-gray-800" : "font-normal text-[#99a1af]"}`}
      >
        探索
      </button>
      <button
        onClick={() => onSelect("spend")}
        className={`flex-1 rounded-[24px] px-3 py-2 text-[16px] ${subTab === "spend" ? "bg-white font-bold text-gray-800" : "font-normal text-[#99a1af]"}`}
      >
        許願池
      </button>
    </div>
  );
}
