"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import { AI_SELECT_HOLDING, REWARD_BALANCE, WINE_PICKS } from "../_lib/mock-data";
import { usePageSlide } from "../_lib/page-transition";
import {
  GREETING_TEXT,
  genId,
  type Message,
  type RecCard,
  type Stage,
} from "../_lib/chat-storage";

// 對話邏輯拿 v9 那套關鍵字判斷當底、砍掉購物車跟 FaceID 下單那條線，
// 只留文字回覆＋快速回覆＋一張純資訊性的推薦卡。這版沒有 v11 的氣流場，
// 「正在輸入」改回一般的三點跳動，跟 Figma 這版走的是同一種寫實調性
export default function ChatClient() {
  const router = useRouter();
  const { style, exit } = usePageSlide();

  const [messages, setMessages] = useState<Message[]>([
    { id: genId(), role: "bot", text: GREETING_TEXT },
  ]);
  const [stage, setStage] = useState<Stage>("idle");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const sentInitial = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const wineCard = (index: number): RecCard => {
    const p = WINE_PICKS[index % WINE_PICKS.length];
    return { name: p.name, subtitle: p.subtitle, price: p.price, image: p.image };
  };

  const handleSend = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    pushUser(text);
    setInput("");

    if (stage === "await_wine_budget") {
      setStage("done");
      await pushBot({
        text: "了解，那我幫你留了這支，送禮質感很夠，也是我常推薦的一支。",
      });
      await pushBot({ card: wineCard(0) });
      return;
    }

    if (text.includes("送禮") || (text.includes("酒") && !text.includes("日用品"))) {
      setStage("await_wine_budget");
      await pushBot({
        text: "送禮的話，大概想抓多少預算？",
        quickReplies: ["1,000 以內", "1,000–3,000", "3,000 以上"],
      });
      return;
    }

    if (text.includes("中秋") || text.includes("烤肉")) {
      await pushBot({ text: "中秋烤肉配這支很順口，要不要看看？" });
      await pushBot({ card: wineCard(1) });
      return;
    }

    if (text.includes("智能選品") || text.includes("回饋率") || text.includes("回饋")) {
      await pushBot({
        text: `你目前的智能選品持有 ${AI_SELECT_HOLDING} 瓶，回饋餘額 ${REWARD_BALANCE.toLocaleString()}，這個月還在累積中。`,
        quickReplies: ["查看我的回饋"],
      });
      return;
    }

    if (text.includes("兌換") || text.includes("賺回饋")) {
      await pushBot({
        text: "買酒、每日簽到、推薦好友都會累積回饋，累積到的回饋可以在「兌換」分頁換商品或折抵酒款。",
        quickReplies: ["去看兌換商品"],
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
      text: "這個我還在學，先跟你說我目前能幫上忙的：買酒、看智能選品，或聊聊怎麼賺回饋。",
      quickReplies: ["幫我找一支送禮的酒", "我想看智能選品"],
    });
  };

  const handleQuickReply = (reply: string) => {
    if (reply === "查看我的回饋") {
      router.push("/v12/rewards");
      return;
    }
    if (reply === "去看兌換商品") {
      router.push("/v12/exchange");
      return;
    }
    handleSend(reply);
  };

  // 首頁帶進來的第一句話從網址讀，但不用 useSearchParams()——那個 hook 會
  // 讓整頁進入 Suspense，從首頁點進來時會先閃一片空白才開始滑。反正這句話
  // 本來就只在掛載後的 effect 裡用一次，直接讀 window.location.search 就好
  useEffect(() => {
    if (sentInitial.current) return;
    const prompt = new URLSearchParams(window.location.search).get("prompt");
    if (!prompt) return;
    sentInitial.current = true;
    handleSend(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastQuickReplies = !typing
    ? messages[messages.length - 1]?.quickReplies
    : undefined;

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-white"
      style={style}
    >
      <StatusBar />
      <div className="relative flex shrink-0 items-center justify-center px-4 pb-3 pt-1">
        <button
          onClick={() => exit(() => router.back())}
          aria-label="返回"
          className="absolute left-4 flex size-9 items-center justify-center rounded-full bg-gray-100"
        >
          <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
        </button>
        <img src="/figma/logo.svg" alt="" className="h-4 w-auto" />
        <button
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="搜尋對話"
          aria-expanded={searchOpen}
          className={`absolute right-4 flex size-9 items-center justify-center rounded-full ${
            searchOpen ? "bg-gray-200" : "bg-gray-100"
          }`}
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-5">
            <circle
              cx="9"
              cy="9"
              r="5.5"
              stroke="#1e2939"
              strokeWidth="1.6"
            />
            <path
              d="M13.2 13.2L17 17"
              stroke="#1e2939"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* 搜尋對話：這版只做到入口示意，輸入框可以打字但不會真的過濾訊息，
          先驗證「對話變長之後需要一個回頭找內容的入口」這件事放在這裡
          順不順手，真正的搜尋邏輯之後再說 */}
      {searchOpen && (
        <div className="shrink-0 px-4 pb-3">
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
            <svg viewBox="0 0 20 20" fill="none" className="size-4 shrink-0">
              <circle cx="9" cy="9" r="5.5" stroke="#99a1af" strokeWidth="1.6" />
              <path
                d="M13.2 13.2L17 17"
                stroke="#99a1af"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋對話內容"
              className="flex-1 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
            />
            <button
              onClick={() => {
                setSearchTerm("");
                setSearchOpen(false);
              }}
              className="shrink-0 text-[13px] text-gray-400"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}
          {typing && (
            <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
              <Dot delay="0ms" />
              <Dot delay="150ms" />
              <Dot delay="300ms" />
            </div>
          )}
          {lastQuickReplies?.map((q) => (
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
        className="flex shrink-0 items-center gap-2 border-t border-gray-100 px-3 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="如何賺回饋"
          autoFocus
          className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-colors ${
            input.trim() ? "bg-brand" : "bg-gray-300"
          }`}
          aria-label="送出"
        >
          <img src="/figma/arrow-up.svg" alt="" className="size-5" />
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

function ChatBubble({ message }: { message: Message }) {
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
      <button className="flex w-full max-w-[85%] items-center gap-3 self-start rounded-2xl border border-gray-200 bg-white p-3.5 text-left">
        {c.image ? (
          <img
            src={c.image}
            alt={c.name}
            className="size-[64px] shrink-0 rounded-xl bg-[#EAE7DD] object-cover"
          />
        ) : (
          <div className="size-[64px] shrink-0 rounded-xl bg-[#EAE7DD]" />
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[14px] leading-[1.4] text-gray-800">
            {c.name}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">{c.subtitle}</p>
          <p className="mt-1 text-[15px] font-bold text-gray-800">
            ${c.price.toLocaleString()}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5 text-[14px] text-gray-800">
      {message.text}
    </div>
  );
}
