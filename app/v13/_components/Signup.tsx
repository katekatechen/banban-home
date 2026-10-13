"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import StatusBar from "./StatusBar";

// 註冊／登入頁（照 Figma 1343:5111 signup-1）。網址加 ?signup 才會出現，
// 取代開場畫面：從這頁開始，輸入手機號碼後出現「使用手機繼續」，點下去進首頁。
// 跟開場畫面一樣用 portal 掛到 #v13-frame，蓋過 tabbar。
//
// 進場（總長約 2 秒）：畫面上只有一件事在動，就是記號起飛。
// - 0 秒：品牌色光從稍大、透明慢慢收攏顯現，之後每一團各自緩慢漂移；
//         AIFIAN 字樣、標語、面板內的文字與輸入框直接出現，不做逐項淡入；
// - 0 ~ 0.65 秒：∧ 記號靜止停在漸層區的左下角（Figma 分鏡第一格）；
// - 0.65 ~ 2.05 秒：記號沿 45° 飛到中央，途中繞行進軸滾一圈，
//         滾到只剩側面一條線時（整段 58%）換成紙飛機，接縫藏在裡面；
//         標題同時由左而右被一道遮罩掃出來，收在飛機停穩之後；
// - 2.05 秒：交棒給常駐的上下漂浮，航跡淡掉；之後每 15 秒會在原地轉一圈（轉法同 scene-8）。
// 背景另有一層氣流刻度，沿 45° 飄動，風向會以 16 秒為週期緩慢來回轉。
// 輸入：號碼自動分成 3-3-3，focus 時底線加粗；開始輸入就展開按鈕（灰色不可按），
// 滿 9 碼變成品牌紅可以按，Enter 也能送出。
// 離場：面板往下收、紙飛機往右上飛走、整頁淡出，首頁同時開始進場（進場不做淡入，只有離場有）。
export const SIGNUP_EXIT_MS = 650;

// 手機瀏覽器狀態列的底色，接漸層最上緣
export const SIGNUP_TOP = "#ff5a8c";

// 光團：位置、大小、疊色、素材全部照 Figma signup-1 的 Group 2220（1343:5114），
// 以 375 寬、漸層區 484 高為準。檔名用 Figma 的 node id，因為圖層名稱（band #2446c4
// 之類）是舊的、跟實際填色對不上，用 node id 之後每次重新同步才不會配錯。
// img 是含模糊外擴的 SVG，inset 是外擴的比例。陣列順序就是疊放順序（第一個在最底下）。
type Band = {
  node: string;
  // 實際填色，寫在這裡純粹為了看程式時好認
  tint: string;
  left: number;
  top: number;
  w: number;
  h: number;
  inset: string;
  blend: React.CSSProperties["mixBlendMode"];
  rotate?: { deg: number; w: number; h: number };
  // 漂移：位移（px）、旋轉（deg）、縮放、週期（秒）
  drift: { x: number; y: number; r: number; s: number; d: number };
};

const BANDS: Band[] = [
  {
    node: "5118",
    tint: "#FE1215",
    left: -317.39,
    top: -97.52,
    w: 572.391,
    h: 522.062,
    inset: "-9.96% -9.08%",
    blend: "normal",
    drift: { x: 20, y: 18, r: -4, s: 1.05, d: 12 },
  },
  {
    node: "5115",
    tint: "#FF3B3B",
    left: -160.2,
    top: 178.29,
    w: 454.839,
    h: 409.833,
    inset: "-21.12% -18.71%",
    blend: "multiply",
    rotate: { deg: 4.31, w: 427.571, h: 378.756 },
    drift: { x: 22, y: -14, r: 6, s: 1.06, d: 11 },
  },
  {
    node: "5121",
    tint: "#FBD044",
    left: 199.01,
    top: -65.99,
    w: 451.274,
    h: 451.474,
    inset: "-15.44% -15.89%",
    blend: "normal",
    rotate: { deg: 44.11, w: 314.681, h: 323.735 },
    drift: { x: -16, y: 14, r: 10, s: 1.07, d: 10 },
  },
  {
    node: "5116",
    tint: "#FF3B3B",
    left: -79.28,
    top: 66,
    w: 528.493,
    h: 526.912,
    inset: "-9.87% -9.84%",
    blend: "normal",
    drift: { x: -18, y: 16, r: -5, s: 1.04, d: 13 },
  },
  {
    node: "5117",
    tint: "#FFBED8",
    left: -150.29,
    top: -183.65,
    w: 434.645,
    h: 354.183,
    inset: "-15.25% -12.42%",
    blend: "normal",
    drift: { x: 26, y: 12, r: 8, s: 1.08, d: 9 },
  },
  {
    node: "5120",
    tint: "#FF171B",
    left: -81.07,
    top: 81.89,
    w: 862.137,
    h: 863.959,
    inset: "-7.21% -8.26%",
    blend: "normal",
    rotate: { deg: 44.11, w: 568.993, h: 651.689 },
    drift: { x: -14, y: 10, r: 5, s: 1.04, d: 15 },
  },
];

