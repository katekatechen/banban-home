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

type Panel = "sidebar" | "home";
const PANEL_INDEX: Record<Panel, number> = { sidebar: 0, home: 1 };

export default function BanbunHomePage() {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [homeInput, setHomeInput] = useState("");
  // 進行中的訂單，用來在首頁顯示「你自己的」狀態，掛載後才讀 sessionStorage
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
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
                <img src="/icons/nav-reward.svg" alt="" className="size-6" />
                <span className="text-[14px] font-medium text-gray-800">
                  999,999
                </span>
              </div>
            </div>
          </div>

          {/* 對話框固定在畫面最下面，隨時可見、隨時可以直接問；
              個人化建議、全部功能是兩個乾脆切換的整頁，不是同一頁裡硬撐出來的假捲動——
              往下滑會俐落地切到全部功能，不是連續捲動穿過一大塊空白 */}
          <div className="no-scrollbar flex-1 touch-pan-y snap-y snap-mandatory overflow-y-auto">
            {/* 第一頁：個人化建議，永遠佔滿一整屏 */}
            <div className="flex h-full shrink-0 snap-start flex-col gap-6 pb-4 pt-4">
              <div className="flex flex-1 flex-col justify-center gap-6">
              {/* 個人化問候：左對齊、不用插畫，把版面讓給下面的建議卡片 */}
              <p className="whitespace-pre-line px-4 text-[26px] font-black leading-[1.25] text-gray-800">
                嗨 Ben，{"\n"}你今天可能會需要
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

              {/* 往下滑提示：釘在第一屏底部，只留箭頭、加彈跳動效，
                  不用文字說明，靠動效直覺提示還可以往下滑 */}
              <button
                onClick={() =>
                  servicesRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                title="往下滑看全部功能"
                className="flex animate-bounce items-center justify-center text-gray-400"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* 第二頁：全部功能，乾脆切過來的獨立整頁，跟上面的個人化建議刻意做出區隔 */}
            <div
              ref={servicesRef}
              className="flex min-h-full shrink-0 snap-start flex-col gap-2.5 px-4 pt-6"
            >
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitHomeInput();
              }}
              className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-3 pr-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                className="shrink-0 text-gray-800"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              <input
                value={homeInput}
                onChange={(e) => setHomeInput(e.target.value)}
                placeholder="想做什麼，跟伴伴說"
                className="flex-1 bg-transparent px-1 text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
              />
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-gray-800"
              >
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <path d="M12 18v4" />
              </svg>
              <button
                type="submit"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5" />
                  <path d="m5 12 7-7 7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
