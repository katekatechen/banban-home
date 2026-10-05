"use client";

import { useEffect, useRef, useState } from "react";
import { EASING } from "../_lib/page-transition";
import GliderSvg from "./GliderSvg";
import { CLOUD_MS } from "./HomeSky";
import OrbBloop, { hexToRgb } from "./orb-bloop/OrbBloop";

// 光暈版首頁（?home=glow）：延續開場畫面的風格。白底上，
// 正中間一顆用 WebGPU 畫的品牌紅光球（Bloop orb，會像語音助理那顆球一樣流動），
// 白色滑翔翼停在光球中央，就像開場畫面那顆白色 logo mark 長大成了飛機。
// 沒有雲，也不分時段。
//
// 座標系跟 HomeSky 一樣是 375×620、往上偏 19px 的框；開場畫面會量這裡的
// data-glider-anchor、data-warm-glow，把 logo mark、光團飛過來接手。
// 送出時光球放大淡掉、飛機往右上飛走，留下白底接到對話；回首頁時再重新浮出來
const PLANE = { w: 17.85, cy: 52.6 };
// 光球、飛機的中心（框的 %）：水平置中
const CENTER = { x: 50, y: PLANE.cy };
const PLANE_LEFT = CENTER.x - PLANE.w / 2;
const PLANE_TOP = CENTER.y - (PLANE.w * 375 * (488 / 600)) / 620 / 2;
// 光球的寬度：畫面寬的 44%（飛機尺寸不變）
const ORB_RATIO = 0.44;

export const GLOW_TOP = "#ffffff";

// 光球的配色跟開場畫面的光團同一組（粉紅的紅、粉紅、珊瑚橘），整體調亮、白多一點。
// shader 會把 main 跟其他顏色做加深混色，main 要放最淡的那個，不然整顆會發黑
const SPLASH_PALETTE = {
  main: hexToRgb("#fff1f3"),
  low: hexToRgb("#ff5476"),
  mid: hexToRgb("#ff9cbd"),
  high: hexToRgb("#ffb38a"),
};

const GRADIENT = "#ffffff";

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

  // 光球的像素大小要在掛載時就決定（GPU 畫布照這個大小建）
  const boxRef = useRef<HTMLDivElement>(null);
  const [orbSize, setOrbSize] = useState(0);
  useEffect(() => {
    const w = boxRef.current?.getBoundingClientRect().width ?? 375;
    setOrbSize(Math.round(w * ORB_RATIO));
  }, []);

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
      <div
        ref={boxRef}
        className="absolute inset-x-0 top-[-19px] aspect-[375/620]"
      >
        {/* 光球：開場畫面的光團會飛到這裡（data-warm-glow）再散開，接成這顆球 */}
        <div
          data-warm-glow
          className="absolute"
          style={{
            left: `${CENTER.x}%`,
            top: `${CENTER.y}%`,
            transform: `translate(-50%, -50%) scale(${visible ? 1 : covered ? 1.3 : 0.6})`,
            opacity: visible ? 1 : 0,
            transition: reduce
              ? "none"
              : `transform ${covered ? CLOUD_MS : 1100}ms ${EASING}, opacity ${covered ? 500 : 800}ms ease`,
          }}
        >
          {/* listen 狀態：球直接長到完整大小，邊緣跟著模擬的聲音輕輕起伏，
              像伴伴正在等你開口（idle 會先縮成小點、十幾秒才慢慢長大，還會一直明暗閃） */}
          {orbSize > 0 && (
            <OrbBloop
              size={orbSize}
              state="listen"
              palette={SPLASH_PALETTE}
              // 邊緣往外淡成透明，削弱一圈清楚的輪廓，像開場畫面那團光一樣柔
              style={{
                maskImage:
                  "radial-gradient(circle closest-side, #000 52%, rgba(0,0,0,0.6) 70%, transparent 92%)",
                WebkitMaskImage:
                  "radial-gradient(circle closest-side, #000 52%, rgba(0,0,0,0.6) 70%, transparent 92%)",
              }}
            />
          )}
        </div>

        {/* 飛機停好的位置（不跟著動）：開場畫面要量這裡，把 logo mark 飛過來 */}
        <div
          data-glider-anchor
          className="absolute aspect-[600/488]"
          style={{
            left: `${PLANE_LEFT}%`,
            top: `${PLANE_TOP}%`,
            width: `${PLANE.w}%`,
          }}
        />

        {/* 白色滑翔翼 */}
        <div
          className="absolute"
          style={{
            left: `${PLANE_LEFT}%`,
            top: `${PLANE_TOP}%`,
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
          {/* 影子：落在光球上，用深一點的紅 */}
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
