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

// 雲層上緣：左高右低的斜線，跟原本的插圖一樣從左邊約 330 斜到右邊約 600
const edgeY = (x: number, lift = 0) => 330 + ((x + 10) * 270) / 400 - lift;

// 每顆雲朵的位置跟大小：圓心壓在斜線下面一點，只露出上半部的弧
const FRONT_BUMPS: [number, number][] = [
  [-6, 30],
  [40, 25],
  [82, 34],
  [128, 27],
  [168, 32],
  [208, 24],
  [246, 30],
  [286, 23],
  [322, 28],
  [360, 25],
  [398, 31],
];
const BACK_BUMPS: [number, number][] = [
  [10, 26],
  [58, 32],
  [104, 24],
  [146, 30],
  [190, 26],
  [232, 33],
  [276, 25],
  [314, 29],
  [354, 24],
  [392, 30],
];

// 雲朵上方手繪感的小弧線（參考原本插圖裡雲邊那幾筆）
const ACCENTS = [0, 2, 5, 7, 9];

function CloudLayer({
  bumps,
  lift,
  accents,
}: {
  bumps: [number, number][];
  lift: number;
  accents?: number[];
}) {
  const top = (x: number) => edgeY(x, lift);
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      className="block h-auto w-full overflow-visible"
      style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
    >
      <polygon
        fill="#fff"
        points={`-40,${top(-40) + 8} ${VB_W + 40},${top(VB_W + 40) + 8} ${VB_W + 40},${VB_H} -40,${VB_H}`}
      />
      {bumps.map(([x, r]) => (
        <circle key={x} cx={x} cy={top(x) + r * 0.35} r={r} fill="#fff" />
      ))}
      {accents?.map((i) => {
        const [x, r] = bumps[i];
        const cy = top(x) + r * 0.35;
        return (
          <path
            key={i}
            d={`M ${x - r * 0.75} ${cy - r * 0.78 - 7} Q ${x - r * 0.2} ${cy - r - 12} ${x + r * 0.35} ${cy - r - 7}`}
            fill="none"
            stroke="#fff"
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

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
  const cloudTransition = reduce
    ? "none"
    : covered
      ? "transform 720ms cubic-bezier(0.55, 0, 0.25, 1)"
      : `transform 1100ms ${EASING}`;

  const planeShown = phase === "rest" && !covered;
  const planeTransform = covered
    ? "translate(48px, -72px) rotate(-6deg) scale(0.85)"
    : planeShown
      ? "translate(0, 0)"
      : "translate(-36px, 28px)";

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
            影子離得遠一點、變淡變小，像真的拉開了高度 */}
        <div
          className="absolute left-[44.99%] top-[50.21%] w-[28.91%]"
          style={{
            opacity: planeShown ? 1 : 0,
            transform: planeTransform,
            transition: reduce
              ? "none"
              : covered
                ? "transform 520ms cubic-bezier(0.5, 0, 0.75, 0), opacity 420ms ease 100ms"
                : `transform 900ms ${EASING} ${intro ? 520 : 200}ms, opacity 500ms ease ${intro ? 520 : 200}ms`,
          }}
        >
          <img
            src="/figma/v13-home-plane-2.png"
            alt=""
            className="glider-shadow absolute inset-0 w-full"
          />
          <img
            src="/figma/v13-home-plane-2.png"
            alt=""
            className="glider-float relative block w-full"
          />
        </div>

        {/* 後面那層雲：半透明、位置高一點，升起的距離也不同，做出前後的層次 */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            opacity: 0.55,
            transform: `translateY(${backY})`,
            transition: cloudTransition,
          }}
        >
          <CloudLayer bumps={BACK_BUMPS} lift={30} />
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
          <CloudLayer bumps={FRONT_BUMPS} lift={0} accents={ACCENTS} />
        </div>
      </div>
    </div>
  );
}
