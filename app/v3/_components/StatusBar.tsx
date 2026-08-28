type StatusBarProps = {
  dark?: boolean;
};

export default function StatusBar({ dark = false }: StatusBarProps) {
  const color = dark ? "text-white" : "text-gray-800";
  return (
    <div
      className={`flex h-11 w-full shrink-0 items-center justify-between px-5 pt-1 text-[15px] font-semibold ${color}`}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.8" fill="currentColor" />
          <rect x="5" y="5" width="3" height="7" rx="0.8" fill="currentColor" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" fill="currentColor" />
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 10.5a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"
            fill="currentColor"
          />
          <path
            d="M4.8 7.2a4.6 4.6 0 0 1 6.4 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M2.2 4.4a8.4 8.4 0 0 1 11.6 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.75"
            y="0.75"
            width="20.5"
            height="10.5"
            rx="2.5"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2.5" y="2.5" width="17" height="7" rx="1.5" fill="currentColor" />
          <rect x="22" y="4" width="1.6" height="4" rx="0.8" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
