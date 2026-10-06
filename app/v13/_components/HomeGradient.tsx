"use client";

// 光暈版首頁的底色：淺冷灰的底，下緣升起一道冷色調的光弧，
// 中間點上主色紅 #ff3030——藍綠、湖水綠在兩側（深藍綠跟帳號頁的企業標籤同色 #007595），
// 不用藍紫色。
// 上半部留給 logo、招呼語；快捷問題、輸入框浮在光上。
// 位置用 375 寬的座標換成 cqw（容器寬的百分比），貼著底部算，不同手機高度光都在下緣。
const BASE = "#eef2f2";
const W = 375;
const cq = (px: number) => `${(px / W) * 100}cqw`;

// [名稱, 顏色, x, 距底部, 寬, 高, 模糊(px@375), 透明度]
const BLOBS: [string, string, number, number, number, number, number, number][] = [
  // 光弧最上緣的淡藍綠霧，讓顏色慢慢融進底色
  ["haze", "#cfe9e6", -80, 280, 540, 460, 90, 0.6],
  ["teal", "#12a7a0", -200, -10, 360, 380, 70, 0.75],
  ["red", "#ff3030", 20, 30, 300, 300, 70, 0.9],
  ["aqua", "#2fc4b2", 165, 70, 240, 250, 70, 0.4],
  ["deep-teal", "#007595", 215, -90, 300, 320, 75, 0.8],
  ["mint", "#8fe3d8", 275, 110, 240, 280, 75, 0.6],
];

// 很淡的顆粒，參考圖都有一點底片感
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

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
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ containerType: "inline-size", background: BASE }}
    >
      {/* 光弧：外層管進出對話，內層管載入（避免 animation 蓋掉 transition） */}
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: "50% 100%",
          transform: covered
            ? "translateY(-45%) scale(1.25)"
            : "translateY(0) scale(1)",
          transition: `transform ${ms}ms ${ease}`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            animation: intro
              ? "homeGlowRise 1100ms cubic-bezier(0.2, 0.9, 0.25, 1) both"
              : undefined,
          }}
        >
          {BLOBS.map(([name, color, x, bottom, w, h, blur, op]) => (
            <span
              key={name}
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
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{ backgroundImage: GRAIN, opacity: 0.1 }}
      />
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
