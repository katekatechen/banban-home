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
export const PLANE_EXIT_MS = 420;
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
  // 送出：按下去馬上往右上飛走（外層單一曲線，路線順暢），內層另外做側傾
  // （像滑翔翼遇到氣流調整角度，planeBank 動畫，globals.css），
  // 邊飛邊縮小、最後淡掉；這裡的 transform 是動畫結束後停留的位置
  const planeTransform = covered
    ? "translate(140px, -200px) scale(0.8)"
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
          transition: `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}`,
          willChange: "transform, opacity",
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
                ? `transform ${PLANE_EXIT_MS}ms cubic-bezier(0.25, 0.5, 0.45, 1), opacity 150ms ease-in 120ms`
                : `transform 1100ms ${EASING} 300ms, opacity 700ms ease 300ms`,
          }}
        >
          <div
            className="relative"
            style={{
              animation: covered
                ? `planeBank ${PLANE_EXIT_MS}ms ease-in-out forwards`
                : undefined,
            }}
          >
            {/* 影子：照 Figma 1083:25414 的 plane（1499:11724），#E5E7EB 填色、模糊 4，
                落在飛機右下方。框是飛機的 67×55，影子的匯出範圍（含模糊外擴）在
                x -5.63、y 40.83、65.59×48.12，換算成百分比放上去 */}
            <svg
              viewBox="0 0 66 49"
              aria-hidden
              className="glider-shadow absolute overflow-visible"
              style={{
                left: "-8.4%",
                top: "74.9%",
                width: "97.9%",
                height: "88.3%",
              }}
            >
              <defs>
                <filter
                  id="glider-shadow-blur"
                  x="0"
                  y="0"
                  width="65.587"
                  height="48.1194"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="2" />
                </filter>
              </defs>
              <g filter="url(#glider-shadow-blur)">
                <path
                  d="M45.2308 31.5414C46.4154 32.9163 47.6834 34.2109 49.2782 35.6189C51.0669 37.1993 53.2667 38.9228 56.2239 41.0619C56.3621 41.1628 56.5049 41.2651 56.6471 41.3679C56.8011 41.478 57.01 41.6297 57.2073 41.7659C57.4027 41.9019 57.4505 41.9359 57.534 41.9838C57.8637 42.1753 58.109 42.1399 58.1 42.0261L59.587 7.67833C59.5451 7.24845 59.2158 6.7661 58.4787 6.40792C57.7415 6.04973 56.8833 5.95515 56.1696 6.01789L6.12627 16.774C5.93849 16.7913 5.93015 16.9419 6.31054 17.0963C6.40613 17.1353 6.4715 17.1564 6.73429 17.243C6.99771 17.3307 7.29029 17.4227 7.50096 17.4897C7.69776 17.5524 7.89456 17.6151 8.08876 17.6749C12.1981 18.9693 15.4725 19.9048 18.4275 20.6301C21.0624 21.2771 23.4434 21.7556 25.9381 22.1684C28.248 22.5514 30.4824 22.6527 32.5982 22.5056C35.3716 22.3128 37.9442 21.6944 40.2115 20.7237L52.9055 10.4926L44.7146 22.8944C43.5731 24.4294 43.0805 26.0584 43.327 27.7184C43.5149 28.9849 44.1344 30.2702 45.2308 31.5414Z"
                  fill="#E5E7EB"
                  stroke="#E5E7EB"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              </g>
            </svg>
            <div className="glider-float relative">
              <SimpleGlider className="block h-auto w-full" />
            </div>
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
