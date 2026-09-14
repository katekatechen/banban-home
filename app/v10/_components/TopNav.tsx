import Link from "next/link";
import { NOTIFICATION_COUNT, REWARD_BALANCE } from "../_lib/mock-data";

// 伴伴首頁專用頂部列，照 Figma「首頁」節點（334:8038）還原：
// 左邊 AIFIAN 字標、右邊鈴鐺通知（帶未讀數字）＋回饋數字膠囊。
export default function TopNav() {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-4">
      <img src="/figma/logo.svg" alt="AIFIAN" className="h-6" />
      <div className="flex items-center gap-2">
        <button
          title="通知"
          className="relative flex size-11 items-center justify-center rounded-[22px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/bell.svg" alt="" className="size-5" />
          <span className="absolute right-1.5 top-1 flex items-center justify-center rounded-[20px] bg-brand px-1 py-0.5 text-[12px] font-bold leading-[12px] text-gray-000">
            {NOTIFICATION_COUNT}
          </span>
        </button>
        <Link
          href="/v10/reward-history"
          className="flex items-center gap-1.5 rounded-[22px] bg-white py-1.5 pl-1.5 pr-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/reward-otter.svg" alt="" className="size-7" />
          <span className="text-[16px] font-medium text-gray-800">
            {REWARD_BALANCE.toLocaleString()}
          </span>
        </Link>
      </div>
    </div>
  );
}
