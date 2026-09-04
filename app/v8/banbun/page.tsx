"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SidebarPanel from "./SidebarPanel";
import HomeChat from "./HomeChat";

type Panel = "sidebar" | "home";
const PANEL_INDEX: Record<Panel, number> = { sidebar: 0, home: 1 };
const STORAGE_LAST_PANEL = "banbun-v8-last-panel";

function loadLastPanel(): Panel {
  try {
    const saved = sessionStorage.getItem(STORAGE_LAST_PANEL);
    return saved === "sidebar" ? "sidebar" : "home";
  } catch {
    return "home";
  }
}

export default function BanbunHomePage() {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 一開始定位在「上次離開時的那一格」——如果是從側邊欄的功能項目點進去，
    // 按返回應該回到側邊欄，而不是每次都被拉回伴伴首頁。
    // 直接寫 scrollLeft，不能用 scrollTo({behavior:"instant"})：
    // 部分瀏覽器對 instant 的支援不穩定，會讓這次定位變成看得到的滑動動畫
    const el = scrollerRef.current;
    if (el) el.scrollLeft = el.clientWidth * PANEL_INDEX[loadLastPanel()];
  }, []);

  const scrollToPanel = (panel: Panel) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * PANEL_INDEX[panel], behavior: "smooth" });
  };

  return (
    <div
      ref={scrollerRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        const panel: Panel =
          Math.round(el.scrollLeft / el.clientWidth) === PANEL_INDEX.sidebar
            ? "sidebar"
            : "home";
        try {
          sessionStorage.setItem(STORAGE_LAST_PANEL, panel);
        } catch {
          // ignore
        }
      }}
      // touch-pan-x：只認橫向手勢，垂直手勢交給裡面的內容自己滾動——
      // 沒有這個，橫向 snap carousel 會把垂直捲動手勢也搶走
      className="no-scrollbar flex h-full w-full touch-pan-x snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
    >
      {/* 左格：側邊欄，功能清單 + 帳號設定（v8 沒有對話紀錄，訂單紀錄收進帳號頁） */}
      <div className="h-full w-full shrink-0 snap-center">
        <SidebarPanel
          onBackToHome={() => scrollToPanel("home")}
          onAccount={() => router.push("/v8/account")}
        />
      </div>

      {/* 中格：伴伴首頁，本身就是對話串 */}
      <div className="h-full w-full shrink-0 snap-center">
        <HomeChat onOpenSidebar={() => scrollToPanel("sidebar")} />
      </div>
    </div>
  );
}
