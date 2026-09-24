"use client";

import { useEffect, useState } from "react";

// v11 沒有 tabbar，頁面之間全部是 push/pop 關係，統一用同一套滑動轉場。
//
// 一開始用的是 CSS `animation` shorthand 當 inline style 直接套在掛載時的
// 根節點上（跟 v10 的 pageIn/pageOut keyframes 同一招）。實測發現這招不夠
// 穩：`animation` 在「掛載那一瞬間就套用」跟「稍晚才套用」之間的瞬間差異，
// 不同瀏覽器/情境的處理不完全一致，導致有時候動畫沒有真的播出來，畫面
// 直接跳到最終位置。改成更穩的兩段式做法：第一次 render 先同步定住在
// 「畫面外」，等瀏覽器真的畫完第一幀後（用 requestAnimationFrame），
// 才把 state 切到「就位」，靠 CSS transition（不是 animation）在這兩個
// 已經確實提交過的樣式之間補動畫——transition 的觸發時機沒有這種模稜兩可，
// 這是 React 裡做進場動畫最穩的寫法。
export const PAGE_TRANSITION_MS = 280;
const EASING = "cubic-bezier(0.2, 0.9, 0.25, 1)";

type Phase = "entering" | "resting" | "exiting";

export function usePageSlide() {
  const [phase, setPhase] = useState<Phase>("entering");

  useEffect(() => {
    // 兩層 rAF：第一層只是確保上一次 commit 真的畫出來了，
    // 第二層才切換 state，避免瀏覽器把兩次改動合併成一次、動畫被跳過
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase("resting"));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  const exit = (onDone: () => void) => {
    setPhase("exiting");
    setTimeout(onDone, PAGE_TRANSITION_MS);
  };

  const style: React.CSSProperties = {
    transform: phase === "resting" ? "translateX(0)" : "translateX(100%)",
    transition:
      phase === "entering"
        ? "none"
        : `transform ${PAGE_TRANSITION_MS}ms ${EASING}`,
  };

  return { style, exit };
}
