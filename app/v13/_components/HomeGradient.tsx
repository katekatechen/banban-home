"use client";

// 光暈版首頁的底色：參考 MYOB——很淺的灰白底，顏色只壓在畫面最下緣，
// 鮮豔、對比強：左邊主色紅 #ff3b3b（帶一點珊瑚），中間偏右洋紅，右邊紫，
// 紅跟洋紅之間留一點淺色的凹口，像起伏的光帶。上方大片留給招呼語，字用深色。
export const GLOW_IS_DARK = false;
const BASE = "#f1f1f2";
export const GLOW_TOP = BASE;
export const GLOW_BG = BASE;
const W = 375;
const cq = (px: number) => `${(px / W) * 100}cqw`;

// [顏色, x, 距底部, 寬, 高, 模糊(px@375), 透明度]
const BAND: [string, number, number, number, number, number, number][] = [
  ["#ff3b3b", -150, -80, 300, 240, 40, 0.95],
  ["#ff6a4d", -60, -130, 220, 200, 40, 0.6],
  ["#e0288a", 180, -90, 250, 230, 42, 0.9],
  ["#9a35c8", 300, -70, 200, 240, 42, 0.9],
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
          {BAND.map(([color, x, bottom, w, h, blur, op], i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: cq(x),
                bottom: cq(bottom),
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
