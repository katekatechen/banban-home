"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GLOW_BG } from "./HomeGradient";
import splashAnimation from "../_lib/launchscreen-splash.json";

// 開場畫面（launch screen）：白底中間一團慢慢旋轉的品牌色光加白色 logo mark，
// 用 Lottie 播放；結束時光團原地放大淡出，白底跟著淡出接上首頁。
// 跟商品細節頁一樣用 portal 掛到 #v13-frame，才蓋得過 tabbar
export const SPLASH_HOLD_MS = 2000;
export const SPLASH_EXIT_MS = 1000;

// 光團改用 Lottie（launchscreen-splash.json，600×600、60fps、5 秒一圈無限循環）：
// 五顆品牌色光點整團旋轉、轉到一半放大到 1.08，中間一顆白色 logo mark。
// 畫布 600 對應畫面 312px，logo mark 約 60px 寬，跟原本程式畫的光團同樣大小
const LOTTIE_SIZE = 312;

function SplashLottie({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let anim:
      | { destroy: () => void; goToAndStop: (v: number, f: boolean) => void }
      | undefined;
    let cancelled = false;
    // lottie-web 一 import 就會碰 document，放到 effect 裡動態載入，避免 SSR 出錯
    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !ref.current) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      anim = lottie.loadAnimation({
        container: ref.current,
        renderer: "svg",
        loop: true,
        autoplay: !reduce,
        animationData: splashAnimation,
      });
      // 系統開啟「減少動態效果」時停在第一格，不旋轉
      if (reduce) anim.goToAndStop(0, true);
    });
    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{ width: LOTTIE_SIZE, height: LOTTIE_SIZE }}
    />
  );
}

export default function Splash({ leaving }: { leaving: boolean }) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
  }, []);

  if (!frame) return null;

  // 底色跟首頁同一片深靛藍到紫的漸層，光團不移到首頁（logo 不從中間跑到定位），
  // 原地稍微放大、淡掉，底色跟著淡出接上首頁
  return createPortal(
    <div aria-hidden className="absolute inset-0 z-[80]">
      <div
        className="absolute inset-0"
        style={{
          background: GLOW_BG,
          opacity: leaving ? 0 : 1,
          transition: "opacity 600ms ease 150ms",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          style={{
            opacity: leaving ? 0 : 1,
            transform: leaving ? "scale(1.12)" : "scale(1)",
            transition: "opacity 450ms ease, transform 600ms ease",
          }}
        >
          <SplashLottie className="splash-in" />
        </div>
      </div>
    </div>,
    frame,
  );
}
