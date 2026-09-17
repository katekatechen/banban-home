"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputAirRing from "../_components/InputAirRing";
import StatusBar from "../_components/StatusBar";
import VectorField from "../_components/VectorField";
import {
  AI_SELECT_HOLDING,
  REWARD_BALANCE,
  WINE_PICKS,
} from "../_lib/mock-data";
import { usePageSlide } from "../_lib/page-transition";
import {
  GREETING_TEXT,
  genId,
  type Message,
  type RecCard,
  type Stage,
} from "../_lib/chat-storage";

// 對話邏輯拿 v9 那套關鍵字判斷當底、砍掉購物車跟 FaceID 下單那條線，
// 只留文字回覆＋快速回覆＋一張純資訊性的推薦卡（點下去帶去回饋頁，
// 不做假的加入購物車/立即購買按鈕——v11 沒有對應的商品頁跟結帳流程，
// 硬接只會做出按了沒反應的東西）
export default function ChatClient() {
  const router = useRouter();
  const { style, exit } = usePageSlide();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";

  const [messages, setMessages] = useState<Message[]>([
    { id: genId(), role: "bot", text: GREETING_TEXT },
  ]);
  const [stage, setStage] = useState<Stage>("idle");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [focused, setFocused] = useState(false);
  const [keystrokeTick, setKeystrokeTick] = useState(0);
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

    if (text.includes("理財") || text.includes("報稅") || text.includes("股票")) {
      await pushBot({
        text: "這個我幫你稍微留意過，等資料備齊我再跟你講怎麼弄最省事，先不用急。",
      });
      return;
    }

    await pushBot({
      text: "這個我還在學，先跟你說我目前能幫上忙的：買酒、看智能選品，或聊聊回饋。",
      quickReplies: ["幫我找一支送禮的酒", "我想看智能選品"],
    });
  };

  const handleQuickReply = (reply: string) => {
    if (reply === "查看我的回饋") {
      router.push("/v11/rewards");
      return;
    }
    handleSend(reply);
  };

  useEffect(() => {
    if (initialPrompt && !sentInitial.current) {
      sentInitial.current = true;
      handleSend(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const lastQuickReplies = !typing
    ? messages[messages.length - 1]?.quickReplies
    : undefined;

  return (
    <div className="relative flex h-full flex-col bg-white" style={style}>
      <StatusBar />
      <div className="relative flex shrink-0 items-center justify-center px-4 pb-3 pt-1">
        <button
          onClick={() => exit(() => router.back())}
          aria-label="返回"
          className="absolute left-4 flex size-9 items-center justify-center rounded-full bg-gray-100"
        >
          <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <img src="/figma/logo.svg" alt="" className="h-4 w-auto" />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}
          {typing && (
            <div className="flex h-11 w-16 items-center self-start overflow-hidden rounded-2xl rounded-bl-sm bg-gray-100">
              {/* 「正在輸入」不是三個跳動的圓點，是氣流場的思考模式縮小版——
                  跟首頁送出訊息時看到的是同一種材質，只是這裡尺寸小很多 */}
              <VectorField
                mode="thinking"
                attractor={{ x: 0.5, y: 0.5 }}
                interactive={false}
                spacing={11}
                opacity={0.5}
              />
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

      <div className="px-3 pb-3 pt-1">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-2">
            <InputAirRing focused={focused} keystrokeTick={keystrokeTick} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative flex items-center gap-2 rounded-full bg-white p-2.5 shadow-[0px_8px_28px_0px_rgba(16,24,40,0.10)]"
          >
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setKeystrokeTick((k) => k + 1);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="什麼都可以問 AIFIAN"
              autoFocus
              className="flex-1 px-2 text-[14px] text-gray-800 outline-none placeholder:text-[#a1a6ab]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-colors ${
                input.trim() ? "bg-brand" : "bg-gray-300"
              }`}
              aria-label="送出"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-4">
                <path
                  d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
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
      <button
        className="flex w-full max-w-[85%] items-center gap-3 self-start rounded-2xl border border-gray-200 bg-white p-3.5 text-left"
      >
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
