"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import StatusBar from "./StatusBar";

// 註冊／登入頁（1-1 照 Figma 1343:5111 signup-1；之後的步驟照 1413:5505 註冊／登入完整流程）。
// 網址加 ?signup 才會出現，取代開場畫面；?signup 走新用戶（手機 → 驗證碼 → 設定密碼），
// ?signup=member 走已註冊（手機 → 輸入密碼）。最後一步完成才進首頁。
// 再加 &lang=zh 是中文版（Figma 1422:7526／1428:9688），標語在紙飛機與 ∧ 記號翻面時整句互換
// （「AIFIAN 幫你買得更好、花得更少」↔「回饋自己的生活」）。
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
// 按下「使用手機繼續」分兩拍：
// - 第 1 拍（0.38 秒）：bottom sheet 往上展開到導覽列下方，標語、AIFIAN 字樣淡掉，
//   紙飛機縮到 0.6 倍移到漸層帶中央，sheet 裡的內容先不換；
// - 第 2 拍：手機那一步往左滑出、下一步從右邊滑入；紙飛機停在原地，只有縮小，不飛走。
// 之後輸入、驗證、換步驟時紙飛機都不動（只有常駐的上下漂浮），回饋交給表單本身：
// 驗證中數字格脈動、錯誤時數字格晃動並且色光短暫偏暖；只有按「重新傳送」時紙飛機會飛出去送簡訊。
// 導覽列用 AFFOGATO navigation-bar（7481:1566）的 Liquid Glass 圓鈕：1-1 只有右上客服，
// 之後左上多一顆返回。
// 驗證碼輸入 000000 可以看錯誤狀態，其他任意 6 碼都會通過。
// 最後一步送出：白色表單一路往下推出畫面，紙飛機同時從漸層帶往右上飛走，接首頁進場。
// 離場：sheet 往下收、紙飛機往右上飛走、整頁淡出，首頁同時開始進場（進場不做淡入，只有離場有）。
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
// coverHeight：以這個高度計算縮放（不給就用容器本身的高度）
function Bands({
  leaving,
  coverHeight,
}: {
  leaving: boolean;
  coverHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () =>
      setScale(
        Math.max(
          el.clientWidth / DESIGN_W,
          (coverHeight ?? el.clientHeight) / DESIGN_H,
        ),
      );
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [coverHeight]);
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
// 機身中心相對外框中心的偏移。航跡的終點要用這個，不能用外框中心，
// 不然線會多往下跑 12.6px，看起來像是插進影子裡
const FACE_DX = FACE_CX - CRAFT_W / 2;
const FACE_DY = FACE_CY - CRAFT_H / 2;
// 起點縮到 MARK_START_SCALE 時，同一個偏移也跟著縮
const FACE_OFF_X = FACE_DX * MARK_START_SCALE;
const FACE_OFF_Y = FACE_DY * MARK_START_SCALE;
const MARK_LEFT = 16;
const MARK_ABOVE_PANEL = 21.58;

// 航跡只畫到整條的這個比例就停：尾巴不接到紙飛機身上。
// 原本 0.73 是連影子都不碰，看起來太短；拉長到 0.82，尾端稍微壓到影子沒關係
const TRAIL_END = 0.82;

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

// 第二行單獨切出來：一輪只重畫兩次，不要牽動整頁。
// 用 rAF 從掛載時間推算，不用一串 setTimeout 接力，才不會愈跑愈偏。
//
// with 用 FLIP 接住換字造成的位移：句子長度一變，整行重新置中，
// with 的位置會瞬間跳過去。換字前先記下它在哪，換完先把它拉回舊位置，
// 再滑到新位置，看起來就是被後面那個字推（或拉）過去的
function TitleLine2() {
  const [tail, setTail] = useState(TAIL_PLANE);
  const withRef = useRef<HTMLSpanElement>(null);
  const beforeX = useRef<number | null>(null);

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
      beforeX.current = withRef.current?.getBoundingClientRect().left ?? null;
      setTail(next);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    const el = withRef.current;
    const from = beforeX.current;
    beforeX.current = null;
    if (!el || from == null) return;
    const dx = from - el.getBoundingClientRect().left;
    if (!dx) return;
    el.style.transition = "none";
    el.style.transform = `translateX(${dx.toFixed(2)}px)`;
    // 讀一次佈局，逼瀏覽器把上面那行先算進去，否則兩次設定會被合併掉
    void el.offsetWidth;
    el.style.transition = "transform 560ms cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "translateX(0)";
  }, [tail]);

  return (
    <span className="signup-title-line">
      <span ref={withRef} className="signup-title-with signup-title-ink">
        with&nbsp;
      </span>
      <span className="signup-title-tail">
        <span className="signup-title-ink">{tail}</span>
      </span>
    </span>
  );
}

