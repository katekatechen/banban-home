import StatusBar from "../_components/StatusBar";
import MenuButton from "../_components/MenuButton";

const UPCOMING = [
  { name: "Ricoh GR III 相機", emoji: "📷", diff: "1,200", gradient: "from-gray-700 to-gray-900" },
  { name: "斑比跳跳頂級豪華露營", emoji: "🏕️", diff: "3,400", gradient: "from-emerald-700 to-emerald-950" },
];

export default function ExperiencePage() {
  return (
    <div className="flex flex-col bg-white">
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <MenuButton className="text-gray-800" />
        <p className="text-[20px] font-bold text-gray-800">體驗</p>
        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
          <img src="/icons/nav-reward.svg" alt="" className="size-4" />
          <span className="text-[14px] font-medium text-gray-800">
            999,999
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 pb-8 pt-2">
        <div>
          <p className="mb-2 text-[16px] font-semibold text-gray-800">
            最新願望
          </p>
          <div
            className="relative flex h-[150px] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-4 text-white"
          >
            <span className="absolute right-3 top-3 text-[40px] opacity-40">
              🥽
            </span>
            <p className="text-[15px] font-bold">Apple Vision Pro</p>
            <p className="text-[12px] text-white/80">
              現實與虛擬完美融合的新體驗
            </p>
            <p className="mt-2 text-[12px] font-semibold text-brand">
              中獎價 {"{{ value }}"}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[16px] font-semibold text-gray-800">
            即將實現
          </p>
          <div className="grid grid-cols-2 gap-3">
            {UPCOMING.map((u) => (
              <div key={u.name} className="flex flex-col gap-1.5">
                <div
                  className={`relative flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br text-[40px] ${u.gradient}`}
                >
                  <span className="absolute left-2 top-2 rounded-lg bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
                    差 {u.diff}
                  </span>
                  {u.emoji}
                </div>
                <p className="text-[13px] text-gray-700">{u.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[16px] font-semibold text-gray-800">
            回饋任務
          </p>
          <div className="flex flex-col gap-3 rounded-2xl bg-gray-000 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-gray-800">
                匯率預測
              </p>
              <span className="text-[22px]">💱</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-gray-500">本期累積獎金</p>
                <p className="text-[22px] font-bold text-gray-800">10,000</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-gray-500">我的號碼</p>
                <p className="text-[14px] text-gray-400">尚未預測</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
