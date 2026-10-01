"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import StatusBar from "../_components/StatusBar";
import { HOME_RESET_EVENT } from "../_components/TabBar";
import {
  genId,
  loadChat,
  saveChat,
  type Message,
  type RecCard,
  type Stage,
} from "../_lib/chat-storage";
import { AI_SELECT_HOLDING, REWARD_BALANCE, WINE_PICKS } from "../_lib/mock-data";

// v13 首頁＝聊天分頁，照 Figma 948:44415（首頁）跟 981:24621（對話中）。
// 點輸入框不換頁：插圖淡出、上方冒出購物車、中間換成對話內容，
// 「你可能想知道」收成一行，輸入框跟 tabbar 留在原位。
// 對話邏輯沿用 v12 對話頁那套關鍵字判斷，只是搬進首頁裡原地展開

// 換一批：標籤不是瞬間換掉，是舊的依序消失、新的再依序出現。三個狀態
// 靠同一個 phase 驅動所有標籤的 style，用 transition 縮寫裡的 delay
// 做出「依序」的效果
type SuggestionPhase = "idle" | "exiting" | "entering-start" | "entering";
const ITEM_STAGGER_MS = 60;
const ITEM_DURATION_MS = 200;
const MODE_TRANSITION_MS = 300;

// 前三個是 Figma 上的原文案，首頁一打開就照這三個排，換一批才洗牌
const SUGGESTION_POOL = [
  { key: "how-to-earn", prompt: "如何開始領取回饋", label: "如何開始領取回饋" },
  { key: "is-cash", prompt: "AIFIAN 的回饋是現金嗎", label: "AIFIAN 的回饋是現金嗎" },
  { key: "restock-drink", prompt: "我想買可樂", label: "上次買的可樂喝完了嗎？要不要補貨" },
  { key: "noodles", prompt: "推薦幾款好吃的乾拌麵給我", label: "推薦幾款好吃的乾拌麵給我" },
  { key: "mid-autumn", prompt: "推薦適合中秋烤肉喝的酒", label: "中秋烤肉想喝點什麼嗎？" },
  { key: "daily-reward", prompt: "我想看智能選品", label: "你的每日回饋突破 100 元！再買點智能選品？" },
];