// 註冊流程的步驟（Figma 1413:5505 註冊／登入完整流程）：
// phone 輸入手機 → 新用戶 otp 驗證碼 → password 設定密碼 → 首頁
//                → 已註冊 login 輸入密碼 → 首頁
// 網址 ?signup 走新用戶，?signup=member 走已註冊
type Pane = "phone" | "otp" | "password" | "login";
type Dir = "fwd" | "bwd";

// 收合後的版面（Figma signup-1-2）：sheet 上緣在 129、紙飛機機身中心在 98（812 高的畫面）。
// 導覽列換成 AFFOGATO navigation-bar（7481:1566）之後高 60（44～104），
// 換算成相對導覽列下緣：sheet 在下方 25px，紙飛機中心在上方 6px（落在兩顆圓鈕中間）
const SHEET_BELOW_NAV = 25;
// sheet 的圓角；漸層區往下多延伸這麼多，圓角後面才看得到色光
const CORNER = 24;
const PLANE_BELOW_NAV = -6;
const PLANE_FORM_SCALE = 0.6;
// 第 1 拍（sheet 往上展開、主視覺收合）的長度，第 2 拍（換內容）接在後面
const BEAT1_MS = 380;
const PANE_MS = 380;
// 最後一步送出：表單推出畫面、紙飛機飛走的長度，以及推出多久之後開始交棒給首頁
const EXIT_MS = 680;
const EXIT_HANDOFF_MS = 320;
const EXIT_EASE = "cubic-bezier(0.55, 0, 0.35, 1)";

// sheet 裡的英文照 Figma 用 SF Pro；中文會自動落到系統的中文字體
const SHEET_FONT = SF_PRO.replace('"SF Pro Display", ', '"SF Pro Text", ');

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

// 導覽列的圓鈕：AFFOGATO navigation-bar（7481:1566）的 Liquid Glass 樣式，
// 44px 圓、白 60%～80%、0.5px 白邊、淡淡的陰影，加一點背景模糊
const GLASS_BUTTON =
  "flex size-11 shrink-0 items-center justify-center rounded-full border-[0.5px] border-white/50 bg-white/70 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] backdrop-blur-md active:scale-95";

// 紙飛機的小動作（Web Animations，疊在收合位置外面一層，不會重新掛載起飛動畫）
const PLANE_MOVES: Record<string, [Keyframe[], KeyframeAnimationOptions]> = {
  // 按「重新傳送」：往右上飛出去送簡訊，再從左邊飛回原位。
  // 其他時候（輸入、驗證、換步驟）紙飛機都不動，只留常駐的上下漂浮
  deliver: [
    [
      { transform: "translate(0, 0)", opacity: 1 },
      { transform: "translate(150px, -70px) rotate(-10deg) scale(0.8)", opacity: 0, offset: 0.42 },
      { transform: "translate(-170px, 18px) scale(0.85)", opacity: 0, offset: 0.46 },
      { transform: "translate(0, 0)", opacity: 1 },
    ],
    { duration: 950, easing: "ease-in-out" },
  ],
};

// 底線輸入框 focus 時從中間往兩邊長出的加粗底線
function FocusLine({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 -bottom-px h-[2px] bg-gray-800"
      style={{
        transform: on ? "scaleX(1)" : "scaleX(0)",
        transition: `transform 300ms ${EASE_OUT}`,
      }}
    />
  );
}

function StepHeader({
  title,
  sub,
  zh,
}: {
  title: string;
  sub: React.ReactNode;
  zh?: boolean;
}) {
  return (
    <>
      <h2
        className="w-[260px] text-[24px] leading-8 font-semibold text-gray-800"
        style={{ fontFamily: zh ? undefined : SF_PRO }}
      >
        {title}
      </h2>
      <p className="text-[14px] leading-5 text-[#6a7282]">{sub}</p>
    </>
  );
}

function Cta({
  label,
  ready,
  onClick,
}: {
  label: string;
  ready: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready}
      className={`flex h-12 w-full items-center justify-center rounded-2xl text-[16px] leading-6 font-semibold transition-[background-color,color,transform] duration-300 active:scale-[0.98] ${
        ready ? "signup-cta-ready bg-[#ff3b3b] text-white" : "bg-gray-200 text-gray-400"
      }`}
    >
      {label}
    </button>
  );
}

// 密碼欄（Figma password field）：底線樣式、24px、右側眼睛切換顯示
function PasswordField({
  value,
  onChange,
  onEnter,
  inputRef,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  error?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <label
      className={`relative flex w-full items-center gap-2 border-b py-2 ${
        error ? "signup-shake border-[#ff3b3b]" : "border-gray-800"
      }`}
    >
      <span className="sr-only">密碼</span>
      <input
        ref={inputRef}
        type={show ? "text" : "password"}
        autoComplete="current-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter();
        }}
        className="block h-8 min-w-0 flex-1 bg-transparent text-[24px] leading-8 text-gray-800 caret-[#ff3b3b] outline-none"
        style={{ fontFamily: SF_PRO }}
      />
      <button
        type="button"
        aria-label={show ? "隱藏密碼" : "顯示密碼"}
        onClick={() => setShow((v) => !v)}
        className="flex size-6 shrink-0 items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={show ? "/v13/signup-eye-off.svg" : "/v13/signup-eye.svg"}
          alt=""
          width={24}
          height={24}
        />
      </button>
      <FocusLine on={focused && !error} />
    </label>
  );
}

