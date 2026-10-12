"use client";

import { useEffect, useRef, useState } from "react";
import { EASING } from "../_lib/page-transition";

// 光暈版首頁的底色：照 Figma「Chat-1」（1083:25414）的 bg-gradient（10/12 更新）。
// 左側粉紅、中間大片珊瑚紅，右上角帶一點鵝黃，往下淡成白色。
// Figma 用了 multiply、linear burn、color burn 等混合模式，CSS 沒有完全對應的做法，
// 所以直接把那一層在 Figma 裡輸出成圖：public/v13/home-glow.webp，
// 375 寬、高 360（以下全白），3 倍解析度。
// 上方的 logo、狀態列、招呼語壓在色光上，改用白字（GLOW_TEXT_ON_COLOR）。
export const GLOW_IS_DARK = false;
export const GLOW_TEXT_ON_COLOR = true;
const BASE = "#ffffff";
// 手機狀態列的底色：取色光上緣（頂端 20px）的平均色
export const GLOW_TOP = "#fc7970";
export const GLOW_BG = BASE;
const BAND_SRC = "/v13/home-glow.webp";

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
          {/* 色光緩緩流動：整張圖放大一點後，16 秒一輪慢慢漂移、微微縮放，
              放大的量剛好蓋住漂移距離，邊緣不會露出白色 */}
          <div
            className="glow-flow absolute inset-x-0 top-0 aspect-[375/360]"
            style={{
              backgroundImage: `url(${BAND_SRC})`,
              backgroundSize: "100% 100%",
              transformOrigin: "50% 20%",
            }}
          />
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
            <SimpleGlider className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 光暈版首頁專用的簡化飛機：只留左翼、龍骨、右翼三塊，深淺兩個紅
// （外形照 GliderSvg 的 600×488 座標，拿掉摺痕、厚度跟骨架；預設天空版的飛機不受影響）
const NOSE = "595 3";
function SimpleGlider({ className }: { className?: string }) {
  const light = "#ff4a4a";
  const dark = "#c4202b";
  return (
    <svg viewBox="0 0 600 488" className={className} aria-hidden>
      <path
        d={`M24 75 L${NOSE} L252 162 L198 236 Q186 243 172 233 L22 128 Q2 112 6 96 Q10 79 24 75 Z`}
        fill={light}
      />
      <path d={`M${NOSE} L252 162 L291 288 L346 248 Z`} fill={dark} />
      <path
        d={`M${NOSE} L346 248 L354 344 Q360 362 376 376 L486 470 Q500 484 520 485 L548 486 Q572 486 574 460 Z`}
        fill={light}
      />
    </svg>
  );
}
