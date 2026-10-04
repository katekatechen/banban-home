"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EASING } from "../_lib/page-transition";

// 開場畫面（launch screen）：白底中間一顆白色的 AIFIAN logo mark，
// 後面墊一團模糊、慢慢旋轉的品牌色光（紅、粉、紫、橘）。
// 停 2 秒後光團放大淡出、logo 縮小淡出，接到首頁的進場動畫。
// 跟商品細節頁一樣用 portal 掛到 #v13-frame，才蓋得過 tabbar
export const SPLASH_HOLD_MS = 2000;
export const SPLASH_EXIT_MS = 500;

// logo mark 的路徑（取自 AIFIAN 工作素材 logo_2.svg，原本是品牌紅，這裡填白色）
const MARK_PATH =
  "M14,15c0.7,0.5,1.4,0.9,2.2,1.3c0.9,0.4,2,0.8,3.3,1.3c0.1,0,0.1,0,0.2,0.1c0.1,0,0.2,0.1,0.3,0.1c0.1,0,0.1,0,0.1,0c0.1,0,0.2-0.1,0.1-0.1L10.9,1.1c-0.1-0.3-0.4-0.4-0.7-0.4c-0.3,0-0.5,0.2-0.7,0.4L0.3,17.6c0,0.1,0,0.2,0.1,0.1c0,0,0.1,0,0.1,0c0.1,0,0.2-0.1,0.3-0.1c0.1,0,0.1,0,0.2-0.1c1.4-0.4,2.4-0.8,3.3-1.3c0.8-0.4,1.5-0.8,2.2-1.3c0.7-0.5,1.2-1.1,1.6-1.8c0.6-0.9,1-2.1,1.2-3.4c0,0,0,0,0,0l0.9-5l0.9,5c0,0,0,0,0,0c0.2,1.3,0.6,2.4,1.2,3.4C12.8,13.9,13.3,14.5,14,15L14,15z";

// 光團：以品牌紅 #ff3030 為主，搭配同色系的珊瑚橘、粉紅跟深一點的洋紅，
// 幾顆圓錯開擺、整團一起轉，紅色就會在 logo 後面流動
const BLOBS: [x: number, y: number, size: number, color: string][] = [
  [-12, -14, 78, "#ff3030"],
  [16, -10, 66, "#ff7a45"],
  [12, 16, 74, "#ff3d6e"],
  [-16, 14, 64, "#e0204f"],
  [2, -24, 48, "#ffa064"],
];

export default function Splash({ leaving }: { leaving: boolean }) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
  }, []);
  if (!frame) return null;

  return createPortal(
    <div
      aria-hidden
      className="absolute inset-0 z-[80] flex items-center justify-center bg-white"
      style={{
        opacity: leaving ? 0 : 1,
        transition: `opacity ${SPLASH_EXIT_MS}ms ease ${SPLASH_EXIT_MS * 0.3}ms`,
      }}
    >
      <div
        className="splash-in relative size-[150px]"
        style={{
          transform: leaving ? "scale(1.7)" : "scale(1)",
          opacity: leaving ? 0 : 1,
          transition: `transform ${SPLASH_EXIT_MS}ms ${EASING}, opacity ${SPLASH_EXIT_MS}ms ease`,
        }}
      >
        <div
          className="splash-blob absolute inset-0"
          style={{ filter: "blur(16px)" }}
        >
          {BLOBS.map(([x, y, size, color]) => (
            <span
              key={color}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: size,
                height: size,
                background: color,
                opacity: 0.9,
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            />
          ))}
        </div>
        <svg
          viewBox="0 0 21 18"
          className="absolute left-1/2 top-1/2 w-[48.3px]"
          style={{
            transform: leaving
              ? "translate(-50%, -50%) scale(0.8)"
              : "translate(-50%, -50%) scale(1)",
            transition: `transform ${SPLASH_EXIT_MS}ms ${EASING}`,
          }}
        >
          <path d={MARK_PATH} fill="#ffffff" />
        </svg>
      </div>
    </div>,
    frame,
  );
}
