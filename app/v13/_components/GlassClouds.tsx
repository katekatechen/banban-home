"use client";

// 「稜鏡玻璃」版的雲（網址加 ?clouds=glass 切換）：
// 雲的輪廓還是同一組圓（左右兩團、中間一道 V 字縫），但畫成一團模糊的白，
// 邊緣透出一圈彩色的光，前面再罩一排直條紋玻璃。
//
// 玻璃的做法：把同一張「雲＋光」的畫面切成一條條直條，每一條各自往上或往下
// 偏一點（像被玻璃折射錯位），再疊一道細細的亮邊當玻璃稜線。
// 整張畫面只用 CSS 漸層組成，切成二十幾條也不吃效能。
//
// 座標系跟 HomeSky 一樣是 375×620 的框；框底下再接一大片底色，送出時整層往上推
// 就會蓋滿畫面
type Puff = [cx: number, cy: number, r: number];

const W = 375;
const H = 620;
const STRIPS = 22;

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

// 一顆圓 → 一層放射漸層（用橢圓的百分比大小換算回正圓），邊緣留一點柔邊
const puffLayer = ([cx, cy, r]: Puff, color: string, soft = 0.82) =>
  `radial-gradient(${pct(r, W)} ${pct(r, H)} at ${pct(cx, W)} ${pct(cy, H)}, ${color} 0 ${soft * 100}%, transparent 100%)`;

// 光：沿著雲的上緣擺幾團大的彩色光暈，被白雲蓋住下半，只露出邊緣那一圈
const GLOWS: [x: number, y: number, rx: number, ry: number, c: number][] = [
  [60, 430, 130, 80, 0],
  [175, 500, 100, 70, 1],
  [250, 548, 70, 50, 2],
  [335, 445, 110, 80, 2],
  [372, 520, 70, 60, 1],
];

const glowLayer = (
  [x, y, rx, ry, c]: (typeof GLOWS)[number],
  colors: string[],
) =>
  `radial-gradient(${pct(rx, W)} ${pct(ry, H)} at ${pct(x, W)} ${pct(y, H)}, ${colors[c % colors.length]}e6 0, ${colors[c % colors.length]}00 100%)`;

// 每一條玻璃的錯位量：兩個不同週期的波疊起來，看起來不規則但有節奏
const stripOffset = (i: number) =>
  Math.round(Math.sin(i * 0.85) * 9 + Math.sin(i * 0.31 + 1) * 6);

export default function GlassScene({
  frontPuffs,
  backPuffs,
  front,
  back,
  glow,
  floor = 590,
  entering,
  reduce,
}: {
  frontPuffs: Puff[];
  backPuffs: Puff[];
  front: string;
  back: string;
  glow: string[];
  floor?: number;
  entering: boolean;
  reduce: boolean;
}) {
  // 由上往下疊：白雲、雲底下那片底色、光、遠景雲
  const background = [
    ...frontPuffs.map((p) => puffLayer(p, front)),
    `linear-gradient(to bottom, transparent ${pct(floor - 14, H)}, ${front} ${pct(floor + 6, H)})`,
    ...GLOWS.map((g) => glowLayer(g, glow)),
    ...backPuffs.map((p) => puffLayer(p, back, 0.7)),
  ].join(", ");

  // 每條的寬度（佔整層的 %），多 0.3% 蓋住條與條之間的細縫。
  // 條裡面放一整張畫面，再往左挪到對應的位置；寬度、位移都要換算成「條寬的 %」
  const stripW = 100 / STRIPS;
  const boxW = stripW + 0.3;
  const innerW = (100 / boxW) * 100;

  return (
    <>
      {Array.from({ length: STRIPS }, (_, i) => {
        const dy = stripOffset(i);
        return (
          <div
            key={i}
            className="absolute top-0 overflow-hidden"
            style={{
              left: `${i * stripW}%`,
              width: `${boxW}%`,
              height: "calc(100% + 2400px)",
              // 進場：玻璃條由左到右一條條從下面浮上來
              animation:
                entering && !reduce
                  ? `glassIn 900ms cubic-bezier(0.2, 0.9, 0.25, 1) ${120 + i * 32}ms backwards`
                  : undefined,
            }}
          >
            <div
              className="absolute top-0 flex flex-col"
              style={
                {
                  left: `-${((i * stripW * 100) / boxW).toFixed(3)}%`,
                  width: `${innerW.toFixed(3)}%`,
                  height: "100%",
                  "--dy": `${dy}px`,
                  transform: `translateY(${dy}px)`,
                  // 常駐：每條各自慢慢上下漂一點，光帶就像在流動
                  animation: reduce
                    ? undefined
                    : `glassDrift ${4 + (i % 5) * 0.4}s ease-in-out ${-i * 0.37}s infinite`,
                } as React.CSSProperties
              }
            >
              <div
                className="relative w-full shrink-0"
                style={{ aspectRatio: `${W} / ${H}`, background }}
              />
              <div className="w-full flex-1" style={{ background: front }} />
            </div>
            {/* 玻璃稜線：左邊一道亮邊、右邊一點點暗，只在雲那一段明顯 */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0"
              style={{
                aspectRatio: `${((W * boxW) / 100).toFixed(2)} / ${H}`,
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.55) 0, rgba(255,255,255,0) 22%, rgba(255,255,255,0) 72%, rgba(40,60,110,0.07) 100%)",
                maskImage:
                  "linear-gradient(to bottom, transparent 56%, #000 76%, #000 92%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 56%, #000 76%, #000 92%, transparent 100%)",
              }}
            />
          </div>
        );
      })}
    </>
  );
}
