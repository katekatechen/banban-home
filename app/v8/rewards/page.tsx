import Link from "next/link";
import StatusBar from "../_components/StatusBar";
import BackButton from "../_components/BackButton";
import { SERVICE_POOL } from "../_lib/services";

// 呼應會議討論：回饋是跟「設定」「體驗」同一層級的導覽項目，
// 收在側邊欄裡，點進來就看到所有能賺回饋的方法，不跟首頁的
// 個人化建議混在一起、也不佔用首頁版面。
export default function RewardsPage() {
  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto bg-white">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 pb-2 pt-1">
        <BackButton />
        <p className="text-[20px] font-bold text-gray-800">賺回饋</p>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-8 pt-2">
        {SERVICE_POOL.map((s) =>
          s.disabled ? (
            <div
              key={s.key}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-3.5"
            >
              <span className="text-[24px] opacity-50 grayscale">
                {s.emoji}
              </span>
              <p className="flex-1 text-[15px] font-semibold text-gray-400">
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
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-000 px-4 py-3.5 transition-transform active:scale-[0.98]"
            >
              <span className="text-[24px]">{s.emoji}</span>
              <p className="flex-1 text-[15px] font-semibold text-gray-800">
                {s.label}
              </p>
              <img
                src="/icons/acc-nav-arrow-right.svg"
                alt=""
                className="size-5"
              />
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
