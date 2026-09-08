export default function AppShell({ children }: { children: React.ReactNode }) {
  // tab bar 現在畫在 /v9/banbun 這個殼頁自己裡面（跟三格 carousel 疊在一起），
  // 其餘功能頁（智能選酒、訂單詳情…）都是全螢幕的 push 頁面，各自管理內部捲動。
  return <div className="flex flex-1 flex-col overflow-hidden">{children}</div>;
}
