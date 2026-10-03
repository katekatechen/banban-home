"use client";

import { useEffect, useRef, useState } from "react";
import { EASING } from "../_lib/page-transition";
import type { SkyTheme } from "../_lib/time-of-day";
import GliderSvg from "./GliderSvg";

// 首頁插圖：天空跟雲都用程式畫，紙飛機是唯一的圖檔。
// 載入時天空先淡入藍色，接著兩層白雲從畫面下方升上來、飛機飛進定位；
// 送出第一句話後，雲朵往上推、蓋滿整個畫面變成白底，就是對話的背景；
// 回到首頁時倒著播：雲往下沉、露出天空。
//
// 雲跟飛機的座標照 Figma 948:44415：375 寬、往上偏 19px 的框，
// 雲的 SVG 拉得很長（375×2400），往上推的時候底下還有白色接著，不會露出天空。
// 天空跟雲的顏色跟著時段換（_lib/time-of-day），送出時雲一律變成白色，接到對話的白底
const VB_W = 375;
const VB_H = 2400;

// 雲：參考積雲的扁平插畫，左右兩團從畫面下方兩角湧上來，中間留一道 V 字的
// 縫露出底下的海，右邊那團比較小。
// 每一團（lobe）都是「一顆大圓＋上半圈一排小圓」拼出凹凸的邊。
// 先畫灰色的一團當背光面，再把同一團往右上挪一點、縮小一點畫成白色，
// 左下就露出一道邊緣凹凸的灰色陰影；灰色的部分再壓一層顆粒，像印刷的質感。
// 從上面往下畫，下面那團的白色頂端會壓在上面那團的灰色底部上
type Lobe = [cx: number, cy: number, r: number];

// 前景：左右兩大團
const FRONT_LOBES: Lobe[] = [
  // 左邊那團
  [14, 462, 66],
  [82, 446, 48],
  [136, 494, 40],
  [44, 528, 60],
  [180, 538, 34],
  [112, 560, 46],
  [214, 576, 30],
  // 右邊那團（比較小）
  [372, 466, 40],
  [338, 504, 30],
  [392, 520, 42],
  [304, 544, 26],
  [352, 562, 34],
  [266, 584, 28],
  // 最底下一排，把雲團之間的縫封起來（貼著底色，不畫陰影）
  [20, 596, 44],
  [96, 600, 40],
  [160, 598, 36],
  [236, 600, 34],
  [306, 598, 36],
  [380, 596, 44],
];

// 遠景：從前景後面探出頭的幾團，顏色偏淡
const BACK_LOBES: Lobe[] = [
  [60, 404, 40],
  [130, 440, 30],
  [356, 424, 30],
];

// 一團雲 → 一組圓：中間一顆大圓，上半圈（左→上→右）排一圈小圓做出凹凸的邊。
// 小圓的大小用固定的規律稍微錯開，不會整齊得像花邊
const BUMPS = 7;
function lobeCircles(
  [cx, cy, r]: Lobe,
  shift = { dx: 0, dy: 0, k: 1 },
): [number, number, number][] {
  const x0 = cx + shift.dx * r;
  const y0 = cy + shift.dy * r;
  const R = r * shift.k;
  const out: [number, number, number][] = [[x0, y0, R * 0.8]];
  for (let i = 0; i < BUMPS; i++) {
    const a = Math.PI * (1 + i / (BUMPS - 1)); // 180°（左）→ 270°（上）→ 360°（右）
    const size = 0.3 + 0.07 * Math.sin(i * 2.3 + cx * 0.05);
    out.push([
      x0 + Math.cos(a) * R * 0.74,
      y0 + Math.sin(a) * R * 0.74,
      R * size,
    ]);
  }
  // 四捨五入到小數點兩位：伺服器跟瀏覽器的三角函數最後幾位會不一樣，
  // 不修掉的話 SSR 對不上（hydration mismatch）
  return out.map(
    (c) => c.map((v) => Math.round(v * 100) / 100) as [number, number, number],
  );
}
// 白色的那層：往右上挪、稍微縮小
const LIT = { dx: 0.16, dy: -0.2, k: 0.86 };

// 夜晚海面上的月光閃點：位置寫死（百分比，相對 375×620 的框），避免伺服器跟瀏覽器算出來不一樣
const GLINTS: [x: number, y: number, size: number, delay: number][] = [
  [12, 30, 2, 0],
  [26, 46, 1.5, 1.2],
  [38, 22, 2, 2.1],
  [61, 33, 1.5, 0.6],
  [78, 26, 2, 1.7],
  [88, 44, 1.5, 2.8],
  [70, 62, 2, 0.9],
  [18, 58, 1.5, 2.4],
  [52, 70, 2, 1.4],
  [92, 15, 1.5, 3.1],
  [6, 12, 2, 1.9],
  [44, 50, 1.5, 3.4],
];

