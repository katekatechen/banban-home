"use client";

// 光暈版首頁的底色。參考 think less / Leonard / MYOB 那種大範圍暈開的光：
// 淺暖灰的底，顏色只聚在畫面下緣，像一道從底部升起的光弧——
// 左邊蜜桃、珊瑚，中間品牌紅到玫瑰，往右轉成紫、淡藍紫，最上緣只剩一點粉色的霧。
// 上半部留給 logo、招呼語，維持乾淨；快捷問題、輸入框浮在光上。
// 位置用 375 寬的座標換成 cqw（容器寬的百分比），貼著底部算，不同手機高度光都在下緣。
const BASE = "#f1efec";
const W = 375;
const cq = (px: number) => `${(px / W) * 100}cqw`;

// [名稱, 顏色, x, 距底部, 寬, 高, 模糊(px@375), 透明度]
const BLOBS: [string, string, number, number, number, number, number, number][] = [
  // 光弧最上緣的淡粉霧，讓顏色慢慢融進底色
  ["haze", "#f2c4cc", -80, 250, 540, 460, 90, 0.5],
  ["peach", "#f7b98a", -170, -20, 360, 380, 70, 0.95],
  ["coral", "#ef6a58", -50, 50, 290, 300, 70, 0.8],
  ["brand-red", "#e8455c", 70, -60, 290, 300, 70, 0.7],
  ["magenta", "#c24a8e", 150, 30, 260, 270, 70, 0.5],
  ["violet", "#6c5ce7", 215, -70, 300, 320, 75, 0.8],
  ["periwinkle", "#93a9f8", 265, 80, 260, 300, 75, 0.65],
];

// 很淡的顆粒，參考圖都有一點底片感
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export const GRADIENT_EXIT_MS = 800;

export default function HomeGradient({
  covered,
  intro,
}: {
  // 進入對話：光往上飄、一路淡掉，底色也淡成白色，接上對話的白底
  covered: boolean;
  // 這次掛載要不要播載入動畫（光從下面升起來）
  intro: boolean;
}) {
  const ease = "cubic-bezier(0.45, 0, 0.2, 1)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-white"
      style={{ containerType: "inline-size" }}
    >
      {/* 底色：進對話時淡成白色 */}
      <div
        className="absolute inset-0"
        style={{
          background: BASE,
          opacity: covered ? 0 : 1,
          transition: `opacity ${GRADIENT_EXIT_MS}ms ${ease}`,
        }}
      />
      {/* 光弧：進對話時整片往上飄、同時淡掉（外層管進出對話，內層管載入，避免 animation 蓋掉 transition） */}
      <div
        className="absolute inset-0"
        style={{
          opacity: covered ? 0 : 1,
          transform: covered ? "translateY(-38%)" : "translateY(0)",
          transition: `opacity ${GRADIENT_EXIT_MS * 0.85}ms ease, transform ${GRADIENT_EXIT_MS}ms ${ease}`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            animation: intro ? "homeGlowRise 1100ms cubic-bezier(0.2, 0.9, 0.25, 1) both" : undefined,
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
        style={{
          backgroundImage: GRAIN,
          opacity: covered ? 0 : 0.1,
          transition: `opacity ${GRADIENT_EXIT_MS}ms ease`,
        }}
      />
    </div>
  );
}
