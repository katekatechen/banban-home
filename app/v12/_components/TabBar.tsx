"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EASING } from "../_lib/page-transition";

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

const INDICATOR_TRANSITION_MS = 220;

export default function TabBar() {
  const pathname = usePathname();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(
    null,
  );

  const activeIndex = TABS.findIndex((tab) => tab.href === pathname);

  // 灰底的選中背景改用一顆獨立的指示器量出當前分頁按鈕的實際位置／寬度
  // 再滑過去，不是每顆按鈕各自切換背景色——這樣切分頁時背景是「滑」過去，
  // 不是瞬間跳到下一顆按鈕上
  useEffect(() => {
    const el = tabRefs.current[activeIndex];
    if (!el) return;
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeIndex]);

  return (
    // pb-[34px] 是照著 Figma 那支手機外框量出來的「home indicator 安全區」，
    // 桌機預覽（sm 以上，外面那圈手機外框）照舊用這個固定值就好；
    // 真的用手機瀏覽器打開時（< sm），瀏覽器自己會佔掉一截高度，
    // 34px 疊上瀏覽器本身的安全區會多墊出一大截空白，改用
    // env(safe-area-inset-bottom) 才是那支手機真正的安全區高度，
    // 跟 StatusBar 處理頂部安全區是同一個邏輯
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[calc(env(safe-area-inset-bottom)+12px)] sm:pb-[34px]">
      <div className="pointer-events-auto relative flex items-center justify-center rounded-[24px] bg-[rgba(249,250,251,0.9)] p-1 shadow-[0px_4px_60px_0px_rgba(0,0,0,0.12)] backdrop-blur-[1.5px]">
        {indicator && (
          <div
            className="absolute top-1 bottom-1 rounded-[20px] bg-[#e5e7eb]"
            style={{
              left: indicator.left,
              width: indicator.width,
              transition: `left ${INDICATOR_TRANSITION_MS}ms ${EASING}, width ${INDICATOR_TRANSITION_MS}ms ${EASING}`,
            }}
          />
        )}
        {TABS.map((tab, i) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-1.5 rounded-[20px] px-7 py-1.5"
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
