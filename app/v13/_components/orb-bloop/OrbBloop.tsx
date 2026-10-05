"use client";

import { useEffect, useRef, useState } from "react";
import { BLOOP_WGSL } from "./bloop.wgsl";

// Bloop orb：用 WebGPU 畫的一顆會流動的光球（類似語音助理那顆球）。
// 改寫自 Space UI 的 orb/bloop（MIT 授權）：
// https://github.com/usespaceui/ui/tree/main/src/registry/components/orb/bloop
//
// 跟原版的差別（prototype 用不到的拿掉、首頁用得到的調整）：
// - 不接麥克風／音檔，改用原版 demoMode 那套「模擬聲音」讓球自己動；
// - 原版在手機上會把畫布降到 160px、每秒 14 張，放在首頁當主視覺太糊太卡，
//   這裡維持跟著螢幕解析度（最多 2 倍）、正常幀率，只在分頁看不到時暫停；
// - 瀏覽器不支援 WebGPU（或初始化失敗）時改畫 CSS 漸層的替代球，不會留白。
export const BloopState = {
  idle: "idle",
  listen: "listen",
  think: "think",
  speak: "speak",
} as const;
export type BloopState = (typeof BloopState)[keyof typeof BloopState];

type RGB = [number, number, number];

export const hexToRgb = (hex: string): RGB => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
};

export type BloopPalette = { main: RGB; low: RGB; mid: RGB; high: RGB };

// 品牌紅：照原版調色盤的結構（main 最淡、low 最飽和、mid 中間、high 接近白）
export const BRAND_RED_PALETTE: BloopPalette = {
  main: hexToRgb("#ffe1dc"),
  low: hexToRgb("#ff3030"),
  mid: hexToRgb("#ff8a7a"),
  high: hexToRgb("#fff4ef"),
};

const toCss = ([r, g, b]: RGB) =>
  `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

export default function OrbBloop({
  size,
  state = BloopState.idle,
  palette = BRAND_RED_PALETTE,
  watercolorStrength = 0.5,
  className,
  style,
}: {
  size: number;
  state?: BloopState;
  palette?: BloopPalette;
  watercolorStrength?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const propsRef = useRef({ state, palette, watercolorStrength });
  propsRef.current = { state, palette, watercolorStrength };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!("gpu" in navigator)) {
      setUnsupported(true);
      return;
    }
    let cancelled = false;
    let stop: (() => void) | undefined;
    let dispose: (() => void) | undefined;
    let hidden = document.hidden;
    const onVis = () => (hidden = document.hidden);
    document.addEventListener("visibilitychange", onVis);

    const startTime = Date.now();
    let lastTime = startTime;
    const tracking = { current: propsRef.current.state, enteredAt: 0 };
    const avgRef = [0, 0, 0, 0];
    const cumulative = [0, 0, 0, 0];

    (async () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      const { init, effect, surface, frameLoop } = await import("vgpu");
      const gpu = await init();
      if (cancelled) {
        gpu.dispose();
        return;
      }
      const target = surface(gpu, canvas, {
        format: "bgra8unorm",
        alphaMode: "premultiplied",
        dpr,
      });
      const fx = effect(gpu, BLOOP_WGSL, { blend: "premultiplied" });
      const loop = frameLoop(gpu, (frame) => {
        if (hidden) return;
        const now = Date.now();
        const time = (now - startTime) / 1000;
        const p = propsRef.current;
        if (tracking.current !== p.state) {
          tracking.current = p.state;
          tracking.enteredAt = time;
        }
        const enteredAt = tracking.enteredAt;
        const t = time - enteredAt;

        // 模擬聲音（原版 demoMode）：不同狀態有不同的起伏節奏
        let mic: number;
        let avg: number[];
        if (p.state === BloopState.speak) {
          const word = Math.sin(t * 4.2) * 0.5 + 0.5;
          const syl = Math.sin(t * 14.8) * 0.5 + 0.5;
          const jitter = Math.sin(t * 28) * 0.5 + 0.5;
          const burst = Math.pow(syl * word, 1.4);
          const low = Math.min(1, 0.28 + burst * 0.65 + Math.sin(t * 7) * 0.12);
          const mid = Math.min(
            1,
            0.22 + (Math.sin(t * 11.5) * 0.5 + 0.5) * 0.62,
          );
          const high = Math.min(1, 0.16 + jitter * 0.42);
          mic = Math.min(1, low * 0.5 + mid * 0.35 + high * 0.15);
          avg = [mic, low, mid, high];
        } else if (p.state === BloopState.listen) {
          mic =
            0.2 +
            (Math.sin(t * 3) * 0.5 + 0.5) * 0.35 +
            (Math.sin(t * 8.2) * 0.15 + 0.15);
          avg = [mic, mic * 0.65, mic * 0.85, mic * 0.45];
        } else if (p.state === BloopState.think) {
          mic = 0.16 + (Math.sin(time * 3.6) * 0.5 + 0.5) * 0.26;
          avg = [mic, mic * 0.45, mic * 0.85, mic * 0.35];
        } else {
          mic = Math.sin(time * 1.8) * 0.06 + 0.06;
          avg = [mic, mic * 0.5, mic * 0.35, mic * 0.2];
        }
        const dt = Math.min(now - lastTime, 100) / 1000;
        lastTime = now;
        for (let i = 0; i < 4; i++) {
          avgRef[i] += (avg[i] - avgRef[i]) * 0.55;
          cumulative[i] += avgRef[i] * (60 * dt) * 0.25;
        }

        fx.set({
          ubo: {
            time,
            micLevel: mic,
            stateListen: p.state === BloopState.listen ? 1 : 0,
            listenTimestamp: p.state === BloopState.listen ? enteredAt : 0,
            stateThink: p.state === BloopState.think ? 1 : 0,
            thinkTimestamp: p.state === BloopState.think ? enteredAt : 0,
            stateSpeak: p.state === BloopState.speak ? 1 : 0,
            speakTimestamp: p.state === BloopState.speak ? enteredAt : 0,
            avgMag: avgRef,
            cumulativeAudio: cumulative,
            viewport: [canvas.width, canvas.height],
            watercolorStrength: p.watercolorStrength,
            watercolorAnimated: 0,
            bloopColorMain: [...p.palette.main, 1],
            bloopColorLow: [...p.palette.low, 1],
            bloopColorMid: [...p.palette.mid, 1],
            bloopColorHigh: [...p.palette.high, 1],
          },
        });
        frame.pass({ target, clear: [0, 0, 0, 0] }, fx);
      });
      stop = () => loop.stop();
      dispose = () => gpu.dispose();
    })().catch(() => {
      if (!cancelled) setUnsupported(true);
    });

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      stop?.();
      dispose?.();
    };
    // 只在掛載時建一次 GPU 資源；顏色、狀態每一幀從 propsRef 讀
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const box: React.CSSProperties = { width: size, height: size, ...style };

  if (unsupported) {
    // 替代球：同一組顏色的放射漸層，慢慢轉
    const { main, low, mid, high } = palette;
    return (
      <div className={className} style={box}>
        <div
          className="splash-blob size-full rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${toCss(high)} 0%, ${toCss(main)} 22%, ${toCss(mid)} 55%, ${toCss(low)} 100%)`,
          }}
        />
      </div>
    );
  }

  return <canvas ref={canvasRef} className={className} style={box} />;
}
