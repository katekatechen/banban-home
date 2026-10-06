"use client";

// 光暈版首頁的底色：參考 Gemini Enterprise 的 App 首頁——
// 不放大塊色光，整片是很淡的粉色洗染，從上方的淡粉慢慢退成白。安靜、乾淨。
const WASH =
  "linear-gradient(180deg, #fcecef 0%, #fdf3f5 30%, #fefafb 55%, #ffffff 80%)";

// 進入對話：白色從底部一口氣往上抽起來蓋滿畫面，光同時被往上甩、放大散掉
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
      {/* 粉色洗染：外層管進出對話，內層管載入（避免 animation 蓋掉 transition） */}
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
            background: WASH,
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
