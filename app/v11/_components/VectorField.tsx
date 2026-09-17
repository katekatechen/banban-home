"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { lerpAngle, seededNoise } from "./fieldMath";

export type FieldMode = "idle" | "converge" | "thinking" | "launch" | "settled";

export type VectorFieldHandle = {
  // 在畫布上（用 0~1 的相對座標）補一次「漣漪」：標籤落地、麥克風收音、
  // 送出訊息都是呼叫這個，不是走 mode/attractor 那套持續性的狀態，
  // 是一次性、會自己衰減消失的事件
  pulse: (xFrac: number, yFrac: number, strength?: number) => void;
};

type Ripple = { x: number; y: number; start: number; strength: number };

type Props = {
  // 吸引點，相對畫布寬高的 0~1 比例；沒有給就用中央偏下（呼應首頁輸入框的位置）
  attractor?: { x: number; y: number };
  mode?: FieldMode;
  // 第二個、比較溫和的「障礙物」：場會在它周圍溫和繞流，但不會像吸引點
  // 那樣主導整個場的走向——用來讓招呼語這種靜態文字感覺「真的擋在空氣裡」
  obstacle?: { x: number; y: number; radius?: number };
  // 允許滑鼠/手指擾動場：越接近指尖，線段角度越會轉向指向指尖
  interactive?: boolean;
  // 外部想要的傾角（度），例如捲動速度換算來的「風」——元件內部自己做平滑，
  // 呼叫端不用自己做 lerp，改變這個值就好
  windTilt?: number;
  dark?: boolean;
  // 格點間距（px），數字越小密度越高，畫面小的展示格建議調大一點省效能
  spacing?: number;
  showAttractorDot?: boolean;
  // 線段不透明度（0~1）。場如果要墊在半透明卡片底下（例如捲動即風那段），
  // 卡片會再吃掉一部分視覺強度，這裡要調高一點，不然穿透出來的線幾乎看不見
  opacity?: number;
  className?: string;
};

