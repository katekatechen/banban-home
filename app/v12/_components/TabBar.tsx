"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 底部 tabbar 回來了（跟 v11 的「上方導覽取代 tabbar」相反），三個分頁都是
// 真正的路由（/v12、/v12/rewards、/v12/exchange），不是同頁面切換 index——
// 每個分頁各自是獨立頁面、可以有自己的捲動狀態，tabbar 本身放在
// (tabs) route group 的 layout 裡，三頁共用同一個常駐元件，不會因為切分頁
// 重新掛載，也不會跟著 usePageSlide 的推頁動畫一起滑動
const TABS = [
  { href: "/v12", label: "AIFIAN", icon: "/figma/v12-tab-home.svg" },
  { href: "/v12/rewards", label: "回饋", icon: "/figma/v12-tab-rewards.svg" },
  { href: "/v12/exchange", label: "兌換", icon: "/figma/v12-tab-exchange.svg" },
] as const;

export default function TabBar() {
  const pathname = usePathname();

  return (
    // pb-[34px] 是照著 Figma 那支手機外框量出來的「home indicator 安全區」，
    // 桌機預覽（sm 以上，外面那圈手機外框）照舊用這個固定值就好；
    // 真的用手機瀏覽器打開時（< sm），瀏覽器自己會佔掉一截高度，
    // 34px 疊上瀏覽器本身的安全區會多墊出一大截空白，改用
    // env(safe-area-inset-bottom) 才是那支手機真正的安全區高度，
    // 跟 StatusBar 處理頂部安全區是同一個邏輯
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[calc(env(safe-area-inset-bottom)+12px)] sm:pb-[34px]">
      <div className="pointer-events-auto flex items-center justify-center rounded-[24px] bg-[rgba(249,250,251,0.9)] p-1 shadow-[0px_4px_60px_0px_rgba(0,0,0,0.12)] backdrop-blur-[1.5px]">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-[20px] px-7 py-1.5 ${
                active ? "bg-[#e5e7eb]" : ""
              }`}
            >
              <img src={tab.icon} alt="" className="size-5" />
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
