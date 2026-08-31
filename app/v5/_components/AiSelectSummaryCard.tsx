import Link from "next/link";
import { HOLDINGS } from "../_lib/mock-data";

// 智能選品的持有摘要，做成一張深色卡片放在酒藏頁最上面，
// 下面直接接精選單品的貨架，讓「賺回饋」跟「撐場的實體酒」同框出現。
export default function AiSelectSummaryCard() {
  const preview = HOLDINGS[1] ?? HOLDINGS[0];

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-gray-900 p-4 text-white">
      <Link href="/v5/collection" className="block">
        <p className="text-[13px] text-gray-400">我的酒窖</p>
        <p className="mt-1 text-[28px] font-bold leading-none">
          {preview.qty} 瓶
        </p>
        <p className="mt-1 text-[14px] text-gray-400">
          ${preview.currentValue.toLocaleString()}
        </p>
      </Link>

      <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
        <p className="text-[13px] text-gray-300">今天收到回饋</p>
        <p className="text-[22px] font-bold text-brand">+0.22</p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/v5/collection/${preview.id}`}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border border-brand px-4 py-2.5 text-brand"
        >
          <span className="text-[13px] font-semibold">賣出</span>
          <span className="text-[11px]">可賣出：{preview.qty} 瓶</span>
        </Link>
        <a
          href="#picks-shelf"
          className="flex flex-[1.4] flex-col items-center justify-center rounded-xl bg-brand py-2.5 text-white"
        >
          <span className="text-[14px] font-semibold">買入</span>
          <span className="text-[11px] text-white/80">NT$ 900 /瓶</span>
        </a>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-gray-300">交易紀錄</p>
          <Link href="/v5/collection" className="text-[12px] text-sky-400">
            查看全部
          </Link>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2 text-[12px] text-gray-300">
          進行中
        </div>
      </div>
    </div>
  );
}
