"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const TABS = [
  { href: "/v4/banbun", label: "伴伴", icon: "/icons/tab-banbun.svg" },
  { href: "/v4/ai-select", label: "智能選品", icon: "/icons/tab-ai-select.svg" },
  { href: "/v4/experience", label: "體驗", icon: "/icons/tab-experience.svg" },
  { href: "/v4/account", label: "帳號", icon: "/icons/tab-account.svg" },
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
              <Icon
                src={tab.icon}
                className={`size-5 transition-transform ${
                  active ? "scale-110 text-gray-800" : "text-gray-400"
                }`}
              />
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