const NOODLE_PICKS: RecCard[] = [
  { id: "dashixiong", name: "大師兄銷魂麻辣粗麵", price: 129 },
  { id: "laotao", name: "老饕乾拌麵 麻醬蒜香", price: 99 },
  { id: "jinjiazhuang", name: "金家莊 蒜辣拌麵", price: 109 },
];

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
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  // 首頁預設展開建議，進到對話後收成一行，點標題可以再打開
  const [chipsOpen, setChipsOpen] = useState(!chat.open);
  const [suggestions, setSuggestions] = useState(SUGGESTION_POOL.slice(0, 3));
  const [itemPhase, setItemPhase] = useState<SuggestionPhase>("idle");
  const timersRef = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasUserMessageRef = useRef(messages.some((m) => m.role === "user"));
  const sentInitial = useRef(false);

  useEffect(() => {
    saveChat({ open: chatOpen, messages, stage, selected, cartCount });
  }, [chatOpen, messages, stage, selected, cartCount]);

  useEffect(() => {
    hasUserMessageRef.current = messages.some((m) => m.role === "user");
  }, [messages]);

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
    return { id: p.id, name: p.name, subtitle: p.subtitle, price: p.price, image: p.image };
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
      await pushBot({
        text: "先推薦你一款我覺得最讚的：大師兄銷魂麻辣粗麵。它是排隊名店直接做成快煮麵的版本，麻辣醬料熬了十小時，香氣跟店裡吃到的很接近，麵體也夠粗夠有嚼勁。不管是自己想解饞，還是要送給喜歡吃辣的朋友，都不容易踩雷，算是討論度最高、回購率也最好的一款：",
        cards: [NOODLE_PICKS[0]],
      }, 900);
      await pushBot({
        text: "如果想一次多備幾款，這幾款也很適合搭配著買：",
        cards: NOODLE_PICKS.slice(1),
      });
      await pushBot({ text: "喜歡的都可以勾起來，一起加入購物車：" }, 400);
      return;
    }

    if (text.includes("送禮") || (text.includes("酒") && !text.includes("烤肉"))) {
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

    if (text.includes("領取") || text.includes("賺回饋") || text.includes("兌換")) {
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

  // 只點了輸入框、什麼都沒說就離開：退回插圖首頁。稍微延後再判斷，
  // 點建議標籤時 blur 會比 click 先發生，要等 click 送出訊息之後再看
  const handleBlur = () => {
    const t = window.setTimeout(() => {
      if (!hasUserMessageRef.current && !inputRef.current?.value) closeChat();
    }, 200);
    timersRef.current.push(t);
  };

  const rollSuggestions = () => {
    if (itemPhase !== "idle") return;
    const exitTotalMs = ITEM_DURATION_MS + (suggestions.length - 1) * ITEM_STAGGER_MS;

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
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const lastMessage = messages[messages.length - 1];
  const lastQuickReplies = !typing ? lastMessage?.quickReplies : undefined;
  const fade = `opacity ${MODE_TRANSITION_MS}ms ease`;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
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
            <img src="/figma/v13-logo.svg" alt="AIFIAN" className="h-7 w-auto" />
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
            <img src="/figma/v13-cart.svg" alt="" className="size-5" />
            {cartCount > 0 && (
              <span className="absolute right-[8.5px] top-[7.5px] rounded-[20px] bg-brand px-1 py-0.5 text-[12px] font-bold leading-3 text-gray-000">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar relative flex-1 overflow-y-auto overscroll-contain px-4 py-4 [mask-image:linear-gradient(to_bottom,transparent,black_16px)]"
        style={{
          opacity: chatOpen ? 1 : 0,
          pointerEvents: chatOpen ? "auto" : "none",
          transition: fade,
        }}
      >
        <div className="flex flex-col gap-6">
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              message={m}
              selected={selected}
              onToggle={toggleSelected}
              onAdd={() => setCartCount((c) => c + 1)}
              showDisclaimer={!typing && m === lastMessage && m.role === "bot"}
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
                <button key={q} onClick={() => handleQuickReply(q)} className={CHIP_CLASS}>
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部留白要讓過 tabbar：55px 膠囊＋底部安全區（真手機 env()+12px、
          桌機預覽 34px），再加 Figma 上 8px 的間距 */}
      <div className="relative flex shrink-0 flex-col gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+75px)] sm:pb-[97px]">
        <div className="flex flex-col gap-4 py-2">
          <div className="flex h-5 items-center justify-between">
            <button
              onClick={() => setChipsOpen((v) => !v)}
              aria-expanded={chipsOpen}
              className="flex items-center gap-1"
            >
              <span className="text-[16px] font-bold text-gray-800">你可能想知道</span>
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
            {chipsOpen && (
              <button onClick={rollSuggestions} aria-label="換一批">
                <img src="/figma/v13-refresh.svg" alt="" className="size-4" />
              </button>
            )}
          </div>
          {chipsOpen && (
            <div className="flex flex-col items-start gap-2">
              {suggestions.map((s, i) => {
                const visible = itemPhase === "idle" || itemPhase === "entering";
                const animating = itemPhase === "exiting" || itemPhase === "entering";
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      setChipsOpen(false);
                      handleSend(s.prompt);
                    }}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(6px)",
                      transition: animating
                        ? `opacity ${ITEM_DURATION_MS}ms ease ${i * ITEM_STAGGER_MS}ms, transform ${ITEM_DURATION_MS}ms ease ${i * ITEM_STAGGER_MS}ms`
                        : "none",
                    }}
                    className={CHIP_CLASS}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}
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
            onFocus={openChat}
            onBlur={handleBlur}
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
    </div>
  );
}

const CHIP_CLASS =
  "max-w-full rounded-[999px] border border-[#d1d6db] bg-white px-[14px] py-2 text-left text-[13px] text-[#4a5461]";

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
  showDisclaimer,
}: {
  message: Message;
  selected: string[];
  onToggle: (id: string) => void;
  onAdd: () => void;
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
        <p className="text-[15px] leading-[25px] text-gray-800">{message.text}</p>
      )}
      {cards.length === 1 && (
        <ProductCard
          card={cards[0]}
          className="w-[172px]"
          checked={selected.includes(cards[0].id)}
          onToggle={onToggle}
          onAdd={onAdd}
        />
      )}
      {cards.length > 1 && (
        <div className="flex gap-4">
          {cards.map((c) => (
            <ProductCard
              key={c.id}
              card={c}
              className="min-w-0 flex-1"
              checked={selected.includes(c.id)}
              onToggle={onToggle}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
      {showDisclaimer && (
        <p className="text-[12px] text-[#a1a5af]">伴伴是 AI，有時可能會出錯。</p>
      )}
    </div>
  );
}

// 商品卡照 Figma：上方方形圖（還沒有實拍的先用灰底）、右上角圓圈勾選、
// 下方品名＋價格＋紅色加入購物車按鈕
function ProductCard({
  card,
  className,
  checked,
  onToggle,
  onAdd,
}: {
  card: RecCard;
  className: string;
  checked: boolean;
  onToggle: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[16px] border border-[#e8eaee] bg-white ${className}`}
    >
      <div className="relative aspect-square bg-[#f0f2f5]">
        {card.image && (
          <img src={card.image} alt={card.name} className="size-full object-cover" />
        )}
        <button
          onClick={() => onToggle(card.id)}
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
          <p className="text-[14px] font-bold text-gray-800">NT$ {card.price.toLocaleString()}</p>
          <button
            onClick={onAdd}
            aria-label="加入購物車"
            className="flex size-[30px] items-center justify-center rounded-[8px] bg-[#ff5050]"
          >
            <svg viewBox="0 0 16 16" className="size-4">
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
