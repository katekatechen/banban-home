"use client";

// 光暈版首頁的底色（照 Figma 1068:26391）：暖米白底，上方一道由暖到冷的柔光
// （蜜桃 → 珊瑚 → 品牌紅 → 玫瑰 → 紫 → 淡藍紫），往下慢慢收回米白，
// 參考 think less / Leonard / MYOB 那種大範圍暈開的漸層。
// 位置跟大小照 Figma 375 寬的座標換算成 cqw（容器寬的百分比），
// 不同手機寬度比例不變；Figma 的模糊半徑大約是 CSS blur 的兩倍
const BASE = "#f5f2ee";
const W = 375;
const cq = (px: number) => `${(px / W) * 100}cqw`;

// [名稱, 顏色, x, y, 寬, 高, Figma 模糊半徑, 透明度]
const BLOBS: [string, string, number, number, number, number, number, number][] = [
  ["peach", "#f8bf93", -190, 40, 380, 360, 160, 0.9],
  ["coral", "#f0645a", -80, -60, 340, 330, 150, 0.7],
  ["brand-red", "#ff3b3b", 60, -110, 260, 260, 140, 0.45],
  ["rose", "#d4507e", 120, -40, 300, 290, 150, 0.6],
  ["violet", "#7d5fe0", 230, -20, 300, 300, 150, 0.6],
  ["periwinkle", "#97aaf5", 255, 120, 320, 320, 160, 0.55],
];

export default function HomeGradient({
  covered,
  intro,
}: {
  // 對話展開中：整片光淡掉，留給對話的白底
  covered: boolean;
  // 這次掛載要不要播載入動畫
  intro: boolean;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        opacity: covered ? 0 : 1,
        transition: "opacity 500ms ease",
      }}
    >
      {/* 外層管對話展開時淡掉，內層管載入時浮現（animation 的 fill 會蓋掉 opacity，要分兩層） */}
      <div
        className="absolute inset-0"
        style={{
          background: BASE,
          containerType: "inline-size",
          animation: intro ? "homeGradientIn 900ms ease both" : undefined,
        }}
      >
      {BLOBS.map(([name, color, x, y, w, h, blur, op]) => (
        <span
          key={name}
          className="absolute rounded-full"
          style={{
            left: cq(x),
            top: cq(y),
            width: cq(w),
            height: cq(h),
            background: color,
            opacity: op,
            filter: `blur(${cq(blur / 2)})`,
          }}
        />
      ))}
      {/* 最上面一層淡淡的米白霧，狀態列和 logo 不會壓在最飽和的顏色上 */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: cq(160),
          background: `linear-gradient(to bottom, ${BASE}8c, ${BASE}00)`,
        }}
      />
      {/* 中段開始收回米白：下方的快捷問題、輸入框都在乾淨的底上 */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: cq(240),
          background: `linear-gradient(to bottom, ${BASE}00 0%, ${BASE}d9 ${cq(252)}, ${BASE} ${cq(560)})`,
        }}
      />
      </div>
    </div>
  );
}
