"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBar from "../../_components/StatusBar";

type RecCard = {
  name: string;
  desc: string;
  price: number;
  emoji: string;
  gradient: string;
};

type Message = {
  id: number;
  role: "bot" | "user";
  text?: string;
  quickReplies?: string[];
  card?: RecCard;
  orderConfirmed?: boolean;
};

let nextId = 1;
const genId = () => nextId++;

type Stage =
  | "idle"
  | "await_wine_budget"
  | "await_daily_category"
  | "done";

const STORAGE_MESSAGES = "banbun-chat-messages";
const STORAGE_STAGE = "banbun-chat-stage";

const DEFAULT_GREETING: Message[] = [
  {
    id: genId(),
    role: "bot",
    text: "你想要什麼，我來買！要買酒、買日用品，還是想聊聊回饋或理財，都可以直接說。",
  },
];

// 用 lazy initializer（而非 useEffect）從 sessionStorage 還原對話紀錄，
// 讀取跟第一次 render 同步發生，避免跟正在進行中的對話流程（例如已經
// setStage 但訊息還在 setTimeout 延遲中）產生競態、把 stage 覆蓋回預設值。
function loadMessages(): Message[] {
  if (typeof window === "undefined") return DEFAULT_GREETING;
  try {
    const saved = sessionStorage.getItem(STORAGE_MESSAGES);
    if (saved) {
      const parsed: Message[] = JSON.parse(saved);
      if (parsed.length > 0) {
        nextId = Math.max(...parsed.map((m) => m.id), 0) + 1;
        return parsed;
      }
    }
  } catch {
    // sessionStorage 不可用（例如無痕模式）就從預設問候語開始
  }
  return DEFAULT_GREETING;
}

function loadStage(): Stage {
  if (typeof window === "undefined") return "idle";
  try {
    const saved = sessionStorage.getItem(STORAGE_STAGE) as Stage | null;
    if (saved) return saved;
  } catch {
    // ignore
  }
  return "idle";
}

export default function ChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";

  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [stage, setStage] = useState<Stage>(loadStage);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const sentInitial = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages));
      sessionStorage.setItem(STORAGE_STAGE, stage);
    } catch {
      // ignore
    }
  }, [messages, stage]);

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
          gradient: "from-amber-700 to-amber-950",
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
        text: "這個月的回饋活動在「體驗」那邊，我先幫你留意，有更划算的我再跟你說。",
        quickReplies: ["去看體驗"],
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
    if (reply === "去看體驗") {
      router.push("/v1/experience");
      return;
    }
    handleSend(reply);
  };

  const handleBuy = async (card: RecCard) => {
    await pushBot({ text: `好，幫你下單「${card.name}」了。` });
    await pushBot({
      orderConfirmed: true,
      text: `已下單，直接寄到你家 — 這次不會存放在 AIFIAN 裡面囉。`,
    });
  };

  useEffect(() => {
    if (initialPrompt && !sentInitial.current) {
      sentInitial.current = true;
      handleSend(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 pb-3 pt-1">
        <button
          onClick={() => router.push("/v1/banbun")}
          className="flex size-8 items-center justify-center text-[20px] text-gray-700"
        >
          ‹
        </button>
        <img src="/icons/tab-banbun.svg" alt="伴伴" className="size-6" />
        <p className="text-[15px] font-semibold text-gray-800">伴伴</p>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} onBuy={handleBuy} />
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
  onBuy,
}: {
  message: Message;
  onBuy: (card: RecCard) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-[14px] text-white">
        {message.text}
      </div>
    );
  }

  if (message.card) {
    const c = message.card;
    return (
      <div
        className="flex w-full max-w-[85%] items-center gap-4 self-start rounded-2xl border border-gray-200 bg-white p-3.5"
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
        <button
          onClick={() => onBuy(c)}
          title="立即購買"
          className="flex size-[46px] shrink-0 items-center justify-center rounded-[10px] text-white shadow-[0_2px_6px_rgba(255,80,80,0.3)]"
          style={{ background: "#ff5050" }}
        >
          <svg
            width="18"
            height="18"
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
