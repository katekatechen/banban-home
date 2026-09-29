"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import StatusBar from "../_components/StatusBar";

// 換一批：標籤不是瞬間換掉，是舊的依序消失、新的再依序出現。三個狀態
// 靠同一個 phase 驅動所有標籤的 style，用 transitionDelay（不是分開排程
// 三次 setTimeout）做出「依序」的效果——state 本身是同時翻的，每顆標籤
// 只是動畫「真正開始」的時間點被 CSS 延遲拉開而已
type SuggestionPhase = "idle" | "exiting" | "entering-start" | "entering";
const ITEM_STAGGER_MS = 60;
const ITEM_DURATION_MS = 200;

// 首頁的建議標籤：跟 Figma 一致用彩色 emoji＋明顯的「換一批」按鈕，
// 不是 v11 那套單色圖示／滑動手勢——這版刻意照 Figma 原樣還原，
// 不是延續上一版的氣流概念實驗
const SUGGESTION_POOL = [
  { key: "restock-drink", prompt: "我想買可樂", emoji: "🥤", label: "上次買的可樂喝完了嗎？要不要補貨" },
  { key: "daily-reward", prompt: "我想看智能選品", emoji: "🎉", label: "你的每日回饋突破 100 元！再買點智能選品？" },
  { key: "mid-autumn", prompt: "推薦適合中秋烤肉喝的酒", emoji: "🍖", label: "中秋烤肉想喝點什麼嗎？" },
  { key: "rate-forecast", prompt: "這期匯率預測開獎了嗎", emoji: "🌐", label: "這期匯率預測獎金池已經 52,000 了" },
  { key: "sell-advice", prompt: "我的酒可以賣掉了嗎", emoji: "📈", label: "你收藏的酒漲不少，考慮賣掉嗎？" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function V12HomePage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState(SUGGESTION_POOL.slice(0, 3));
  const [inputValue, setInputValue] = useState("");
  const [itemPhase, setItemPhase] = useState<SuggestionPhase>("idle");
  const timersRef = useRef<number[]>([]);

  // 掛載後才抽一次，避免 SSR/CSR 抽到不同結果兜不起來
  useEffect(() => {
    setSuggestions(shuffle(SUGGESTION_POOL).slice(0, 3));
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const rollSuggestions = () => {
    if (itemPhase !== "idle") return;
    const count = suggestions.length;
    const exitTotalMs = ITEM_DURATION_MS + (count - 1) * ITEM_STAGGER_MS;
    const enterTotalMs = exitTotalMs;

    setItemPhase("exiting");
    const t1 = window.setTimeout(() => {
      setSuggestions(shuffle(SUGGESTION_POOL).slice(0, 3));
      setItemPhase("entering-start");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setItemPhase("entering"));
      });
      const t2 = window.setTimeout(() => setItemPhase("idle"), enterTotalMs);
      timersRef.current.push(t2);
    }, exitTotalMs);
    timersRef.current.push(t1);
  };

  const goToChat = (prompt: string) => {
    const params = new URLSearchParams();
    if (prompt) params.set("prompt", prompt);
    params.set("_t", Date.now().toString());
    router.push(`/v12/chat?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    goToChat(text);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <StatusBar />

      <div className="relative flex shrink-0 items-center justify-between px-4 pb-2 pt-1">
        <button
          onClick={() => router.push("/v12/notifications")}
          aria-label="通知"
          className="flex size-11 items-center justify-center rounded-full bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/bell.svg" alt="" className="size-5" />
        </button>
        <img src="/figma/logo.svg" alt="AIFIAN" className="h-6 w-auto" />
        <button
          onClick={() => router.push("/v12/account")}
          aria-label="帳號"
          className="flex size-11 items-center justify-center rounded-full bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/v12-profile.svg" alt="" className="size-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <img src="/figma/v12-hero-mark.svg" alt="" className="size-[75px]" />
      </div>

      <div className="flex shrink-0 flex-col gap-4 px-4 pb-[110px] pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-bold text-gray-800">你可能想知道</p>
            <button
              onClick={rollSuggestions}
              className="flex items-center gap-1 text-[12px] text-gray-400"
            >
              <img src="/figma/v12-refresh.svg" alt="" className="size-4" />
              換一批
            </button>
          </div>
          <div className="flex flex-col items-start gap-2">
            {suggestions.map((s, i) => {
              const visible = itemPhase === "idle" || itemPhase === "entering";
              const animating = itemPhase === "exiting" || itemPhase === "entering";
              return (
                <button
                  key={s.key}
                  onClick={() => goToChat(s.prompt)}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(6px)",
                    // 延遲寫在 transition 縮寫字串裡面，不是分開設
                    // transitionDelay——分開設的話，這個值在 idle/exiting/
                    // entering 之間都是同一個字串（只跟 index 有關），React
                    // 的 inline style diff 會覺得「沒變」就不重新套用，
                    // 但 transition 縮寫本身重新賦值時會把 delay 重置成 0，
                    // 沒被重新套用的 transitionDelay 就救不回來，導致三顆
                    // 標籤的延遲全部變 0、看起來像同時消失/出現
                    transition: animating
                      ? `opacity ${ITEM_DURATION_MS}ms ease ${i * ITEM_STAGGER_MS}ms, transform ${ITEM_DURATION_MS}ms ease ${i * ITEM_STAGGER_MS}ms`
                      : "none",
                  }}
                  className="flex max-w-full items-center gap-2 rounded-[999px] bg-white px-4 py-2.5 text-left shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]"
                >
                  <span className="w-5 shrink-0 text-[20px] leading-none">
                    {s.emoji}
                  </span>
                  <span className="line-clamp-1 min-w-0 text-[14px] text-gray-800">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-[999px] border border-[#91fff8] bg-white/90 px-3 py-2 shadow-[0px_4px_36px_0px_rgba(0,0,0,0.12)]"
        >
          <img src="/figma/plus.svg" alt="" className="size-6 shrink-0" />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="如何賺回饋"
            className="flex-1 text-[14px] text-gray-800 outline-none placeholder:text-[#a1a6ab]"
          />
          <span className="flex size-9 shrink-0 items-center justify-center">
            <img src="/figma/mic.svg" alt="語音輸入" className="size-5" />
          </span>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              inputValue.trim() ? "bg-brand" : "bg-gray-300"
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
