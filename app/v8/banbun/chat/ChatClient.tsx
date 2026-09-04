"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBar from "../../_components/StatusBar";
import ProductSheet from "../../_components/ProductSheet";
import { getCart, toggleCartItem, ensureInCart } from "../../_lib/cart";
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
} from "../../_lib/chat-storage";

export default function ChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";

  // 跟 SSR 結果一致的預設狀態先 render（避免 hydration mismatch），
  // 掛載後才在 effect 裡讀 sessionStorage、接續真正的對話——
  // v8 沒有「開新對話」也沒有多個對話串，永遠接續同一段
  const [messages, setMessages] = useState<Message[]>(DEFAULT_GREETING);
  const [stage, setStage] = useState<Stage>("idle");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sheetCard, setSheetCard] = useState<RecCard | null>(null);
  const [cartKeys, setCartKeys] = useState<Set<string>>(
    () => new Set(getCart().map((i) => i.key)),
  );
  const sentInitial = useRef(false);
  const hydrated = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 掛載後才接續之前的對話，這個 effect 要排在「送出網址帶來的 prompt」
  // 那個 effect 前面，先把舊訊息接上，才輪到新 prompt 接在後面。
  // dev 模式下 React StrictMode 會把 effect 故意重跑一次，用 ref 擋住
  // 第二次重跑，不然會在對話進行到一半時把訊息重置回預設招呼語。
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const loaded = loadMessages();
    bumpNextId(loaded.map((m) => m.id));
    setMessages(loaded);
    setStage(loadStage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 把目前這段唯一的對話寫回 sessionStorage，沒有清單、沒有 activeId 要維護
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

  useEffect(() => {
    if (initialPrompt && !sentInitial.current) {
      sentInitial.current = true;
      handleSend(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  return (
    <div className="relative flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex items-center gap-1 border-b border-gray-100 px-2 pb-3 pt-1">
        <button
          onClick={() => router.push("/v8/banbun")}
          title="回首頁"
          className="flex size-8 items-center justify-center text-[20px] text-gray-700"
        >
          ‹
        </button>
        <div className="ml-1 flex items-center gap-2">
          <img src="/icons/tab-banbun.svg" alt="伴伴" className="size-6" />
          <p className="text-[15px] font-semibold text-gray-800">伴伴</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex-1 overflow-y-auto px-4 py-4"
      >
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
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 self-start">
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 border-t border-gray-100 px-3 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="跟伴伴說你想要什麼..."
          className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          type="submit"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white"
        >
          ↑
        </button>
      </form>

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
          <div
            className={`flex size-[74px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[30px] ${c.gradient}`}
          >
            {c.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[15px] leading-[1.4] text-gray-800">
              {c.name}
            </p>
            <p className="mt-2 text-[17px] font-bold text-gray-800">
              ${c.price.toLocaleString()}
            </p>
          </div>
        </button>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            onClick={() => onToggleCart(c)}
            title={inCart ? "已加入購物車" : "加入購物車"}
            className={`relative flex size-[42px] items-center justify-center rounded-[10px] border transition-colors ${
              inCart
                ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                : "border-gray-300 text-gray-500"
            }`}
          >
            {inCart ? (
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
