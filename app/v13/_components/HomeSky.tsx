"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

// 雲：參考積雲的俯視插圖，左右兩團從畫面下方兩角湧上來，中間留一道 V 字的
// 縫露出底下的海，右邊那團比較高、升到飛機旁邊。
// 畫法刻意抽象：只用實心的圓疊出雲的輪廓，不畫陰影，前景白、遠景帶一點時段色。
// 進場時每顆圓從 0 彈性放大，一開始是鮮豔的向量色（粉、藍、黃、紫、綠輪流），
// 長大的同時褪成白色，從下往上一顆顆冒出來，最後拼成雲的造型。
// 從上面往下畫，下面的雲朵在前面
type Puff = [cx: number, cy: number, r: number];

// 前景：左右兩大團
const FRONT_PUFFS: Puff[] = [
  // 右邊那團（比較高，但比左邊小一號，不要搶飛機）
  [386, 455, 35],
  [356, 486, 27],
  [395, 508, 41],
  [333, 518, 24],
  [365, 538, 36],
  [311, 550, 22],
  [342, 570, 30],
  // 左邊那團
  [8, 450, 54],
  [66, 468, 44],
  [-18, 516, 66],
  [118, 500, 38],
  [48, 540, 56],
  [164, 540, 36],
  [110, 572, 48],
  [206, 572, 32],
  // V 字谷底收圓
  [234, 588, 28],
  // 最底下一排，把雲朵之間的縫封起來
  [24, 588, 34],
  [80, 592, 32],
  [152, 588, 30],
  [272, 584, 30],
  [334, 586, 34],
  [384, 580, 36],
  [362, 552, 30],
];

// 遠景：比前景高一點、顏色偏藍，從前景後面探出頭
const BACK_PUFFS: Puff[] = [
  [378, 426, 27],
  [351, 451, 20],
  [36, 408, 40],
  [92, 430, 32],
  [142, 462, 28],
];

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

// 進場時雲朵一開始的顏色
const POP_PALETTE = ["#ffc4b5", "#b5dcff", "#ffe59a", "#d0c5ff", "#b5f0d6"];
const POP_MS = 560;
const POP_STAGGER_MS = 28;

function CloudLayer({
  puffs,
  fill,
  floor,
  colorTransition,
  pop,
  popDelay = 0,
}: {
  puffs: Puff[];
  fill: string;
  // 這一層雲朵下面要墊滿顏色的高度（viewBox 座標），往下一路填到底；
  // 遠景那層藏在前景後面，不用墊
  floor?: number;
  colorTransition: string;
  // 要不要播進場的「冒出來」動畫，以及這一層從幾毫秒後開始
  pop: boolean;
  popDelay?: number;
}) {
  const sorted = [...puffs].sort((a, b) => a[1] - b[1]);
  // 冒出來的順序：從最下面那顆開始往上
  const order = [...puffs]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .map((p) => `${p[0]}-${p[1]}`);
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      className="block h-auto w-full overflow-visible"
      style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
    >
      {floor !== undefined && (
        <rect
          x={-60}
          y={floor}
          width={VB_W + 120}
          height={VB_H}
          style={{ fill, transition: colorTransition }}
        />
      )}
      {sorted.map(([cx, cy, r]) => {
        const key = `${cx}-${cy}`;
        const i = order.indexOf(key);
        const delay = popDelay + i * POP_STAGGER_MS;
        return (
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r={r}
            style={
              {
                fill,
                transition: colorTransition,
                transformBox: "fill-box",
                transformOrigin: "center",
                // backwards：還沒輪到的時候停在「0 大小、鮮豔色」，播完回到原本的樣子，
                // 之後送出時變白的 transition 才不會被動畫蓋掉
                animation: pop
                  ? `cloudPop ${POP_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms backwards, cloudTint ${POP_MS + 300}ms ease ${delay}ms backwards`
                  : undefined,
                "--pop-from": POP_PALETTE[i % POP_PALETTE.length],
                "--pop-to": fill,
              } as React.CSSProperties
            }
          />
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
  // 每次進場換一個 key，讓雲朵重新掛載、冒出來的動畫從頭播
  const [popKey, setPopKey] = useState(0);
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
    setPopKey((k) => k + 1);
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
      window.setTimeout(() => setPhase("rest"), 120),
      window.setTimeout(() => setEntering(false), 2200),
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
  // 用 layout effect：要在瀏覽器畫出這一幀之前就切到「不要過場」，
  // 不然雲會先開始往下退，冒出來的動畫就跑在畫面上方
  const wasCovered = useRef(covered);
  useLayoutEffect(() => {
    if (wasCovered.current && !covered && !reduce) playEnter();
    wasCovered.current = covered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [covered]);

  // 雲的三個位置（百分比是相對 SVG 自己的高度，375×2400）：
  // 載入前在畫面下方外面、平常在 Figma 的位置、送出後往上推到蓋滿畫面
  const cloudY = covered ? "-30%" : "0%";
  const backY = covered ? "-29%" : "0%";
  // 雲上下移動都用很明顯的 ease in out：慢慢起步、中段衝過去、最後慢慢停住
  const cloudTransition =
    reduce || jump
      ? "none"
      : `transform ${entering ? 1000 : CLOUD_MS}ms ${CLOUD_EASE}`;

  // 雲的顏色：送出時在往上推的過程中漸漸變白，回首頁時再變回這個時段的顏色
  const colorTransition = reduce || jump ? "none" : `fill ${CLOUD_MS}ms ease`;

  // 滑翔翼從雲層底下鑽出來：平常停在 Figma 的位置；還沒進場、或對話展開被雲蓋住時，
  // 躲在左下那團雲的底下。進場、回首頁時順著機頭方向（往右上）從雲底下飛出來
  const planeOut = phase === "rest" && !covered;
  const planeTransform = planeOut
    ? "translate(0, 0)"
    : "translate(-150px, 230px)";
  // 進場時等雲快升到定位（約九成）才起飛，不然飛機會在雲還沒蓋到的地方露出來
  const planeDelay = entering ? 700 : 250;

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
          className="absolute left-[48.95%] top-[47.45%] w-[21%]"
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
            puffs={BACK_PUFFS}
            key={`back-${popKey}`}
            fill={covered ? "#ffffff" : theme.back.fill}
            colorTransition={colorTransition}
            pop={entering && !reduce}
            popDelay={520}
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
            puffs={FRONT_PUFFS}
            key={`front-${popKey}`}
            fill={covered ? "#ffffff" : theme.front.fill}
            floor={590}
            colorTransition={colorTransition}
            pop={entering && !reduce}
            popDelay={120}
          />
        </div>
      </div>
    </div>
  );
}