function CloudLayer({
  id,
  lobes,
  fill,
  shade,
  floor,
  colorTransition,
}: {
  // 顆粒濾鏡的 id，前景、遠景各用一個
  id: string;
  lobes: Lobe[];
  // 受光面（白）跟背光面（灰）的顏色；fill 也是雲底下那片的底色
  fill: string;
  shade: string;
  // 這一層雲朵下面要墊滿顏色的高度（viewBox 座標），往下一路填到底；
  // 遠景那層藏在前景後面，不用墊
  floor?: number;
  colorTransition: string;
}) {
  const sorted = [...lobes].sort((a, b) => a[1] - b[1]);
  const lit = { fill, transition: colorTransition };
  const dark = { fill: shade, transition: colorTransition };
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      className="block h-auto w-full overflow-visible"
      style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
    >
      <defs>
        {/* 灰色陰影上的顆粒：雜訊轉成稀疏的深色小點，只留在灰色範圍裡 */}
        <filter id={`${id}-grain`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.1"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.25  0 0 0 0 0.28  0 0 0 0 0.35  0 0 0 -2.4 1.25"
            result="specks"
          />
          <feComposite
            in="specks"
            in2="SourceGraphic"
            operator="in"
            result="grain"
          />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>
      </defs>
      {floor !== undefined && (
        <rect x={-60} y={floor} width={VB_W + 120} height={VB_H} style={lit} />
      )}
      {sorted.map((lobe) => {
        const [cx, cy, r] = lobe;
        // 貼著底色的那幾團不畫灰色，不然陰影會落在下面那片白色上
        const low = floor !== undefined && cy + r * 0.9 > floor;
        return (
          <g key={`${cx}-${cy}`}>
            {/* 灰色的背光面；送出時陰影變白，顆粒也一起拿掉 */}
            {!low && (
              <g
                style={dark}
                filter={shade === "#ffffff" ? undefined : `url(#${id}-grain)`}
              >
                {lobeCircles(lobe).map(([x, y, rr], i) => (
                  <circle key={i} cx={x} cy={y} r={rr} />
                ))}
              </g>
            )}
            <g style={lit}>
              {lobeCircles(lobe, low ? undefined : LIT).map(([x, y, rr], i) => (
                <circle key={i} cx={x} cy={y} r={rr} />
              ))}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

// 雲移動的時間跟曲線（easeInOutQuint）。首頁送出後也照 CLOUD_MS 算對話什麼時候淡入
export const CLOUD_MS = 900;
const CLOUD_EASE = "cubic-bezier(0.83, 0, 0.17, 1)";

type Phase = "pre" | "sky" | "rest";

export default function HomeSky({
  covered,
  intro,
  theme,
}: {
  // 這個時段的天空、雲的配色
  theme: SkyTheme;
  // 對話展開中：雲往上蓋滿畫面
  covered: boolean;
  // 這次掛載要不要播載入動畫（同一次開啟頁面只播一次，切分頁回來不重播）
  intro: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(intro ? "pre" : "rest");
  const [reduce, setReduce] = useState(false);
  // 正在播進場（第一次載入、或從對話回首頁）：雲升起比較慢、飛機等雲到位才起飛
  const [entering, setEntering] = useState(intro);
  // 這一幀不要過場：回首頁時先把雲瞬間搬回畫面下方（這時畫面還是白的，看不出來）
  const [jump, setJump] = useState(false);
  const timers = useRef<number[]>([]);
  // 比較用：網址加 ?plane=svg 換成程式畫的扁平滑翔翼，預設還是圖檔
  const [vectorPlane, setVectorPlane] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("plane") === "svg")
      setVectorPlane(true);
  }, []);

  // 進場：天空從白淡入，雲從畫面下方升上來，飛機最後從雲底下鑽出來
  const playEnter = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    setEntering(true);
    setJump(true);
    setPhase("pre");
    // 先畫一幀「全白、雲在下面」，下一幀才開始動，不然瀏覽器會直接跳到結果
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setJump(false);
        setPhase("sky");
      }),
    );
    timers.current = [
      window.setTimeout(() => setPhase("rest"), 380),
      window.setTimeout(() => setEntering(false), 2800),
    ];
  };

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    if (intro && !r) playEnter();
    else {
      setPhase("rest");
      setEntering(false);
    }
    const ids = timers.current;
    return () => ids.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 從對話回首頁：不是讓蓋滿畫面的雲往下退，而是跟第一次載入一樣，
  // 天空重新淡入、雲從下方升上來
  const wasCovered = useRef(covered);
  useEffect(() => {
    if (wasCovered.current && !covered && !reduce) playEnter();
    wasCovered.current = covered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [covered]);

  // 雲的三個位置（百分比是相對 SVG 自己的高度，375×2400）：
  // 載入前在畫面下方外面、平常在 Figma 的位置、送出後往上推到蓋滿畫面
  const cloudY = covered ? "-30%" : phase === "rest" ? "0%" : "28%";
  const backY = covered ? "-29%" : phase === "rest" ? "0%" : "30%";
  // 雲上下移動都用很明顯的 ease in out：慢慢起步、中段衝過去、最後慢慢停住
  const cloudTransition =
    reduce || jump
      ? "none"
      : `transform ${entering ? 1400 : CLOUD_MS}ms ${CLOUD_EASE}`;

  // 雲的顏色：送出時在往上推的過程中漸漸變白，回首頁時再變回這個時段的顏色
  const colorTransition = reduce || jump ? "none" : `fill ${CLOUD_MS}ms ease`;

  // 滑翔翼從雲層底下鑽出來：平常停在 Figma 的位置；還沒進場、或對話展開被雲蓋住時，
  // 躲在左下那團雲的底下。進場、回首頁時順著機頭方向（往右上）從雲底下飛出來
  const planeOut = phase === "rest" && !covered;
  const planeTransform = planeOut
    ? "translate(0, 0)"
    : "translate(-150px, 230px)";
  // 進場時等雲快升到定位（約九成）才起飛，不然飛機會在雲還沒蓋到的地方露出來
  const planeDelay = entering ? 1000 : 250;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
    >
      {/* 天空（俯視下去是海）：顏色跟著時段換，往下稍微變亮一點 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${theme.sky.map(([c, at]) => `${c} ${at}%`).join(", ")})`,
          opacity: phase === "pre" ? 0 : 1,
          transition: reduce || jump ? "none" : "opacity 500ms ease",
        }}
      />

      <div className="absolute inset-x-0 top-[-19px] aspect-[375/620]">
        {theme.glints &&
          GLINTS.map(([x, y, size, delay]) => (
            <span
              key={`${x}-${y}`}
              className="sea-glint absolute rounded-full bg-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size * 1.6,
                height: size,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        {/* 滑翔翼：外層管進場、送出時飛走；裡面的飛機跟影子各自跑常駐的浮動。
            俯視的角度，影子落在下方的海面上：飛機往上飄（離鏡頭近一點、稍微放大）時，
            影子離得遠一點、變淡變小，像真的拉開了高度。
            飛機要從雲底下鑽出來，所以放在雲層後面 */}
        <div
          className="absolute left-[50.53%] top-[48.23%] w-[17.85%]"
          style={{
            // 進場前（雲還在畫面外）先藏起來，其他時候都在，靠雲擋住
            opacity: phase === "rest" ? 1 : 0,
            transform: planeTransform,
            transition:
              reduce || jump
                ? "none"
                : covered
                  ? // 等雲把畫面蓋白了，才把飛機悄悄搬回雲底下
                    `transform 0ms linear ${CLOUD_MS}ms`
                  : `transform 1300ms ${EASING} ${planeDelay}ms, opacity 0ms linear ${planeDelay}ms`,
          }}
        >
          {/* 影子只取機翼的大三角形輪廓，不畫骨架細節 */}
          <div className="absolute inset-0" style={{ opacity: theme.shadow }}>
            {/* 圓角三角形：用同色的粗描邊配圓角接點把三個角磨圓，
                頂點往內縮一點，抵掉描邊多出來的寬度 */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="glider-shadow absolute inset-0 size-full overflow-visible"
            >
              <polygon
                points="7,21 94,7 90,92"
                fill="#0b3a4a"
                stroke="#0b3a4a"
                strokeWidth={10}
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="glider-float relative">
            {vectorPlane ? (
              <GliderSvg className="block h-auto w-full" />
            ) : (
              <img
                src="/figma/v13-home-plane-2.png"
                alt=""
                className="block w-full"
              />
            )}
            {/* 夜晚機翼尖端的閃燈 */}
            {theme.glints && (
              <span className="glider-light absolute left-[3%] top-[19%] size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5a5a]" />
            )}
          </div>
        </div>

        {/* 遠景的雲：位置高一點、偏藍，升起的距離也不同，做出前後的層次 */}
        <div
          className="absolute inset-x-0 top-0 will-change-transform"
          style={{
            transform: `translateY(${backY})`,
            transition: cloudTransition,
          }}
        >
          <CloudLayer
            id="v13-cloud-back"
            lobes={BACK_LOBES}
            fill={covered ? "#ffffff" : theme.back.fill}
            shade={covered ? "#ffffff" : theme.back.shade}
            colorTransition={colorTransition}
          />
        </div>
        <div
          className="absolute inset-x-0 top-0 will-change-transform"
          style={{
            transform: `translateY(${cloudY})`,
            transition:
              cloudTransition === "none"
                ? "none"
                : `${cloudTransition} ${covered ? "0ms" : "90ms"}`,
          }}
        >
          <CloudLayer
            id="v13-cloud-front"
            lobes={FRONT_LOBES}
            fill={covered ? "#ffffff" : theme.front.fill}
            shade={covered ? "#ffffff" : theme.front.shade}
            floor={590}
            colorTransition={colorTransition}
          />
        </div>
      </div>
    </div>
  );
}
