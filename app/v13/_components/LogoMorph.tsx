"use client";

import { useEffect, useRef, useState } from "react";
import { interpolate } from "flubber";
import SvgPath from "svgpath";

// AIFIAN 字樣 ↔ logo mark 的轉場（首頁 ↔ 對話的左上角）：
// 1. 從最右邊的 N 開始，字母依序往左縮進第一個 A，邊縮邊淡掉；
// 2. 第一個 A 的輪廓用 flubber 逐格變形成 logo mark，中間的三角形鏤空同時縮小消失；
// 回首頁時整段倒著播。
// 字樣的路徑取自 public/figma/v13-logo.svg（95.44×28），mark 取自 logo_2.svg（21×18），
// mark 放大到 24px 高、貼齊左邊，跟對話裡原本 h-6 的 mark 一樣大
const W = 95.4393;
const H = 28;
const MS = 720;

// 第一個 A 以外的字母，依「先縮進去的」排序（從右到左），附上每個字母的中心 x
const LETTERS: [d: string, cx: number][] = [
  [
    "M95.222 5.53922H91.847C91.7263 5.53922 91.6273 5.62635 91.6273 5.73583V16.7502L86.4876 7.67283C86.4658 7.63262 86.4417 7.59464 86.42 7.55442C86.1616 7.11877 85.8309 6.73673 85.4519 6.42394C84.8411 5.92126 84.1096 5.60625 83.3733 5.55039V5.53922H79.781C79.6603 5.53922 79.5613 5.62635 79.5613 5.73583V20.7381C79.5613 20.8476 79.6603 20.9348 79.781 20.9348H83.156C83.2767 20.9348 83.3757 20.8476 83.3757 20.7381V9.72602L88.5831 18.9195C88.8414 19.3552 89.1721 19.7372 89.5511 20.05C90.1619 20.5527 90.8934 20.8677 91.6273 20.9236V20.9348H95.2196C95.3403 20.9348 95.4393 20.8476 95.4393 20.7381V5.73583C95.4393 5.62635 95.3403 5.53922 95.2196 5.53922H95.222Z",
    84,
  ],
  [
    "M69.8032 5.66657C69.7718 5.58837 69.6897 5.53922 69.598 5.53922H64.6272C64.5355 5.53922 64.4534 5.58837 64.422 5.66657L58.1017 20.6689C58.0486 20.7985 58.1524 20.937 58.3069 20.937H60.7984C61.5419 20.937 61.9813 20.3919 62.2082 19.9696L63.6833 16.4665H70.5395L72.0122 19.9674C72.2415 20.3896 72.6785 20.9348 73.4245 20.9348H75.9159C76.068 20.9348 76.1766 20.7962 76.1211 20.6667L69.8032 5.66657ZM67.1138 8.32967L69.3035 13.5263H64.9242L67.1138 8.32967Z",
    67,
  ],
  [
    "M53.8262 5.53922H50.1301C50.0094 5.53922 49.9104 5.62635 49.9104 5.73583V20.7381C49.9104 20.8476 50.0094 20.9348 50.1301 20.9348H53.8262C53.9469 20.9348 54.0459 20.8476 54.0459 20.7381V5.73583C54.0459 5.62635 53.9469 5.53922 53.8262 5.53922Z",
    52,
  ],
  [
    "M45.5673 5.53922H32.7409C32.6201 5.53922 32.5212 5.62635 32.5212 5.73583V20.7381C32.5212 20.8476 32.6201 20.9348 32.7409 20.9348H36.1159C36.2366 20.9348 36.3356 20.8476 36.3356 20.7381V14.9964H41.5453C42.7935 14.9964 43.5177 14.3239 44.0174 12.7064L44.1213 12.2975C44.1526 12.1746 44.0488 12.0562 43.9088 12.0562H36.3356V9.04907H42.6921C44.1816 9.04907 45.0483 8.24701 45.647 6.31224L45.7822 5.77827C45.8136 5.6554 45.7098 5.53699 45.5698 5.53699L45.5673 5.53922Z",
    39,
  ],
  [
    "M26.3626 5.53922H22.6665C22.5458 5.53922 22.4468 5.62635 22.4468 5.73583V20.7381C22.4468 20.8476 22.5458 20.9348 22.6665 20.9348H26.3626C26.4833 20.9348 26.5823 20.8476 26.5823 20.7381V5.73583C26.5823 5.62635 26.4833 5.53922 26.3626 5.53922Z",
    24.5,
  ],
];
const A_CX = 9.7;
const A_OUTER =
  "M11.9548 5.66657C11.9235 5.58837 11.8414 5.53922 11.7496 5.53922H6.77885C6.68712 5.53922 6.60503 5.58837 6.57365 5.66657L0.253348 20.6689C0.200236 20.7985 0.304045 20.937 0.458552 20.937H2.94998C3.69354 20.937 4.13292 20.3919 4.35985 19.9696L5.83491 16.4665H12.6912L14.1638 19.9674C14.3932 20.3896 14.8301 20.9348 15.5761 20.9348H18.0675C18.2196 20.9348 18.3283 20.7962 18.2727 20.6667L11.9548 5.66657Z";
