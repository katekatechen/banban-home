"use client";

// 光暈版首頁的底色：以白色為主，只在兩個角落點上小面積的柔光，
// 斜對角配置（參考 Leonard 那張的構圖）：右上是主色紅 #ff3030 帶一點粉紅，
// 左下是蜜桃帶一點淡粉。總共三種顏色（紅、粉、蜜桃），中間大片留白給招呼語跟快捷問題。
// 位置用 375 寬的座標換成 cqw（容器寬的百分比），不同手機寬度比例不變。
const W = 375;
const cq = (px: number) => `${(px / W) * 100}cqw`;

// [貼齊上或下, 顏色, x, 距上／下, 寬, 高, 模糊(px@375), 透明度]
const BLOBS: ["top" | "bottom", string, number, number, number, number, number, number][] = [
  ["top", "#ff3030", 250, -150, 220, 200, 60, 0.5],
  ["top", "#ff8aa5", 300, -60, 180, 180, 55, 0.5],
  ["bottom", "#ffb38f", -130, -90, 260, 240, 60, 0.55],
  ["bottom", "#ffc2d1", -20, -130, 200, 180, 55, 0.45],
];

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
      {/* 角落柔光：外層管進出對話，內層管載入（避免 animation 蓋掉 transition） */}
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
            containerType: "inline-size",
            animation: intro ? "homeGradientFade 900ms ease both" : undefined,
          }}
        >
          {BLOBS.map(([anchor, color, x, y, w, h, blur, op], i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: cq(x),
                [anchor]: cq(y),
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