// 中文版（Figma 1422:7526／1428:9688）：標語是一整句，翻面時整句互換——
// 紙飛機那面「AIFIAN 幫你買得更好、花得更少」，轉到背面 ∧ 記號時「回饋自己的生活」。
// 由下往上的遮罩動作跟英文版句尾換字共用（.signup-title-tail），時間另外訂：
// 第二句在開頁後第 8 秒出現、停 6 秒到第 14 秒換回，之後每 15 秒重複。
// 中文版的翻面也跟著提早、在背面停住（globals.css 的 .signup-zh），
// 兩次換句都壓在紙飛機轉到側面的那一格；要跟 signupTailSwapZh、signupIdleSpinZh 對齊
const ZH_PLANE = "AIFIAN 幫你買得更好、花得更少";
const ZH_MARK = "回饋自己的生活";
const ZH_IN = 8000 - IDLE_START;
const ZH_OUT = 14000 - IDLE_START;

function TitleZh() {
  const [line, setLine] = useState(ZH_PLANE);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t0 = performance.now();
    let raf = 0;
    let last = ZH_PLANE;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const e = now - t0 - IDLE_START;
      const p = e < 0 ? 0 : e % FLIP_CYCLE;
      const next = p >= ZH_IN && p < ZH_OUT ? ZH_MARK : ZH_PLANE;
      if (next === last) return;
      last = next;
      setLine(next);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <span className="signup-title-line">
      <span className="signup-title-tail signup-title-tail-zh">
        {/* 第一句照設計在 AIFIAN 後面斷行；兩行各自成塊、各畫各的漸層（同英文版） */}
        <span>
          {line === ZH_PLANE ? (
            <>
              <span className="signup-title-ink block">AIFIAN</span>
              <span className="signup-title-ink block">{ZH_PLANE.replace("AIFIAN ", "")}</span>
            </>
          ) : (
            <span className="signup-title-ink block">{line}</span>
          )}
        </span>
      </span>
    </span>
  );
}

type Lang = "en" | "zh";

