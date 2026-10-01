"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ProductSheet from "../_components/ProductSheet";
import StatusBar from "../_components/StatusBar";
import { HOME_RESET_EVENT } from "../_components/TabBar";
import { EASING } from "../_lib/page-transition";
import {
  genId,
  loadChat,
  saveChat,
  type Message,
  type RecCard,
  type Stage,
} from "../_lib/chat-storage";
import {
  AI_SELECT_HOLDING,
  REWARD_BALANCE,
  WINE_PICKS,
} from "../_lib/mock-data";

// v13 首頁＝聊天分頁，照 Figma 948:44415（首頁）跟 981:24621（對話中）。
// 點輸入框本身不會有任何變化，送出第一句話之後才原地展開對話：插圖淡出、
// 上方冒出購物車、中間換成對話內容，「你可能想知道」收成一行，
// 輸入框跟 tabbar 留在原位，不換頁。
// 對話邏輯沿用 v12 對話頁那套關鍵字判斷，只是搬進首頁裡原地展開

// 換一批：標籤不是瞬間換掉，是舊的依序消失、新的再依序出現。三個狀態
// 靠同一個 phase 驅動所有標籤的 style，用 transition 縮寫裡的 delay
// 做出「依序」的效果
type SuggestionPhase = "idle" | "exiting" | "entering-start" | "entering";
const ITEM_STAGGER_MS = 60;
const ITEM_DURATION_MS = 200;
const MODE_TRANSITION_MS = 300;
const FLY_TO_CART_MS = 650;

// 前三個是 Figma 上的原文案，首頁一打開就照這三個排，換一批才洗牌
const SUGGESTION_POOL = [
  { key: "how-to-earn", prompt: "如何開始領取回饋", label: "如何開始領取回饋" },
  {
    key: "is-cash",
    prompt: "AIFIAN 的回饋是現金嗎",
    label: "AIFIAN 的回饋是現金嗎",
  },
  {
    key: "restock-drink",
    prompt: "我想買可樂",
    label: "上次買的可樂喝完了嗎？要不要補貨",
  },
  {
    key: "noodles",
    prompt: "推薦幾款好吃的乾拌麵給我",
    label: "推薦幾款好吃的乾拌麵給我",
  },
  {
    key: "mid-autumn",
    prompt: "推薦適合中秋烤肉喝的酒",
    label: "中秋烤肉想喝點什麼嗎？",
  },
  {
    key: "daily-reward",
    prompt: "我想看智能選品",
    label: "你的每日回饋突破 100 元！再買點智能選品？",
  },
];

const NOODLE_PICKS: RecCard[] = [
  {
    id: "dashixiong",
    name: "大師兄銷魂麻辣粗麵",
    price: 129,
    image: "/figma/v13-product-dashixiong.jpg",
  },
  { id: "laotao", name: "老饕乾拌麵 麻醬蒜香", price: 99 },
  { id: "jinjiazhuang", name: "金家莊 蒜辣拌麵", price: 109 },
];

