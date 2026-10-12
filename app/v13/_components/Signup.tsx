"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import StatusBar from "./StatusBar";

// 註冊／登入頁（照 Figma 1322:3538 signup-1）。網址加 ?signup 才會出現，
// 取代開場畫面：從這頁開始，輸入手機號碼後出現「使用手機繼續」，點下去進首頁。
// 跟開場畫面一樣用 portal 掛到 #v13-frame，蓋過 tabbar。
//
// 進場微互動（總長約 1.2 秒）：
// - 0 秒：品牌色光從稍大、透明慢慢收攏顯現，之後每一團各自緩慢漂移；
// - 0.2 秒：紙飛機從下方浮上來，就定位後開始上下漂浮，影子跟著呼吸；
// - 0.4 秒起：AIFIAN 字樣、標語依序往上浮現；
// - 0.15 秒起：下方白色面板從底部滑上來，裡面的標題、輸入框、或、登入按鈕、條款依序淡入。
// 輸入：號碼自動分成 3-3-3，focus 時底線加粗；開始輸入就展開按鈕（灰色不可按），
// 滿 9 碼變成品牌紅可以按，Enter 也能送出。
// 離場：面板往下收、紙飛機往右上飛走、整頁淡出，首頁同時開始進場。
export const SIGNUP_EXIT_MS = 650;

// 手機瀏覽器狀態列的底色，接漸層最上緣
export const SIGNUP_TOP = "#ff5a8c";

// 光團：位置、大小照 Figma（以 375 寬、漸層區 484 高為準），
// img 是含模糊外擴的 SVG，inset 是外擴的比例。
// 最右上那團淡黃在 Figma 是 linear burn，瀏覽器沒有，改用 multiply（疊在白底上看起來一樣）
type Band = {
  src: string;
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
    src: "/v13/signup-band-blue.svg",
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
    src: "/v13/signup-band-orange.svg",
    left: -79.28,
    top: 66,
    w: 528.493,
    h: 526.912,
    inset: "-9.87% -9.84%",
    blend: "darken",
    drift: { x: -18, y: 16, r: -5, s: 1.04, d: 13 },
  },
  {
    src: "/v13/signup-band-yellow.svg",
    left: -131.45,
    top: -47.8,
    w: 434.645,
    h: 354.183,
    inset: "-15.25% -12.42%",
    blend: "normal",
    drift: { x: 26, y: 12, r: 8, s: 1.08, d: 9 },
  },
  {
    src: "/v13/signup-band-pink.svg",
    left: -317.39,
    top: -97.52,
    w: 572.391,
    h: 522.062,
    inset: "-9.96% -9.08%",
    blend: "multiply",
    drift: { x: 20, y: 18, r: -4, s: 1.05, d: 12 },
  },
  {
    src: "/v13/signup-band-blue2.svg",
    left: 233,
    top: -165.02,
    w: 451.274,
    h: 451.474,
    inset: "-15.44% -15.89%",
    blend: "multiply",
    rotate: { deg: 44.11, w: 314.681, h: 323.735 },
    drift: { x: -16, y: 14, r: 10, s: 1.07, d: 10 },
  },
];

const DESIGN_W = 375;
const DESIGN_H = 484;

function BandImg({ b }: { b: Band }) {
  const img = (
    <div className="absolute" style={{ inset: b.inset }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src={b.src} className="block size-full max-w-none" />
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
      setScale(
        Math.max(el.clientWidth / DESIGN_W, el.clientHeight / DESIGN_H),
      );
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

// 號碼分成 3-3-3：912 345 678
const formatPhone = (digits: string) =>
  [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter(Boolean)
    .join(" ");

// 進場時依序浮上來的一層，delay 單位 ms
const rise = (delay: number): React.CSSProperties =>
  ({ "--delay": `${delay}ms` }) as React.CSSProperties;

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

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
  }, []);

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
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Bands leaving={leaving} />
        <div className="relative">
          <StatusBar />
        </div>
        <div className="relative flex h-11 shrink-0 items-center justify-end pr-4">
          <button
            type="button"
            aria-label="客服"
            className="signup-rise flex size-10 items-center justify-center rounded-full active:bg-black/5"
            style={rise(600)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v13/signup-headset.svg" alt="" width={24} height={24} />
          </button>
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center pb-6">
          {/* 紙飛機：外層管進場、離場，內層管常駐漂浮 */}
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
            <div className="signup-plane-in relative h-[79.696px] w-[67.9px]">
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
          <div
            className="mt-[32px] flex flex-col items-center"
            style={{
              opacity: leaving ? 0 : 1,
              transition: "opacity 250ms ease",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/v13/signup-logo.svg"
              alt="AIFIAN"
              className="signup-rise h-[30px] w-[102px]"
              style={rise(420)}
            />
            <p
              className="signup-rise mt-[6.8px] text-center text-[16px] leading-6 font-semibold text-white"
              style={rise(520)}
            >
              Investment Yourself
              <br />
              with AIFIAN
            </p>
          </div>
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
        <div
          className="signup-panel-in flex flex-col items-center gap-6 bg-[#fefefe] p-4 pb-[calc(16px+env(safe-area-inset-bottom))] sm:pb-[50px]"
          style={rise(150)}
        >
          <div className="flex w-full flex-col items-center gap-6">
            <p
              className="signup-rise w-full text-center text-[16px] leading-6 text-gray-800"
              style={rise(260)}
            >
              Create an account or log in
            </p>
            <div className="flex w-full flex-col">
              <div
                className="signup-rise flex w-full items-start gap-2"
                style={rise(320)}
              >
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
                      transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  />
                </label>
              </div>

              {/* 「使用手機繼續」：開始輸入才展開，滿 9 碼變紅色可以按 */}
              <div
                className="grid"
                style={{
                  gridTemplateRows: ctaOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 360ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className="pt-2"
                    style={{
                      opacity: ctaOpen ? 1 : 0,
                      transform: ctaOpen ? "translateY(0)" : "translateY(-8px)",
                      transition: "opacity 260ms ease 80ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
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

              <div
                className="signup-rise mt-2 flex w-full justify-center py-2"
                style={rise(380)}
              >
                <p className="text-[14px] leading-[18px] text-gray-800">或</p>
              </div>
              <div
                className="signup-rise mt-2 flex w-full gap-2"
                style={rise(440)}
              >
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
          <p
            className="signup-rise min-h-11 w-full text-center text-[12px] leading-4 tracking-[0.12px] text-gray-800"
            style={rise(500)}
          >
            繼續建立帳號或登入代表你已閱讀並同意 AIFIAN 的{" "}
            <span className="font-bold whitespace-nowrap">服務條款</span>
            {/* 照設計稿固定在「服務條款」後面換行，避免寬螢幕斷在「隱私權政｜策」 */}
            <br />與 <span className="font-bold whitespace-nowrap">隱私權政策</span>。
          </p>
        </div>
      </div>
    </div>,
    frame,
  );
}
