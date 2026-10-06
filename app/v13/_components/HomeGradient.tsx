"use client";

import { useEffect, useRef, useState } from "react";
import GliderSvg from "./GliderSvg";
import { EASING } from "../_lib/page-transition";

// 光暈版首頁的底色：配色參考 helia——左邊深藍綠，經過一點梅紫，
// 中間深莓紅到亮紅粉，往右退成淺粉、白。不滿版：只壓在畫面上方，往下退成白色，
// 下半部留白（快捷問題、輸入框都在白底上）。
// 上方的 logo、狀態列、招呼語壓在色光上，改用白字（GLOW_TEXT_ON_COLOR）。
export const GLOW_IS_DARK = false;
export const GLOW_TEXT_ON_COLOR = true;
const BASE = "#ffffff";
export const GLOW_TOP = "#c8234f";
export const GLOW_BG = BASE;
// 色光帶的下緣是一道起伏的波浪（參考藍色波浪那張）：同一條邊界有緊有鬆——
// 中段用很小的模糊，邊界清楚、還壓一道深一點的陰影線；左右兩側換成大模糊，散開成霧。
// 做法：同一個波浪形狀畫兩次（小模糊／大模糊），各自用左右方向的遮罩只留一段。
// 座標系 375×420，寬度跟著畫面縮放。
const WAVE_EDGE =
  "C360,140 320,230 250,222 C180,214 150,160 95,180 C55,195 25,250 -80,262";
const WAVE = `M-80,-60 H455 V150 L415,150 ${WAVE_EDGE} Z`;
const EDGE_LINE = `M415,150 ${WAVE_EDGE}`;
const STOPS: [number, string][] = [
  [0, "#2f6b8c"],
  [0.14, "#4c3c7e"],
  [0.36, "#b81f4b"],
  [0.6, "#e8385a"],
  [0.82, "#f27c96"],
  [1, "#f9c6d3"],
];

function WaveBand() {
  return (
    <svg
      viewBox="0 0 375 420"
      className="absolute inset-x-0 top-0 h-auto w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id="glow-band" x1="0" y1="0" x2="1" y2="0.25">
          {STOPS.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id="glow-hi" cx="0.72" cy="0.1" r="0.45">
          <stop offset="0" stopColor="#ff9fb4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff9fb4" stopOpacity="0" />
        </radialGradient>
        <filter id="glow-tight" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="glow-loose" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
        <filter id="glow-edge" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        {/* 緊：中段；鬆：左右兩側 */}
        <linearGradient id="glow-mt" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="0.3" stopColor="#fff" />
          <stop offset="0.62" stopColor="#fff" />
          <stop offset="0.85" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glow-ml" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.85" stopColor="#fff" />
        </linearGradient>
        <mask id="glow-mask-tight" maskUnits="userSpaceOnUse" x="-100" y="-100" width="575" height="560">
          <rect x="-100" y="-100" width="575" height="560" fill="url(#glow-mt)" />
        </mask>
        <mask id="glow-mask-loose" maskUnits="userSpaceOnUse" x="-100" y="-100" width="575" height="560">
          <rect x="-100" y="-100" width="575" height="560" fill="url(#glow-ml)" />
        </mask>
      </defs>
      <g mask="url(#glow-mask-tight)">
        <path d={WAVE} fill="url(#glow-band)" filter="url(#glow-tight)" />
      </g>
      <g mask="url(#glow-mask-loose)">
        <path d={WAVE} fill="url(#glow-band)" filter="url(#glow-loose)" />
      </g>
      {/* 邊界內側一道深一點的陰影，讓緊的那段更有「邊」的感覺 */}
      <g mask="url(#glow-mask-tight)">
        <path
          d={EDGE_LINE}
          transform="translate(0,-10)"
          fill="none"
          stroke="#7a1638"
          strokeWidth="16"
          strokeOpacity="0.35"
          filter="url(#glow-edge)"
        />
      </g>
      <rect x="-80" y="-60" width="535" height="300" fill="url(#glow-hi)" />
    </svg>
  );
}

// 進入對話：白色從底部一口氣往上抽起來蓋滿畫面，彩色底同時往上淡掉
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
  // 預設版（天空版）的紅色小飛機：停在畫面中段，平常輕輕浮動。
  // 載入、回首頁時從左下飛進定位；送出時往右上飛走（疊在白幕上面，看得到它飛走）
  const [planeIn, setPlaneIn] = useState(!intro);
  const [jump, setJump] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    const isFirst = first.current;
    first.current = false;
    if (covered) return;
    // 切分頁回來（不播進場）：直接停在定位
    if (isFirst && !intro) return;
    // 回首頁：先瞬間搬回左下（不要從右上倒飛回來），下一幀再飛進來
    setJump(true);
    setPlaneIn(false);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      setJump(false);
      r2 = requestAnimationFrame(() => setPlaneIn(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
    // intro 只看掛載當下
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [covered]);
  const planeTransform = covered
    ? "translate(70px, -100px) scale(0.9)"
    : planeIn
      ? "translate(0, 0)"
      : "translate(-40px, 60px) scale(0.9)";

  const ms = covered ? GRADIENT_EXIT_MS : 650;
  const ease = covered ? IN : OUT;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-white"
    >
      {/* 漸層：外層管進出對話，內層管載入（避免 animation 蓋掉 transition） */}
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
            background: BASE,
            animation: intro ? "homeGradientFade 900ms ease both" : undefined,
          }}
        >
          <WaveBand />
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
      {/* 小飛機：位置照天空版（Figma 948:44415，375 寬、往上偏 19px 的框） */}
      <div className="absolute inset-x-0 top-[-19px] aspect-[375/620]">
        <div
          className="absolute left-[50.53%] top-[48.23%] w-[17.85%]"
          style={{
            opacity: covered || !planeIn ? 0 : 1,
            transform: planeTransform,
            transition: jump
              ? "none"
              : covered
                ? "transform 600ms cubic-bezier(0.5, 0, 0.75, 0), opacity 450ms ease 100ms"
                : `transform 1100ms ${EASING} 300ms, opacity 700ms ease 300ms`,
          }}
        >
          {/* 淡淡的影子落在白底上 */}
          <div className="absolute inset-0" style={{ opacity: 0.5 }}>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="glider-shadow absolute inset-0 size-full overflow-visible"
            >
              <polygon
                points="7,21 94,7 90,92"
                fill="#1e2939"
                stroke="#1e2939"
                strokeWidth={10}
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="glider-float relative">
            <GliderSvg frame={false} className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
