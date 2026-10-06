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
const W = 375;
const cq = (px: number) => `${(px / W) * 100}cqw`;

// [顏色, x, 距頂部, 寬, 高, 模糊(px@375), 透明度]
const BAND: [string, number, number, number, number, number, number][] = [
  ["#2f6b8c", -190, -90, 300, 330, 48, 0.95],
  ["#4c3c7e", -90, -170, 220, 300, 48, 0.75],
  ["#b81f4b", 30, -150, 260, 330, 48, 0.95],
  ["#e8385a", 140, -180, 250, 320, 48, 0.95],
  ["#f27c96", 230, -130, 200, 260, 46, 0.75],
  ["#f9c6d3", 300, -150, 200, 260, 46, 0.7],
];

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
            containerType: "inline-size",
            animation: intro ? "homeGradientFade 900ms ease both" : undefined,
          }}
        >
          {BAND.map(([color, x, top, w, h, blur, op], i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: cq(x),
                top: cq(top),
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
