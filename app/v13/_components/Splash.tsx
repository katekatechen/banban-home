"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import GliderSvg, { GLIDER_GLOW } from "./GliderSvg";
import { resolveHomeVariant } from "../_lib/home-variant";

// 開場畫面（launch screen）：白底中間一顆白色的 AIFIAN logo mark，
// 後面墊一團模糊、慢慢旋轉的品牌色光。
// 停 2 秒後接到首頁，兩個畫面用同一組元素串起來：
// - logo mark 轉向、縮小，飛到首頁滑翔翼停的位置，途中交叉淡化成滑翔翼
//   （mark 是往上指的尖角，滑翔翼的機頭朝右上，轉 50 度剛好對上）；
// - 光團往下散開、淡掉，變成首頁地平線那團品牌色的暖光；
// - 白底同時淡出，露出正在進場的首頁。
// 跟商品細節頁一樣用 portal 掛到 #v13-frame，才蓋得過 tabbar
export const SPLASH_HOLD_MS = 2000;
export const SPLASH_EXIT_MS = 1000;
// 滑翔翼機頭相對 logo mark（正上方）的角度
const NOSE_DEG = 50;
const FLY_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

// logo mark 的路徑（取自 AIFIAN 工作素材 logo_2.svg，原本是品牌紅，這裡填白色）
const MARK_PATH =
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

type Flight = { dx: number; dy: number; planeW: number; glowDy: number };

const MARK_W = 48.3;

export default function Splash({ leaving }: { leaving: boolean }) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [vectorPlane, setVectorPlane] = useState(false);
  // 光暈版首頁：飛過去的是白色滑翔翼
  const [glow, setGlow] = useState(false);
  // 量好首頁飛機、暖光的位置後才開始飛（先停一幀在起點，過場才看得到）
  const [flight, setFlight] = useState<Flight | null>(null);
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
    setVectorPlane(
      new URLSearchParams(window.location.search).get("plane") === "svg",
    );
    setGlow(resolveHomeVariant() === "glow");
  }, []);

  useEffect(() => {
    if (!leaving || !frame) return;
    const f = frame.getBoundingClientRect();
    const anchor = frame
      .querySelector("[data-glider-anchor]")
      ?.getBoundingClientRect();
    const glow = frame
      .querySelector("[data-warm-glow]")
      ?.getBoundingClientRect();
    setFlight({
      dx: anchor ? anchor.left + anchor.width / 2 - (f.left + f.width / 2) : 0,
      dy: anchor ? anchor.top + anchor.height / 2 - (f.top + f.height / 2) : 0,
      planeW: anchor?.width ?? 70,
      glowDy: glow ? glow.top + glow.height / 2 - (f.top + f.height / 2) : 200,
    });
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setFlying(true)),
    );
    return () => cancelAnimationFrame(raf);
  }, [leaving, frame]);

  if (!frame) return null;

  const fly = flying && flight;
  const t = (ms: number, delay = 0, ease = FLY_EASE) =>
    `${ms}ms ${ease} ${delay}ms`;

  return createPortal(
    <div aria-hidden className="absolute inset-0 z-[80]">
      {/* 白底：開始飛的同時淡出，露出後面正在進場的首頁 */}
      <div
        className="absolute inset-0 bg-white"
        style={{
          opacity: fly ? 0 : 1,
          transition: `opacity ${t(520, 80, "ease")}`,
        }}
      />

      {/* 光團：往下散開到地平線的位置，變大、變淡，接上首頁的暖光 */}
      <div className="absolute left-1/2 top-1/2">
        <div
          className="splash-in relative -ml-[75px] -mt-[75px] size-[150px]"
          style={{
            transform: fly
              ? `translateY(${flight.glowDy}px) scale(${glow ? 2 : 3.2})`
              : "translateY(0) scale(1)",
            opacity: fly ? 0 : 1,
            transition: `transform ${t(SPLASH_EXIT_MS)}, opacity ${t(SPLASH_EXIT_MS * 0.8, 120, "ease")}`,
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
        </div>
      </div>

      {/* logo mark → 滑翔翼：同一條路徑飛過去，mark 前半段淡掉、滑翔翼前半段浮出 */}
      <div className="absolute left-1/2 top-1/2">
        <svg
          viewBox="0 0 21 18"
          className="splash-in absolute"
          style={{
            width: MARK_W,
            left: -MARK_W / 2,
            top: -(MARK_W * 18) / 21 / 2,
            transform: fly
              ? `translate(${flight.dx}px, ${flight.dy}px) rotate(${NOSE_DEG}deg) scale(${(flight.planeW * 0.7) / MARK_W})`
              : "none",
            opacity: fly ? 0 : 1,
            transition: `transform ${t(SPLASH_EXIT_MS)}, opacity ${t(SPLASH_EXIT_MS * 0.45, SPLASH_EXIT_MS * 0.2, "ease")}`,
          }}
        >
          <path d={MARK_PATH} fill="#ffffff" />
        </svg>
        {flight && (
          <div
            className="absolute"
            style={{
              width: flight.planeW,
              left: -flight.planeW / 2,
              top: -(flight.planeW * 488) / 600 / 2,
              transform: fly
                ? `translate(${flight.dx}px, ${flight.dy}px) rotate(0deg) scale(1)`
                : `rotate(${-NOSE_DEG}deg) scale(${MARK_W / flight.planeW})`,
              opacity: fly ? 1 : 0,
              transition: `transform ${t(SPLASH_EXIT_MS)}, opacity ${t(SPLASH_EXIT_MS * 0.45, SPLASH_EXIT_MS * 0.15, "ease")}`,
            }}
          >
            {glow ? (
              <GliderSvg
                tone="white"
                frame={false}
                className="block h-auto w-full"
                style={GLIDER_GLOW}
              />
            ) : vectorPlane ? (
              <GliderSvg className="block h-auto w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/figma/v13-home-plane-2.png"
                alt=""
                className="block w-full"
              />
            )}
          </div>
        )}
      </div>
    </div>,
    frame,
  );
}
