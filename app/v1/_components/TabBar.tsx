"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/v1/banbun", label: "伴伴", icon: "🦦" },
  { href: "/v1/wine-select", label: "精選酒品", icon: "🍷" },
  { href: "/v1/ai-select", label: "智能選品", icon: "✨" },
  { href: "/v1/experience", label: "體驗", icon: "🎁" },
  { href: "/v1/account", label: "帳號", icon: "👤" },
] as const;

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+10px)]">
      <nav className="pointer-events-auto flex w-full max-w-[343px] items-stretch justify-between rounded-[24px] bg-white/90 px-2 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.14)] backdrop-blur-md">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-1.5"
            >
              <span
                className={`text-[18px] leading-none transition-transform ${
                  active ? "scale-110" : "opacity-60"
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[10px] leading-none ${
                  active ? "font-semibold text-gray-800" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
