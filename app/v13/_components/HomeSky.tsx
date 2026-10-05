"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EASING } from "../_lib/page-transition";
import type { SkyTheme } from "../_lib/time-of-day";
import GliderSvg from "./GliderSvg";

// 首頁插圖：滿版的天空漸層加一架滑翔翼（照 Figma 1017:3714，沒有雲）。
// 載入時天空從白淡入，滑翔翼從左下飛進定位；
// 送出第一句話後，天空淡掉、滑翔翼往右上飛走，留下白底接到對話；
// 回到首頁時再重播一次進場。
//
// 飛機的座標照 Figma 948:44415：375 寬、往上偏 19px 的框。
// 天空的顏色跟著時段換（_lib/time-of-day，預設白天）

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

// 送出時首頁淡掉的時間。首頁送出後也照 CLOUD_MS 算對話什麼時候淡入
// （名稱沿用以前「雲往上蓋白」的版本）
export const CLOUD_MS = 900;

type Phase = "pre" | "sky" | "rest";

export default function HomeSky({
  covered,
  intro,
  theme,
  planeHandoff = false,
  pull = 0,
  pullDragging = false,
}: {
  // 首頁下拉的進度（0～1）：雲、飛機、暖光各自往下移不同距離，做出視差。
  // 俯視的角度，越靠近鏡頭的移得越多：雲（最近）> 飛機（在雲底下）> 暖光、海面
  pull?: number;
  // 手指還在拖：跟著手指走、不要過場；放開後才彈回去
  pullDragging?: boolean;
  // 開場畫面的 logo mark 正飛過來變成滑翔翼：這段期間首頁自己的飛機先藏著、
  // 直接停在定位，等開場畫面收掉（這個值變回 false）才現身接手
  planeHandoff?: boolean;
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
  // 滑翔翼預設是程式畫的扁平版（沒有骨架）；比較用：網址加 ?plane=png 換回原本的圖檔
  const [vectorPlane, setVectorPlane] = useState(true);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("plane") === "png")
      setVectorPlane(false);
  }, []);

  // 進場：天空從白淡入，雲從畫面下方升上來，飛機最後從雲底下鑽出來
  const playEnter = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    setEntering(true);
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
      window.setTimeout(() => setEntering(false), 2800),
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
  // 用 layout effect：要在瀏覽器畫出這一幀之前就把雲瞬間搬到畫面下方，
  // 不然雲會先從蓋滿畫面的位置往下掉，看起來像從上面進來
  const wasCovered = useRef(covered);
  useLayoutEffect(() => {
    if (wasCovered.current && !covered && !reduce) playEnter();
    wasCovered.current = covered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [covered]);

  // 滑翔翼：平常停在 Figma 的位置；進場、回首頁時從左下飛進來，送出時往右上飛走
  // 這次掛載的飛機是從開場畫面接手的：不走「從雲底下鑽出來」，第一次送出之後才恢復
  const [fromSplash, setFromSplash] = useState(planeHandoff);
  useEffect(() => {
    if (covered) setFromSplash(false);
  }, [covered]);

  const planeOut = phase === "rest" && !covered;
  const planeTransform = planeOut
    ? "translate(0, 0)"
    : covered
      ? "translate(70px, -100px) scale(0.9)"
      : "translate(-40px, 60px) scale(0.9)";
  const planeDelay = entering ? 300 : 0;

  // 視差：每一層各自往下移 pull × 距離
  const parallax = (px: number): React.CSSProperties => ({
    transform: `translateY(${pull * px}px)`,
    transition: pullDragging ? "none" : `transform 320ms ${EASING}`,
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
    >
      {/* 天空：滿版漸層，顏色跟著時段換；送出時淡掉，留下白底接到對話 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${theme.sky.map(([c, at]) => `${c} ${at}%`).join(", ")})`,
          opacity: phase === "pre" || covered ? 0 : 1,
          transition:
            reduce || jump
              ? "none"
              : `opacity ${covered ? CLOUD_MS * 0.6 : 500}ms ease`,
        }}
      />

      <div className="absolute inset-x-0 top-[-19px] aspect-[375/620]">
        <div className="absolute inset-0" style={parallax(4)}>
          {/* 品牌色的暖光：延續開場畫面的光團，在雲後面、地平線附近，像太陽剛升起；
            跟開場畫面同樣 5 秒一次慢慢呼吸。強弱跟著時段 */}
          <div
            data-warm-glow
            className="warm-glow absolute left-[56%] top-[70%] aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: `radial-gradient(closest-side, ${theme.warmGlow[0]}, ${theme.warmGlow[1]} 45%, transparent 100%)`,
              opacity: phase === "pre" || covered ? 0 : 1,
              transition:
                reduce || jump
                  ? "none"
                  : covered
                    ? `opacity ${CLOUD_MS * 0.6}ms ease`
                    : "opacity 900ms ease 200ms",
            }}
          />
        </div>
        {/* 飛機停好的位置（不跟著動）：開場畫面要量這裡，把 logo mark 飛過來 */}
        <div
          data-glider-anchor
          className="pointer-events-none absolute left-[50.53%] top-[48.23%] aspect-[600/488] w-[17.85%]"
        />
        <div className="absolute inset-0" style={parallax(12)}>
          {/* 月光閃點：送出時跟天空一起淡掉 */}
          <div
            className="absolute inset-0"
            style={{
              opacity: covered ? 0 : 1,
              transition: `opacity ${CLOUD_MS * 0.6}ms ease`,
            }}
          >
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
          </div>
          {/* 滑翔翼：外層管進場、送出時飛走；裡面的飛機跟影子各自跑常駐的浮動。
            俯視的角度，影子落在下方的海面上：飛機往上飄（離鏡頭近一點、稍微放大）時，
            影子離得遠一點、變淡變小，像真的拉開了高度。
            飛機要從雲底下鑽出來，所以放在雲層後面 */}
          <div
            className="absolute left-[50.53%] top-[48.23%] w-[17.85%]"
            style={{
              // 進場前（雲還在畫面外）先藏起來，其他時候都在，靠雲擋住
              opacity: fromSplash ? (planeHandoff ? 0 : 1) : planeOut ? 1 : 0,
              transform: fromSplash ? "translate(0, 0)" : planeTransform,
              transition:
                fromSplash || reduce || jump
                  ? "none"
                  : covered
                    ? "transform 600ms cubic-bezier(0.5, 0, 0.75, 0), opacity 450ms ease 100ms"
                    : `transform 1100ms ${EASING} ${planeDelay}ms, opacity 700ms ease ${planeDelay}ms`,
            }}
          >
            {/* 影子只取機翼的大三角形輪廓，不畫骨架細節 */}
            <div
              className="absolute inset-0"
              style={{
                // 從開場畫面接手時，影子等飛機落定才慢慢浮出來
                opacity: fromSplash && planeHandoff ? 0 : theme.shadow,
                transition: "opacity 600ms ease",
              }}
            >
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
                <GliderSvg frame={false} className="block h-auto w-full" />
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
        </div>
      </div>
    </div>
  );
}
