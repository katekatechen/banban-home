"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EASING } from "../_lib/page-transition";

// v13 tabbar 改成四格（聊天／回饋／兌換／帳號），照 Figma 948:44415。
// 四個分頁都是 (tabs) route group 底下的真路由，tabbar 本身放在 layout 裡
// 常駐，不會因為切分頁重新掛載。
// 跟 v12 不同：膠囊永遠撐滿寬度、四格平均分配，不再有「首頁撐滿／其他頁
// 內縮」兩種寬度，所以灰底指示器不用量按鈕位置，直接用 25% 的格寬平移
const TABS = [
  {
    href: "/v13",
    label: "聊天",
    icon: "/figma/v13-tab-chat-inactive.svg",
    activeIcon: "/figma/v13-tab-chat-active.svg",
  },
  {
    href: "/v13/rewards",
    label: "回饋",
    icon: "/figma/v13-tab-rewards-inactive.svg",
    activeIcon: "/figma/v13-tab-rewards-active.svg",
  },
  {
    href: "/v13/exchange",
    label: "兌換",
    icon: "/figma/v13-tab-exchange.svg",
    activeIcon: "/figma/v13-tab-exchange.svg",
  },
  {
    href: "/v13/account",
    label: "帳號",
    icon: "/figma/v13-tab-account.svg",
    activeIcon: "/figma/v13-tab-account.svg",
  },
] as const;

const INDICATOR_TRANSITION_MS = 220;

// 已經在聊天分頁時再點一次「聊天」，通知首頁收起對話、回到插圖首頁
export const HOME_RESET_EVENT = "v13:home-reset";

export default function TabBar() {
  const pathname = usePathname();
  const activeIndex = TABS.findIndex((tab) => tab.href === pathname);

  return (
    // 底部安全區：桌機預覽（sm 以上，外面那圈手機外框）照 Figma 用固定 34px；
    // 真手機瀏覽器（< sm）改用 env(safe-area-inset-bottom)，跟 StatusBar
    // 處理頂部安全區是同一個邏輯
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:pb-[34px]">
      <div className="pointer-events-auto relative flex h-[55px] w-full items-center rounded-[24px] bg-white/80 px-[2px] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.1)] backdrop-blur-[1.5px]">
        {activeIndex !== -1 && (
          <div
            className="absolute bottom-[2px] left-[2px] top-[2px] rounded-[24px] bg-gray-100"
            style={{
              width: "calc((100% - 4px) / 4)",
              transform: `translateX(${activeIndex * 100}%)`,
              transition: `transform ${INDICATOR_TRANSITION_MS}ms ${EASING}`,
            }}
          />
        )}
        {TABS.map((tab, i) => {
          const active = i === activeIndex;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => {
                if (active && tab.href === "/v13") {
                  window.dispatchEvent(new Event(HOME_RESET_EVENT));
                }
              }}
              className="relative flex h-full flex-1 flex-col items-center justify-center gap-1.5"
            >
              <img
                src={active ? tab.activeIcon : tab.icon}
                alt=""
                className="h-5 w-auto"
              />
              <span
                className={`text-[10px] leading-[11px] text-gray-800 ${
                  active ? "font-semibold" : "font-normal"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