const A_HOLE = "M9.26545 8.32967L11.4551 13.5263H7.0758L9.26545 8.32967Z";
// A 鏤空的中心：縮小消失時往這裡收
const HOLE_C = { x: 9.27, y: 11.4 };
const MARK = new SvgPath(
  "M14,15c0.7,0.5,1.4,0.9,2.2,1.3c0.9,0.4,2,0.8,3.3,1.3c0.1,0,0.1,0,0.2,0.1c0.1,0,0.2,0.1,0.3,0.1 c0.1,0,0.1,0,0.1,0c0.1,0,0.2-0.1,0.1-0.1L10.9,1.1c-0.1-0.3-0.4-0.4-0.7-0.4c-0.3,0-0.5,0.2-0.7,0.4L0.3,17.6c0,0.1,0,0.2,0.1,0.1 c0,0,0.1,0,0.1,0c0.1,0,0.2-0.1,0.3-0.1c0.1,0,0.1,0,0.2-0.1c1.4-0.4,2.4-0.8,3.3-1.3c0.8-0.4,1.5-0.8,2.2-1.3 c0.7-0.5,1.2-1.1,1.6-1.8c0.6-0.9,1-2.1,1.2-3.4c0,0,0,0,0,0l0.9-5l0.9,5c0,0,0,0,0,0c0.2,1.3,0.6,2.4,1.2,3.4 C12.8,13.9,13.3,14.5,14,15L14,15z",
)
  .scale(24 / 18)
  .translate(0, 2)
  .toString();

const morph = interpolate(A_OUTER, MARK, { maxSegmentLength: 1 });

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function LogoMorph({
  mark,
  color = "#1E2939",
  className,
  style,
}: {
  // true：變成 logo mark（進入對話）；false：完整字樣
  mark: boolean;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  // p：0 是完整字樣、1 是 mark。每一格往目標推進，中途反向也接得上
  const [p, setP] = useState(mark ? 1 : 0);
  const pRef = useRef(p);
  useEffect(() => {
    const target = mark ? 1 : 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pRef.current = target;
      setP(target);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const cur = pRef.current;
      const next =
        target > cur
          ? Math.min(target, cur + dt / MS)
          : Math.max(target, cur - dt / MS);
      pRef.current = next;
      setP(next);
      if (next !== target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mark]);

  // 時間軸：前 55% 字母依序縮進去（每個字母佔 25%，間隔 7.5%），後 55% A 變形成 mark
  const letterT = (i: number) => easeInOut(clamp((p - i * 0.075) / 0.25));
  const m = easeInOut(clamp((p - 0.45) / 0.55));
  const holeScale = 1 - clamp(m * 2.2);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      style={{ overflow: "visible", ...style }}
      role="img"
      aria-label="AIFIAN"
    >
      <g style={{ fill: color, transition: "fill 300ms ease" }}>
        {LETTERS.map(([d, cx], i) => {
          const t = letterT(i);
          if (t >= 1) return null;
          return (
            <path
              key={i}
              d={d}
              opacity={1 - t}
              transform={`translate(${(A_CX - cx) * t} 0)`}
            />
          );
        })}
        {/* 第一個 A：外框變形成 mark；鏤空用遮罩挖，跟著縮小 */}
        <mask
          id="aifian-a-hole"
          maskUnits="userSpaceOnUse"
          x={-10}
          y={-10}
          width={60}
          height={60}
        >
          <rect x={-10} y={-10} width={60} height={60} fill="#fff" />
          {holeScale > 0 && (
            <path
              d={A_HOLE}
              fill="#000"
              transform={`translate(${HOLE_C.x} ${HOLE_C.y}) scale(${holeScale}) translate(${-HOLE_C.x} ${-HOLE_C.y})`}
            />
          )}
        </mask>
        <path
          d={m <= 0 ? A_OUTER : m >= 1 ? MARK : morph(m)}
          mask="url(#aifian-a-hole)"
        />
      </g>
    </svg>
  );
}
