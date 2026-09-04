"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web";

type LottiePlayerProps = {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
};

export default function LottiePlayer({
  src,
  className,
  loop = true,
  autoplay = true,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop,
      autoplay,
      path: src,
    });
    return () => anim.destroy();
  }, [src, loop, autoplay]);

  return <div ref={containerRef} className={className} />;
}