const VectorField = forwardRef<VectorFieldHandle, Props>(function VectorField(
  {
    attractor = { x: 0.5, y: 0.82 },
    mode = "idle",
    obstacle,
    interactive = true,
    windTilt = 0,
    dark = false,
    spacing = 26,
    showAttractorDot = false,
    opacity = 0.34,
    className,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 用 ref 存活動狀態，不透過 React state：這些數字每一幀都在變，
  // 若放進 state 會觸發不必要的重渲染跟 re-render 風暴
  const runtimeRef = useRef({
    mode,
    attractor,
    obstacle: obstacle ?? null,
    windTilt: 0,
    windTarget: 0,
    pointer: null as { x: number; y: number } | null,
    pointerLastMove: 0,
    ripples: [] as Ripple[],
    angles: new Float32Array(0),
    energies: new Float32Array(0),
    cols: 0,
    rows: 0,
  });

  // props 變了就同步進 runtime ref，動畫迴圈本身不依賴 React 的重渲染節奏
  useEffect(() => {
    runtimeRef.current.mode = mode;
  }, [mode]);
  useEffect(() => {
    runtimeRef.current.attractor = attractor;
  }, [attractor]);
  useEffect(() => {
    runtimeRef.current.obstacle = obstacle ?? null;
  }, [obstacle]);
  useEffect(() => {
    // windTilt 是外部丟進來的「一陣風」，不是要一直維持的目標角度——
    // 呼叫端（例如捲動事件）每次改變這個 prop 就是補一次陣風，
    // 陣風本身會在動畫迴圈裡隨時間衰減回 0，呼叫端不用自己做衰減
    runtimeRef.current.windTarget = (windTilt * Math.PI) / 180;
  }, [windTilt]);

  useImperativeHandle(
    ref,
    () => ({
      pulse: (xFrac, yFrac, strength = 1) => {
        runtimeRef.current.ripples.push({
          x: xFrac,
          y: yFrac,
          start: performance.now(),
          strength,
        });
        // 場合裡同時掉太多漣漪（例如標籤一次全部落地）畫面會糊掉，
        // 只留最新的幾個，舊的直接丟掉
        if (runtimeRef.current.ripples.length > 6) {
          runtimeRef.current.ripples.shift();
        }
      },
    }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.max(2, Math.floor(width / spacing));
      const rows = Math.max(2, Math.floor(height / spacing));
      runtimeRef.current.cols = cols;
      runtimeRef.current.rows = rows;
      runtimeRef.current.angles = new Float32Array(cols * rows);
      runtimeRef.current.energies = new Float32Array(cols * rows);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const handlePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      runtimeRef.current.pointer = { x: clientX - rect.left, y: clientY - rect.top };
      runtimeRef.current.pointerLastMove = performance.now();
    };
    const onPointerMove = (e: PointerEvent) => handlePointer(e.clientX, e.clientY);
    const onPointerLeave = () => {
      // 手指離開時不要立刻清掉座標，讓下面的時間衰減自然把影響力歸零，
      // 手感才會是「餘波散開」而不是瞬間消失
    };

    if (interactive) {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
    }

    let raf = 0;
    const start = performance.now();
    const lineHalf = spacing * 0.32;
    const pointerRadius = spacing * 5.5;
    const pointerDecayMs = 650;
    const rippleLifeMs = 900;
    const rippleSpeed = 340; // px/s，漣漪環往外擴散的速度

    // 參考氣流視覺（平行的細線 → 靠近流動核心變粗、變亮、拉長），
    // 「energy」代表這個點此刻被哪股力量影響得多深，0 是平靜的背景細線，
    // 1 是正在被吸引點/漣漪/指尖強烈牽引的線段——粗細、長度、顏色濃度
    // 都是同一個 energy 算出來的，不是分開調的三個參數
    const baseRGB: [number, number, number] = dark
      ? [255, 255, 255]
      : [30, 41, 57];
    const hotRGB: [number, number, number] = [255, 59, 59]; // 品牌紅，當作「熱」的那一端
    const dotStyle = "#ff3b3b";

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const rt = runtimeRef.current;
      const { cols, rows, attractor: at, mode: currentMode, obstacle: ob } = rt;

      // 先讓實際顯示的傾角追向目前的陣風強度（平滑，不然會硬生生跳），
      // 再讓陣風強度本身每一幀衰減一點——呼叫端只要在捲動時「補風」，
      // 停止捲動後不用做任何事，風會自己在幾百毫秒內靜下來
      rt.windTilt = lerpAngle(rt.windTilt, rt.windTarget, 0.09, Math.PI * 2);
      rt.windTarget *= 0.93;

      const pointerAge = now - rt.pointerLastMove;
      const pointerStrength = rt.pointer
        ? Math.max(0, 1 - pointerAge / pointerDecayMs)
        : 0;

      // 過期的漣漪直接丟掉，不用每幀都留著判斷
      if (rt.ripples.length > 0) {
        rt.ripples = rt.ripples.filter((r) => now - r.start < rippleLifeMs);
      }

      ctx.clearRect(0, 0, width, height);

      const ax = at.x * width;
      const ay = at.y * height;
      const ox = ob ? ob.x * width : 0;
      const oy = ob ? ob.y * height : 0;
      const obstacleRadius = ob?.radius ?? Math.min(width, height) * 0.32;

      // 思考中：每 2.2 秒一個循環，先擾動（0→1）再收斂回穩（1→0），
      // 呼應「亂流散開、再重新對齊」的敘事，不是單純的隨機抖動
      const thinkPeriod = 2200;
      const thinkPhase = ((now % thinkPeriod) / thinkPeriod) * Math.PI;
      const thinkEnvelope = currentMode === "thinking" ? Math.sin(thinkPhase) : 0;

      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const idx = gy * cols + gx;
          const px = (gx + 0.5) * spacing;
          const py = (gy + 0.5) * spacing;

          const dx = px - ax;
          const dy = py - ay;
          const dist = Math.hypot(dx, dy) || 1;

          // 底層：緩慢漂移的基礎風向，任何模式都存在，是「待命」的骨架——
          // 疊兩層不同速度的正弦波，就算畫面完全靜止（settled、沒有手指
          // 互動）也還是能感覺到背景有一點微微的呼吸感，不會整個定住
          const drift =
            -0.45 +
            0.26 * Math.sin(t * 0.22 + gx * 0.15) +
            0.07 * Math.sin(t * 0.55 + gy * 0.3);

          // 環繞吸引點的切線方向（形成漩渦感），越靠近吸引點影響越強
          const tangential = Math.atan2(dy, dx) + Math.PI / 2;
          // 直接指向吸引點（收斂用）
          const radial = Math.atan2(dy, dx) + Math.PI;

          const influenceRadius = Math.min(width, height) * 0.9;
          const proximity = Math.exp(-dist / influenceRadius);

          // energy：這個點此刻被牽引得多深，決定線段畫出來多粗、多長、
          // 顏色多接近品牌紅——跟角度計算分開算，但共用同一批 proximity/w，
          // 「越靠近正在發生的事，線越粗越亮」是貫穿所有模式的同一條規則
          let energy = 0;

          let target: number;
          if (currentMode === "settled") {
            // 已經對齊完成：忽略吸引點，全場同一個方向，呼應「答案已經給出」
            target = drift;
          } else if (currentMode === "launch") {
            // 發射瞬間：不分遠近，附近線段全部指向「遠離吸引點」的方向，
            // 像是從送出鍵那一點往外炸開一圈氣流，跟 converge 的方向正好相反
            const away = Math.atan2(dy, dx);
            const w = Math.min(1, proximity * 1.8);
            target = lerpAngle(drift, away, w);
            energy = Math.max(energy, w);
          } else if (currentMode === "converge") {
            const w = Math.min(1, proximity * 1.4);
            target = lerpAngle(drift, radial, w);
            energy = Math.max(energy, w * 0.85);
          } else if (currentMode === "thinking") {
            const swirl = lerpAngle(drift, tangential, proximity);
            const seed = seededNoise(idx * 7.13 + Math.floor(now / thinkPeriod));
            const noise = (seed * 2 - 1) * (Math.PI * 0.38) * thinkEnvelope;
            target = swirl + noise;
            energy = Math.max(energy, proximity * thinkEnvelope * 0.7);
          } else {
            // idle：淡淡的漩渦感，暗示「有個中心，但沒事發生」
            target = lerpAngle(drift, tangential, proximity * 0.7);
            energy = Math.max(energy, proximity * 0.25);
          }

          // 障礙物（招呼語文字）：場在它周圍溫和繞流，範圍比吸引點小很多，
          // 只影響貼近文字的那一小圈線段，不會蓋過目前模式原本的走向
          if (ob) {
            const odx = px - ox;
            const ody = py - oy;
            const odist = Math.hypot(odx, ody) || 1;
            if (odist < obstacleRadius) {
              const flowAround = Math.atan2(ody, odx) + Math.PI / 2;
              const w = Math.exp(-odist / (obstacleRadius * 0.5)) * 0.55;
              target = lerpAngle(target, flowAround, w);
              energy = Math.max(energy, w * 0.5);
            }
          }

          // 漣漪：標籤落地／送出／麥克風脈動都是補一個一次性的擴散環，
          // 環的半徑隨時間往外長，掃過的線段短暫轉向環的切線方向，
          // 環過去之後線段會自己 lerp 回原本目標角度，不用手動歸位——
          // 掃過的當下也是線段最粗最亮的瞬間，像真的有東西震過去
          for (const r of rt.ripples) {
            const rx = r.x * width;
            const ry = r.y * height;
            const rdx = px - rx;
            const rdy = py - ry;
            const rdist = Math.hypot(rdx, rdy);
            const age = now - r.start;
            const ringRadius = (age / 1000) * rippleSpeed;
            const band = 46;
            const bandDist = Math.abs(rdist - ringRadius);
            if (bandDist < band) {
              const ringAngle = Math.atan2(rdy, rdx) + Math.PI / 2;
              const fade = 1 - age / rippleLifeMs;
              const w = Math.exp(-bandDist / (band * 0.45)) * fade * r.strength;
              target = lerpAngle(target, ringAngle, Math.min(1, w));
              energy = Math.max(energy, Math.min(1, w));
            }
          }

          // 指尖擾動疊加在最上層，跟目前模式無關——不管在哪個狀態，
          // 手指靠近永遠會讓附近線段轉向指尖，這是「場會回應你」最直接的證據
          if (pointerStrength > 0 && rt.pointer) {
            const pdx = px - rt.pointer.x;
            const pdy = py - rt.pointer.y;
            const pdist = Math.hypot(pdx, pdy);
            if (pdist < pointerRadius) {
              const pointerAngle = Math.atan2(pdy, pdx) + Math.PI / 2;
              const w = pointerStrength * Math.exp(-pdist / (pointerRadius * 0.45));
              target = lerpAngle(target, pointerAngle, w);
              energy = Math.max(energy, w);
            }
          }

          target += rt.windTilt;

          const current = rt.angles[idx] || 0;
          rt.angles[idx] = lerpAngle(current, target, 0.09);

          // energy 也做平滑，不然粗細/顏色會跟著每幀雜訊一起閃爍——
          // 平滑後的值才拿去決定線段畫多粗、多長、多接近品牌紅
          const smoothEnergy = (rt.energies[idx] =
            (rt.energies[idx] || 0) + (Math.min(1, energy) - (rt.energies[idx] || 0)) * 0.12);

          const a = rt.angles[idx];
          const len = lineHalf * (0.72 + smoothEnergy * 0.75);
          const cos = Math.cos(a) * len;
          const sin = Math.sin(a) * len;

          const r = Math.round(baseRGB[0] + (hotRGB[0] - baseRGB[0]) * smoothEnergy);
          const g = Math.round(baseRGB[1] + (hotRGB[1] - baseRGB[1]) * smoothEnergy);
          const b = Math.round(baseRGB[2] + (hotRGB[2] - baseRGB[2]) * smoothEnergy);
          const a2 = Math.min(1, opacity + smoothEnergy * (1 - opacity) * 0.9);

          ctx.beginPath();
          ctx.moveTo(px - cos, py - sin);
          ctx.lineTo(px + cos, py + sin);
          ctx.strokeStyle = `rgba(${r},${g},${b},${a2})`;
          ctx.lineWidth = 1.1 + smoothEnergy * 2.1;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      if (
        showAttractorDot &&
        (currentMode === "converge" || currentMode === "settled")
      ) {
        ctx.beginPath();
        ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.fillStyle = dotStyle;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
    // spacing/dark/interactive/showAttractorDot 改變時重建整個迴圈比較單純，
    // 其餘會動態變化的值（mode/attractor/obstacle/windTilt）都走上面的
    // runtimeRef 同步，不需要也不應該把整個 effect 重跑
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spacing, dark, interactive, showAttractorDot, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
});

export default VectorField;
