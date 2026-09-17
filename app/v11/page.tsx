"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import InputAirRing from "./_components/InputAirRing";
import StatusBar from "./_components/StatusBar";
import VectorField, {
  type FieldMode,
  type VectorFieldHandle,
} from "./_components/VectorField";
import { ACCOUNT_PROFILE, REWARD_BALANCE, getInitials } from "./_lib/mock-data";

// 首頁的建議標籤：先固定三則，跟 Figma 例圖同一種口氣的短句 + emoji，
// 這輪重點是跟氣流場的互動，不是重新做一次 v10 那套隨機抽籤/換一批。
// 圖示改用單色實心的自畫 SVG，不用彩色 emoji——跟整頁「氣流／儀表板」
// 那種收斂、不花俏的調性一致，emoji 的多色插畫感在這裡太搶戲
const SUGGESTIONS: {
  key: string;
  prompt: string;
  icon: "drink" | "reward" | "flame";
  label: string;
}[] = [
  {
    key: "restock-drink",
    prompt: "我想買可樂",
    icon: "drink",
    label: "上次買的可樂喝完了嗎？要不要補貨",
  },
  {
    key: "daily-reward",
    prompt: "我想看智能選品",
    icon: "reward",
    label: "你的每日回饋突破 100 元！再買點智能選品？",
  },
  {
    key: "mid-autumn",
    prompt: "推薦適合中秋烤肉喝的酒",
    icon: "flame",
    label: "中秋烤肉想喝點什麼嗎？",
  },
];

