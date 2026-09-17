"use client";

import { useEffect, useRef } from "react";
import { lerpAngle, seededNoise } from "./fieldMath";

type Props = {
  focused: boolean;
  // 每次遞增一次，代表「使用者打了一個字」——不用真的知道打了什麼，
  // 只要知道「剛剛有輸入」，藉此觸發一次沿著圈的輕微擾動
  keystrokeTick: number;
};

// 輸入框的邊框不是另外疊一層漸層裝飾，是氣流場本身被收攏成一圈：
// 沿著跟輸入框外框同尺寸的「藥丸形」路徑均勻取點，每個點畫一小段
// 貼著路徑切線方向的線段，效果是「一整圈都在輕輕流動」而不是靜止的邊框。
// focus 時線段對齊得更整齊、更亮；每打一個字，圈上會有一小段短暫更亮/更擾動，
// 像是字真的震動了周圍的空氣
export default function InputAirRing({ focused, keystrokeTick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef({
    focused,
    keystrokePulseAt: 0,
    keystrokeSeed: 0,
    angles: new Float32Array(0),
  });

  useEffect(() => {
    runtimeRef.current.focused = focused;
  }, [focused]);

  useEffect(() => {
    if (keystrokeTick === 0) return;
    runtimeRef.current.keystrokePulseAt = performance.now();
    runtimeRef.current.keystrokeSeed = keystrokeTick;
  }, [keystrokeTick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let pointCount = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 沿著藥丸形周長，大約每 9px 放一個點
      const r = height / 2;
      const straight = Math.max(width - height, 0);
      const perimeter = 2 * straight + Math.PI * height;
      pointCount = Math.max(24, Math.round(perimeter / 9));
      runtimeRef.current.angles = new Float32Array(pointCount);
      void r;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // 沿著藥丸形（兩段直邊 + 兩個半圓端蓋）走一圈：回傳該點座標跟切線角度
    const stadiumPoint = (tFrac: number) => {
      const r = height / 2;
      const straight = Math.max(width - height, 0);
      const perimeter = 2 * straight + Math.PI * height;
      let s = tFrac * perimeter;

      if (s < straight) {
        // 上緣，由左往右
        return { x: r + s, y: 0, angle: 0 };
      }
      s -= straight;
      const halfCirc = Math.PI * r;
      if (s < halfCirc) {
        // 右端半圓，由上往下繞
        const theta = -Math.PI / 2 + s / r;
        return {
          x: width - r + r * Math.cos(theta),
          y: r + r * Math.sin(theta),
          angle: theta + Math.PI / 2,
        };
      }
      s -= halfCirc;
      if (s < straight) {
        // 下緣，由右往左
        return { x: width - r - s, y: height, angle: 0 };
      }
      s -= straight;
      const theta = Math.PI / 2 + s / r;
      return {
        x: r + r * Math.cos(theta),
        y: r + r * Math.sin(theta),
        angle: theta + Math.PI / 2,
      };
    };

    let raf = 0;
    const start = performance.now();
    const lineHalf = 4.5;

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const rt = runtimeRef.current;
      ctx.clearRect(0, 0, width, height);
      if (pointCount === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const pulseAge = now - rt.keystrokePulseAt;
      const pulseActive = rt.keystrokePulseAt > 0 && pulseAge < 500;
      // 每次打字挑一段固定但看起來隨機的圈上位置來擾動，不是整圈一起跳
      const pulseCenter = seededNoise(rt.keystrokeSeed * 3.77);

      const baseOpacity = rt.focused ? 0.55 : 0.3;
      // 跟 VectorField 同一套「energy 決定粗細/顏色濃度」的規則：
      // 打字擾動經過的那一小段圈，會跟主場的漣漪一樣變粗、泛紅
      const baseRGB: [number, number, number] = [30, 41, 57];
      const hotRGB: [number, number, number] = [255, 59, 59];

      for (let i = 0; i < pointCount; i++) {
        const frac = i / pointCount;
        const { x, y, angle: tangent } = stadiumPoint(frac);

        // 待命時沿著圈緩慢流動的微擾；focus 時流動變慢、更貼合切線方向，
        // 呼應「聚焦、整齊」的感覺
        const drift =
          Math.sin(t * 0.6 + frac * Math.PI * 2) * (rt.focused ? 0.05 : 0.16);

        let target = tangent + drift;
        let energy = rt.focused ? 0.12 : 0;

        if (pulseActive) {
          const circDist = Math.min(
            Math.abs(frac - pulseCenter),
            1 - Math.abs(frac - pulseCenter),
          );
          const band = 0.06;
          if (circDist < band) {
            const fade = 1 - pulseAge / 500;
            const w = Math.exp(-circDist / (band * 0.5)) * fade;
            target = lerpAngle(target, tangent + Math.PI / 2, w * 0.6);
            energy = Math.max(energy, w);
          }
        }

        const current = rt.angles[i] || 0;
        rt.angles[i] = lerpAngle(current, target, 0.14);
        const a = rt.angles[i];
        const len = lineHalf * (0.85 + energy * 0.7);
        const cos = Math.cos(a) * len;
        const sin = Math.sin(a) * len;

        const r = Math.round(baseRGB[0] + (hotRGB[0] - baseRGB[0]) * energy);
        const g = Math.round(baseRGB[1] + (hotRGB[1] - baseRGB[1]) * energy);
        const b = Math.round(baseRGB[2] + (hotRGB[2] - baseRGB[2]) * energy);
        const opacity = Math.min(1, baseOpacity + energy * 0.6);

        ctx.beginPath();
        ctx.moveTo(x - cos, y - sin);
        ctx.lineTo(x + cos, y + sin);
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.lineWidth = 1.2 + energy * 1.6;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
