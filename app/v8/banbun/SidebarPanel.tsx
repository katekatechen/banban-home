import Link from "next/link";
import StatusBar from "../_components/StatusBar";
import Icon from "../_components/Icon";
import { SERVICE_POOL } from "../_lib/services";

type SidebarPanelProps = {
  onAccount: () => void;
  onBackToHome: () => void;
};

const ICON_WRAP = "flex size-10 shrink-0 items-center justify-center rounded-full";

// 每個服務配一組專屬的 icon 圓點顏色，呼應首頁建議卡的視覺語言——
// 讓這份清單讀起來是「伴伴的能力」，不是帳號頁那種單色設定列
const ICON_META: Record<string, { iconBg: string; iconColor: string; icon: React.ReactNode }> = {
  "ai-select": {
    iconBg: "bg-red-50",
    iconColor: "text-brand",
    icon: <Icon src="/icons/tab-ai-select.svg" className="size-5" />,
  },
  "wine-select": {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    icon: <Icon src="/icons/tab-wine-select.svg" className="size-5" />,
  },
  "reward-marketplace": {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    icon: <Icon src="/icons/acc-gift.svg" className="size-5" />,
  },
  "rate-forecast": {
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m17 3 4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="m7 21-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  bill: {
    iconBg: "bg-gray-100",
    iconColor: "text-gray-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2h9l3 3v17H6z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  solar: {
    iconBg: "bg-gray-100",
    iconColor: "text-gray-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
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
        <button onClick={onBackToHome} title="回到伴伴">
          <img
            src="/icons/logo-aifian-mark.svg"
            alt="AIFIAN"
            className="h-[51px]"
          />
        </button>
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
            <path d="m6 6 12 12" />
            <path d="m18 6-12 12" />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-2">
        <p className="px-1 pb-0.5 text-[13px] font-medium text-gray-400">
          伴伴能幫你
        </p>
        {SERVICE_POOL.map((s) => {
          const meta = ICON_META[s.key];
          return s.disabled ? (
            <div
              key={s.key}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-3.5 text-left"
            >
              <div className={`${ICON_WRAP} ${meta.iconBg} ${meta.iconColor}`}>
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-gray-400">
                  {s.label}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[13px] text-gray-400">
                  {s.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                敬請期待
              </span>
            </div>
          ) : (
            <Link
              key={s.key}
              href={s.href}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-000 px-4 py-3.5 text-left transition-transform active:scale-[0.98]"
            >
              <div className={`${ICON_WRAP} ${meta.iconBg} ${meta.iconColor}`}>
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-gray-800">
                  {s.label}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[13px] text-gray-500">
                  {s.description}
                </p>
              </div>
              <img
                src="/icons/acc-nav-arrow-right.svg"
                alt=""
                className="size-5 shrink-0"
              />
            </Link>
          );
        })}
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
