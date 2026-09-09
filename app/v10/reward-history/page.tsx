import StatusBar from "../_components/StatusBar";
import BackButton from "../_components/BackButton";
import {
  REWARD_BALANCE,
  TODAY_REWARD_RATE_PCT,
  TOTAL_ACCUMULATED_REWARD,
} from "../_lib/mock-data";

// 每日回饋紀錄，數字圍繞 TODAY_REWARD_AMOUNT 上下小幅波動，模擬真實累積的樣子
const HISTORY = [
  { date: "2026/09/08", time: "08:02", amount: 451.1 },
  { date: "2026/09/07", time: "08:01", amount: 447.8 },
  { date: "2026/09/06", time: "08:01", amount: 449.6 },
  { date: "2026/09/05", time: "08:02", amount: 452.3 },
  { date: "2026/09/04", time: "08:02", amount: 448.9 },
  { date: "2026/09/03", time: "08:02", amount: 450.4 },
  { date: "2026/09/02", time: "08:01", amount: 446.5 },
  { date: "2026/09/01", time: "08:02", amount: 451.7 },
];

export default function RewardHistoryPage() {
  return (
    <div
      className="no-scrollbar flex h-full flex-col overflow-y-auto bg-white"
      data-page-root
      style={{ animation: "pageIn 0.28s cubic-bezier(.2,.9,.25,1)" }}
    >
      <StatusBar />
      <div className="flex items-center px-2 pb-2 pt-1">
        <BackButton />
        <p className="flex-1 text-center text-[17px] font-semibold text-gray-800">
          回饋
        </p>
        <span className="size-8" />
      </div>

      <div className="flex flex-col items-center px-4 pb-5 pt-2">
        <div className="flex items-baseline gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </span>
          <span className="text-[34px] font-black leading-none tracking-tight text-gray-800">
            {Math.floor(REWARD_BALANCE).toLocaleString()}
          </span>
          <span className="text-[20px] font-bold leading-none text-gray-300">
            .{(REWARD_BALANCE % 1).toFixed(2).slice(2)}
          </span>
        </div>

        <div className="mt-5 flex w-full items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[12px] text-gray-400">今日回饋率</p>
            <p className="text-[15px] font-bold text-gray-800">
              {TODAY_REWARD_RATE_PCT}%
            </p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="flex flex-col items-center gap-1">
            <p className="text-[12px] text-gray-400">總累積回饋</p>
            <p className="text-[15px] font-bold text-gray-800">
              {TOTAL_ACCUMULATED_REWARD.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gray-100" />

      <div className="px-4 pb-2 pt-4">
        <p className="text-[13px] text-gray-400">2026.09</p>
      </div>

      <div className="flex flex-col divide-y divide-gray-100 px-4">
        {HISTORY.map((h, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-800">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-semibold text-gray-800">
                每日回饋
              </p>
              <p className="text-[12px] text-gray-400">
                {h.date} {h.time}
              </p>
            </div>
            <p className="text-[15px] font-bold text-brand">
              {h.amount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
