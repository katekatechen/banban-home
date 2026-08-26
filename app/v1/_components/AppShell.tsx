"use client";

import { usePathname } from "next/navigation";
import TabBar from "./TabBar";

const FULLSCREEN_PATTERNS = [
  /^\/v1\/banbun\/chat(\/.*)?$/,
  /^\/v1\/wine-select\/[^/]+$/,
  /^\/v1\/collection\/[^/]+$/,
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullScreen = FULLSCREEN_PATTERNS.some((re) => re.test(pathname));

  if (fullScreen) {
    // 全螢幕頁面（對話、商品詳情）自己管理內部捲動跟底部固定的 CTA，
    // 這裡不能再套一層 overflow-y-auto，不然會跟頁面內部的捲動打架。
    return <div className="flex flex-1 flex-col overflow-hidden">{children}</div>;
  }

  return (
    <>
      <div className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden pb-[104px]">
        {children}
      </div>
      <TabBar />
    </>
  );
}
