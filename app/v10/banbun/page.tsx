"use client";

import { useEffect, useRef, useState } from "react";
import BanbunPanel from "../_components/BanbunPanel";
import RewardsPanel from "../_components/RewardsPanel";
import AccountPanel from "../_components/AccountPanel";
import TabBar, { type TabKey } from "../_components/TabBar";

const PANEL_INDEX: Record<TabKey, number> = { banbun: 0, rewards: 1, account: 2 };
const PANEL_ORDER: TabKey[] = ["banbun", "rewards", "account"];
const STORAGE_LAST_PANEL = "banbun-v10-last-panel";

function loadLastPanel(): TabKey {
  try {
    const saved = sessionStorage.getItem(STORAGE_LAST_PANEL);
    if (saved === "banbun" || saved === "rewards" || saved === "account") {
      return saved;
    }
  } catch {
    // ignore
  }
  return "banbun";
}

// 網址一律停在 /v10/banbun：三個分頁不是各自獨立的路由，而是同一頁裡
// 水平 carousel 的三格，但只能用 tab bar 點擊切換，不開放手勢滑動——
// overflow-x-hidden 讓使用者滑不動，programmatic scrollTo 仍然可以捲。
// 離開去別的功能頁（智能選酒、訂單詳情…）再按返回時，靠 sessionStorage
// 記住上次停在哪一格，回來能接續原本的分頁，而不是每次都被拉回伴伴首頁。
export default function BanbunShellPage() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<TabKey>("banbun");

  useEffect(() => {
    const el = scrollerRef.current;
    const panel = loadLastPanel();
    if (el) el.scrollLeft = el.clientWidth * PANEL_INDEX[panel];
    setActive(panel);
  }, []);

  const scrollToPanel = (panel: TabKey) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * PANEL_INDEX[panel], behavior: "smooth" });
    setActive(panel);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={scrollerRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const index = Math.round(el.scrollLeft / el.clientWidth);
          const panel = PANEL_ORDER[index] ?? "banbun";
          setActive(panel);
          try {
            sessionStorage.setItem(STORAGE_LAST_PANEL, panel);
          } catch {
            // ignore
          }
        }}
        className="no-scrollbar flex h-full w-full overflow-x-hidden overflow-y-hidden"
      >
        <div className="h-full w-full shrink-0 snap-center">
          <BanbunPanel />
        </div>
        <div className="h-full w-full shrink-0 snap-center">
          <RewardsPanel />
        </div>
        <div className="h-full w-full shrink-0 snap-center">
          <AccountPanel />
        </div>
      </div>

      <TabBar active={active} onSelect={scrollToPanel} />
    </div>
  );
}
