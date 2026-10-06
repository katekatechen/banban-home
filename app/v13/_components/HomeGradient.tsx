"use client";

// 光暈版首頁的底色：參考 GuestUp 海報——上方深靛藍，往下轉成寶藍、紫，
// 右下角透出一團接近白的粉紫光；上面疊幾條很細的白色線條，
// 線條畫成圓角的「Λ」，呼應 AIFIAN logo mark 的形狀。深底上的字一律白色。
export const GLOW_TOP = "#120f4a";
export const GLOW_BG =
  "linear-gradient(168deg, #120f4a 0%, #1c1772 26%, #3a2db0 52%, #6e3cb8 74%, #a45bc4 90%, #c98bd6 100%)";
const LIGHTS = [
  // 右下角的亮光
  "radial-gradient(55% 32% at 92% 98%, rgba(248, 222, 248, 0.95) 0%, rgba(232, 180, 236, 0.55) 35%, rgba(200, 140, 220, 0) 75%)",
  // 左側中段一點寶藍，讓藍到紫的過渡有層次
  "radial-gradient(45% 30% at 0% 52%, rgba(76, 70, 230, 0.55) 0%, rgba(76, 70, 230, 0) 100%)",
].join(", ");

// 進入對話：白色從底部一口氣往上抽起來蓋滿畫面，深色底同時往上淡掉
export const GRADIENT_EXIT_MS = 420;
const IN = "cubic-bezier(0.7, 0, 0.84, 0)"; // 越抽越快
const OUT = "cubic-bezier(0.16, 1, 0.3, 1)"; // 回首頁：白色快速落下、光慢慢回位

export default function HomeGradient({
  covered,
  intro,
}: {
  covered: boolean;
  // 這次掛載要不要播載入動畫（光從下緣升起來）
  intro: boolean;
}) {
  const ms = covered ? GRADIENT_EXIT_MS : 650;
  const ease = covered ? IN : OUT;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-white"
    >
      {/* 深色漸層：外層管進出對話，內層管載入（避免 animation 蓋掉 transition） */}
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: "50% 0%",
          opacity: covered ? 0 : 1,
          transform: covered ? "translateY(-12%)" : "translateY(0)",
          transition: `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `${LIGHTS}, ${GLOW_BG}`,
            animation: intro ? "homeGradientFade 900ms ease both" : undefined,
          }}
        >
          {/* 細白線：圓角的 Λ，像放大的 logo mark 輪廓 */}
          <svg
            viewBox="0 0 375 812"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 size-full"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeLinecap="round"
          >
            <path
              d="M-60 470 L118 168 Q140 130 162 168 L470 690"
              strokeOpacity="0.28"
            />
            <path
              d="M150 900 L300 640 Q318 610 336 640 L480 880"
              strokeOpacity="0.22"
            />
            <path d="M330 -40 Q300 120 420 250" strokeOpacity="0.16" />
          </svg>
        </div>
      </div>
      {/* 白幕：上緣羽化，從畫面下方抽上來；回首頁時往下退 */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "-30%",
          height: "130%",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 22%)",
          transform: covered ? "translateY(0)" : "translateY(100%)",
          transition: `transform ${ms}ms ${ease}`,
        }}
      />
    </div>
  );
}
