export default function AppShell({ children }: { children: React.ReactNode }) {
  // v6 沒有 tab bar：伴伴是唯一常駐入口，其他功能都是首頁預覽卡片的「看更多」
  // 目的地，所以每一頁都自己管理內部捲動（跟原本 fullScreen 頁面一致）。
  return <div className="flex flex-1 flex-col overflow-hidden">{children}</div>;
}
