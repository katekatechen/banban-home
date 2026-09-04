"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBar from "../_components/StatusBar";
import Icon from "../_components/Icon";
import ProductSheet from "../_components/ProductSheet";
import { getCart, toggleCartItem, ensureInCart } from "../_lib/cart";
import {
  type Message,
  type RecCard,
  type Stage,
  DEFAULT_GREETING,
  bumpNextId,
  genId,
  loadMessages,
  loadStage,
  saveMessages,
  saveStage,
} from "../_lib/chat-storage";
import { TODAY_REWARD_AMOUNT } from "../_lib/mock-data";
import { getOrders, type Order } from "../_lib/orders";

// 標題每次進首頁隨機換一句，其中一句直接呼應「賺回饋」這個主軸
const HEADLINES = [
  "嗨 Ben，你今天可能會需要",
  "嗨 Ben，你今天的回饋突破 300 了",
];

const CARD_ICON_WRAP = "flex size-9 items-center justify-center rounded-full";

type SuggestionCard = {
  key: string;
  href?: string;
  prompt?: string;
  bg: string;
  text: string;
  subtext: string;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

// 首頁就是伴伴的對話串本身——個人化建議收成一塊永遠釘在最上面、
// 可以收合的區塊，不會被往下捲的訊息蓋走；下面接的才是真正的對話。
export default function HomeChat({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const router = useRouter();

  // 標題固定從第一句開始 render（跟 SSR 結果一致，避免 hydration
  // mismatch），掛載後才隨機換一句
  const [headline, setHeadline] = useState(HEADLINES[0]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(false);

  const [messages, setMessages] = useState<Message[]>(DEFAULT_GREETING);
  const [stage, setStage] = useState<Stage>("idle");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sheetCard, setSheetCard] = useState<RecCard | null>(null);
  const [cartKeys, setCartKeys] = useState<Set<string>>(
    () => new Set(getCart().map((i) => i.key)),
  );
  const hydrated = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeadline(HEADLINES[Math.floor(Math.random() * HEADLINES.length)]);
    setActiveOrder(getOrders().find((o) => o.status === "進行中") ?? null);
  }, []);

  // 掛載後才接續之前的對話，跟 SSR 結果一致的預設招呼語先 render，
  // 避免 hydration mismatch。dev 模式下 React StrictMode 會把 effect
  // 故意重跑一次，用 ref 擋住第二次重跑，不然對話會被重置回招呼語。
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const loaded = loadMessages();
    bumpNextId(loaded.map((m) => m.id));
    setMessages(loaded);
    setStage(loadStage());
  }, []);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);
  useEffect(() => {
    saveStage(stage);
  }, [stage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, typing]);

  const pushBot = (msg: Omit<Message, "id" | "role">, delay = 700) => {
    setTyping(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setTyping(false);
        setMessages((m) => [...m, { id: genId(), role: "bot", ...msg }]);
        resolve();
      }, delay);
    });
  };

  const pushUser = (text: string) => {
    setMessages((m) => [...m, { id: genId(), role: "user", text }]);
  };

  const handleSend = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    pushUser(text);
    setInput("");

    // 依 stage 先處理快速回覆分支
    if (stage === "await_wine_budget") {
      setStage("done");
      await pushBot({
        text: `了解，那我幫你留了一支麥卡倫 12 年雪莉桶，送禮質感很夠，也是我常推薦的一支。`,
      });
      await pushBot({
        card: {
          name: "麥卡倫 12 年雪莉桶",
          desc: "2025 Whisky · 送禮首選",
          price: 999,
          emoji: "🥃",
          gradient: "from-[#EAE7DD] to-[#EAE7DD]",
        },
      });
      return;
    }

    if (stage === "await_daily_category") {
      setStage("done");
      await pushBot({
        text: "手邊剛好有你常買的那款，要我直接幫你下單嗎？",
      });
      await pushBot({
        card: {
          name: "無香洗衣精 補充包",
          desc: "日用品 · 上次購買同款",
          price: 259,
          emoji: "🧴",
          gradient: "from-sky-600 to-sky-900",
        },
      });
      return;
    }

    // 關鍵字判斷（模擬伴伴對話邏輯，非本次改版範圍，這裡只是 mock）
    if (text.includes("送禮") || (text.includes("酒") && !text.includes("日用品"))) {
      setStage("await_wine_budget");
      await pushBot({
        text: "送禮的話，大概想抓多少預算？",
        quickReplies: ["1,000 以內", "1,000–3,000", "3,000 以上"],
      });
      return;
    }

    if (text.includes("日用品")) {
      setStage("await_daily_category");
      await pushBot({
        text: "想找哪一類的日用品？",
        quickReplies: ["清潔用品", "個人護理", "廚房用品"],
      });
      return;
    }

    if (text.includes("回饋")) {
      await pushBot({
        text: "這個月的回饋活動在「回饋許願池」那邊，我先幫你留意，有更划算的我再跟你說。",
        quickReplies: ["去看回饋許願池"],
      });
      return;
    }

    if (text.includes("報稅") || text.includes("理財") || text.includes("股票")) {
      await pushBot({
        text: "報稅的事我幫你稍微留意過，等你資料備齊我再跟你講怎麼弄最省事，先不用急。",
      });
      return;
    }

    await pushBot({
      text: "這個我還在學，先跟你說我目前能幫上忙的：買酒、買日用品，或聊聊回饋跟理財。",
      quickReplies: ["幫我找一支送禮的酒", "我想買日用品"],
    });
  };

  const handleQuickReply = (reply: string) => {
    if (reply === "去看回饋許願池") {
      router.push("/v8/reward-marketplace");
      return;
    }
    handleSend(reply);
  };

  const toCartItem = (card: RecCard) => ({
    key: card.name,
    name: card.name,
    price: card.price,
    emoji: card.emoji,
    gradient: card.gradient,
    source: "伴伴對話" as const,
  });

  const handleToggleCart = (card: RecCard) => {
    const nowIn = toggleCartItem(toCartItem(card));
    setCartKeys((prev) => {
      const next = new Set(prev);
      if (nowIn) next.add(card.name);
      else next.delete(card.name);
      return next;
    });
  };

  const handleBuyNow = (card: RecCard) => {
    ensureInCart(toCartItem(card));
    setSheetCard(null);
    router.push("/v8/checkout");
  };

  // 個人化建議卡：用 icon 取代 emoji，訂單媒合中只在有進行中訂單時才插進來，
  // 顏色特地跟其他卡不同（深藍），讓它在一排卡片裡明顯凸顯出來。
  // 有 prompt 的卡直接把文字送進對話（同一個畫面裡完成），有 href 的卡才是
  // 真的跳頁（去別的功能頁）。
  const suggestionCards: SuggestionCard[] = [
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
      prompt: "推薦適合週末喝的酒",
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
      prompt: "幫我挑一份生日禮物",
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
      prompt: "我想買零卡可樂",
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
    <div className="relative flex h-full flex-col bg-white">
      <StatusBar />

      {/* header：拿掉 AIFIAN logo，回饋數字也不用灰底大膠囊，
          避免搶了「伴伴」本身的存在感——只有這個首頁的 header 這樣調整，
          其他頁面的共用 header 不動 */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-1">
        <button
          onClick={onOpenSidebar}
          title="選單"
          className="flex size-8 items-center justify-center text-gray-800"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
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
            <span className="text-[14px] font-medium text-gray-800">999,999</span>
          </div>
        </div>
      </div>

      {/* 個人化建議：永遠釘在最上面，不會被下面的對話捲走。
          可以收合——收合後的樣式先做一個陽春版，之後再調整長相。 */}
      <div className="shrink-0 border-b border-gray-100 pb-3">
        {suggestionsCollapsed ? (
          <button
            onClick={() => setSuggestionsCollapsed(false)}
            className="flex w-full items-center gap-2 px-4 pt-1 text-left"
          >
            <span className="text-[13px] font-medium text-gray-500">
              今天的建議（{suggestionCards.length}）
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 pt-1">
              <p className="whitespace-pre-line text-[20px] font-black leading-[1.25] text-gray-800">
                {headline}
              </p>
              <button
                onClick={() => setSuggestionsCollapsed(true)}
                title="收合建議"
                className="flex size-7 shrink-0 items-center justify-center text-gray-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>
            </div>

            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4">
              {suggestionCards.map((c) => {
                const content = (
                  <>
                    <div className={`${CARD_ICON_WRAP} ${c.iconBg}`}>{c.icon}</div>
                    <div>
                      <p className="text-[15px] font-bold leading-snug">{c.title}</p>
                      <p className={`mt-1 line-clamp-2 text-[12px] leading-snug ${c.subtext}`}>
                        {c.description}
                      </p>
                    </div>
                  </>
                );
                const className = `flex w-[176px] shrink-0 flex-col gap-3 rounded-2xl ${c.bg} p-4 ${c.text} text-left transition-transform active:scale-[0.98]`;
                return c.href ? (
                  <Link key={c.key} href={c.href} className={className}>
                    {content}
                  </Link>
                ) : (
                  <button key={c.key} onClick={() => handleSend(c.prompt!)} className={className}>
                    {content}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 對話串：往上捲看得到過去的對話，往下永遠是最新的 */}
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              inCart={m.card ? cartKeys.has(m.card.name) : false}
              onToggleCart={handleToggleCart}
              onBuyNow={handleBuyNow}
              onOpenSheet={setSheetCard}
            />
          ))}
          {typing && (
            <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
              <Dot delay="0ms" />
              <Dot delay="150ms" />
              <Dot delay="300ms" />
            </div>
          )}
          {!typing &&
            messages[messages.length - 1]?.quickReplies?.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickReply(q)}
                className="self-start rounded-full border border-brand px-3.5 py-2 text-[13px] font-medium text-brand"
              >
                {q}
              </button>
            ))}
        </div>
      </div>

      {/* 對話框：固定在畫面最下面，不隨內容捲動 */}
      <div className="flex shrink-0 flex-col gap-2 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-3 pr-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="shrink-0 text-gray-800">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="想做什麼，跟伴伴說"
            className="flex-1 bg-transparent px-1 text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-800">
            <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <path d="M12 18v4" />
          </svg>
          <button type="submit" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>

      {sheetCard && (
        <ProductSheet
          card={sheetCard}
          inCart={cartKeys.has(sheetCard.name)}
          onClose={() => setSheetCard(null)}
          onToggleCart={() => handleToggleCart(sheetCard)}
          onBuyNow={() => handleBuyNow(sheetCard)}
        />
      )}
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

function ChatBubble({
  message,
  inCart,
  onToggleCart,
  onBuyNow,
  onOpenSheet,
}: {
  message: Message;
  inCart: boolean;
  onToggleCart: (card: RecCard) => void;
  onBuyNow: (card: RecCard) => void;
  onOpenSheet: (card: RecCard) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-gray-800 px-4 py-2.5 text-[14px] text-white">
        {message.text}
      </div>
    );
  }

  if (message.card) {
    const c = message.card;
    return (
      <div className="flex w-full max-w-[85%] items-center gap-3 self-start rounded-2xl border border-gray-200 bg-white p-3.5">
        <button
          onClick={() => onOpenSheet(c)}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          <div className={`flex size-[74px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[30px] ${c.gradient}`}>
            {c.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[15px] leading-[1.4] text-gray-800">{c.name}</p>
            <p className="mt-2 text-[17px] font-bold text-gray-800">${c.price.toLocaleString()}</p>
          </div>
        </button>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            onClick={() => onToggleCart(c)}
            title={inCart ? "已加入購物車" : "加入購物車"}
            className={`relative flex size-[42px] items-center justify-center rounded-[10px] border transition-colors ${
              inCart ? "border-emerald-600 bg-emerald-50 text-emerald-600" : "border-gray-300 text-gray-500"
            }`}
          >
            {inCart ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onBuyNow(c)}
            title="立即購買"
            className="flex size-[42px] items-center justify-center rounded-[10px] bg-brand text-white shadow-[0_2px_6px_rgba(255,59,59,0.3)]"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (message.orderConfirmed) {
    return (
      <div className="flex max-w-[85%] items-start gap-2 self-start rounded-2xl rounded-bl-sm bg-gray-800 px-4 py-3 text-white">
        <span className="text-[18px]">📦</span>
        <p className="text-[13px] leading-relaxed">{message.text}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5 text-[14px] text-gray-800">
      {message.text}
    </div>
  );
}