// 註冊流程的文案。英文照 Figma 1413:5505，中文照 1422:7526 的 1-1，後面步驟比照翻譯
const COPY = {
  en: {
    start: "Create an account or log in",
    or: "or",
    otpTitle: "Enter verification code",
    otpSub: (p: string) => `We sent a 6-digit code to ${p}`,
    noCode: "Didn't get it?",
    resendIn: (n: number) => `Resend in ${n}s`,
    resend: "Resend",
    otpError: "Incorrect code, please try again",
    pwTitle: "Set a password",
    pwSub: "You'll use it with your phone number to log in",
    rules: ["At least 8 characters", "Includes letters and numbers"],
    create: "Create account",
    loginTitle: "Welcome back",
    loginSub: (p: string) => `Enter the password for ${p}`,
    forgot: "Forgot password?",
    login: "Log in",
  },
  zh: {
    start: "建立帳號或登入",
    or: "或",
    otpTitle: "輸入驗證碼",
    otpSub: (p: string) => `已傳送 6 位數驗證碼到 ${p}`,
    noCode: "沒收到？",
    resendIn: (n: number) => `${n} 秒後可重新傳送`,
    resend: "重新傳送",
    otpError: "驗證碼錯誤，請再試一次",
    pwTitle: "設定密碼",
    pwSub: "之後可以用手機號碼和密碼登入",
    rules: ["至少 8 個字元", "包含英文和數字"],
    create: "完成註冊",
    loginTitle: "歡迎回來",
    loginSub: (p: string) => `請輸入 ${p} 的密碼`,
    forgot: "忘記密碼？",
    login: "登入",
  },
};

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

  // ── 流程狀態 ──
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const planeSlotRef = useRef<HTMLDivElement>(null);
  const planeMoveRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const phonePaneRef = useRef<HTMLDivElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const [member, setMember] = useState(false);
  // ?lang=zh 是中文版；英文版維持原樣
  const [lang, setLang] = useState<Lang>("en");
  const [mode, setMode] = useState<"hero" | "form">("hero");
  // sheet 上緣只在切換 1-1／收合時才做過場；其他時候（例如展開按鈕）要即時跟著內容高度
  const [moving, setMoving] = useState(false);
  const [pane, setPane] = useState<Pane>("phone");
  const paneRef = useRef<Pane>("phone");
  const [prev, setPrev] = useState<{ pane: Pane; dir: Dir } | null>(null);
  const [dir, setDir] = useState<Dir>("fwd");
  // 1-1 時 sheet 只露出手機那一步的高度；量出來之後漸層區就停在它上面
  const [phoneH, setPhoneH] = useState(300);
  const [formTop, setFormTop] = useState(129);
  const [collapse, setCollapse] = useState({ dx: 0, dy: 0 });
  const [otp, setOtp] = useState("");
  const [otpState, setOtpState] = useState<"idle" | "verifying" | "error">("idle");
  const [otpFocused, setOtpFocused] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [pw, setPw] = useState("");
  // 最後一步已經送出（等版面還原、紙飛機飛走），擋掉重複送出
  const finishing = useRef(false);
  const [exiting, setExiting] = useState(false);
  // 整個畫面的高度：漸層的縮放要以「1-1 時漸層區的高度」為準，
  // 表單推出畫面時漸層才不會跟著放大
  const [rootH, setRootH] = useState(812);
  // 收合之後把漸層區的高度定住：手機鍵盤彈出時畫面會變矮，
  // 不定住的話紙飛機會跟著重新置中，看起來就是在抖
  const [frozenSkyH, setFrozenSkyH] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
    const q = new URLSearchParams(window.location.search);
    setMember(q.get("signup") === "member");
    setLang(q.get("lang") === "zh" ? "zh" : "en");
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
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
        // 漸層區往下多延伸了 24px 墊在 sheet 的圓角後面，記號要以 sheet 上緣為準
        dy:
          s.bottom - CORNER - MARK_ABOVE_PANEL - h - (c.top + c.height / 2) - FACE_OFF_Y,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(craft);
    ro.observe(sky);
    return () => ro.disconnect();
  }, [frame]);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setRootH(el.clientHeight));
    ro.observe(el);
    setRootH(el.clientHeight);
    return () => ro.disconnect();
  }, [frame]);

  // 手機那一步的高度（展開「使用手機繼續」時會變）
  useLayoutEffect(() => {
    const el = phonePaneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPhoneH(el.offsetHeight));
    ro.observe(el);
    setPhoneH(el.offsetHeight);
    return () => ro.disconnect();
  }, [frame, pane, prev]);

  // 驗證碼重新傳送的倒數：每次進到驗證碼都從 60 秒開始
  useEffect(() => {
    if (pane !== "otp") return;
    const t = window.setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [pane]);

  if (!frame) return null;

  const valid = digits.length === 9;
  const ctaOpen = digits.length > 0;
  const phoneText = `+886 ${formatPhone(digits)}`;
  const form = mode === "form";
  const zh = lang === "zh";
  const t = COPY[lang];

  const move = (name: keyof typeof PLANE_MOVES) => {
    const el = planeMoveRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    const [kf, opts] = PLANE_MOVES[name];
    return el.animate(kf, opts);
  };
  // 錯誤時色光短暫偏暖
  const warm = () =>
    warmRef.current?.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], {
      duration: 700,
      easing: "ease-out",
    });

  const switchPane = (next: Pane, d: Dir) => {
    const from = paneRef.current;
    setPrev({ pane: from, dir: d });
    paneRef.current = next;
    setPane(next);
    setDir(d);
    later(() => setPrev(null), PANE_MS + 40);
    // 換步驟時紙飛機不動：從 1-1 進來、回到 1-1 只在原地縮小／放大，
    // 驗證碼 → 密碼也不飛（送出驗證碼時畫面上只有內容在換）
    if (next === "otp") {
      setOtp("");
      setOtpState("idle");
      setCountdown(60);
      later(() => otpRef.current?.focus(), PANE_MS);
    }
    if (next === "password" || next === "login") {
      setPw("");
      later(() => pwRef.current?.focus(), PANE_MS);
    }
  };

  // 第 1 拍：sheet 往上展開、主視覺收合（內容不換）；第 2 拍：換內容
  const submitPhone = () => {
    if (!valid || leaving || form) return;
    inputRef.current?.blur();
    const slot = planeSlotRef.current?.getBoundingClientRect();
    const nav = navRef.current?.getBoundingClientRect();
    const root = rootRef.current?.getBoundingClientRect();
    if (skyRef.current) setFrozenSkyH(skyRef.current.offsetHeight);
    if (slot && nav && root) {
      setFormTop(nav.bottom - root.top + SHEET_BELOW_NAV);
      setCollapse({
        dx: root.left + root.width / 2 - (slot.left + FACE_CX),
        dy: nav.bottom + PLANE_BELOW_NAV - (slot.top + FACE_CY),
      });
    }
    setMoving(true);
    setMode("form");
    later(() => setMoving(false), BEAT1_MS + 60);
    later(() => switchPane(member ? "login" : "otp", "fwd"), BEAT1_MS);
  };

  // 返回：內容往右退，回到 1-1 時才把 sheet 收回去、主視覺展開
  const goBack = () => {
    if (!form || leaving) return;
    switchPane("phone", "bwd");
    later(() => {
      setMoving(true);
      setMode("hero");
      setFrozenSkyH(null);
      later(() => setMoving(false), BEAT1_MS + 60);
    }, PANE_MS);
  };

  const onOtp = (raw: string) => {
    if (otpState !== "idle") return;
    const v = raw.replace(/\D/g, "").slice(0, 6);
    setOtp(v);
    if (v.length < 6) return;
    // 滿 6 碼自動送出；000000 示範驗證碼錯誤。
    // 輸入、驗證、送出時紙飛機都不動（原本每打一碼上浮一下，連續輸入時動畫互相打斷會抖）；
    // 驗證中改由數字格脈動表示，錯誤時數字格晃動、色光短暫偏暖
    setOtpState("verifying");
    later(() => {
      if (v === "000000") {
        setOtpState("error");
        warm();
        later(() => {
          setOtp("");
          setOtpState("idle");
          otpRef.current?.focus();
        }, 650);
        return;
      }
      switchPane("password", "fwd");
    }, 900);
  };

  const rules = [pw.length >= 8, /[A-Za-z]/.test(pw) && /\d/.test(pw)];
  const pwReady = rules.every(Boolean);
  // 輸入密碼時紙飛機也不動，規則打勾只在清單上回饋
  const onPw = (v: string) => setPw(v);
  // 最後一步送出：白色表單一路往下推出畫面，紙飛機同時從漸層帶往右上飛走，
  // 一個連續的動作；表單推出一段之後才交棒給首頁進場（整頁淡出）
  const finishFlow = () => {
    if (finishing.current) return;
    finishing.current = true;
    pwRef.current?.blur();
    setExiting(true);
    later(onContinue, EXIT_HANDOFF_MS);
  };
  const finish = (ok: boolean) => {
    if (!ok || leaving) return;
    finishFlow();
  };
  const login = () => {
    if (!pw || leaving || otpState === "verifying" || finishing.current) return;
    pwRef.current?.blur();
    setOtpState("verifying");
    later(() => {
      setOtpState("idle");
      finishFlow();
    }, 700);
  };

  // ── 各步驟的內容 ──
  const renderPane = (p: Pane) => {
    if (p === "phone")
      return (
        <div
          ref={phonePaneRef}
          className="flex flex-col gap-6 px-4 pt-6 pb-[calc(16px+env(safe-area-inset-bottom))] sm:pb-[50px]"
        >
          <div className="flex w-full flex-col gap-6">
            {/* 中文版照 Figma 1422:7526 置中 */}
            <p className={`w-full text-[16px] leading-6 text-gray-800 ${zh ? "text-center" : ""}`}>
              {t.start}
            </p>
            <div className="flex w-full flex-col">
              <div className="flex w-full items-start gap-2">
                <div className="flex w-[83px] shrink-0 items-center gap-1 border-b border-gray-800 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/v13/signup-flag-tw.svg" alt="" width={20} height={20} />
                  <span className="text-[24px] leading-8 text-gray-800" style={{ fontFamily: SF_PRO }}>
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
                      if (e.key === "Enter") submitPhone();
                    }}
                    className="block h-8 w-full bg-transparent text-[24px] leading-8 text-gray-800 caret-[#ff3b3b] outline-none placeholder:text-gray-300"
                    style={{ fontFamily: SF_PRO }}
                  />
                  <FocusLine on={focused} />
                </label>
              </div>

              {/* 「使用手機繼續」：開始輸入才展開，滿 9 碼變紅色可以按 */}
              <div
                className="grid"
                style={{
                  gridTemplateRows: ctaOpen ? "1fr" : "0fr",
                  transition: `grid-template-rows 360ms ${EASE_OUT}`,
                }}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className="pt-2"
                    style={{
                      opacity: ctaOpen ? 1 : 0,
                      transform: ctaOpen ? "translateY(0)" : "translateY(-8px)",
                      transition: `opacity 260ms ease 80ms, transform 360ms ${EASE_OUT}`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={submitPhone}
                      disabled={!valid}
                      tabIndex={ctaOpen ? 0 : -1}
                      className={`flex h-12 w-full items-center justify-center rounded-2xl text-[16px] leading-6 font-bold transition-[background-color,color,transform] duration-300 active:scale-[0.98] ${
                        valid ? "signup-cta-ready bg-[#ff3b3b] text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      使用手機繼續
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex w-full justify-center py-2">
                <p className="text-[14px] leading-[18px] text-gray-800">{t.or}</p>
              </div>
              <div className="mt-2 flex w-full gap-2">
                <button
                  type="button"
                  aria-label="使用 Apple 繼續"
                  className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-gray-800 bg-gray-800 transition-transform active:scale-[0.97]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/v13/signup-apple.svg" alt="" width={20} height={24} />
                </button>
                <button
                  type="button"
                  aria-label="使用 Google 繼續"
                  className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-gray-100 transition-transform active:scale-[0.97]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/v13/signup-google.svg" alt="" width={24} height={24} />
                </button>
              </div>
            </div>
          </div>
          {zh ? (
            <p className="min-h-11 w-full text-center text-[12px] leading-4 text-[#4a5565]">
              繼續即表示你同意 AIFIAN 的 <span className="font-bold">服務條款</span> 與{" "}
              <span className="font-bold">隱私權政策</span>
            </p>
          ) : (
            <p className="min-h-11 w-full text-center text-[12px] leading-4 tracking-[0.12px] text-[#4a5565]">
              By continuing, you agree to AIFIAN&apos;s{" "}
              <span className="font-semibold whitespace-nowrap">Terms of Service</span> and{" "}
              <span className="font-semibold whitespace-nowrap">Privacy Policy</span> .
            </p>
          )}
        </div>
      );

    if (p === "otp") {
      const active = otpState === "idle" && otpFocused ? otp.length : -1;
      return (
        <div className="flex flex-col gap-6 px-4 pt-6">
          <StepHeader zh={zh} title={t.otpTitle} sub={t.otpSub(phoneText)} />
          {/* 一個看不見的輸入框蓋在 6 格上：簡訊自動帶入（one-time-code）跟貼上都能用 */}
          <label className={`relative flex w-full gap-2 ${otpState === "error" ? "signup-shake" : ""}`}>
            <span className="sr-only">驗證碼</span>
            {Array.from({ length: 6 }, (_, i) => {
              const ch = otp[i] ?? "";
              const err = otpState === "error";
              const on = i === active;
              return (
                <span
                  key={i}
                  className={`flex h-14 min-w-0 flex-1 items-center justify-center rounded-xl text-[24px] leading-8 text-gray-800 transition-[background-color,box-shadow] duration-200 ${
                    otpState === "verifying" && ch ? "signup-otp-pulse" : ""
                  }`}
                  style={{
                    fontFamily: SF_PRO,
                    background: on ? "#fff" : "#f3f4f6",
                    boxShadow: err
                      ? "inset 0 0 0 1.5px #ff3b3b"
                      : on
                        ? "inset 0 0 0 1.5px #1e2939"
                        : "none",
                  }}
                >
                  {ch}
                  {on && <span className="signup-caret h-7 w-[2px] rounded-[1px] bg-[#ff3b3b]" />}
                </span>
              );
            })}
            <input
              ref={otpRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => onOtp(e.target.value)}
              onFocus={() => setOtpFocused(true)}
              onBlur={() => setOtpFocused(false)}
              className="absolute inset-0 h-full w-full cursor-text opacity-0"
            />
          </label>
          <div className="flex gap-1 text-[14px] leading-5">
            {otpState === "error" ? (
              <span className="text-[#ff3b3b]">{t.otpError}</span>
            ) : (
              <>
                <span className="text-[#6a7282]">{t.noCode}</span>
                {countdown > 0 ? (
                  <span className="font-semibold text-gray-400">{t.resendIn(countdown)}</span>
                ) : (
                  <button
                    type="button"
                    className="font-semibold text-gray-800"
                    onClick={() => {
                      setCountdown(60);
                      move("deliver");
                      otpRef.current?.focus();
                    }}
                  >
                    {t.resend}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    if (p === "password")
      return (
        <div className="flex flex-col gap-6 px-4 pt-6">
          <StepHeader zh={zh} title={t.pwTitle} sub={t.pwSub} />
          <div className="flex w-full flex-col gap-3">
            <PasswordField value={pw} onChange={onPw} onEnter={() => finish(pwReady)} inputRef={pwRef} />
            <div className="flex flex-col gap-1.5">
              {t.rules.map((r, i) => (
                <div
                  key={r}
                  className="flex items-center gap-1.5 text-[14px] leading-5 transition-colors duration-200"
                  style={{ color: rules[i] ? "#1e2939" : "#99a1af" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/v13/signup-check.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="transition-[opacity,transform] duration-300"
                    style={{
                      opacity: rules[i] ? 1 : 0.35,
                      transform: rules[i] ? "scale(1)" : "scale(0.85)",
                    }}
                  />
                  {r}
                </div>
              ))}
            </div>
          </div>
          <Cta label={t.create} ready={pwReady} onClick={() => finish(pwReady)} />
        </div>
      );

    return (
      <div className="flex flex-col gap-6 px-4 pt-6">
        <StepHeader zh={zh} title={t.loginTitle} sub={t.loginSub(phoneText)} />
        <div className="flex w-full flex-col items-end gap-3">
          <PasswordField value={pw} onChange={onPw} onEnter={login} inputRef={pwRef} />
          <button type="button" className="text-[14px] leading-5 font-semibold text-gray-800">
            {t.forgot}
          </button>
        </div>
        <Cta label={t.login} ready={pw.length > 0 && otpState !== "verifying"} onClick={login} />
      </div>
    );
  };

  // 紙飛機的位置：1-1 在原地；收合後縮小移到漸層帶中央；離場往右上飛走
  const base = form ? { ...collapse, s: PLANE_FORM_SCALE } : { dx: 0, dy: 0, s: 1 };
  const flying = leaving || exiting;
  const planeTransform = flying
    ? `translate(${base.dx + 140}px, ${base.dy - 200}px) scale(${base.s * 0.8})`
    : `translate(${base.dx}px, ${base.dy}px) scale(${base.s})`;

  return createPortal(
    <div
      ref={rootRef}
      className={`absolute inset-0 z-[80] overflow-hidden bg-white ${form ? "signup-form" : ""} ${
        zh ? "signup-zh" : ""
      }`}
      style={{
        opacity: leaving ? 0 : 1,
        transition: `opacity 450ms ease ${leaving ? 200 : 0}ms`,
        pointerEvents: leaving ? "none" : undefined,
      }}
    >
      {/* 漸層鋪滿整個畫面（底下平常被表單蓋住，最後送出、表單推出畫面時才露出來），
          縮放仍以 1-1 漸層區的高度為準，構圖跟原本一樣 */}
      <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#ff2a2e]">
        <Bands leaving={leaving} coverHeight={frozenSkyH ?? rootH - phoneH + CORNER} />
      </div>
      {/* 上半部：氣流、紙飛機、logo、標語。往下多延伸 24px 墊在 sheet 的圓角後面 */}
      <div
        ref={skyRef}
        className="absolute inset-x-0 top-0 flex flex-col overflow-hidden"
        style={
          frozenSkyH != null ? { height: frozenSkyH } : { bottom: phoneH - CORNER }
        }
      >
        <AirFlow />
        {/* 錯誤時偏暖的一層色光 */}
        <div
          ref={warmRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{ background: "radial-gradient(120% 80% at 50% 20%, #ff9a3c 0%, rgba(255,154,60,0) 70%)", mixBlendMode: "screen" }}
        />
        <div className="relative">
          <StatusBar />
        </div>
        {/* 導覽列：1-1 是 AIFIAN 字樣置中；之後換成左上返回，字樣淡掉（Figma signup-1-2） */}
        <div
          ref={navRef}
          className="relative flex h-[60px] shrink-0 items-center justify-between px-4 py-2"
        >
          <button
            type="button"
            aria-label="返回"
            onClick={goBack}
            tabIndex={form ? 0 : -1}
            className={GLASS_BUTTON}
            style={{
              opacity: form && !leaving && !exiting ? 1 : 0,
              transform: form ? "scale(1)" : "scale(0.8)",
              pointerEvents: form ? undefined : "none",
              transition: `opacity 250ms ease, transform ${BEAT1_MS}ms ${EASE_OUT}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v13/signup-back.svg" alt="" width={24} height={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/v13/signup-logo.svg"
            alt="AIFIAN"
            className="absolute left-1/2 h-[30px] w-[102px] -translate-x-1/2"
            style={{
              opacity: form ? 0 : 1,
              marginTop: form ? -12 : 0,
              transition: `opacity 250ms ease, margin-top ${BEAT1_MS}ms ${EASE_OUT}`,
            }}
          />
          <button type="button" aria-label="客服" className={GLASS_BUTTON}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v13/signup-headset.svg" alt="" width={20} height={20} />
          </button>
        </div>
        {/* 中文版（Figma 1422:7526）紙飛機＋標語整組比置中再高 38px：底部多墊 76px */}
        <div
          className={`relative flex flex-1 flex-col items-center justify-center ${
            zh ? "pb-[100px]" : "pb-6"
          }`}
        >
          {/* 紙飛機：最外層管收合／離場的位置，下一層是小動作（送簡訊、晃、上揚），
              再往內是起飛動畫，最內層管常駐漂浮 */}
          <div
            ref={planeSlotRef}
            style={{
              transform: planeTransform,
              transformOrigin: `${FACE_CX}px ${FACE_CY}px`,
              opacity: flying ? 0 : 1,
              transition: exiting
                ? `transform ${EXIT_MS}ms ${EXIT_EASE}, opacity 220ms ease-in ${EXIT_MS - 260}ms`
                : leaving
                  ? "transform 420ms cubic-bezier(0.25, 0.5, 0.45, 1), opacity 150ms ease-in 120ms"
                  : `transform ${BEAT1_MS + 120}ms ${EASE_OUT}`,
            }}
          >
            <div ref={planeMoveRef}>
            <div ref={craftRef} className="relative h-[79.696px] w-[67.9px]">
              {/* 航跡：座標原點放在機身中心（不是外框中心），
                  線才會接在紙飛機身上，而不是往下插進影子 */}
              <svg
                aria-hidden
                className="signup-trail pointer-events-none absolute"
                style={{ left: FACE_CX - 200, top: FACE_CY - 200 }}
                width={400}
                height={400}
                viewBox="-200 -200 400 400"
                fill="none"
              >
                <defs>
                  <linearGradient id="signup-trail-fade" x1="0" y1="1" x2="1" y2="0">
                    {/* 兩端都收掉：航跡不再接到紙飛機身上，
                        前端要是停在最亮的地方會像被切斷 */}
                    <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="55%" stopColor="#fff" stopOpacity="0.4" />
                    <stop offset="86%" stopColor="#fff" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={(() => {
                    // 起點同樣換算到機身中心這個原點上
                    const x0 = start.dx + FACE_OFF_X - FACE_DX;
                    const y0 = start.dy + FACE_OFF_Y - FACE_DY;
                    const cx = x0 * 0.46;
                    const cy = y0 * 0.38;
                    // 用 de Casteljau 從同一條二次曲線切前段出來，
                    // 這樣縮短之後的弧度跟原本那條完全一致
                    const t = TRAIL_END;
                    const ax = x0 + (cx - x0) * t;
                    const ay = y0 + (cy - y0) * t;
                    const ex = ax + (cx * (1 - t) - ax) * t;
                    const ey = ay + (cy * (1 - t) - ay) * t;
                    return `M${x0.toFixed(1)},${y0.toFixed(1)} Q${ax.toFixed(1)},${ay.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
                  })()}
                  className="signup-trail-line"
                  pathLength={1}
                  stroke="url(#signup-trail-fade)"
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
                    {/* 影子不是紙飛機的輪廓，是 ∧ 記號：飛的是紙飛機，
                        落在地上的影子卻還是 AIFIAN。記號先轉到跟機頭同一個
                        航向（48 度，跟起飛時那段轉向同一個角度），再做地面的
                        縱向壓縮，不然會變成畫面上第二個貼著的 logo。
                        形狀另外用 8px 的同色描邊往外撐厚：影子要是一團量體，
                        細細一條 ∧ 看起來只像畫上去的線。
                        收合到漸層帶之後影子拿掉（Figma signup-1-2 只有機身） */}
                    <div
                      className="absolute inset-0"
                      style={{ opacity: form ? 0 : 1, transition: "opacity 250ms ease" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/v13/signup-mark-shadow.svg"
                        alt=""
                        className="signup-plane-shadow absolute top-[46px] left-[4px] h-[45.965px] w-[59.279px]"
                      />
                    </div>
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
          </div>
          {/* 標題：置中、寬度 232.4 自然斷行，跟紙飛機當成同一組一起置中
              （Figma landing::title，SF Pro Display Medium 24/32，
              與紙飛機下緣相距 12.18）。收合時往上淡出 */}
          {/* 中文版（Figma 1422:7526）：一行、Noto Sans TC Bold 20/32，與紙飛機下緣相距約 7 */}
          <p
            className={`signup-title relative text-center ${
              zh
                ? "mt-[7px] h-16 w-[300px] text-[20px] leading-8 font-bold"
                : "mt-[12.18px] w-[232.4px] text-[24px] leading-8 font-medium"
            }`}
            style={{
              fontFamily: zh ? undefined : SF_PRO,
              opacity: leaving || form ? 0 : 1,
              transform: form ? "translateY(-16px)" : "none",
              transition: `opacity 220ms ease, transform ${BEAT1_MS}ms ${EASE_OUT}`,
            }}
          >
            {/* 兩行各自成塊（斷行處跟自然斷行同一個地方）：句尾換字時
                字寬會變，交給自動斷行會在某幾格跳成一行或三行 */}
            {zh ? (
              <TitleZh />
            ) : (
              <>
                <span className="signup-title-line signup-title-ink">Invest in Yourself</span>
                <TitleLine2 />
              </>
            )}
          </p>
        </div>
      </div>

      {/* bottom sheet：1-1 只露出手機那一步；之後往上展開到導覽列下方（Figma signup-1-2） */}
      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-3xl bg-[#fefefe]"
        style={{
          top: exiting ? "100%" : form ? formTop : `calc(100% - ${phoneH}px)`,
          fontFamily: zh ? undefined : SHEET_FONT,
          transform: leaving && !exiting ? "translateY(100%)" : "translateY(0)",
          opacity: leaving && !exiting ? 0 : 1,
          transition: exiting
            ? `top ${EXIT_MS}ms ${EXIT_EASE}`
            : leaving
            ? "transform 450ms cubic-bezier(0.55, 0, 0.75, 0.2), opacity 250ms ease"
            : moving
              ? `top ${BEAT1_MS}ms ${EASE_OUT}`
              : "none",
        }}
      >
        <div className="relative">
          <div key={pane} className={prev ? `signup-pane-in-${dir}` : undefined}>
            {renderPane(pane)}
          </div>
          {prev && (
            <div
              key={`out-${prev.pane}`}
              aria-hidden
              className={`signup-pane-out-${prev.dir} pointer-events-none absolute inset-x-0 top-0`}
            >
              {renderPane(prev.pane)}
            </div>
          )}
        </div>
      </div>
    </div>,
    frame,
  );
}