const DESIGN_W = 375;
const DESIGN_H = 484;

function BandImg({ b }: { b: Band }) {
  const img = (
    <div className="absolute" style={{ inset: b.inset }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={`/v13/signup-band-${b.node}.svg`}
        className="block size-full max-w-none"
      />
    </div>
  );
  return (
    <div
      className="signup-band absolute"
      style={
        {
          left: b.left,
          top: b.top,
          width: b.w,
          height: b.h,
          mixBlendMode: b.blend,
          "--dx": `${b.drift.x}px`,
          "--dy": `${b.drift.y}px`,
          "--dr": `${b.drift.r}deg`,
          "--ds": b.drift.s,
          "--d": `${b.drift.d}s`,
        } as React.CSSProperties
      }
    >
      {b.rotate ? (
        <div className="flex size-full items-center justify-center">
          <div
            className="relative flex-none"
            style={{
              width: b.rotate.w,
              height: b.rotate.h,
              transform: `rotate(${b.rotate.deg}deg)`,
            }}
          >
            {img}
          </div>
        </div>
      ) : (
        img
      )}
    </div>
  );
}

// 漸層區：設計稿是 375×484，實際畫面寬高不一定，等比放大到蓋滿（以上緣中間為準）
function Bands({ leaving }: { leaving: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () =>
      setScale(Math.max(el.clientWidth / DESIGN_W, el.clientHeight / DESIGN_H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          transform: leaving ? "scale(1.25)" : "scale(1)",
          transformOrigin: "50% 40%",
          transition: "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          className="signup-bloom absolute top-0 left-1/2 isolate bg-white"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            marginLeft: -DESIGN_W / 2,
            transform: `scale(${scale})`,
            transformOrigin: "50% 0",
          }}
        >
          {BANDS.map((b, i) => (
            <BandImg key={i} b={b} />
          ))}
        </div>
      </div>
    </div>
  );
}

// 氣流：一格一格沿 45° 往右上飄的小翼形刻度，疊在漸層上，
// 位置用固定算式產生（不用隨機，避免 SSR 跟 client 對不起來）
// 6 欄 6 列，列距 17% 從 6% 排到 91%，整個漸層區（含標題、記號起點那一帶）
// 都要鋪到，不然下半部會空一塊
const AIR_COLS = 6;
const AIR_TICKS = Array.from({ length: 36 }, (_, i) => {
  const col = i % AIR_COLS;
  const row = Math.floor(i / AIR_COLS);
  return {
    left: `${5 + col * 17 + (row % 2 ? 8 : 0)}%`,
    top: `${6 + row * 17}%`,
    delay: `${-(((i * 7) % 9) * 0.6).toFixed(1)}s`,
    dur: `${(5 + ((i * 3) % 5) * 0.8).toFixed(1)}s`,
    // 轉向的相位依「位置」給，不是各自亂轉——相鄰的刻度先後差一點點，
    // 整片看起來就是一陣風斜斜吹過去，而不是一堆箭頭各自抖動
    swayDelay: `${-((col + row) * 0.9).toFixed(1)}s`,
    // 大小與線粗微微不同，拉出遠近層次，不然整片會讀成規律的圖樣
    size: 9 + ((i * 5) % 3) * 1.5,
    stroke: 1.1 + ((i * 2) % 3) * 0.2,
  };
});

// 飛機停在漸層區的中央偏上；翻轉時以它為中心擾動氣流。
// 每一格的強度與起始延遲都看「離飛機多遠」：近的轉得兇、也先被吹到
const PLANE_AT = { x: 50, y: 47 };
const AIR_GUSTS = AIR_TICKS.map((t) => {
  const dx = parseFloat(t.left) - PLANE_AT.x;
  const dy = parseFloat(t.top) - PLANE_AT.y;
  const d = Math.hypot(dx, dy);
  const n = Math.min(1, d / 70);
  const len = d || 1;
  return {
    gust: `${(32 - 26 * n).toFixed(1)}deg`,
    lag: `${Math.round(n * 550)}ms`,
    px: `${((dx / len) * (6 - 4 * n)).toFixed(1)}px`,
    py: `${((dy / len) * (6 - 4 * n)).toFixed(1)}px`,
  };
});

function AirFlow() {
  return (
    <div aria-hidden className="signup-air absolute inset-0 overflow-hidden">
      {AIR_TICKS.map((t, i) => (
        <span
          key={i}
          className="signup-air-tick absolute block"
          style={
            {
              left: t.left,
              top: t.top,
              "--delay": t.delay,
              "--d": t.dur,
            } as React.CSSProperties
          }
        >
          <span
            className="signup-air-gust"
            style={
              {
                "--gust": AIR_GUSTS[i].gust,
                "--gust-lag": AIR_GUSTS[i].lag,
                "--px": AIR_GUSTS[i].px,
                "--py": AIR_GUSTS[i].py,
              } as React.CSSProperties
            }
          >
            <svg
              className="signup-air-sway"
              width={t.size}
              height={t.size}
              viewBox="-5 -5 10 10"
              fill="none"
              style={{ "--sway-delay": t.swayDelay } as React.CSSProperties}
            >
              <path
                d="M -4,3 L 0,-4 L 4,3"
                stroke="#fff"
                strokeWidth={t.stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="rotate(45)"
              />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
}

// 旋轉殘影：8 層延遲副本，落後 110ms 一層、跨度 880ms。
// 跨度是關鍵——轉一圈 5 秒等於 72 度/秒，880ms 約 63 度的弧，
// 每一層才會停在看得出差異的角度上，疊起來是一疊清楚的剪影、
// 而不是全部擠在同一個角度糊成一團（原本 5 層只跨 333ms ≈ 24 度）。
// 不透明度比一般拖影的直覺值高：參考圖是白底配飽和色塊，這裡卻是
// 白色剪影疊在鮮紅底上，對比天生弱很多，壓太低就整個看不見
const ECHOES = [
  { lag: 110, op: 0.5 },
  { lag: 220, op: 0.43 },
  { lag: 330, op: 0.37 },
  { lag: 440, op: 0.31 },
  { lag: 550, op: 0.26 },
  { lag: 660, op: 0.21 },
  { lag: 770, op: 0.16 },
  { lag: 880, op: 0.12 },
];

function SpinEchoes() {
  return (
    <>
      {ECHOES.map((e) => (
        <div
          key={e.lag}
          aria-hidden
          className="signup-echo absolute inset-0"
          style={
            {
              "--lag": `${e.lag}ms`,
              "--echo-op": e.op,
            } as React.CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v13/signup-mark.svg"
            alt=""
            className="signup-echo-mark absolute top-[-1.8px] h-[58px] w-[66.63px] max-w-none"
            style={{ left: 1.135 }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v13/signup-plane.svg"
            alt=""
            className="signup-echo-plane absolute top-0 left-px h-[54.4px] w-[66.9px]"
          />
        </div>
      ))}
    </>
  );
}

// 號碼分成 3-3-3：912 345 678
const formatPhone = (digits: string) =>
  [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter(Boolean)
    .join(" ");

// 記號圖檔在起飛層裡的尺寸（跟紙飛機同高、置中疊著），
// 起點縮到 0.5 倍 ≈ Figma 分鏡第一格的 46×40。
// 標題改置中之後，記號不再跟標題對齊，改錨在漸層區的左下角：
// Figma 裡它在 x16（跟面板同一條 16px 邊界），下緣距離白色面板上緣 21.58。
// 記號的尺寸取 66.63×58，讓它翻到背面時的量體跟紙飛機（66.9 寬）一致；
// 起點再縮到 0.69 倍 ≈ Figma 分鏡第一格的 46×40
const MARK_W = 66.63;
const MARK_H = 58;
const MARK_START_SCALE = 0.6897;

// 翻面的共用重心：取白色紙飛機圖形的中心（紅影子算投影，不計入量體）。
// 記號必須對齊這個點、旋轉也以它為軸，兩面才會疊在同一個位置上翻，
// 否則翻過去會整個偏移——外框中心 (33.95, 39.85) 比機身中心低了 12.6px
const CRAFT_W = 67.9;
const CRAFT_H = 79.696;
const FACE_CX = 34.45;
const FACE_CY = 27.2;
// 記號中心相對外框中心的偏移，量測起點時要扣掉
const FACE_OFF_X = (FACE_CX - CRAFT_W / 2) * MARK_START_SCALE;
const FACE_OFF_Y = (FACE_CY - CRAFT_H / 2) * MARK_START_SCALE;
const MARK_LEFT = 16;
const MARK_ABOVE_PANEL = 21.58;

// 英文標語照 Figma 用 SF Pro Display：專案字體堆疊第一順位的 PingFang TC
// 自己也帶一套拉丁字母，不指定的話英文會被它接走，字形跟字面大小都會不一樣
const SF_PRO =
  '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

// 翻面時標題跟著換句：轉到背面時畫面上的東西就是 ∧ 記號本身，
// 句尾從 an AI Agent 換成 AIFIAN，字面跟圖形講的是同一件事。
// 換字的時機壓在紙飛機轉到「只剩側面一條線」的那一格（週期 15 秒、
// 從 2250ms 起算：10000 起轉、11250 側面、12500 正對背面、13750 再轉回側面），
// 跟記號換成紙飛機用的是同一招——趁看不見的時候換，接縫藏在裡面。
// 進出場是由下往上：舊的字往上滑出行高之外被遮罩切掉，新的從下面升上來。
// 動作交給 CSS（.signup-title-tail），這裡只負責在看不見的那一格換字串
const IDLE_START = 2250;
const FLIP_CYCLE = 15000;
const EDGE_IN = 11250;
const EDGE_OUT = 13750;
const TAIL_PLANE = "an AI Agent";
const TAIL_MARK = "AIFIAN";

// 單獨切出來的小元件：一輪只重畫兩次，不要牽動整頁。
// 用 rAF 從掛載時間推算，不用一串 setTimeout 接力，才不會愈跑愈偏
function TitleTail() {
  const [tail, setTail] = useState(TAIL_PLANE);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t0 = performance.now();
    let raf = 0;
    let last = TAIL_PLANE;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const e = now - t0 - IDLE_START;
      const p = e < 0 ? 0 : e % FLIP_CYCLE;
      const next = p >= EDGE_IN && p < EDGE_OUT ? TAIL_MARK : TAIL_PLANE;
      if (next === last) return;
      last = next;
      setTail(next);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <span className="signup-title-tail">
      <span className="signup-title-ink">{tail}</span>
    </span>
  );
}

export default function Signup({
  leaving,
  onContinue,
}: {
  leaving: boolean;
  onContinue: () => void;
}) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [digits, setDigits] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  // 記號的起點：漸層區的左下角（Figma 分鏡第一格）。
  // 用量的不用寫死，手機框從 375 到 430 都會落在對的位置
  const [start, setStart] = useState({ dx: -134, dy: 120 });

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
  }, []);

  useLayoutEffect(() => {
    const craft = craftRef.current;
    const sky = skyRef.current;
    if (!craft || !sky) return;
    const measure = () => {
      const c = craft.getBoundingClientRect();
      const s = sky.getBoundingClientRect();
      // 起點縮到 MARK_START_SCALE，記號實際會是 45.8×39.9（≈Figma 的 46×40）
      const w = (MARK_W * MARK_START_SCALE) / 2;
      const h = (MARK_H * MARK_START_SCALE) / 2;
      setStart({
        dx: s.left + MARK_LEFT + w - (c.left + c.width / 2) - FACE_OFF_X,
        dy:
          s.bottom - MARK_ABOVE_PANEL - h - (c.top + c.height / 2) - FACE_OFF_Y,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(craft);
    ro.observe(sky);
    return () => ro.disconnect();
  }, [frame]);

  if (!frame) return null;

  const valid = digits.length === 9;
  const ctaOpen = digits.length > 0;

  const submit = () => {
    if (!valid || leaving) return;
    inputRef.current?.blur();
    onContinue();
  };

  return createPortal(
    <div
      className="absolute inset-0 z-[80] flex flex-col bg-white"
      style={{
        opacity: leaving ? 0 : 1,
        transition: `opacity 450ms ease ${leaving ? 200 : 0}ms`,
        pointerEvents: leaving ? "none" : undefined,
      }}
    >
      {/* 上半部：漸層、紙飛機、logo、標語 */}
      <div
        ref={skyRef}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <Bands leaving={leaving} />
        <AirFlow />
        <div className="relative">
          <StatusBar />
        </div>
        {/* 導覽列：AIFIAN 字樣置中、客服在右（Figma logo 1343:5613 x137 y54 102×30） */}
        <div className="relative flex h-11 shrink-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v13/signup-logo.svg"
            alt="AIFIAN"
            className="h-[30px] w-[102px]"
          />
          <button
            type="button"
            aria-label="客服"
            className="absolute right-4 flex size-10 items-center justify-center rounded-full active:bg-black/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v13/signup-headset.svg" alt="" width={24} height={24} />
          </button>
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center">
          {/* 紙飛機：外層管離場，內層是起飛動畫，最內層管常駐漂浮 */}
          <div
            style={{
              transform: leaving
                ? "translate(140px, -200px) scale(0.8)"
                : "translate(0, 0) scale(1)",
              opacity: leaving ? 0 : 1,
              transition: leaving
                ? "transform 420ms cubic-bezier(0.25, 0.5, 0.45, 1), opacity 150ms ease-in 120ms"
                : undefined,
            }}
          >
            <div ref={craftRef} className="relative h-[79.696px] w-[67.9px]">
              {/* 航跡：座標原點對齊紙飛機的中心，所以從量到的起點畫到 (0,0) 就好 */}
              <svg
                aria-hidden
                className="signup-trail pointer-events-none absolute"
                style={{ left: 33.95 - 200, top: 39.85 - 200 }}
                width={400}
                height={400}
                viewBox="-200 -200 400 400"
                fill="none"
              >
                <defs>
                  <linearGradient
                    id="signup-trail-fade"
                    x1="0"
                    y1="1"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="55%" stopColor="#fff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <path
                  d={`M${start.dx},${start.dy} Q${(start.dx * 0.46).toFixed(1)},${(start.dy * 0.38).toFixed(1)} 0,0`}
                  pathLength={1}
                  stroke="url(#signup-trail-fade)"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeDasharray={1}
                />
              </svg>

              {/* 起飛：位移＋放大 → 繞航行軸滾一圈 → 記號與紙飛機交接 */}
              <div
                className="signup-takeoff absolute inset-0"
                style={
                  {
                    "--tx": `${start.dx.toFixed(1)}px`,
                    "--ty": `${start.dy.toFixed(1)}px`,
                  } as React.CSSProperties
                }
              >
                <SpinEchoes />
                <div className="signup-takeoff-roll absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/v13/signup-mark.svg"
                    alt=""
                    className="signup-takeoff-mark absolute top-[-1.8px] h-[58px] w-[66.63px] max-w-none"
                    style={{ left: 1.135 }}
                  />
                  <div className="signup-takeoff-plane absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/v13/signup-plane-shadow.svg"
                      alt=""
                      className="signup-plane-shadow absolute top-[34px] left-0 h-[45.696px] w-[62.217px]"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/v13/signup-plane.svg"
                      alt=""
                      className="signup-plane-float absolute top-0 left-px h-[54.4px] w-[66.9px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 標題：置中、寬度 232.4 自然斷行，跟紙飛機當成同一組一起置中
              （Figma landing::title 1343:5612，SF Pro Display Medium 24/32，
              與紙飛機下緣相距 12.18） */}
          <p
            className="signup-title relative mt-[12.18px] w-[232.4px] text-center text-[24px] leading-8 font-medium"
            style={{
              fontFamily: SF_PRO,
              opacity: leaving ? 0 : 1,
              transition: "opacity 250ms ease",
            }}
          >
            {/* 兩行各自成塊（斷行處跟自然斷行同一個地方）：句尾換字時
                字寬會變，交給自動斷行會在某幾格跳成一行或三行 */}
            <span className="signup-title-line signup-title-ink">
              Invest in Yourself
            </span>
            <span className="signup-title-line">
              <span className="signup-title-with signup-title-ink">
                with&nbsp;
              </span>
              <TitleTail />
            </span>
          </p>
        </div>
      </div>

      {/* 下半部：註冊面板 */}
      <div
        className="relative shrink-0"
        style={{
          transform: leaving ? "translateY(100%)" : "translateY(0)",
          opacity: leaving ? 0 : 1,
          transition:
            "transform 450ms cubic-bezier(0.55, 0, 0.75, 0.2), opacity 250ms ease",
        }}
      >
        <div className="flex flex-col items-center gap-6 bg-[#fefefe] p-4 pb-[calc(16px+env(safe-area-inset-bottom))] sm:pb-[50px]">
          <div className="flex w-full flex-col items-center gap-6">
            <p className="w-full text-center text-[16px] leading-6 text-gray-800">
              Create an account or log in
            </p>
            <div className="flex w-full flex-col">
              <div className="flex w-full items-start gap-2">
                <div className="flex w-[83px] shrink-0 items-center gap-1 border-b border-gray-800 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/v13/signup-flag-tw.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                  <span className="text-[24px] leading-8 text-gray-800">
                    +886
                  </span>
                </div>
                <label className="relative min-w-0 flex-1 border-b border-gray-800 py-2">
                  <span className="sr-only">手機號碼</span>
                  <input
                    ref={inputRef}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="912 345 678"
                    value={formatPhone(digits)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={(e) => {
                      // 只留數字；習慣打 09 開頭的，把開頭的 0 拿掉
                      let d = e.target.value.replace(/\D/g, "");
                      if (d.startsWith("0")) d = d.slice(1);
                      setDigits(d.slice(0, 9));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                    className="block h-8 w-full bg-transparent text-[24px] leading-8 text-gray-800 caret-[#ff3b3b] outline-none placeholder:text-gray-300"
                  />
                  {/* focus 時從中間往兩邊長出一條加粗的底線 */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-[2px] bg-gray-800"
                    style={{
                      transform: focused ? "scaleX(1)" : "scaleX(0)",
                      transition:
                        "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  />
                </label>
              </div>

              {/* 「使用手機繼續」：開始輸入才展開，滿 9 碼變紅色可以按 */}
              <div
                className="grid"
                style={{
                  gridTemplateRows: ctaOpen ? "1fr" : "0fr",
                  transition:
                    "grid-template-rows 360ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className="pt-2"
                    style={{
                      opacity: ctaOpen ? 1 : 0,
                      transform: ctaOpen ? "translateY(0)" : "translateY(-8px)",
                      transition:
                        "opacity 260ms ease 80ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={submit}
                      disabled={!valid}
                      tabIndex={ctaOpen ? 0 : -1}
                      className={`flex h-12 w-full items-center justify-center rounded-2xl text-[16px] leading-6 font-semibold transition-[background-color,color,transform] duration-300 active:scale-[0.98] ${
                        valid
                          ? "signup-cta-ready bg-[#ff3b3b] text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      使用手機繼續
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex w-full justify-center py-2">
                <p className="text-[14px] leading-[18px] text-gray-800">或</p>
              </div>
              <div className="mt-2 flex w-full gap-2">
                <button
                  type="button"
                  aria-label="使用 Apple 繼續"
                  className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-gray-800 bg-gray-800 transition-transform active:scale-[0.97]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/v13/signup-apple.svg"
                    alt=""
                    width={20}
                    height={24}
                  />
                </button>
                <button
                  type="button"
                  aria-label="使用 Google 繼續"
                  className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-gray-100 transition-transform active:scale-[0.97]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/v13/signup-google.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>
          </div>
          <p className="min-h-11 w-full text-center text-[12px] leading-4 tracking-[0.12px] text-gray-800">
            繼續建立帳號或登入代表你已閱讀並同意 AIFIAN 的{" "}
            <span className="font-bold whitespace-nowrap">服務條款</span>
            {/* 照設計稿固定在「服務條款」後面換行，避免寬螢幕斷在「隱私權政｜策」 */}
            <br />與{" "}
            <span className="font-bold whitespace-nowrap">隱私權政策</span>。
          </p>
        </div>
      </div>
    </div>,
    frame,
  );
}
