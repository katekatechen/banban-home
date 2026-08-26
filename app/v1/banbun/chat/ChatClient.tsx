"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBar from "../../_components/StatusBar";
import { addOrder } from "../../_lib/orders";

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

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  stage: Stage;
  updatedAt: number;
};

const STORAGE_CONVERSATIONS = "banbun-conversations";
const STORAGE_ACTIVE_ID = "banbun-active-conversation-id";

const DEFAULT_GREETING: Message[] = [
  {
    id: genId(),
    role: "bot",
    text: "你想要什麼，我來買！要買酒、買日用品，還是想聊聊回饋或理財，都可以直接說。",
  },
];

function createConversation(): Conversation {
  return {
    id: `conv-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    title: "新對話",
    messages: DEFAULT_GREETING,
    stage: "idle",
    updatedAt: Date.now(),
  };
}

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = sessionStorage.getItem(STORAGE_CONVERSATIONS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

function saveConversations(list: Conversation[]) {
  try {
    sessionStorage.setItem(STORAGE_CONVERSATIONS, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function loadActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_ACTIVE_ID);
  } catch {
    return null;
  }
}

function deriveTitle(messages: Message[]): string | null {
  const firstUser = messages.find((m) => m.role === "user" && m.text);
  if (!firstUser?.text) return null;
  return firstUser.text.length > 16
    ? firstUser.text.slice(0, 16) + "…"
    : firstUser.text;
}

export default function ChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";

  // 只在第一次 render 算一次「初始要用哪個對話串」，避免跟後續互動產生競態
  const initialRef = useRef<{
    conversations: Conversation[];
    activeId: string;
  } | null>(null);
  if (initialRef.current === null) {
    const convs = loadConversations();
    let activeId = loadActiveId();
    if (!activeId || !convs.find((c) => c.id === activeId)) {
      if (convs.length > 0) {
        activeId = convs[0].id;
      } else {
        const fresh = createConversation();
        convs.push(fresh);
        activeId = fresh.id;
        nextId = Math.max(...fresh.messages.map((m) => m.id), 0) + 1;
      }
    } else {
      const active = convs.find((c) => c.id === activeId)!;
      nextId = Math.max(...active.messages.map((m) => m.id), 1) + 1;
    }
    initialRef.current = { conversations: convs, activeId };
  }
  const initial = initialRef.current;
  const initialActive =
    initial.conversations.find((c) => c.id === initial.activeId) ??
    initial.conversations[0];

  const [conversations, setConversations] = useState<Conversation[]>(
    initial.conversations,
  );
  const [activeId, setActiveId] = useState<string>(initial.activeId);
  const [messages, setMessages] = useState<Message[]>(initialActive.messages);
  const [stage, setStage] = useState<Stage>(initialActive.stage);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const sentInitial = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 把目前對話寫回對話清單 + sessionStorage（切換/新增對話時三個 setState
  // 會在同一個事件處理內一起呼叫、一起 batch，這裡才不會用舊資料互相覆蓋）
  useEffect(() => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === activeId);
      const title = deriveTitle(messages) ?? prev[idx]?.title ?? "新對話";
      const updated: Conversation = {
        id: activeId,
        title,
        messages,
        stage,
        updatedAt: Date.now(),
      };
      const next =
        idx >= 0
          ? prev.map((c, i) => (i === idx ? updated : c))
          : [updated, ...prev];
      saveConversations(next);
      return next;
    });
    try {
      sessionStorage.setItem(STORAGE_ACTIVE_ID, activeId);
    } catch {
      // ignore
    }
  }, [messages, stage, activeId]);

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
    addOrder({
      name: card.name,
      price: card.price,
      emoji: card.emoji,
      gradient: card.gradient,
      source: "伴伴對話",
    });
    await pushBot({ text: `好，幫你下單「${card.name}」了。` });
    await pushBot({
      orderConfirmed: true,
      text: `已下單，直接寄到你家 — 這次不會存放在 AIFIAN 裡面囉。`,
    });
  };

  const newChat = () => {
    const fresh = createConversation();
    setConversations((prev) => {
      const next = [fresh, ...prev];
      saveConversations(next);
      return next;
    });
    setActiveId(fresh.id);
    setMessages(fresh.messages);
    setStage(fresh.stage);
    setDrawerOpen(false);
  };

  const openConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    setActiveId(id);
    setMessages(conv.messages);
    setStage(conv.stage);
    setDrawerOpen(false);
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
          onClick={() => router.push("/v1/banbun")}
          title="回首頁"
          className="flex size-8 items-center justify-center text-[20px] text-gray-700"
        >
          ‹
        </button>
        <button
          onClick={() => setDrawerOpen(true)}
          title="對話紀錄"
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

      {drawerOpen && (
        <div
          className="absolute inset-0 z-40 flex flex-col bg-white p-4"
          style={{
            animation: "drawerIn 0.26s cubic-bezier(.2,.9,.25,1) both",
          }}
        >
          <div className="flex items-center justify-between px-1 pb-3">
            <img src="/icons/logo-aifian.svg" alt="AIFIAN" className="h-4" />
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex size-9 items-center justify-center rounded-lg text-gray-800"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <button
            onClick={newChat}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-gray-800"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.167.094 10 10 0 1 0-4.845-4.821" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
            開新對話
          </button>

          <div className="no-scrollbar mt-2 flex-1 overflow-y-auto">
            <p className="px-3 pb-2 text-[12px] font-medium text-gray-400">
              最近
            </p>
            {conversations
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={`block w-full truncate rounded-xl px-3 py-3 text-left text-[14px] ${
                    c.id === activeId
                      ? "bg-gray-100 font-medium text-gray-800"
                      : "text-gray-700"
                  }`}
                >
                  {c.title}
                </button>
              ))}
          </div>

          <button
            onClick={() => {
              setDrawerOpen(false);
              router.push("/v1/orders");
            }}
            className="flex items-center gap-3 border-t border-gray-100 px-3 pb-1 pt-4 text-left text-[14px] font-medium text-gray-800"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
              <path d="M12 22V12" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <path d="m7.5 4.27 9 5.15" />
            </svg>
            我的訂單
          </button>
        </div>
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
  onBuy,
}: {
  message: Message;
  onBuy: (card: RecCard) => void;
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
      <div className="flex w-full max-w-[85%] items-center gap-4 self-start rounded-2xl border border-gray-200 bg-white p-3.5">
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
