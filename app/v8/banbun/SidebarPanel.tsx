import Link from "next/link";
import StatusBar from "../_components/StatusBar";
import { SERVICE_POOL } from "../_lib/services";

type SidebarPanelProps = {
  onAccount: () => void;
  onBackToHome: () => void;
};

// 側邊欄現在是水平輪播的最左格，不再是覆蓋整頁的抽屜——
// v8 沒有對話紀錄、也沒有「開新對話」（永遠接續同一段對話）。
// 智能選酒/線上藏酒等功能直接列在這裡，不用多繞一層「賺回饋」頁；
// 訂單紀錄收進帳號頁裡（帳號頁本來就有「歷史交易紀錄」入口），這裡不重複放。
export default function SidebarPanel({
  onAccount,
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

      <div className="no-scrollbar flex-1 overflow-y-auto px-4">
        {SERVICE_POOL.map((s) =>
          s.disabled ? (
            <div
              key={s.key}
              className="flex items-center gap-3 py-3 text-left opacity-50"
            >
              <span className="text-[20px] grayscale">{s.emoji}</span>
              <p className="flex-1 text-[16px] font-medium text-gray-500">
                {s.label}
              </p>
              <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                敬請期待
              </span>
            </div>
          ) : (
            <Link
              key={s.key}
              href={s.href}
              className="flex items-center gap-3 py-3 text-left"
            >
              <span className="text-[20px]">{s.emoji}</span>
              <p className="text-[16px] font-medium text-gray-800">
                {s.label}
              </p>
            </Link>
          ),
        )}
      </div>

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
