"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HistoryDrawer from "./HistoryDrawer";
import { DrawerContext } from "./DrawerContext";
import { loadConversations, loadActiveId } from "../_lib/chat-storage";

const FULLSCREEN_PATTERNS = [
  /^\/v3\/banbun\/chat(\/.*)?$/,
  /^\/v3\/wine-select\/[^/]+$/,
  /^\/v3\/collection\/[^/]+$/,
  /^\/v3\/checkout$/,
  /^\/v3\/orders$/,
  /^\/v3\/orders\/[^/]+$/,
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const fullScreen = FULLSCREEN_PATTERNS.some((re) => re.test(pathname));
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 記著「正在切去哪個路徑」：等新頁面的 pathname 真的到了才關側欄，
  // 不然側欄關閉的當下 {children} 還是舊頁面，會先閃一下舊頁面才跳新頁面。
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // 側邊欄取代原本的 tab bar，統一放在 AppShell 這層，讓每個頁面（包含全螢幕頁面，
  // 例如對話中點「返回」）都能打開，而不用各自管理一份 drawerOpen 狀態。
  const conversations = drawerOpen ? loadConversations() : [];
  const activeId = drawerOpen ? (loadActiveId() ?? undefined) : undefined;

  const go = (href: string) => {
    const targetPathname = href.split("?")[0];
    router.push(href);
    if (targetPathname === pathname) {
      // 同一個 pathname（例如對話裡切另一個 query），沒有整頁替換的問題，直接關
      setDrawerOpen(false);
    } else {
      setNavigatingTo(targetPathname);
    }
  };

  useEffect(() => {
    if (navigatingTo && pathname === navigatingTo) {
      setDrawerOpen(false);
      setNavigatingTo(null);
    }
  }, [pathname, navigatingTo]);

  const drawer = drawerOpen && (
    <HistoryDrawer
      conversations={conversations}
      activeId={activeId}
      onClose={() => setDrawerOpen(false)}
      onNewChat={() => go("/v3/banbun/chat?new=1")}
      onOpenConversation={(id) => go(`/v3/banbun/chat?open=${id}`)}
      onBanbun={() => go("/v3/banbun")}
      onWineSelect={() => go("/v3/wine-select")}
      onAiSelect={() => go("/v3/ai-select")}
      onExperience={() => go("/v3/experience")}
      onAccount={() => go("/v3/account")}
    />
  );

  if (fullScreen) {
    // 全螢幕頁面（對話、商品詳情）自己管理內部捲動跟底部固定的 CTA，
    // 這裡不能再套一層 overflow-y-auto，不然會跟頁面內部的捲動打架。
    return (
      <DrawerContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {drawer}
          {children}
        </div>
      </DrawerContext.Provider>
    );
  }

  return (
    <DrawerContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
      <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
        {drawer}

        <div
          className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-white transition-transform duration-300 ease-out"
          style={{ transform: drawerOpen ? "translateX(100%)" : "translateX(0)" }}
        >
          {children}
        </div>
      </div>
    </DrawerContext.Provider>
  );
}
