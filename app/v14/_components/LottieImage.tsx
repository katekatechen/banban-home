"use client";

import { useEffect, useRef } from "react";

// 用 Lottie 動畫取代商品圖：跟 object-cover 一樣填滿容器、置中裁切，無限循環。
// 動畫檔放在 public，用路徑載入，不打包進 JS。
// 系統開啟「減少動態效果」時停在第一格
export default function LottieImage({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let anim:
      | { destroy: () => void; goToAndStop: (v: number, f: boolean) => void }
      | undefined;
    let cancelled = false;
    // lottie-web 一 import 就會碰 document，放到 effect 裡動態載入，避免 SSR 出錯
    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !ref.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      anim = lottie.loadAnimation({
        container: ref.current,
        renderer: "svg",
        loop: true,
        autoplay: !reduce,
        path: src,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
      });
      if (reduce) anim.goToAndStop(0, true);
    });
    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, [src]);
  return <div ref={ref} aria-hidden className={className} />;
}
