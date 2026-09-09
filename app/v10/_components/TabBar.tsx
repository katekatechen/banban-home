"use client";

import Icon from "./Icon";

export type TabKey = "banbun" | "rewards" | "account";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "banbun", label: "伴伴", icon: "/icons/tab-banbun.svg" },
  { key: "rewards", label: "回饋", icon: "/icons/acc-gift.svg" },
  { key: "account", label: "帳號", icon: "/icons/tab-account.svg" },
];

type TabBarProps = {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
};

// 分頁不再是各自獨立的路由（網址一律停在 /v10/banbun），單純是同一頁裡
// 三格水平 carousel 的捲動位置，所以用 active/onSelect 控制，不用 usePathname。
export default function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+10px)]">
      <nav className="pointer-events-auto flex w-full max-w-[343px] items-stretch justify-between rounded-[24px] bg-white/90 px-2 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.14)] backdrop-blur-md">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => onSelect(tab.key)}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-1.5"
            >
              <Icon
                src={tab.icon}
                className={`size-5 transition-transform ${
                  isActive ? "scale-110 text-gray-800" : "text-gray-400"
                }`}
              />
              <span
                className={`text-[10px] leading-none ${
                  isActive ? "font-semibold text-gray-800" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
