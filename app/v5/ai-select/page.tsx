import Link from "next/link";
import StatusBar from "../_components/StatusBar";
import { HOLDINGS } from "../_lib/mock-data";

export default function AiSelectPage() {
  const preview = HOLDINGS[1] ?? HOLDINGS[0];

  return (
    <div className="flex min-h-full flex-col bg-gray-900 text-white">
      <StatusBar dark />
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <p className="text-[20px] font-bold">智能藏酒</p>
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
          <img src="/icons/nav-reward.svg" alt="" className="size-4" />
          <span className="text-[14px] font-medium">999,999</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
        <Link href="/v5/collection" className="block">
          <p className="text-[14px] text-gray-400">我的酒窖</p>
          <p className="mt-1 text-[32px] font-bold leading-none">
            {preview.qty} 瓶
          </p>
          <p className="mt-1 text-[15px] text-gray-400">
            ${preview.currentValue.toLocaleString()}
          </p>
        </Link>

        <div className="relative flex h-[220px] items-center justify-center">
          <span className="text-[140px] opacity-15">🔺</span>
          <div className="absolute bottom-0 flex flex-col items-center gap-1">
            <p className="text-[13px] text-gray-400">今天收到回饋</p>
            <p className="text-[36px] font-bold text-brand">+0.22</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold">交易紀錄</p>
          <Link href="/v5/collection" className="text-[13px] text-sky-400">
            查看全部
          </Link>
        </div>
        <div className="rounded-xl bg-white/5 px-3 py-2.5 text-[13px] text-gray-300">
          進行中
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 px-4 pb-4 pt-2">
        <Link
          href={`/v5/collection/${preview.id}`}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl border border-brand px-4 py-2.5 text-brand"
        >
          <span className="text-[13px] font-semibold">賣出</span>
          <span className="text-[11px]">可賣出：{preview.qty} 瓶</span>
        </Link>
        <Link
          href="/v5/wine-select"
          className="flex flex-[1.4] flex-col items-center justify-center rounded-2xl bg-brand py-2.5 text-white"
        >
          <span className="text-[14px] font-semibold">買入</span>
          <span className="text-[11px] text-white/80">NT$ 900 /瓶</span>
        </Link>
      </div>
    </div>
  );
}
