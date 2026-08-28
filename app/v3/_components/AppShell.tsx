"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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

  if (fullScreen) {
    // 全螢幕頁面（對話、商品詳情）自己管理內部捲動跟底部固定的 CTA，
    // 這裡不能再套一層 overflow-y-auto，不然會跟頁面內部的捲動打架。
    return <div className="flex flex-1 flex-col overflow-hidden">{children}</div>;
  }

  // 側邊欄取代原本的 tab bar，統一放在 AppShell 這層，讓每個頁面都能打開，
  // 而不用各自管理一份 drawerOpen 狀態。
  const conversations = drawerOpen ? loadConversations() : [];
  const activeId = drawerOpen ? (loadActiveId() ?? undefined) : undefined;

  const go = (href: string) => {
    setDrawerOpen(false);
    router.push(href);
  };

  return (
    <DrawerContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
      <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
        {drawerOpen && (
          <HistoryDrawer
            conversations={conversations}
            activeId={activeId}
            onClose={() => setDrawerOpen(false)}
            onNewChat={() => go("/v3/banbun/chat?new=1")}
            onOpenConversation={(id) => go(`/v3/banbun/chat?open=${id}`)}
            onOrders={() => go("/v3/orders")}
            onBanbun={() => go("/v3/banbun")}
            onWineSelect={() => go("/v3/wine-select")}
            onAiSelect={() => go("/v3/ai-select")}
            onExperience={() => go("/v3/experience")}
            onAccount={() => go("/v3/account")}
          />
        )}

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
