import StatusBar from "../_components/StatusBar";

type SidebarPanelProps = {
  onAccount: () => void;
  onOrders: () => void;
  onBackToHome: () => void;
};

// 側邊欄現在是水平輪播的最左格，不再是覆蓋整頁的抽屜——
// v8 沒有對話紀錄、也沒有「開新對話」（永遠接續同一段對話），
// 只放訂單紀錄跟帳號設定。
export default function SidebarPanel({
  onAccount,
  onOrders,
  onBackToHome,
}: SidebarPanelProps) {
  return (
    <div className="relative flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <img src="/icons/logo-aifian-mark.svg" alt="AIFIAN" className="h-11" />
        <button
          onClick={onBackToHome}
          title="回到伴伴"
          className="flex size-9 items-center justify-center rounded-full border border-gray-100 bg-gray-000 text-gray-800"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col px-4">
        <button
          onClick={onOrders}
          className="flex items-center gap-3 py-3 text-left"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-gray-800"
          >
            <path d="m21 8.5-9-4.5-9 4.5v8l9 4.5 9-4.5Z" />
            <path d="m3 8.5 9 4.5 9-4.5" />
            <path d="M12 13v8" />
          </svg>
          <p className="text-[16px] font-medium text-gray-800">訂單紀錄</p>
        </button>
      </div>

      <div className="flex-1" />

      <button
        onClick={onAccount}
        className="flex shrink-0 items-center gap-3 border-t border-gray-100 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 text-left"
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-[17px]">
          🧑
        </div>
        <p className="flex-1 text-[15px] font-medium text-gray-800">Ben</p>
        <img src="/icons/acc-settings.svg" alt="" className="size-5" />
      </button>
    </div>
  );
}
