"use client";

import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import {
  REWARD_BALANCE,
  REWARD_BALANCE_DECIMAL,
  REWARD_HISTORY,
  TODAY_REWARD_RATE_PCT,
  TOTAL_ACCUMULATED_REWARD,
  type RewardTxn,
} from "../_lib/mock-data";
import { usePageSlide } from "../_lib/page-transition";

function TxnIcon({ icon }: { icon: RewardTxn["icon"] }) {
  if (icon === "wallet") {
    return <img src="/figma/icon-wallet.svg" alt="" className="size-5" />;
  }
  if (icon === "undo") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="size-5 text-gray-700">
        <path
          d="M4 8h9a4 4 0 0 1 0 8h-3M4 8l4-4M4 8l4 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (icon === "exchange") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="size-5 text-gray-700">
        <path
          d="M4 7h11M12 4l3 3-3 3M16 13H5M8 16l-3-3 3-3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // 預設：一般正向回饋入帳，跟首頁回饋藥丸同一款「圈起來的上箭頭」圖示
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5 text-gray-700">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10 13V7M10 7L7 10M10 7l3 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RewardHistoryPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white" style={style}>
      <StatusBar />
      <div className="relative flex shrink-0 items-center justify-center px-4 pb-3 pt-1">
        <button
          onClick={() => exit(() => router.back())}
          aria-label="返回"
          className="absolute left-4 flex size-9 items-center justify-center rounded-full bg-gray-100"
        >
          <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
        </button>
        <p className="text-[15px] font-semibold text-gray-900">回饋</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="flex flex-col items-center gap-1 pb-5 pt-2">
          <p className="flex items-end gap-1">
            <span className="flex items-center gap-1.5 text-[32px] font-bold text-gray-900">
              <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
                <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                  <path
                    d="M8 12.5V3.5M8 3.5L4 7.5M8 3.5l4 4"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {REWARD_BALANCE.toLocaleString()}
            </span>
            <span className="pb-1 text-[16px] text-gray-400">
              .{REWARD_BALANCE_DECIMAL}
            </span>
          </p>
          <p className="text-[12.5px] text-gray-400">
            ≈ ${REWARD_BALANCE.toLocaleString()} TWD
          </p>
        </div>

        <div className="flex shrink-0 divide-x divide-gray-100 border-y border-gray-100 py-4">
          <div className="flex-1 text-center">
            <p className="text-[12px] text-gray-400">今日回饋率</p>
            <p className="mt-1 text-[16px] font-bold text-gray-900">
              {TODAY_REWARD_RATE_PCT}%
            </p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[12px] text-gray-400">總累積回饋</p>
            <p className="mt-1 text-[16px] font-bold text-gray-900">
              {TOTAL_ACCUMULATED_REWARD.toLocaleString()}
            </p>
          </div>
        </div>

        <button className="flex w-full items-center gap-3 border-b border-gray-100 px-5 py-4 text-left">
          <img src="/figma/bell.svg" alt="" className="size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-gray-800">
              交易處理中
            </p>
            <p className="text-[12px] text-gray-400">
              含轉出申請、訂單折抵的回饋
            </p>
          </div>
          <svg viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 text-gray-300">
            <path
              d="M6 3.5L10.5 8L6 12.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {REWARD_HISTORY.map((group) => (
          <div key={group.month}>
            <p className="px-5 pb-1 pt-4 text-[12.5px] font-medium text-gray-400">
              {group.month}
            </p>
            <div className="flex flex-col divide-y divide-gray-100">
              {group.items.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center">
                    <TxnIcon icon={txn.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-gray-800">{txn.label}</p>
                    <p className="mt-0.5 text-[11.5px] text-gray-400">
                      {txn.time}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-[14px] font-semibold ${
                      txn.amount > 0
                        ? "text-brand"
                        : txn.amount < 0
                          ? "text-gray-800"
                          : "text-gray-300"
                    }`}
                  >
                    {txn.amount > 0 ? "+" : ""}
                    {txn.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
