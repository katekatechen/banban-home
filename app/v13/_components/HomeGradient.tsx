"use client";

import { useEffect, useRef, useState } from "react";
import { EASING } from "../_lib/page-transition";

// 光暈版首頁的底色：照 Figma「Chat-1」（1083:25414）的 bg-gradient（10/12 更新）。
// 左側粉紅、左上杏色、中間大片珊瑚紅（multiply）、右上鵝黃（multiply），往下淡成白色。
// 四顆色光從 Figma 各自輸出成透明圖（public/v13/glow-*.webp，含 layer blur），
// 在這裡用同樣的混合模式疊回去，讓色光持續往右流：每顆有前後兩份，
// 從左邊淡入、一路往右漂、在右邊淡出，兩份錯開半輪接力，看不到往回跑。
// 圖的畫布比畫面大一圈（左右上下各多 80px），漂移時邊緣不會露出來。
// 上方的 logo、狀態列、招呼語壓在色光上，改用白字（GLOW_TEXT_ON_COLOR）。
export const GLOW_IS_DARK = false;
export const GLOW_TEXT_ON_COLOR = true;
const BASE = "#ffffff";
// 手機狀態列的底色：取色光上緣（頂端 20px）的平均色
export const GLOW_TOP = "#fc7970";
export const GLOW_BG = BASE;
// [檔名, 混合模式]，順序＝Figma 圖層由下到上
const GLOW_LAYERS: [string, "normal" | "multiply"][] = [
  ["pink", "normal"],
  ["peach", "normal"],
  ["coral", "multiply"],
  ["yellow", "multiply"],
];

// 進入對話：色光往外擴散、變糊、淡掉，露出底下的白；回首頁時再收回來
export const GRADIENT_EXIT_MS = 700;
// 送出時紙飛機飛出畫面的時間；對話內容等它大致飛走才淡入，不然會被對話的白底蓋掉
export const PLANE_EXIT_MS = 500;
const IN = "cubic-bezier(0.22, 1, 0.36, 1)"; // 一開始擴散得快、最後慢慢散掉
const OUT = "cubic-bezier(0.16, 1, 0.3, 1)"; // 回首頁：色光慢慢聚回來

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
  // 送出：按下去馬上往右上飛走（起步快、後段減速），邊飛邊微微抬頭、縮小，飛到一半淡掉
  const planeTransform = covered
    ? "translate(140px, -200px) rotate(-8deg) scale(0.8)"
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
          transformOrigin: "35% 15%",
          opacity: covered ? 0 : 1,
          transform: covered ? "scale(1.45)" : "scale(1)",
          filter: covered ? "blur(28px)" : "blur(0px)",
          transition: `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}, filter ${ms}ms ${ease}`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: BASE,
            animation: intro ? "homeGradientFade 900ms ease both" : undefined,
          }}
        >
          <div className="absolute inset-x-0 top-0 isolate aspect-[375/360]">
            {GLOW_LAYERS.flatMap(([name, blend]) =>
              ["a", "b"].map((copy) => (
                <div
                  key={`${name}-${copy}`}
                  className={`glow-layer glow-${name} glow-${copy} absolute`}
                  style={{
                    left: "-21.333%",
                    top: "-22.222%",
                    width: "142.667%",
                    height: "144.444%",
                    backgroundImage: `url(/v13/glow-${name}.webp)`,
                    backgroundSize: "100% 100%",
                    mixBlendMode: blend,
                  }}
                />
              )),
            )}
          </div>
        </div>
      </div>
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
                ? `transform ${PLANE_EXIT_MS}ms cubic-bezier(0.25, 0.5, 0.45, 1), opacity 250ms ease 200ms`
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
