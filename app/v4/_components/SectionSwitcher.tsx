type SectionSwitcherProps = {
  active: "ai" | "wine";
  dark?: boolean;
  onSelect: (key: "ai" | "wine") => void;
};

const OPTIONS = [
  { key: "ai", label: "智能選品" },
  { key: "wine", label: "精選酒品" },
] as const;

// 智能選品跟精選酒品合併成一組，tab bar 上不再各佔一格，
// 改用這個切換入口互通；點擊只是切換同一頁裡的左右滑動面板，不會換路由。
export default function SectionSwitcher({ active, dark, onSelect }: SectionSwitcherProps) {
  return (
    <div
      className={`flex items-center gap-1 rounded-full p-1 ${
        dark ? "bg-white/10" : "bg-gray-100"
      }`}
    >
      {OPTIONS.map((o) => {
        const isActive = o.key === active;
        return (
          <button
            key={o.key}
            onClick={() => onSelect(o.key)}
            className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
              isActive
                ? dark
                  ? "bg-white text-gray-900"
                  : "bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                : dark
                  ? "text-white/60"
                  : "text-gray-500"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
