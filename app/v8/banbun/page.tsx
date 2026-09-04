"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import Icon from "../_components/Icon";
import SidebarPanel from "./SidebarPanel";
import { TODAY_REWARD_AMOUNT } from "../_lib/mock-data";
import { getOrders, type Order } from "../_lib/orders";

type Panel = "sidebar" | "home";
const PANEL_INDEX: Record<Panel, number> = { sidebar: 0, home: 1 };
const STORAGE_LAST_PANEL = "banbun-v8-last-panel";

function loadLastPanel(): Panel {
  try {
    const saved = sessionStorage.getItem(STORAGE_LAST_PANEL);
    return saved === "sidebar" ? "sidebar" : "home";
  } catch {
    return "home";
  }
}

// 標題每次進首頁隨機換一句，其中一句直接呼應「賺回饋」這個主軸
const HEADLINES = [
  "嗨 Ben，\n你今天可能會需要",
  "嗨 Ben，\n你今天的回饋突破 300 了",
];

const CARD_ICON_WRAP = "flex size-9 items-center justify-center rounded-full";

const HOME_RECEDE_MS = 220;

export default function BanbunHomePage() {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const homeContentRef = useRef<HTMLDivElement>(null);
  // 標題固定從第一句開始 render（跟 SSR 結果一致，避免 hydration mismatch），
  // 掛載後才隨機換一句
  const [headline, setHeadline] = useState(HEADLINES[0]);
  // 進行中的訂單，用來在首頁顯示「你自己的」狀態，掛載後才讀 sessionStorage
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    setHeadline(HEADLINES[Math.floor(Math.random() * HEADLINES.length)]);
    setActiveOrder(getOrders().find((o) => o.status === "進行中") ?? null);
    // 一開始定位在「上次離開時的那一格」——如果是從側邊欄的功能項目點進去，
    // 按返回應該回到側邊欄，而不是每次都被拉回伴伴首頁。
    // 直接寫 scrollLeft，不能用 scrollTo({behavior:"instant"})：
    // 部分瀏覽器對 instant 的支援不穩定，會讓這次定位變成看得到的滑動動畫
    const el = scrollerRef.current;
    if (el) el.scrollLeft = el.clientWidth * PANEL_INDEX[loadLastPanel()];
    // 每次回到首頁（不管是從聊天室按返回、還是從功能頁），內容都用
    // 跟 openChat() 對稱的模糊淡入效果進場，呼應離開時的模糊淡出
    const content = homeContentRef.current;
    if (content) content.style.animation = "homeApproach 220ms ease-out";
  }, []);

  const scrollToPanel = (panel: Panel) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * PANEL_INDEX[panel], behavior: "smooth" });
  };

  // 點輸入框進聊天室前，讓首頁內容先往後模糊淡出，
  // 動畫播完才真的導航離開，呼應功能頁 pageIn/pageOut 的轉場感
  const openChat = () => {
    const el = homeContentRef.current;
    if (!el) {
      router.push("/v8/banbun/chat");
      return;
    }
    el.style.animation = `homeRecede ${HOME_RECEDE_MS}ms ease-in forwards`;
    setTimeout(() => router.push("/v8/banbun/chat"), HOME_RECEDE_MS);
  };

  // 個人化建議卡：用 icon 取代 emoji，訂單媒合中只在有進行中訂單時才插進來，
  // 顏色特地跟其他卡不同（深藍），讓它在一排卡片裡明顯凸顯出來
  const suggestionCards = [
    ...(activeOrder
      ? [
          {
            key: "order",
            href: `/v8/orders/${activeOrder.id}`,
            bg: "bg-[#2B3A55]",
            text: "text-white",
            subtext: "text-white/80",
            iconBg: "bg-white/15",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21 8.5-9-4.5-9 4.5v8l9 4.5 9-4.5Z" />
                <path d="m3 8.5 9 4.5 9-4.5" />
                <path d="M12 13v8" />
              </svg>
            ),
            title: "訂單媒合中",
            description: activeOrder.name,
          },
        ]
      : []),
    {
      key: "reward-source",
      href: "/v8/ai-select",
      bg: "bg-brand",
      text: "text-white",
      subtext: "text-white/85",
      iconBg: "bg-white/20",
      icon: <Icon src="/icons/nav-reward.svg" className="size-5 text-white" />,
      title: "查看我的回饋來源",
      description: `今天收到 ${TODAY_REWARD_AMOUNT} 回饋`,
    },
    {
      key: "weekend-wine",
      href: "/v8/banbun/chat?prompt=推薦適合週末喝的酒",
      bg: "bg-[#FF7A6B]",
      text: "text-white",
      subtext: "text-white/85",
      iconBg: "bg-white/20",
      icon: <Icon src="/icons/cat-redwine.svg" className="size-5 text-white" />,
      title: "推薦週末適合的酒",
      description: "你之前看過的梅酒，現在有新選擇",
    },
    {
      key: "birthday-gift",
      href: "/v8/banbun/chat?prompt=幫我挑一份生日禮物",
      bg: "bg-[#FFD6CE]",
      text: "text-gray-800",
      subtext: "text-gray-600",
      iconBg: "bg-black/5",
      icon: <Icon src="/icons/acc-gift.svg" className="size-5 text-gray-800" />,
      title: "送人的生日禮物",
      description: "隔壁鄰居家的狗，生日快到了",
    },
    {
      key: "zero-coke",
      href: "/v8/banbun/chat?prompt=我想買零卡可樂",
      bg: "bg-gray-100",
      text: "text-gray-800",
      subtext: "text-gray-500",
      iconBg: "bg-white",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="4" width="10" height="16" rx="2" />
          <path d="M9 8h6" />
        </svg>
      ),
      title: "零卡可樂",
      description: "上次買的零卡可樂要不要補貨？",
    },
    {
      key: "new-things",
      href: "/v8/wine-select",
      bg: "bg-gray-800",
      text: "text-white",
      subtext: "text-white/85",
      iconBg: "bg-white/20",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
        </svg>
      ),
      title: "看看新東西",
      description: "大家都在買這個",
    },
  ];

  return (
    <div
      ref={scrollerRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        const panel: Panel =
          Math.round(el.scrollLeft / el.clientWidth) === PANEL_INDEX.sidebar
            ? "sidebar"
            : "home";
        try {
          sessionStorage.setItem(STORAGE_LAST_PANEL, panel);
        } catch {
          // ignore
        }
      }}
      // touch-pan-x：只認橫向手勢，垂直手勢交給裡面的內容自己滾動——
      // 沒有這個，橫向 snap carousel 會把垂直捲動手勢也搶走
      className="no-scrollbar flex h-full w-full touch-pan-x snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
    >
      {/* 左格：側邊欄，功能清單 + 帳號設定（v8 沒有對話紀錄，訂單紀錄收進帳號頁） */}
      <div className="h-full w-full shrink-0 snap-center">
        <SidebarPanel
          onBackToHome={() => scrollToPanel("home")}
          onAccount={() => router.push("/v8/account")}
        />
      </div>

      {/* 中格：伴伴首頁 */}
      <div className="relative h-full w-full shrink-0 snap-center">
        <div
          ref={homeContentRef}
          className="no-scrollbar flex h-full flex-col overflow-y-auto bg-white"
        >
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
              賺回饋收進側邊欄，不再佔用首頁版面，首頁只剩個人化建議 */}
          <div className="no-scrollbar flex flex-1 touch-pan-y flex-col justify-center gap-6 overflow-y-auto pb-4 pt-4">
            {/* 個人化問候：左對齊、不用插畫，把版面讓給下面的建議卡片 */}
            <p className="whitespace-pre-line px-4 text-[26px] font-black leading-[1.25] text-gray-800">
              {headline}
            </p>

            {/* 我可以替你準備：橫向捲動的建議卡片，用 icon 取代 emoji，比例比原本更大 */}
            <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
              {suggestionCards.map((c) => (
                <Link
                  key={c.key}
                  href={c.href}
                  className={`flex w-[190px] shrink-0 flex-col gap-4 rounded-2xl ${c.bg} p-5 ${c.text} transition-transform active:scale-[0.98]`}
                >
                  <div className={`${CARD_ICON_WRAP} ${c.iconBg}`}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-[16px] font-bold leading-snug">
                      {c.title}
                    </p>
                    <p className={`mt-1 line-clamp-2 text-[13px] leading-snug ${c.subtext}`}>
                      {c.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 對話框：固定在畫面最下面，不隨內容捲動。
              首頁這顆是「點了就換頁進聊天室」的觸發器，不是真的輸入框——
              過去的對話紀錄只會在聊天室頁面看到，首頁保持乾淨、
              不用煩惱歷史訊息要不要塞進來 */}
          <div className="flex shrink-0 flex-col gap-2 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
            <button
              onClick={openChat}
              className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-3 pr-1.5 text-left shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
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
              <span className="flex-1 px-1 text-[14px] text-gray-400">
                想做什麼，跟伴伴說
              </span>
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
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
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
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
