"use client";

import { useEffect, useRef, useState } from "react";
import { EASING } from "../_lib/page-transition";
import GliderSvg from "./GliderSvg";
import { CLOUD_MS } from "./HomeSky";

// 光暈版首頁（?home=glow）：延續開場畫面的風格。整個畫面鋪滿靜態的品牌紅漸層
// （開場畫面光團的那組顏色，上面最紅、往下漸漸變成淡淡的桃色），
// 滑翔翼改成白色，就像開場畫面那顆白色 logo mark 長大成了飛機。沒有雲，也不分時段。
//
// 座標系跟 HomeSky 一樣是 375×620、往上偏 19px 的框，飛機停的位置也一樣，
// 開場畫面的 logo mark 才能直接飛過來接手。
// 送出時漸層淡掉、飛機往右上飛走，留下白底接到對話；回首頁時再重新浮出來
const PLANE = { left: 50.53, top: 48.23, w: 17.85 };
// 飛機中心（框的 %）：光團就墊在這裡
const CENTER = {
  x: PLANE.left + PLANE.w / 2,
  y: PLANE.top + (PLANE.w * 375 * (488 / 600)) / 620 / 2,
};

export const GLOW_TOP = "#ff4a3c";

const GRADIENT = [
  "radial-gradient(90% 45% at 12% 8%, rgba(255, 150, 90, 0.9) 0%, rgba(255, 150, 90, 0) 70%)",
  "radial-gradient(80% 50% at 92% 28%, rgba(255, 61, 110, 0.85) 0%, rgba(255, 61, 110, 0) 70%)",
  "radial-gradient(90% 40% at 30% 48%, rgba(224, 32, 79, 0.55) 0%, rgba(224, 32, 79, 0) 70%)",
  `linear-gradient(to bottom, ${GLOW_TOP} 0%, #ff3030 30%, #ff6a52 50%, #ffa48c 64%, #ffe1d8 78%, #fff6f3 100%)`,
].join(", ");

export default function GlowHome({
  covered,
  intro,
  planeHandoff = false,
}: {
  covered: boolean;
  intro: boolean;
  planeHandoff?: boolean;
}) {
  // shown：光團跟飛機在不在畫面上。進場、從對話回來時先藏起來，下一幀再浮出來
  const [shown, setShown] = useState(!intro);
  const [reduce, setReduce] = useState(false);
  const [fromSplash, setFromSplash] = useState(planeHandoff);

  const appear = () => {
    setShown(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    if (intro && !r) appear();
    else setShown(true);
  }, [intro]);

  const wasCovered = useRef(covered);
  useEffect(() => {
    if (covered) setFromSplash(false);
    if (wasCovered.current && !covered && !reduce) appear();
    wasCovered.current = covered;
  }, [covered, reduce]);

  const visible = shown && !covered;
  const planeOpacity = fromSplash ? (planeHandoff ? 0 : 1) : visible ? 1 : 0;
  const planeTransform = fromSplash
    ? "translate(0, 0)"
    : covered
      ? "translate(70px, -100px) scale(0.9)"
      : visible
        ? "translate(0, 0)"
        : "translate(-40px, 60px) scale(0.9)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
    >
      <div className="absolute inset-0 bg-white" />
      {/* 滿版的品牌紅漸層（靜態）：幾團放射漸層疊在一條由上往下的漸層上，
          做出像網格漸層那種有深有淺的紅；下面漸漸淡成桃白色，「你可能也想知道」
          跟輸入框那一段才看得清楚 */}
      <div
        className="absolute inset-0"
        style={{
          background: GRADIENT,
          opacity: visible ? 1 : 0,
          transition: reduce ? "none" : `opacity ${covered ? 600 : 900}ms ease`,
        }}
      />
      <div className="absolute inset-x-0 top-[-19px] aspect-[375/620]">
        {/* 開場畫面的光團要飛到這裡再散開，接進滿版的漸層 */}
        <div
          data-warm-glow
          className="absolute size-px"
          style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
        />

        {/* 飛機停好的位置（不跟著動）：開場畫面要量這裡，把 logo mark 飛過來 */}
        <div
          data-glider-anchor
          className="absolute aspect-[600/488]"
          style={{
            left: `${PLANE.left}%`,
            top: `${PLANE.top}%`,
            width: `${PLANE.w}%`,
          }}
        />

        {/* 白色滑翔翼 */}
        <div
          className="absolute"
          style={{
            left: `${PLANE.left}%`,
            top: `${PLANE.top}%`,
            width: `${PLANE.w}%`,
            opacity: planeOpacity,
            transform: planeTransform,
            transition:
              fromSplash || reduce
                ? "none"
                : covered
                  ? "transform 600ms cubic-bezier(0.5, 0, 0.75, 0), opacity 450ms ease 100ms"
                  : `transform 1100ms ${EASING} 250ms, opacity 700ms ease 250ms`,
          }}
        >
          {/* 影子：落在光團上，用深一點的紅 */}
          <div
            className="absolute inset-0"
            style={{
              opacity: fromSplash && planeHandoff ? 0 : 0.5,
              transition: "opacity 600ms ease",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="glider-shadow absolute inset-0 size-full overflow-visible"
            >
              <polygon
                points="7,21 94,7 90,92"
                fill="#8a0e1e"
                stroke="#8a0e1e"
                strokeWidth={10}
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="glider-float relative">
            <GliderSvg
              tone="white"
              frame={false}
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
