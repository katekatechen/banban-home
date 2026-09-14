"use client";

export type TabKey = "banbun" | "rewards" | "account";

type TabDef = {
  key: TabKey;
  label: string;
  icon: string;
  iconActive?: string;
};

// 伴伴／帳號兩個圖示在 Figma 裡 active／inactive 是同一份 SVG（顏色、線條都一樣，
// 差異只在外層有沒有白色底），只有回饋圖示 active／inactive 真的是不同畫法。
const TABS: TabDef[] = [
  { key: "banbun", label: "伴伴", icon: "/figma/tab-banbun-active.svg" },
  {
    key: "rewards",
    label: "回饋",
    icon: "/figma/tab-rewards-inactive.svg",
    iconActive: "/figma/tab-rewards-active.svg",
  },
  { key: "account", label: "帳號", icon: "/figma/tab-account-inactive.svg" },
];

type TabBarProps = {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
};

// 分頁不再是各自獨立的路由（網址一律停在 /v10/banbun），單純是同一頁裡
// 三格水平 carousel 的捲動位置，所以用 active/onSelect 控制，不用 usePathname。
// 版型照 Figma 的 tabbar 元件還原：外層是一層很淺的模糊底，裡面是一顆藥丸，
// 選中的分頁靠白色底區隔，不是靠顏色變淡——文字顏色不管選不選中都一樣深。
export default function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center justify-center bg-[rgba(255,255,255,0.05)] pb-[34px] backdrop-blur-[1.5px]">
      <nav className="pointer-events-auto flex items-center justify-center overflow-clip rounded-[24px] bg-[rgba(249,250,251,0.9)] px-1 py-0.5 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.12)]">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const src = isActive && tab.iconActive ? tab.iconActive : tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onSelect(tab.key)}
              className={`flex items-center justify-center rounded-[20px] px-[28px] ${
                isActive ? "bg-white py-[7px]" : "py-[9px]"
              }`}
            >
              <span className="flex flex-col items-center gap-[6px]">
                <img src={src} alt="" className="size-5" />
                <span
                  className={`text-[10px] leading-[11px] text-gray-800 ${
                    isActive ? "font-semibold" : "font-normal"
                  }`}
                >
                  {tab.label}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
