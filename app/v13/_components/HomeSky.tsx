"use client";

import { useEffect, useState } from "react";
import { EASING } from "../_lib/page-transition";

// 首頁插圖：天空跟雲都用程式畫，紙飛機是唯一的圖檔。
// 載入時天空先淡入藍色，接著兩層白雲從畫面下方升上來、飛機飛進定位；
// 送出第一句話後，雲朵往上推、蓋滿整個畫面變成白底，就是對話的背景；
// 回到首頁時倒著播：雲往下沉、露出天空。
//
// 雲跟飛機的座標照 Figma 948:44415：375 寬、往上偏 19px 的框，
// 雲的 SVG 拉得很長（375×2400），往上推的時候底下還有白色接著，不會露出天空
export const HERO_TOP_TINT = "#77c2d9";

const VB_W = 375;
const VB_H = 2400;

// 雲：參考積雲的俯視插圖，左右兩團從畫面下方兩角湧上來，中間留一道 V 字的
// 縫露出底下的海，右邊那團比較高、升到飛機旁邊。
// 畫法是扁平向量：每一朵是一顆大圓，先畫一顆淺藍的「影子圓」往右下偏一點，
// 再疊一顆白圓，兩顆錯開的地方就是一道月牙形的陰影。從上面往下畫，
// 下面的雲朵會蓋住上面那朵的下半部，堆出一朵壓一朵的體積感
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

function CloudLayer({
  puffs,
  fill,
  shade,
  floor,
}: {
  puffs: Puff[];
  fill: string;
  shade: string;
  // 這一層雲朵下面要墊滿顏色的高度（viewBox 座標），往下一路填到底；
  // 遠景那層藏在前景後面，不用墊
  floor?: number;
}) {
  const sorted = [...puffs].sort((a, b) => a[1] - b[1]);
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      className="block h-auto w-full overflow-visible"
      style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
    >
      {floor !== undefined && (
        <rect x={-60} y={floor} width={VB_W + 120} height={VB_H} fill={fill} />
      )}
      {sorted.map(([cx, cy, r]) => (
        <g key={`${cx}-${cy}`}>
          {/* 貼著底色的那排不畫陰影，不然月牙會落在下面那片白色上 */}
          {(floor === undefined || cy + r * 1.12 <= floor) && (
            <circle cx={cx + r * 0.07} cy={cy + r * 0.1} r={r} fill={shade} />
          )}
          <circle cx={cx} cy={cy} r={r} fill={fill} />
        </g>
      ))}
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
}: {
  // 對話展開中：雲往上蓋滿畫面
  covered: boolean;
  // 這次掛載要不要播載入動畫（同一次開啟頁面只播一次，切分頁回來不重播）
  intro: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(intro ? "pre" : "rest");
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    if (!intro || r) {
      setPhase("rest");
      return;
    }
    // 先畫一幀「全白」，下一幀才開始淡入，不然瀏覽器會直接跳到結果
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setPhase("sky")),
    );
    const t = window.setTimeout(() => setPhase("rest"), 380);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [intro]);

  // 雲的三個位置（百分比是相對 SVG 自己的高度，375×2400）：
  // 載入前在畫面下方外面、平常在 Figma 的位置、送出後往上推到蓋滿畫面
  const cloudY = covered ? "-30%" : phase === "rest" ? "0%" : "28%";
  const backY = covered ? "-29%" : phase === "rest" ? "0%" : "30%";
  // 雲上下移動都用很明顯的 ease in out：慢慢起步、中段衝過去、最後慢慢停住
  const cloudTransition = reduce
    ? "none"
    : `transform ${intro && phase !== "rest" ? 1400 : CLOUD_MS}ms ${CLOUD_EASE}`;

  // 滑翔翼從雲層底下鑽出來：平常停在 Figma 的位置；還沒進場、或對話展開被雲蓋住時，
  // 躲在左下那團雲的底下。進場、回首頁時順著機頭方向（往右上）從雲底下飛出來
  const planeOut = phase === "rest" && !covered;
  const planeTransform = planeOut
    ? "translate(0, 0)"
    : "translate(-150px, 230px)";
  // 進場時等雲快升到定位（約九成）才起飛，不然飛機會在雲還沒蓋到的地方露出來
  const planeDelay = intro ? 1000 : 250;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
    >
      {/* 天空：上面是插圖頂端的藍，往下稍微變亮一點，接近地平線 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${HERO_TOP_TINT} 0%, #84c9de 55%, #a3d7e7 100%)`,
          opacity: phase === "pre" ? 0 : 1,
          transition: reduce ? "none" : "opacity 500ms ease",
        }}
      />

      <div className="absolute inset-x-0 top-[-19px] aspect-[375/620]">
        {/* 滑翔翼：外層管進場、送出時飛走；裡面的飛機跟影子各自跑常駐的浮動。
            俯視的角度，影子落在下方的海面上：飛機往上飄（離鏡頭近一點、稍微放大）時，
            影子離得遠一點、變淡變小，像真的拉開了高度。
            飛機要從雲底下鑽出來，所以放在雲層後面 */}
        <div
          className="absolute left-[45.71%] top-[45.86%] w-[27.46%]"
          style={{
            // 進場前（雲還在畫面外）先藏起來，其他時候都在，靠雲擋住
            opacity: phase === "rest" ? 1 : 0,
            transform: planeTransform,
            transition: reduce
              ? "none"
              : covered
                ? // 等雲把畫面蓋白了，才把飛機悄悄搬回雲底下
                  `transform 0ms linear ${CLOUD_MS}ms`
                : `transform 1300ms ${EASING} ${planeDelay}ms, opacity 0ms linear ${planeDelay}ms`,
          }}
        >
          {/* 影子只取機翼的大三角形輪廓，不畫骨架細節 */}
          <div className="glider-shadow absolute inset-0">
            <div
              className="size-full bg-[#0b3a4a]"
              style={{ clipPath: "polygon(2% 19%, 99% 2%, 94% 98%)" }}
            />
          </div>
          <img
            src="/figma/v13-home-plane-2.png"
            alt=""
            className="glider-float relative block w-full"
          />
        </div>

        {/* 遠景的雲：位置高一點、偏藍，升起的距離也不同，做出前後的層次 */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            transform: `translateY(${backY})`,
            transition: cloudTransition,
          }}
        >
          <CloudLayer puffs={BACK_PUFFS} fill="#e4f3f8" shade="#c5e3ed" />
        </div>
        <div
          className="absolute inset-x-0 top-0"
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
            fill="#ffffff"
            shade="#d6ecf3"
            floor={590}
          />
        </div>
      </div>
    </div>
  );
}