// 上次對話的假資料：對話中往上滑會冒出「載入上次對話」，點了才接到目前對話上面。
// id 用負數，跟目前對話 genId() 發的正數 id 不會撞
const PREVIOUS_CHAT_DATE = "9 月 28 日";
const PREVIOUS_CHAT: Message[] = [
  { id: -1, role: "user", text: "這個月的回饋怎麼算？" },
  {
    id: -2,
    role: "bot",
    text: "你這個月的回饋主要來自智能選酒的每日回饋，每天自動累積，不用另外領。到目前為止已經累積 451 點，月底會一起入帳。",
  },
  { id: -3, role: "user", text: "幫我找一支送禮的酒，預算 1,000 以內" },
  {
    id: -4,
    role: "bot",
    text: "送禮的話這支很穩，包裝有質感，價格也剛好在預算內：",
    cards: [
      {
        id: WINE_PICKS[0].id,
        name: WINE_PICKS[0].name,
        subtitle: WINE_PICKS[0].subtitle,
        price: WINE_PICKS[0].price,
        image: WINE_PICKS[0].image,
      },
    ],
  },
];
const HISTORY_LOADING_MS = 700;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function V13HomePage() {
  const router = useRouter();
  const [chat] = useState(loadChat);
  const [chatOpen, setChatOpen] = useState(chat.open);
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [stage, setStage] = useState<Stage>(chat.stage);
  const [selected, setSelected] = useState<string[]>(chat.selected);
  const [cartCount, setCartCount] = useState(chat.cartCount);
  const [addedIds, setAddedIds] = useState<string[]>(chat.addedIds);
  const [sheet, setSheet] = useState<{
    cards: RecCard[];
    index: number;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  // 首頁預設展開建議，進到對話後收成一行，點標題可以再打開
  const [chipsOpen, setChipsOpen] = useState(!chat.open);
  const [suggestions, setSuggestions] = useState(SUGGESTION_POOL.slice(0, 3));
  const [itemPhase, setItemPhase] = useState<SuggestionPhase>("idle");
  const [historyLoaded, setHistoryLoaded] = useState(chat.historyLoaded);
  const [showHistoryBtn, setShowHistoryBtn] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const lastScrollTop = useRef(0);
  const touchStartY = useRef<number | null>(null);
  const bottomPullStartY = useRef<number | null>(null);
  const bottomWheelPull = useRef(0);
  const atBottomSince = useRef<number | null>(null);
  const distanceFromBottom = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const cartIconRef = useRef<HTMLImageElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevCartCount = useRef(cartCount);
  const sentInitial = useRef(false);

  useEffect(() => {
    saveChat({
      open: chatOpen,
      historyLoaded,
      messages,
      stage,
      selected,
      cartCount,
      addedIds,
    });
  }, [chatOpen, historyLoaded, messages, stage, selected, cartCount, addedIds]);

  // 卡片上的 + ：商品圖飛進購物車，同時記下這個商品已經在購物車裡
  const addFromCard = (from: HTMLElement, card: RecCard) => {
    flyToCart(from);
    setAddedIds((ids) => (ids.includes(card.id) ? ids : [...ids, card.id]));
  };

  // 細節頁的「加入購物車」是切換：沒加過就加、已經加過就拿掉
  const toggleCartFromSheet = (card: RecCard) => {
    if (addedIds.includes(card.id)) {
      setAddedIds((ids) => ids.filter((id) => id !== card.id));
      setCartCount((c) => Math.max(0, c - 1));
    } else {
      setAddedIds((ids) => [...ids, card.id]);
      setCartCount((c) => c + 1);
    }
  };

  // 這版沒有結帳頁，立即購買先放進購物車、關掉細節頁，再用提示說明
  const buyFromSheet = (card: RecCard) => {
    if (!addedIds.includes(card.id)) {
      setAddedIds((ids) => [...ids, card.id]);
      setCartCount((c) => c + 1);
    }
    setSheet(null);
    setToast("已放進購物車，結帳流程這版還沒做");
    const t = window.setTimeout(() => setToast(null), 2200);
    timersRef.current.push(t);
  };

  // 往上滑才冒出「載入上次對話」，往下滑就收起來。三種輸入都要接：
  // 內容夠長時看 scroll 方向；內容還很短、根本捲不動時，手機看手指往下拖、
  // 桌機看滾輪往上，不然對話才一兩句的時候永遠叫不出這顆按鈕
  const revealHistoryBtn = (up: boolean) => {
    if (historyLoaded || historyLoading || !chatOpen) return;
    setShowHistoryBtn(up);
  };

  // 對話捲到底之後還繼續往下滑，滑超過一段距離才打開「你可能想知道」。
  // 「繼續往下滑」在手機是手指往上推、桌機是滾輪往下；只看已經到底之後
  // 多推的那段，捲動途中經過底部不會誤觸
  const BOTTOM_PULL_TOUCH_PX = 70;
  const BOTTOM_PULL_WHEEL_PX = 160;
  const isAtBottom = () => {
    const el = scrollRef.current;
    return !!el && el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
  };
  const openChipsFromPull = () => {
    if (chipsOpen) return;
    setChipsOpen(true);
    bottomPullStartY.current = null;
    bottomWheelPull.current = 0;
  };

  // 「你可能想知道」展開後，對話區會被往上擠矮一截，最後一則訊息會被
  // 底下長出來的標籤蓋住，順手捲回最底
  useEffect(() => {
    if (!chatOpen || !chipsOpen) return;
    const t = window.setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, MODE_TRANSITION_MS);
    return () => window.clearTimeout(t);
  }, [chipsOpen, chatOpen]);

  const handleChatScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (isAtBottom()) {
      if (atBottomSince.current == null)
        atBottomSince.current = performance.now();
    } else {
      atBottomSince.current = null;
      bottomWheelPull.current = 0;
    }
    const delta = el.scrollTop - lastScrollTop.current;
    lastScrollTop.current = el.scrollTop;
    if (Math.abs(delta) > 4) revealHistoryBtn(delta < 0);
  };

  const loadHistory = () => {
    if (historyLoading) return;
    setHistoryLoading(true);
    const t = window.setTimeout(() => {
      const el = scrollRef.current;
      if (el) distanceFromBottom.current = el.scrollHeight - el.scrollTop;
      setHistoryLoaded(true);
      setHistoryLoading(false);
      setShowHistoryBtn(false);
    }, HISTORY_LOADING_MS);
    timersRef.current.push(t);
  };

  // 上次對話是接在最上面，直接插進去的話，畫面上正在看的內容會被往下推走。
  // 插入後先把捲動位置補回去（畫面停在原處），再往上滑一小段，
  // 讓使用者看到上次對話的尾巴、知道內容已經載進來了
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!historyLoaded || !el || distanceFromBottom.current == null) return;
    el.scrollTop = el.scrollHeight - distanceFromBottom.current;
    distanceFromBottom.current = null;
    lastScrollTop.current = el.scrollTop;
    el.scrollBy({ top: -140, behavior: "smooth" });
  }, [historyLoaded]);

  // 購物車數字一變就讓紅點「彈」出來：從 0 放大超過一點再縮回原尺寸
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      badgeRef.current?.animate(
        [
          { transform: "scale(0)" },
          { transform: "scale(1.35)", offset: 0.6 },
          { transform: "scale(1)" },
        ],
        { duration: 320, easing: "ease-out" },
      );
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  // 按 + 加入購物車：一顆紅點從按鈕沿著弧線飛進右上角的購物車，
  // 飛到之後購物車圖示縮放一下，數字才 +1 跳出來。
  // 用 Web Animations API 直接動 DOM，不走 React state，動畫期間不會重繪整頁
  const flyToCart = (from: HTMLElement) => {
    const root = rootRef.current;
    const cart = cartIconRef.current;
    const image = from
      .closest("[data-product-card]")
      ?.querySelector<HTMLElement>("[data-product-image]");
    if (!root || !cart || !image) {
      setCartCount((c) => c + 1);
      return;
    }
    const rootRect = root.getBoundingClientRect();
    const a = image.getBoundingClientRect();
    const b = cart.getBoundingClientRect();
    // 複製一份商品圖（拿掉右上角的勾選圈），疊在原圖的位置上，
    // 邊飛邊縮小，最後縮成跟購物車圖示差不多大、落在購物車正中間
    const w = a.width;
    const endScale = 22 / w;
    const x0 = a.left - rootRect.left;
    const y0 = a.top - rootRect.top;
    const x1 = b.left + b.width / 2 - rootRect.left - (w * endScale) / 2;
    const y1 = b.top + b.height / 2 - rootRect.top - (w * endScale) / 2;
    // 中途點：垂直方向先走掉七成、水平只走三成，路徑往左上鼓成一道弧，
    // 不會衝出畫面上緣（購物車本來就貼著頂部）
    const midX = x0 + (x1 - x0) * 0.3;
    const midY = y0 + (y1 - y0) * 0.7;
    const midScale = 0.45;

    const ghost = image.cloneNode(true) as HTMLElement;
    ghost.querySelector("button")?.remove();
    ghost.removeAttribute("data-product-image");
    Object.assign(ghost.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: `${w}px`,
      height: `${a.height}px`,
      margin: "0",
      zIndex: "30",
      pointerEvents: "none",
      borderRadius: "16px",
      overflow: "hidden",
      transformOrigin: "0 0",
      boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
    });
    root.appendChild(ghost);
    const anim = ghost.animate(
      [
        {
          transform: `translate(${x0}px, ${y0}px) scale(1)`,
          borderRadius: "16px",
        },
        {
          transform: `translate(${midX}px, ${midY}px) scale(${midScale})`,
          offset: 0.45,
        },
        {
          transform: `translate(${x1}px, ${y1}px) scale(${endScale})`,
          opacity: 0.7,
          borderRadius: `${w / 2}px`,
        },
      ],
      { duration: FLY_TO_CART_MS, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
    );
    anim.onfinish = () => {
      ghost.remove();
      cart.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.3)", offset: 0.4 },
          { transform: "scale(0.92)", offset: 0.75 },
          { transform: "scale(1)" },
        ],
        { duration: 360, easing: "ease-out" },
      );
      window.setTimeout(() => setCartCount((c) => c + 1), 140);
    };
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, chatOpen]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const openChat = () => {
    if (chatOpen) return;
    setChatOpen(true);
    setChipsOpen(false);
  };

  const closeChat = () => {
    inputRef.current?.blur();
    setChatOpen(false);
    setChipsOpen(true);
  };

  // 已經在聊天分頁時再點一次 tabbar 的「聊天」：收起對話、回到插圖首頁
  // （對話內容留著，下次點輸入框會接著聊）
  useEffect(() => {
    const onReset = () => closeChat();
    window.addEventListener(HOME_RESET_EVENT, onReset);
    return () => window.removeEventListener(HOME_RESET_EVENT, onReset);
  });

  const pushBot = (msg: Omit<Message, "id" | "role">, delay = 700) => {
    setTyping(true);
    return new Promise<void>((resolve) => {
      const t = window.setTimeout(() => {
        setTyping(false);
        setMessages((m) => [...m, { id: genId(), role: "bot", ...msg }]);
        resolve();
      }, delay);
      timersRef.current.push(t);
    });
  };

  const wineCard = (index: number): RecCard => {
    const p = WINE_PICKS[index % WINE_PICKS.length];
    return {
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      price: p.price,
      image: p.image,
    };
  };

  const handleSend = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    openChat();
    setMessages((m) => [...m, { id: genId(), role: "user", text }]);
    setInput("");

    if (stage === "await_wine_budget") {
      setStage("done");
      await pushBot({
        text: "了解，那我幫你留了這支，送禮質感很夠，也是我常推薦的一支：",
        cards: [wineCard(0)],
      });
      return;
    }

    if (text.includes("麵")) {
      await pushBot(
        {
          text: "先推薦你一款我覺得最讚的：大師兄銷魂麻辣粗麵。它是排隊名店直接做成快煮麵的版本，麻辣醬料熬了十小時，香氣跟店裡吃到的很接近，麵體也夠粗夠有嚼勁。不管是自己想解饞，還是要送給喜歡吃辣的朋友，都不容易踩雷，算是討論度最高、回購率也最好的一款：",
          cards: [NOODLE_PICKS[0]],
        },
        900,
      );
      await pushBot({
        text: "如果想一次多備幾款，這幾款也很適合搭配著買：",
        cards: NOODLE_PICKS.slice(1),
      });
      await pushBot({ text: "喜歡的都可以勾起來，一起加入購物車：" }, 400);
      return;
    }

    if (
      text.includes("送禮") ||
      (text.includes("酒") && !text.includes("烤肉"))
    ) {
      setStage("await_wine_budget");
      await pushBot({
        text: "送禮的話，大概想抓多少預算？",
        quickReplies: ["1,000 以內", "1,000–3,000", "3,000 以上"],
      });
      return;
    }

    if (text.includes("中秋") || text.includes("烤肉")) {
      await pushBot({
        text: "中秋烤肉配這支很順口，要不要看看？",
        cards: [wineCard(1)],
      });
      return;
    }

    if (text.includes("現金")) {
      await pushBot({
        text: "AIFIAN 的回饋不是現金，是可以拿來用的點數：在「兌換」分頁換商品，或直接折抵買東西的金額。",
        quickReplies: ["去看兌換商品"],
      });
      return;
    }

    if (
      text.includes("領取") ||
      text.includes("賺回饋") ||
      text.includes("兌換")
    ) {
      await pushBot({
        text: "透過 AIFIAN 買東西、每日簽到、推薦好友都會累積回饋，累積到的回饋可以在「兌換」分頁換商品或折抵金額。",
        quickReplies: ["去看兌換商品"],
      });
      return;
    }

    if (text.includes("智能選品") || text.includes("回饋")) {
      await pushBot({
        text: `你目前的智能選品持有 ${AI_SELECT_HOLDING} 瓶，回饋餘額 ${REWARD_BALANCE.toLocaleString()}，這個月還在累積中。`,
        quickReplies: ["查看我的回饋"],
      });
      return;
    }

    if (text.includes("可樂") || text.includes("補貨")) {
      await pushBot({
        text: "上次那款可樂我幫你留意到通路快缺貨了，補齊我馬上跟你說。",
      });
      return;
    }

    await pushBot({
      text: "這個我還在學，先跟你說我目前能幫上忙的：推薦商品、看回饋，或聊聊怎麼賺回饋。",
      quickReplies: ["推薦幾款好吃的乾拌麵給我", "如何開始領取回饋"],
    });
  };

  const handleQuickReply = (reply: string) => {
    if (reply === "查看我的回饋") {
      router.push("/v13/rewards");
      return;
    }
    if (reply === "去看兌換商品") {
      router.push("/v13/exchange");
      return;
    }
    handleSend(reply);
  };

  // 其他頁（例如線上藏酒）帶著 ?prompt= 回首頁時，直接展開對話送出那句話。
  // 用 window.location.search，不用 useSearchParams()，避免整頁進 Suspense
  useEffect(() => {
    if (sentInitial.current) return;
    const prompt = new URLSearchParams(window.location.search).get("prompt");
    if (!prompt) return;
    sentInitial.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    handleSend(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rollSuggestions = () => {
    if (itemPhase !== "idle") return;
    const exitTotalMs =
      ITEM_DURATION_MS + (suggestions.length - 1) * ITEM_STAGGER_MS;

    setChipsOpen(true);
    setItemPhase("exiting");
    const t1 = window.setTimeout(() => {
      setSuggestions(shuffle(SUGGESTION_POOL).slice(0, 3));
      setItemPhase("entering-start");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setItemPhase("entering"));
      });
      const t2 = window.setTimeout(() => setItemPhase("idle"), exitTotalMs);
      timersRef.current.push(t2);
    }, exitTotalMs);
    timersRef.current.push(t1);
  };

  const toggleSelected = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const lastMessage = messages[messages.length - 1];
  const lastQuickReplies = !typing ? lastMessage?.quickReplies : undefined;
  const fade = `opacity ${MODE_TRANSITION_MS}ms ease`;

  return (
    <div
      ref={rootRef}
      className="relative flex h-full flex-col overflow-hidden bg-white"
    >
      {/* 首頁插圖：寬度撐滿、高度照比例，圖本身底部就是白色，自然接到底下的白底 */}
      <img
        src="/figma/v13-home-hero.jpg"
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 w-full select-none"
        style={{ opacity: chatOpen ? 0 : 1, transition: fade }}
      />

      <div className="relative flex shrink-0 flex-col">
        <StatusBar />
        <div className="flex h-11 items-center justify-between px-4">
          <button onClick={closeChat} aria-label="AIFIAN 首頁">
            <img
              src="/figma/v13-logo.svg"
              alt="AIFIAN"
              className="h-7 w-auto"
            />
          </button>
          <button
            aria-label="購物車"
            tabIndex={chatOpen ? 0 : -1}
            className="relative flex h-11 items-center rounded-[22px] bg-white px-4 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
            style={{
              opacity: chatOpen ? 1 : 0,
              pointerEvents: chatOpen ? "auto" : "none",
              transition: fade,
            }}
          >
            <img
              ref={cartIconRef}
              src="/figma/v13-cart.svg"
              alt=""
              className="size-5"
            />
            {cartCount > 0 && (
              <span
                ref={badgeRef}
                className="absolute right-[8.5px] top-[7.5px] rounded-[20px] bg-brand px-1 py-0.5 text-[12px] font-bold leading-3 text-gray-000"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1"
        style={{
          opacity: chatOpen ? 1 : 0,
          pointerEvents: chatOpen ? "auto" : "none",
          transition: fade,
        }}
      >
        {/* 浮動的「載入上次對話」：放在捲動區外面，才不會被頂部的淡出遮罩吃掉 */}
        <div
          className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center"
          style={{
            opacity: showHistoryBtn || historyLoading ? 1 : 0,
            transform:
              showHistoryBtn || historyLoading
                ? "translateY(0)"
                : "translateY(-8px)",
            transition: `opacity 200ms ease, transform 200ms ease`,
          }}
        >
          <button
            onClick={loadHistory}
            tabIndex={showHistoryBtn ? 0 : -1}
            className={`flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] text-gray-800 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.12)] ${
              showHistoryBtn || historyLoading ? "pointer-events-auto" : ""
            }`}
          >
            {historyLoading ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
            ) : (
              <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                <path
                  d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2.5 2.5v2.2h2.2M8 5.2V8l1.8 1.2"
                  stroke="#1e2939"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {historyLoading ? "載入中…" : "載入上次對話"}
          </button>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleChatScroll}
          onWheel={(e) => {
            if (Math.abs(e.deltaY) > 2) revealHistoryBtn(e.deltaY < 0);
            // 滾輪（尤其觸控板）捲到底之後還會有一段慣性，那段不能算「多推」：
            // 要在底部停穩 300ms 之後的滾動才累積；內容短到捲不動時直接算停穩
            const el = scrollRef.current;
            const scrollable = !!el && el.scrollHeight > el.clientHeight + 2;
            const settled =
              !scrollable ||
              (atBottomSince.current != null &&
                performance.now() - atBottomSince.current > 300);
            if (e.deltaY > 0 && isAtBottom() && settled) {
              bottomWheelPull.current += e.deltaY;
              if (bottomWheelPull.current > BOTTOM_PULL_WHEEL_PX)
                openChipsFromPull();
            } else if (e.deltaY < 0) {
              bottomWheelPull.current = 0;
            }
          }}
          onTouchStart={(e) => {
            touchStartY.current = e.touches[0].clientY;
            bottomPullStartY.current = null;
          }}
          onTouchMove={(e) => {
            if (touchStartY.current == null) return;
            const y = e.touches[0].clientY;
            const dy = y - touchStartY.current;
            if (Math.abs(dy) > 12) revealHistoryBtn(dy > 0);
            if (!isAtBottom()) {
              bottomPullStartY.current = null;
              return;
            }
            if (bottomPullStartY.current == null) bottomPullStartY.current = y;
            if (bottomPullStartY.current - y > BOTTOM_PULL_TOUCH_PX)
              openChipsFromPull();
          }}
          onTouchEnd={() => {
            bottomPullStartY.current = null;
          }}
          className="no-scrollbar h-full overflow-y-auto overscroll-contain px-4 pb-10 pt-4 [mask-image:linear-gradient(to_bottom,transparent,black_16px)]"
        >
          <div className="flex flex-col gap-6">
            {historyLoaded && (
              <>
                <DateDivider label={PREVIOUS_CHAT_DATE} />
                {PREVIOUS_CHAT.map((m) => (
                  <ChatMessage
                    key={m.id}
                    message={m}
                    selected={selected}
                    onToggle={toggleSelected}
                    onAdd={addFromCard}
                    onOpen={(cards, index) => setSheet({ cards, index })}
                    showDisclaimer={false}
                  />
                ))}
                <DateDivider label="今天" />
              </>
            )}
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                selected={selected}
                onToggle={toggleSelected}
                onAdd={addFromCard}
                onOpen={(cards, index) => setSheet({ cards, index })}
                showDisclaimer={
                  !typing && m === lastMessage && m.role === "bot"
                }
              />
            ))}
            {typing && (
              <div className="flex items-center gap-1 py-2">
                <Dot delay="0ms" />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </div>
            )}
            {lastQuickReplies && (
              <div className="-mt-3 flex flex-wrap gap-2">
                {lastQuickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickReply(q)}
                    className={CHIP_CLASS}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部留白要讓過 tabbar：55px 膠囊＋底部安全區（真手機 env()+12px、
          桌機預覽 34px），再加 Figma 上 8px 的間距 */}
      <div className="relative flex shrink-0 flex-col gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+75px)] sm:pb-[97px]">
        <div className="flex flex-col py-2">
          <div className="flex h-5 items-center justify-between">
            <button
              onClick={() => setChipsOpen((v) => !v)}
              aria-expanded={chipsOpen}
              className="flex items-center gap-1"
            >
              <span className="text-[16px] font-bold text-gray-800">
                你可能想知道
              </span>
              <img
                src="/figma/v13-nav-arrow-down.svg"
                alt=""
                className="size-4"
                style={{
                  transform: chipsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: `transform ${MODE_TRANSITION_MS}ms ease`,
                }}
              />
            </button>
            <button
              onClick={rollSuggestions}
              aria-label="換一批"
              tabIndex={chipsOpen ? 0 : -1}
              style={{
                opacity: chipsOpen ? 1 : 0,
                pointerEvents: chipsOpen ? "auto" : "none",
                transition: `opacity ${MODE_TRANSITION_MS}ms ease`,
              }}
            >
              <img src="/figma/v13-refresh.svg" alt="" className="size-4" />
            </button>
          </div>
          {/* 收合／展開用 grid-template-rows 在 0fr 跟 1fr 之間過渡：高度不用
              寫死，標籤換一批之後內容高度變了也一樣能順順地收起來、打開。
              同時淡入淡出、稍微往下位移，收起來時像是縮回標題底下 */}
          <div
            className="grid"
            style={{
              gridTemplateRows: chipsOpen ? "1fr" : "0fr",
              opacity: chipsOpen ? 1 : 0,
              transition: `grid-template-rows ${MODE_TRANSITION_MS}ms ${EASING}, opacity ${MODE_TRANSITION_MS}ms ease`,
            }}
            aria-hidden={!chipsOpen}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className="flex flex-col items-start gap-2 pt-4"
                style={{
                  transform: chipsOpen ? "translateY(0)" : "translateY(8px)",
                  transition: `transform ${MODE_TRANSITION_MS}ms ${EASING}`,
                }}
              >
                {suggestions.map((s, i) => {
                  const visible =
                    itemPhase === "idle" || itemPhase === "entering";
                  const animating =
                    itemPhase === "exiting" || itemPhase === "entering";
                  return (
                    <button
                      key={s.key}
                      onClick={() => {
                        setChipsOpen(false);
                        handleSend(s.prompt);
                      }}
                      style={{
                        opacity: visible ? 1 : 0,
                        transform: visible
                          ? "translateY(0)"
                          : "translateY(6px)",
                        transition: animating
                          ? `opacity ${ITEM_DURATION_MS}ms ease ${i * ITEM_STAGGER_MS}ms, transform ${ITEM_DURATION_MS}ms ease ${i * ITEM_STAGGER_MS}ms`
                          : "none",
                      }}
                      tabIndex={chipsOpen ? 0 : -1}
                      className={CHIP_CLASS}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex h-[52px] items-center gap-2 rounded-[999px] bg-white/90 px-3 py-2 shadow-[0px_4px_36px_0px_rgba(0,0,0,0.12)]"
        >
          <img src="/figma/plus.svg" alt="" className="size-6 shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="什麼都可以聊..."
            className="min-w-0 flex-1 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-[#a1a6ab]"
          />
          <span className="flex size-9 shrink-0 items-center justify-center">
            <img src="/figma/mic.svg" alt="語音輸入" className="size-5" />
          </span>
          <button
            type="submit"
            disabled={!input.trim()}
            className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              input.trim() ? "bg-brand" : "bg-gray-400"
            }`}
            aria-label="送出"
          >
            <img src="/figma/arrow-up.svg" alt="" className="size-5" />
          </button>
        </form>
      </div>

      {sheet && (
        <ProductSheet
          cards={sheet.cards}
          startIndex={sheet.index}
          addedIds={addedIds}
          onToggleCart={toggleCartFromSheet}
          onBuy={buyFromSheet}
          onClose={() => setSheet(null)}
        />
      )}

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-40 flex justify-center px-4">
          <p
            className="rounded-full bg-gray-800/90 px-4 py-2 text-[13px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
            style={{ animation: "fadeIn 200ms ease" }}
          >
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}

const CHIP_CLASS =
  "max-w-full rounded-[999px] border border-[#d1d6db] bg-white px-[14px] py-2 text-left text-[13px] text-[#4a5461]";

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-gray-100" />
      <span className="text-[12px] text-[#a1a5af]">{label}</span>
      <span className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-gray-400"
      style={{ animationDelay: delay }}
    />
  );
}

function ChatMessage({
  message,
  selected,
  onToggle,
  onAdd,
  onOpen,
  showDisclaimer,
}: {
  message: Message;
  selected: string[];
  onToggle: (id: string) => void;
  onAdd: (from: HTMLElement, card: RecCard) => void;
  onOpen: (cards: RecCard[], index: number) => void;
  showDisclaimer: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="max-w-[80%] self-end rounded-[18px] bg-gray-800 px-[18px] py-[11px] text-[15px] text-white">
        {message.text}
      </div>
    );
  }

  const cards = message.cards ?? [];
  return (
    <div className="flex flex-col gap-3">
      {message.text && (
        <p className="text-[15px] leading-[25px] text-gray-800">
          {message.text}
        </p>
      )}
      {cards.length === 1 && (
        <ProductCard
          card={cards[0]}
          className="w-[172px]"
          checked={selected.includes(cards[0].id)}
          onToggle={onToggle}
          onAdd={onAdd}
          onOpen={() => onOpen(cards, 0)}
        />
      )}
      {cards.length > 1 && (
        <div className="flex gap-4">
          {cards.map((c, i) => (
            <ProductCard
              key={c.id}
              card={c}
              className="min-w-0 flex-1"
              checked={selected.includes(c.id)}
              onToggle={onToggle}
              onAdd={onAdd}
              onOpen={() => onOpen(cards, i)}
            />
          ))}
        </div>
      )}
      {showDisclaimer && (
        <p className="text-[12px] text-[#a1a5af]">
          伴伴是 AI，有時可能會出錯。
        </p>
      )}
    </div>
  );
}

// 商品卡照 Figma：上方方形圖（還沒有實拍的先用灰底）、右上角圓圈勾選、
// 下方品名＋價格＋紅色加入購物車按鈕。點卡片其他地方打開商品細節頁，
// 勾選圈跟 + 按鈕各自擋掉冒泡，不會順便打開細節頁
function ProductCard({
  card,
  className,
  checked,
  onToggle,
  onAdd,
  onOpen,
}: {
  card: RecCard;
  className: string;
  checked: boolean;
  onToggle: (id: string) => void;
  onAdd: (from: HTMLElement, card: RecCard) => void;
  onOpen: () => void;
}) {
  return (
    <div
      data-product-card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      className={`cursor-pointer overflow-hidden rounded-[16px] border border-[#e8eaee] bg-white ${className}`}
    >
      <div data-product-image className="relative aspect-square bg-[#f0f2f5]">
        {card.image && (
          <img
            src={card.image}
            alt={card.name}
            className="size-full object-cover"
          />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(card.id);
          }}
          aria-label={checked ? "取消勾選" : "勾選"}
          aria-pressed={checked}
          className="absolute right-[11px] top-[9px] size-6"
        >
          {checked ? (
            <svg viewBox="0 0 24 24" className="size-6">
              <circle cx="12" cy="12" r="12" fill="#ff3b3b" />
              <path
                d="M7.5 12.5l3 3 6-6.5"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <img src="/figma/v13-check-circle.svg" alt="" className="size-6" />
          )}
        </button>
      </div>
      <div className="flex flex-col gap-1 px-[11px] pb-3 pt-[9px]">
        <p className="line-clamp-1 text-[13px] font-medium leading-[18px] text-gray-800">
          {card.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-gray-800">
            NT$ {card.price.toLocaleString()}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(e.currentTarget, card);
            }}
            aria-label="加入購物車"
            className="flex size-[30px] items-center justify-center rounded-[8px] bg-[#ff5050]"
          >
            <svg viewBox="0 0 16 16" className="size-4">
              <path
                d="M8 3v10M3 8h10"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
