"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBar from "../_components/StatusBar";

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

  // 掛載後才抽一次，避免 SSR/CSR 抽到不同結果兜不起來
  useEffect(() => {
    setSuggestions(shuffle(SUGGESTION_POOL).slice(0, 3));
  }, []);

  const rollSuggestions = () => {
    setSuggestions(shuffle(SUGGESTION_POOL).slice(0, 3));
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
            {suggestions.map((s) => (
              <button
                key={s.key}
                onClick={() => goToChat(s.prompt)}
                className="flex max-w-full items-center gap-2 rounded-[999px] bg-white px-4 py-2.5 text-left shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]"
              >
                <span className="w-5 shrink-0 text-[20px] leading-none">
                  {s.emoji}
                </span>
                <span className="line-clamp-1 min-w-0 text-[14px] text-gray-800">
                  {s.label}
                </span>
              </button>
            ))}
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
