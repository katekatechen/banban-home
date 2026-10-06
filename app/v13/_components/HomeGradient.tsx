"use client";

// 光暈版首頁的底色：參考 MYOB 的色光帶，但倒過來放——鮮豔的顏色在畫面最上緣，
// 往下退成白色，下半部留白（快捷問題、輸入框都在白底上）。
// 左上亮藍（帶一點天藍），往右接主色紅 #ff3b3b、洋紅，最右邊紫。
// 上方的 logo、狀態列、招呼語壓在色光上，改用白字（GLOW_TEXT_ON_COLOR）。
export const GLOW_IS_DARK = false;
export const GLOW_TEXT_ON_COLOR = true;
const BASE = "#ffffff";
export const GLOW_TOP = "#1f7bff";
export const GLOW_BG = BASE;
const W = 375;
const cq = (px: number) => `${(px / W) * 100}cqw`;

// [顏色, x, 距頂部, 寬, 高, 模糊(px@375), 透明度]
const BAND: [string, number, number, number, number, number, number][] = [
  ["#1f7bff", -170, -110, 330, 360, 44, 0.95],
  ["#3fb0ff", -80, -170, 220, 260, 44, 0.6],
  ["#ff3b3b", 70, -180, 230, 300, 44, 0.8],
  ["#e0288a", 180, -120, 270, 350, 46, 0.9],
  ["#9a35c8", 295, -100, 220, 360, 46, 0.92],
];

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
            background: BASE,
            containerType: "inline-size",
            animation: intro ? "homeGradientFade 900ms ease both" : undefined,
          }}
        >
          {BAND.map(([color, x, top, w, h, blur, op], i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: cq(x),
                top: cq(top),
                width: cq(w),
                height: cq(h),
                background: color,
                opacity: op,
                filter: `blur(${cq(blur)})`,
              }}
            />
          ))}
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
