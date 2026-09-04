"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import SidebarPanel from "./SidebarPanel";
import { loadConversations, loadActiveId } from "../_lib/chat-storage";
import {
  TOTAL_PORTFOLIO_VALUE,
  TOTAL_PORTFOLIO_CHANGE_PCT,
} from "../_lib/mock-data";
import { getOrders, type Order } from "../_lib/orders";
import { SERVICE_POOL } from "../_lib/services";

const PROMPT_CHIPS = [
  "🥃 第一次喝威士忌，入門推薦",
  "🤔 普發一萬花在哪裡最划算？",
  "🎈 這個月有什麼回饋活動？",
  "💰 我想了解報稅的事情",
  "👍 乾拌麵推薦",
  "🌀 防災乾糧",
];

type Panel = "sidebar" | "home";
const PANEL_INDEX: Record<Panel, number> = { sidebar: 0, home: 1 };

export default function BanbunHomePage() {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [homeInput, setHomeInput] = useState("");
  // chips 固定先顯示前 4 個（跟 SSR 結果一致），掛載後才從全部裡隨機抽 4 個
  const [chips, setChips] = useState(PROMPT_CHIPS.slice(0, 4));
  // 進行中的訂單，用來在首頁顯示「你自己的」狀態，掛載後才讀 sessionStorage
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    setChips([...PROMPT_CHIPS].sort(() => Math.random() - 0.5).slice(0, 4));
    setActiveOrder(getOrders().find((o) => o.status === "進行中") ?? null);
    // 一開始就定位在中間（伴伴）那一格，不要讓用戶先看到側邊欄再滑過去——
    // 直接寫 scrollLeft，不能用 scrollTo({behavior:"instant"})：
    // 部分瀏覽器對 instant 的支援不穩定，會讓這次定位變成看得到的滑動動畫
    const el = scrollerRef.current;
    if (el) el.scrollLeft = el.clientWidth * PANEL_INDEX.home;
  }, []);

  const scrollToPanel = (panel: Panel) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * PANEL_INDEX[panel], behavior: "smooth" });
  };

  const submitHomeInput = () => {
    const text = homeInput.trim();
    if (!text) return;
    router.push(`/v7/banbun/chat?prompt=${encodeURIComponent(text)}`);
  };

  // 側邊欄打開時才讀一次對話紀錄，不用每次 render 都重讀 sessionStorage
  const [sidebarData, setSidebarData] = useState<{
    conversations: ReturnType<typeof loadConversations>;
    activeId?: string;
  }>({ conversations: [] });

  return (
    <div
      ref={scrollerRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        // 側邊欄內容只需要在切到那一格附近時才是新鮮的，用 scroll 事件觸發即可，
        // 不用整頁一直輪詢 sessionStorage
        if (el.scrollLeft < el.clientWidth) {
          setSidebarData({
            conversations: loadConversations(),
            activeId: loadActiveId() ?? undefined,
          });
        }
      }}
      // touch-pan-x：只認橫向手勢，垂直手勢交給裡面的內容自己滾動——
      // 沒有這個，橫向 snap carousel 會把垂直捲動手勢也搶走
      className="no-scrollbar flex h-full w-full touch-pan-x snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
    >
      {/* 左格：側邊欄，對話紀錄 + 帳號設定 */}
      <div className="h-full w-full shrink-0 snap-center">
        <SidebarPanel
          conversations={sidebarData.conversations}
          activeId={sidebarData.activeId}
          onBackToHome={() => scrollToPanel("home")}
          onNewChat={() => router.push("/v7/banbun/chat?new=1")}
          onOpenConversation={(id) =>
            router.push(`/v7/banbun/chat?open=${id}`)
          }
          onAccount={() => router.push("/v7/account")}
          onOrders={() => router.push("/v7/orders")}
        />
      </div>

      {/* 中格：伴伴首頁 */}
      <div className="relative h-full w-full shrink-0 snap-center">
        <div className="no-scrollbar flex h-full flex-col overflow-y-auto bg-white">
          <StatusBar />

          {/* header：拿掉 AIFIAN logo，回饋數字也不用灰底大膠囊，
              避免搶了「伴伴」本身的存在感——只有這個首頁的 header 這樣調整，
              其他頁面的共用 header 不動 */}
          <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-1">
            <button
              onClick={() => scrollToPanel("sidebar")}
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
            <div className="flex items-center gap-3">
              <div className="relative flex size-8 items-center justify-center">
                <img src="/icons/nav-bell.svg" alt="通知" className="size-6" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  9
                </span>
              </div>
              <div className="flex items-center gap-1">
                <img src="/icons/nav-reward.svg" alt="" className="size-4" />
                <span className="text-[14px] font-medium text-gray-800">
                  999,999
                </span>
              </div>
            </div>
          </div>

          {/* 對話框固定在畫面最下面，隨時可見、隨時可以直接問；
              往下滑會看到全部功能——首頁不是空空等你發問，而是先幫你準備好 */}
          <div className="no-scrollbar flex-1 touch-pan-y overflow-y-auto">
            {/* 第一眼只看到問候+建議卡+往下滑提示，全部功能永遠在第一屏之外——
                min-h-full 撐滿至少一整屏的高度，不管裝置螢幕多高，都要滑過去才看得到 */}
            <div className="flex min-h-full flex-col justify-between gap-6 pb-4 pt-4">
              <div className="flex flex-col gap-6">
              {/* 個人化問候：左對齊、不用插畫，把版面讓給下面的建議卡片 */}
              <p className="whitespace-pre-line px-4 text-[26px] font-black leading-[1.25] text-gray-800">
                嗨 阿福，{"\n"}你今天可能會需要
              </p>

              {/* 我可以替你準備：橫向捲動的建議卡片，取代原本上下堆疊的個人化狀態卡 */}
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
                <Link
                  href="/v7/collection"
                  className="flex w-[160px] shrink-0 flex-col gap-3 rounded-2xl bg-brand p-4 text-white transition-transform active:scale-[0.98]"
                >
                  <span className="text-[20px]">🛢️</span>
                  <div>
                    <p className="text-[15px] font-bold leading-snug">
                      我的酒窖現值
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-white/85">
                      ${TOTAL_PORTFOLIO_VALUE.toLocaleString()}，比上週 +
                      {TOTAL_PORTFOLIO_CHANGE_PCT}%
                    </p>
                  </div>
                </Link>

                {activeOrder ? (
                  <Link
                    href={`/v7/orders/${activeOrder.id}`}
                    className="flex w-[160px] shrink-0 flex-col gap-3 rounded-2xl bg-[#FF7A6B] p-4 text-white transition-transform active:scale-[0.98]"
                  >
                    <span className="text-[20px]">📦</span>
                    <div>
                      <p className="text-[15px] font-bold leading-snug">
                        訂單媒合中
                      </p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-white/85">
                        {activeOrder.name}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/v7/banbun/chat?prompt=今晚想喝點什麼，幫我挑一支"
                    className="flex w-[160px] shrink-0 flex-col gap-3 rounded-2xl bg-[#FF7A6B] p-4 text-white transition-transform active:scale-[0.98]"
                  >
                    <span className="text-[20px]">🍷</span>
                    <div>
                      <p className="text-[15px] font-bold leading-snug">
                        今晚想喝點什麼
                      </p>
                      <p className="mt-1 text-[12px] leading-snug text-white/85">
                        跟伴伴說，我幫你挑
                      </p>
                    </div>
                  </Link>
                )}

                <Link
                  href="/v7/banbun/chat?prompt=幫我挑一份送禮的禮物"
                  className="flex w-[160px] shrink-0 flex-col gap-3 rounded-2xl bg-[#FFD6CE] p-4 text-gray-800 transition-transform active:scale-[0.98]"
                >
                  <span className="text-[20px]">🎁</span>
                  <div>
                    <p className="text-[15px] font-bold leading-snug">
                      送禮靈感
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-gray-600">
                      跟伴伴說要送誰，幫你挑
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() =>
                    servicesRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="flex w-[160px] shrink-0 flex-col gap-3 rounded-2xl bg-gray-800 p-4 text-left text-white transition-transform active:scale-[0.98]"
                >
                  <span className="text-[20px]">✨</span>
                  <div>
                    <p className="text-[15px] font-bold leading-snug">
                      看看新東西
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-white/85">
                      全部功能都在下面
                    </p>
                  </div>
                </button>
              </div>
              </div>

              {/* 往下滑提示：釘在第一屏底部，告訴用戶下面還有全部功能可以看 */}
              <div className="flex flex-col items-center gap-1 text-gray-300">
                <p className="text-[12px]">往下滑看全部功能</p>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* 全部功能：靜態、完整的功能清單，永遠在第一屏之外，跟上面的個人化建議刻意做出區隔 */}
              <div ref={servicesRef} className="flex flex-col gap-2.5 px-4">
                <p className="px-1 text-[13px] font-medium text-gray-400">
                  全部功能
                </p>
                {SERVICE_POOL.map((s) =>
                  s.disabled ? (
                    <div
                      key={s.key}
                      className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-3.5"
                    >
                      <span className="text-[24px] opacity-50 grayscale">
                        {s.emoji}
                      </span>
                      <p className="flex-1 text-[15px] font-semibold text-gray-400">
                        {s.label}
                      </p>
                      <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        敬請期待
                      </span>
                    </div>
                  ) : (
                    <Link
                      key={s.key}
                      href={s.href}
                      className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-000 px-4 py-3.5 transition-transform active:scale-[0.98]"
                    >
                      <span className="text-[24px]">{s.emoji}</span>
                      <p className="flex-1 text-[15px] font-semibold text-gray-800">
                        {s.label}
                      </p>
                      <img
                        src="/icons/acc-nav-arrow-right.svg"
                        alt=""
                        className="size-5"
                      />
                    </Link>
                  ),
                )}
              </div>
          </div>

          {/* 對話框：固定在畫面最下面，不隨內容捲動 */}
          <div className="flex shrink-0 flex-col gap-2 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {chips.map((p) => (
                <Link
                  key={p}
                  href={`/v7/banbun/chat?prompt=${encodeURIComponent(p)}`}
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
                placeholder="想做什麼，跟伴伴說"
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
    </div>
  );
}
