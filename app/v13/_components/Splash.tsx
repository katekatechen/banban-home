"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// 開場畫面（launch screen），兩個版本，跟著首頁的版本走：
// - 預設（天空版首頁）：白底中間放紅色的 AIFIAN 完整 logo，停 2 秒後淡出接首頁；
// - 光暈版（?home=glow）：白底中間一團模糊、慢慢旋轉的品牌色光，上面一顆白色 logo mark。
//   首頁也是同一顆光團加 logo（標題置中排在下面），開場畫面結束時白底淡出、
//   這顆整個往上移到首頁的位置，兩個畫面無縫接起來。
// 跟商品細節頁一樣用 portal 掛到 #v13-frame，才蓋得過 tabbar
export const SPLASH_HOLD_MS = 2000;
export const SPLASH_EXIT_MS = 1000;
const FLY_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

// logo mark 的路徑（取自 AIFIAN 工作素材 logo_2.svg，原本是品牌紅，這裡填白色）
export const MARK_PATH =
  "M14,15c0.7,0.5,1.4,0.9,2.2,1.3c0.9,0.4,2,0.8,3.3,1.3c0.1,0,0.1,0,0.2,0.1c0.1,0,0.2,0.1,0.3,0.1c0.1,0,0.1,0,0.1,0c0.1,0,0.2-0.1,0.1-0.1L10.9,1.1c-0.1-0.3-0.4-0.4-0.7-0.4c-0.3,0-0.5,0.2-0.7,0.4L0.3,17.6c0,0.1,0,0.2,0.1,0.1c0,0,0.1,0,0.1,0c0.1,0,0.2-0.1,0.3-0.1c0.1,0,0.1,0,0.2-0.1c1.4-0.4,2.4-0.8,3.3-1.3c0.8-0.4,1.5-0.8,2.2-1.3c0.7-0.5,1.2-1.1,1.6-1.8c0.6-0.9,1-2.1,1.2-3.4c0,0,0,0,0,0l0.9-5l0.9,5c0,0,0,0,0,0c0.2,1.3,0.6,2.4,1.2,3.4C12.8,13.9,13.3,14.5,14,15L14,15z";

// 光團：以品牌紅 #ff3030 為主，搭配同色系的珊瑚橘、粉紅跟深一點的洋紅，
// 幾顆圓錯開擺、整團一起轉，紅色就會在 logo 後面流動
export const BLOBS: [x: number, y: number, size: number, color: string][] = [
  [-12, -14, 78, "#ff3030"],
  [16, -10, 66, "#ff7a45"],
  [12, 16, 74, "#ff3d6e"],
  [-16, 14, 64, "#e0204f"],
  [2, -24, 48, "#ffa064"],
];

// 光團跟 logo 的比例：光團整體縮到原本的 80%（位置跟大小一起縮），
// logo mark 放大到 60px，讓光變成從 logo 後面暈開，而不是 logo 浮在一大團光上
const GLOW_SCALE = 0.8;
const MARK_W = 60;

// 品牌光團＋白色 logo mark：開場畫面（光暈版）跟光暈版首頁共用同一顆，
// 開場畫面結束時直接把這顆從畫面中間移到首頁的位置，兩邊無縫接起來
export function BrandGlow({
  className,
  style,
  anchor = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  // 首頁那顆標上 data-warm-glow，開場畫面量它的位置飛過去
  anchor?: boolean;
}) {
  return (
    <div
      data-warm-glow={anchor || undefined}
      className={`relative size-[150px] shrink-0 ${className ?? ""}`}
      style={style}
    >
      <div
        className="splash-blob absolute inset-0"
        style={{ filter: "blur(18px)" }}
      >
        {BLOBS.map(([x, y, size, color]) => (
          <span
            key={color}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size * GLOW_SCALE,
              height: size * GLOW_SCALE,
              background: color,
              opacity: 0.9,
              transform: `translate(calc(-50% + ${x * GLOW_SCALE}px), calc(-50% + ${y * GLOW_SCALE}px))`,
            }}
          />
        ))}
      </div>
      <svg
        viewBox="0 0 21 18"
        className="absolute left-1/2 top-1/2"
        style={{ width: MARK_W, transform: "translate(-50%, -50%)" }}
      >
        <path d={MARK_PATH} fill="#ffffff" />
      </svg>
    </div>
  );
}

export default function Splash({
  leaving,
  variant = "plain",
}: {
  leaving: boolean;
  variant?: "plain" | "glow";
}) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  // 光暈版：量好首頁那顆光團的位置後才開始移（先停一幀在起點，過場才看得到）
  const [target, setTarget] = useState<{ dx: number; dy: number } | null>(null);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
  }, []);

  useEffect(() => {
    if (!leaving || !frame || variant !== "glow") return;
    const f = frame.getBoundingClientRect();
    const g = frame.querySelector("[data-warm-glow]")?.getBoundingClientRect();
    setTarget({
      dx: g ? g.left + g.width / 2 - (f.left + f.width / 2) : 0,
      dy: g ? g.top + g.height / 2 - (f.top + f.height / 2) : 0,
    });
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMoving(true)),
    );
    return () => cancelAnimationFrame(raf);
  }, [leaving, frame, variant]);

  if (!frame) return null;

  if (variant === "plain") {
    // 預設版：紅色完整 logo，結束時 logo 稍微縮小淡掉、白底跟著淡出
    return createPortal(
      <div
        aria-hidden
        className="absolute inset-0 z-[80] flex items-center justify-center bg-white"
        style={{
          opacity: leaving ? 0 : 1,
          transition: `opacity 600ms ease ${leaving ? 200 : 0}ms`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figma/v13-logo-full-red.svg"
          alt=""
          className="splash-in w-[112px]"
          style={{
            opacity: leaving ? 0 : 1,
            transform: leaving ? "scale(0.92)" : "scale(1)",
            transition: "opacity 400ms ease, transform 500ms ease",
          }}
        />
      </div>,
      frame,
    );
  }

  // 光暈版：白底淡出，光團＋logo mark 整顆往上移到首頁深色 logo mark 的位置，
// 一邊移一邊淡掉，散進首頁的漸層底色裡，由首頁那顆深色 mark 接手
  const move = moving && target;
  return createPortal(
    <div aria-hidden className="absolute inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-white"
        style={{
          opacity: move ? 0 : 1,
          transition: "opacity 520ms ease 80ms",
        }}
      />
      <div className="absolute left-1/2 top-1/2">
        <div
          className="-ml-[75px] -mt-[75px]"
          style={{
            transform: move
              ? `translate(${target.dx}px, ${target.dy}px) scale(0.6)`
              : "translate(0, 0)",
            opacity: move ? 0 : 1,
            transition: `transform ${SPLASH_EXIT_MS}ms ${FLY_EASE}, opacity ${SPLASH_EXIT_MS * 0.8}ms ease`,
          }}
        >
          <BrandGlow className="splash-in" />
        </div>
      </div>
    </div>,
    frame,
  );
}

// 光暈版首頁招呼語上方的深色 logo mark（照 Figma 1068:26391，寬 60）。
// 標上 data-warm-glow，開場畫面量它的位置把光團飛過來
export function HomeMark({ style }: { style?: React.CSSProperties }) {
  return (
    <div data-warm-glow className="mb-[17px] w-[60px]" style={style}>
      <svg viewBox="0 0 21 18" className="block w-full">
        <path d={MARK_PATH} fill="#1e2939" />
      </svg>
    </div>
  );
}
