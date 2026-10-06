"use client";

// 光暈版首頁的底色：亮色系——上方淡藍、淡紫，右側一點粉，往下漸層到白色
// （大約畫面 6～7 成的位置就是純白），快捷問題、輸入框都在白底上。字用深色。
// 上一版的深色（深海軍藍到紫）只要把 GLOW_IS_DARK 改回 true、換回那組顏色即可
export const GLOW_IS_DARK = false;
export const GLOW_TOP = "#d3e1ff";
export const GLOW_BG =
  "linear-gradient(180deg, #d3e1ff 0%, #e2dcff 22%, #f1eaff 40%, #fbf9ff 58%, #ffffff 72%)";
const LIGHTS = [
  // 左上亮一點的淡藍
  "radial-gradient(65% 32% at 0% 0%, rgba(110, 155, 255, 0.55) 0%, rgba(110, 155, 255, 0) 100%)",
  // 右上淡紫
  "radial-gradient(60% 30% at 100% 6%, rgba(190, 150, 255, 0.5) 0%, rgba(190, 150, 255, 0) 100%)",
  // 右側一點粉
  "radial-gradient(45% 22% at 90% 30%, rgba(255, 185, 225, 0.35) 0%, rgba(255, 185, 225, 0) 100%)",
].join(", ");

// 進入對話：白色從底部一口氣往上抽起來蓋滿畫面，彩色底同時往上淡掉
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
      {/* 漸層：外層管進出對話，內層管載入（避免 animation 蓋掉 transition） */}
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
