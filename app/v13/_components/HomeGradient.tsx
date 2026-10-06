"use client";

// 光暈版首頁的底色：參考 GuestUp 海報——上方深海軍藍，往下轉成寶藍、紫，
// 右下角透出一團接近白的粉紫光。左上偏藍（深海軍藍到寶藍），紫色只留在右下。深底上的字一律白色。
export const GLOW_TOP = "#071a45";
export const GLOW_BG =
  "linear-gradient(168deg, #071a45 0%, #0b2a7e 26%, #2443c4 50%, #5a3fc0 72%, #a45bc4 90%, #c98bd6 100%)";
const LIGHTS = [
  // 右下角的亮光
  "radial-gradient(55% 32% at 92% 98%, rgba(248, 222, 248, 0.95) 0%, rgba(232, 180, 236, 0.55) 35%, rgba(200, 140, 220, 0) 75%)",
  // 左上一點亮寶藍，讓上半部偏藍
  "radial-gradient(50% 32% at 0% 30%, rgba(40, 110, 240, 0.5) 0%, rgba(40, 110, 240, 0) 100%)",
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
        />
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