function SuggestionIcon({ icon }: { icon: "drink" | "reward" | "flame" }) {
  if (icon === "drink") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="size-[18px] text-gray-700">
        <rect
          x="8.4"
          y="0.6"
          width="1.6"
          height="4.4"
          rx="0.8"
          transform="rotate(18 9.2 2.8)"
          fill="currentColor"
        />
        <path
          d="M5 4h10l-1.1 12.7a2 2 0 0 1-2 1.8H8.1a2 2 0 0 1-2-1.8L5 4z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (icon === "flame") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="size-[18px] text-gray-700">
        <path
          d="M10 2c2.4 3.1 5.2 6.2 5.2 9.7a5.2 5.2 0 1 1-10.4 0C4.8 8.2 7.6 5.1 10 2z"
          fill="currentColor"
        />
        <path
          d="M10 8.2c.9 1.2 1.9 2.3 1.9 3.6a1.9 1.9 0 1 1-3.8 0c0-.5.1-.9.3-1.3-.1.6.3 1 .8 1 .4 0 .7-.3.7-.7 0-.6-.4-.9-.4-1.5 0-.4.2-.8.5-1.1z"
          fill="white"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-[18px] text-gray-700">
      <path
        d="M10 1.5c.35 3.3 1.1 5.6 2.35 6.85S15.4 9.6 18.5 10c-3.1.4-5.4 1.1-6.65 2.35S10.35 15.7 10 18.5c-.35-2.8-1.1-4.95-2.35-6.15S4.1 10.4 1.5 10c3.1-.4 5.4-1.1 6.65-2.35S9.65 4.8 10 1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// 標籤進場動畫跟 v10 用同一個 tagEnter/tag-enter class（定義在共用的
// globals.css），最後一則（最靠近輸入框）延遲最短、最先出現，
// 呼應「由下往上依序浮現」——這裡另外算每則「落地」的時間，
// 用來排程對應的場漣漪
const CHIP_STAGGER_MS = 90;
const CHIP_ENTER_DURATION_MS = 520;

export default function V11Page() {
  const router = useRouter();
  const [heroMode, setHeroMode] = useState<FieldMode>("idle");
  const [inputValue, setInputValue] = useState("");
  const [keystrokeTick, setKeystrokeTick] = useState(0);
  const [recording, setRecording] = useState(false);
  const settleTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fieldRef = useRef<VectorFieldHandle>(null);

  useEffect(() => {
    return () => {
      settleTimers.current.forEach(clearTimeout);
    };
  }, []);

  // 標籤依序「落地」時，場在它大致所在的位置補一圈短暫的漣漪，
  // 讓標籤進場動畫跟場是同一套物理語言，不是兩個各自獨立的動效系統
  useEffect(() => {
    const timers = SUGGESTIONS.map((_, index) => {
      const delay =
        (SUGGESTIONS.length - 1 - index) * CHIP_STAGGER_MS +
        CHIP_ENTER_DURATION_MS;
      return setTimeout(() => {
        fieldRef.current?.pulse(0.5, 0.58 + index * 0.075, 0.8);
      }, delay);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // 麥克風：先用點擊模擬「錄音中」，沒有真的接語音辨識——錄音期間場
  // 用假的音量（sine 波）在麥克風位置持續補漣漪，把「聲音」轉成看得見的擾動
  useEffect(() => {
    if (!recording) return;
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const volume = 0.5 + 0.5 * Math.sin((performance.now() - t0) / 260);
      fieldRef.current?.pulse(0.86, 0.855, 0.5 + volume * 0.7);
    }, 260);
    return () => window.clearInterval(id);
  }, [recording]);

  const handleFocus = () => {
    settleTimers.current.forEach(clearTimeout);
    settleTimers.current = [];
    setHeroMode("converge");
  };

  const handleBlur = () => {
    setHeroMode((m) => (m === "converge" ? "idle" : m));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // 每打一個字，輸入框的氣流圈就震一下——不用知道打了什麼，
    // 光是「剛剛有輸入」這件事本身就該讓周圍的空氣有反應
    setKeystrokeTick((k) => k + 1);
  };

  // 發射：先讓場從輸入框那一點往外炸開一圈（launch mode + 一次疊加的漣漪
  // 加強衝擊感），再帶著這句話進聊天室——呼應「送出＝起飛」的敘事。
  // 帶一個每次都不一樣的 _t，逼 Next.js 認為這是全新網址、一定重新掛載
  // 聊天室頁面，不然同一路徑再次進入會沿用快取的元件實例
  const goToChat = (prompt: string) => {
    settleTimers.current.forEach(clearTimeout);
    setHeroMode("launch");
    fieldRef.current?.pulse(0.5, 0.93, 1.6);
    const params = new URLSearchParams();
    if (prompt) params.set("prompt", prompt);
    params.set("_t", Date.now().toString());
    const t1 = setTimeout(() => {
      router.push(`/v11/chat?${params.toString()}`);
    }, 340);
    settleTimers.current = [t1];
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

      {/* ---------- 上方導覽：沒有底部 tabbar，回饋／帳號／通知都靠這裡進去，
          進去之後靠左上角返回鍵回首頁——首頁本身維持只有這三個入口，
          不做任何 push 轉場動畫，先把資訊架構定下來，動效之後再談。
          樣式照 Figma 的 bell-btn／reward-pill 節點：實心白底＋
          shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)] 這種很淡、很暈開、
          沒有明顯邊界的陰影，是「浮在畫面上的白色圓片」那種玻璃感，
          不是灰底色塊，也不是加 backdrop-blur 的半透明玻璃 ---------- */}
      <div className="relative z-10 flex shrink-0 items-center justify-between px-4 pb-2 pt-1">
        <Link
          href="/v11/notifications"
          aria-label="通知"
          className="flex size-11 items-center justify-center rounded-full bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/bell.svg" alt="" className="size-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/v11/rewards"
            className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
              <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                <path
                  d="M8 12.5V3.5M8 3.5L4 7.5M8 3.5l4 4"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-[16px] font-medium text-gray-800">
              {REWARD_BALANCE.toLocaleString()}
            </span>
          </Link>
          <Link
            href="/v11/account"
            aria-label="帳號"
            className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-800 text-[15px] font-semibold text-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
          >
            {getInitials(ACCOUNT_PROFILE.handle)}
          </Link>
        </div>
      </div>

      {/* ---------- Hero：AIFIAN 記號 + 問候語 + 標籤 + 輸入框，填滿剩下的
          全部空間，輸入框固定貼在裝置下緣——首頁不再往下捲動，這五個元件
          都會跟場互動，不只是蓋在場上面的靜態圖層 ---------- */}
      <div className="relative flex flex-1 flex-col overflow-hidden px-5 pb-8 pt-4">
        {/* 這層故意不設 pointer-events-none：canvas 要能收到滑鼠/手指移動
            才能示範「場會回應你」，輸入框跟按鈕是後面的 sibling、疊在
            視覺上層，命中測試時瀏覽器本來就會優先選最上層的元素，
            不會被下面這片畫布擋住點擊 */}
        {/* 場只鋪在問候語那一層空間，往下漸漸淡出、在標籤堆疊開始之前
            就完全隱形——氣流感不會蓋到標籤區塊後面，兩者不重疊。
            吸引點/障礙物的座標算法沒有變，還是用整個 hero 的比例在算，
            只是視覺上把下半段遮罩掉，收斂的方向感還是對的 */}
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 38%, transparent 54%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 38%, transparent 54%)",
          }}
        >
          <VectorField
            ref={fieldRef}
            mode={heroMode}
            attractor={{ x: 0.5, y: 0.93 }}
            obstacle={{ x: 0.5, y: 0.42, radius: 110 }}
            showAttractorDot
          />
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center gap-5">
          <img src="/figma/logo.svg" alt="AIFIAN" className="h-6 w-auto" />
          <p className="text-center text-[22px] font-bold leading-[30px] text-[#101828]">
            嗨，今天想讓我
            <br />
            幫你做什麼？
          </p>
        </div>

        <div className="relative flex flex-col gap-3">
          <div className="flex flex-col items-start gap-2">
            {SUGGESTIONS.map((s, index) => (
              <button
                key={s.key}
                onClick={() => goToChat(s.prompt)}
                className="tag-enter flex max-w-full items-center gap-2 rounded-[999px] bg-white px-4 py-2.5 text-left shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]"
                style={{
                  animationDelay: `${(SUGGESTIONS.length - 1 - index) * CHIP_STAGGER_MS}ms`,
                }}
              >
                <span className="flex w-5 shrink-0 items-center justify-center">
                  <SuggestionIcon icon={s.icon} />
                </span>
                <span className="line-clamp-1 min-w-0 text-[14px] text-gray-800">
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          {/* 輸入框的邊框不是另外疊上去的漸層裝飾，是場本身收攏成一圈：
              InputAirRing 沿著跟輸入框同尺寸的藥丸形路徑畫線段，
              focus／打字都會讓這圈線段有對應的反應 */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-2">
              <InputAirRing focused={heroMode === "converge"} keystrokeTick={keystrokeTick} />
            </div>
            <form
              onSubmit={handleSubmit}
              className="relative flex w-full items-center gap-2 rounded-[999px] bg-white p-3 shadow-[0px_8px_28px_0px_rgba(16,24,40,0.10)]"
            >
              <span className="flex size-6 shrink-0 items-center justify-center text-gray-400">
                +
              </span>
              <input
                value={inputValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="什麼都可以問 AIFIAN"
                className="flex-1 text-[14px] text-gray-800 outline-none placeholder:text-[#a1a6ab]"
              />
              <button
                type="button"
                onClick={() => setRecording((v) => !v)}
                aria-pressed={recording}
                aria-label="語音輸入"
                className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  recording ? "bg-brand/10" : ""
                }`}
              >
                <img src="/figma/mic.svg" alt="" className="size-5" />
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-colors ${
                  inputValue.trim() ? "bg-brand" : "bg-gray-300"
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
    </div>
  );
}


