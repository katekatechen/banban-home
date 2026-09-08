"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBar from "../../_components/StatusBar";
import Icon from "../../_components/Icon";
import ProductSheet from "../../_components/ProductSheet";
import FaceIdOrderSheet from "../../_components/FaceIdOrderSheet";
import { getCart, toggleCartItem } from "../../_lib/cart";
import { PRODUCTS, HOLDINGS } from "../../_lib/mock-data";
import { getOrders, addOrder } from "../../_lib/orders";
import {
  type Message,
  type RecCard,
  type Stage,
  DEFAULT_GREETING,
  GREETING_TEXT,
  bumpNextId,
  genId,
  loadMessages,
  saveMessages,
} from "../../_lib/chat-storage";

const HISTORY_PAGE_SIZE = 10;

export default function ChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";

  // 跟 SSR 結果一致的預設狀態先 render（避免 hydration mismatch），
  // 掛載後才在 effect 裡真的接手——每次進聊天室畫面上都像開新對話，
  // 只看得到這次的招呼語，之前的對話收在 historyRef 裡，往上滑才分批載回來
  const [messages, setMessages] = useState<Message[]>(DEFAULT_GREETING);
  const [stage, setStage] = useState<Stage>("idle");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sheetCard, setSheetCard] = useState<RecCard | null>(null);
  const [confirmCard, setConfirmCard] = useState<RecCard | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [cartKeys, setCartKeys] = useState<Set<string>>(
    () => new Set(getCart().map((i) => i.key)),
  );
  const sentInitial = useRef(false);
  const hydrated = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // 還沒載回畫面的舊訊息，由舊到新排列；往上滑一次從尾端撈一批出來
  const historyRef = useRef<Message[]>([]);
  // 補載歷史訊息時用手動算的 scrollTop 頂住位置，這次 messages 變動
  // 不能讓「捲到最下面」的 effect 跟著搶著把畫面拉到底部
  const skipAutoScrollRef = useRef(false);

  // 掛載後才接手：把之前存的全部歷史收進 historyRef（先不顯示），
  // 畫面上只放一則全新的招呼語，看起來就是全新的一段對話。
  // dev 模式下 React StrictMode 會把 effect 故意重跑一次，用 ref 擋住
  // 第二次重跑，不然會把歷史重複塞進 historyRef、招呼語也會多一則。
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const all = loadMessages();
    bumpNextId(all.map((m) => m.id));
    historyRef.current = all;
    setHasMoreHistory(all.length > 0);
    setMessages([{ id: genId(), role: "bot", text: GREETING_TEXT }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 存檔時要把「還沒載回畫面的舊歷史」跟「畫面上這次的訊息」接回同一條時間軸，
  // 不然下次進來 historyRef 會漏掉這次新增的訊息
  useEffect(() => {
    saveMessages([...historyRef.current, ...messages]);
  }, [messages]);

  useEffect(() => {
    if (skipAutoScrollRef.current) {
      skipAutoScrollRef.current = false;
      return;
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, typing]);

  // 往上滑到頂才觸發：從 historyRef 尾端（最接近現在的一批）撈一批出來
  // 接到畫面最前面，同時手動把 scrollTop 頂回原本的視覺位置，
  // 不然畫面內容一變高，使用者會覺得整串對話往下跳了一截
  const loadMoreHistory = () => {
    if (historyRef.current.length === 0) return;
    const chunk = historyRef.current.slice(-HISTORY_PAGE_SIZE);
    historyRef.current = historyRef.current.slice(0, -HISTORY_PAGE_SIZE);
    setHasMoreHistory(historyRef.current.length > 0);

    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    skipAutoScrollRef.current = true;
    setMessages((m) => [...chunk, ...m]);
    requestAnimationFrame(() => {
      if (!el) return;
      el.scrollTop = el.scrollHeight - prevHeight;
    });
  };

  const handleChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (hasMoreHistory && e.currentTarget.scrollTop < 40) {
      loadMoreHistory();
    }
  };

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

    // 首頁大卡片帶進來的 prompt，要接得住，不然會落到「酒」關鍵字誤判成送禮流程
    if (text.includes("降價") || text.includes("追蹤")) {
      const p = PRODUCTS.find((p) => p.id === "macallan-12")!;
      await pushBot({
        text: `你追蹤的${p.name}降價了，現在只要 $${p.price}，要不要趁現在入手？`,
      });
      await pushBot({
        card: {
          name: p.name,
          desc: `${p.subtitle} · 降價中`,
          price: p.price,
          emoji: p.emoji,
          gradient: p.gradient,
        },
      });
      return;
    }

    if (text.includes("關注")) {
      const p = PRODUCTS.find((p) => p.id === "louve-cortez")!;
      await pushBot({
        text: `你關注的${p.name}目前是 $${p.price}，我會持續幫你留意價格變化。`,
      });
      await pushBot({
        card: {
          name: p.name,
          desc: `${p.subtitle} · 持續關注中`,
          price: p.price,
          emoji: p.emoji,
          gradient: p.gradient,
        },
      });
      return;
    }

    if (text.includes("獲利了結") || text.includes("賣出")) {
      const h = HOLDINGS.find((h) => h.id === "kinmen-58")!;
      await pushBot({
        text: `你的${h.name}已經漲了 ${h.changePct}%，這個時間點賣出滿划算的，要幫你安排轉售嗎？`,
        quickReplies: ["查看藏酒明細"],
      });
      return;
    }

    if (text.includes("訂單") || text.includes("進度")) {
      const activeOrder = getOrders().find((o) => o.status === "進行中");
      if (activeOrder) {
        await pushBot({
          text: `你的「${activeOrder.name}」還在媒合中，媒合完成我會馬上通知你。`,
        });
      } else {
        await pushBot({
          text: "目前沒有進行中的訂單喔，之前的訂單都可以在帳號裡的歷史交易紀錄查到。",
        });
      }
      return;
    }

    if (text.includes("大家都在買") || text.includes("新東西")) {
      const p = PRODUCTS.find((p) => p.id === "louve-cortez")!;
      await pushBot({
        text: `最近很多人在看${p.name}，是這個月新上架的酒款，要不要看看？`,
      });
      await pushBot({
        card: {
          name: p.name,
          desc: `${p.subtitle} · 新上架`,
          price: p.price,
          emoji: p.emoji,
          gradient: p.gradient,
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
      router.push("/v9/reward-marketplace");
      return;
    }
    if (reply === "查看藏酒明細") {
      router.push("/v9/collection/kinmen-58");
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

  // 立即購買不再跳去結帳頁，直接開一個確認明細＋一鍵刷臉下單的 sheet，
  // 讓伴伴把整件事在對話裡辦完，不用把使用者丟到另一個獨立流程
  const handleBuyNow = (card: RecCard) => {
    setSheetCard(null);
    setConfirmCard(card);
  };

  const handleConfirmOrder = (finalTotal: number) => {
    if (!confirmCard) return;
    addOrder({
      name: confirmCard.name,
      price: finalTotal,
      emoji: confirmCard.emoji,
      gradient: confirmCard.gradient,
      source: "伴伴對話",
    });
    setConfirmCard(null);
    setMessages((m) => [
      ...m,
      {
        id: genId(),
        role: "bot",
        orderConfirmed: true,
        text: `已用 Face ID 確認，「${confirmCard.name}」訂單成立，媒合完成我會馬上通知你。`,
      },
    ]);
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
          onClick={() => router.push("/v9/banbun")}
          title="回首頁"
          className="flex size-8 items-center justify-center text-[20px] text-gray-700"
        >
          ‹
        </button>
        <div className="ml-1 flex items-center gap-2">
          <Icon src="/icons/tab-banbun.svg" className="size-6 text-gray-900" />
          <p className="text-[15px] font-semibold text-gray-800">伴伴</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleChatScroll}
        className="no-scrollbar flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="flex flex-col gap-3">
          {hasMoreHistory && (
            <button
              onClick={loadMoreHistory}
              className="flex items-center gap-1 self-center rounded-full bg-white px-4 py-2 text-[12px] font-medium text-gray-600 shadow-[0_2px_10px_rgba(0,0,0,0.1)] active:opacity-60"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
              載入上次的對話
            </button>
          )}
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
          autoFocus
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

      {confirmCard && (
        <FaceIdOrderSheet
          card={confirmCard}
          onClose={() => setConfirmCard(null)}
          onConfirm={handleConfirmOrder}
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
