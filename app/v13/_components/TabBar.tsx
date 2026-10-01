"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EASING } from "../_lib/page-transition";

// 底部 tabbar 回來了（跟 v11 的「上方導覽取代 tabbar」相反），三個分頁都是
// 真正的路由（/v13、/v13/rewards、/v13/exchange），不是同頁面切換 index——
// 每個分頁各自是獨立頁面、可以有自己的捲動狀態，tabbar 本身放在
// (tabs) route group 的 layout 裡，三頁共用同一個常駐元件，不會因為切分頁
// 重新掛載，也不會跟著 usePageSlide 的推頁動畫一起滑動
const TABS = [
  { href: "/v13", label: "AIFIAN", icon: "/figma/v12-tab-home.svg" },
  { href: "/v13/rewards", label: "回饋", icon: "/figma/v12-tab-rewards.svg" },
  { href: "/v13/exchange", label: "兌換", icon: "/figma/v12-tab-exchange.svg" },
] as const;

const INDICATOR_TRANSITION_MS = 220;
const WIDTH_TRANSITION_MS = 300;

export default function TabBar() {
  const pathname = usePathname();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const compactRef = useRef<HTMLDivElement>(null);
  const wasHomeRef = useRef<boolean | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(
    null,
  );
  const [compactWidth, setCompactWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const activeIndex = TABS.findIndex((tab) => tab.href === pathname);
  // AIFIAN 首頁沒有其他內容跟 tabbar 爭版面，比照首頁輸入框的寬度
  // （px-4，左右各 16px）撐滿；回饋／兌換兩頁維持原本內縮的膠囊寬度
  const isHome = pathname === "/v13";

  // 寬度真的在變的這段期間，兩種狀態都先用「平均分配」排版，等動畫播完
  // 才切回內縮模式自己 hug 內容的排版——不然內縮排版在寬度還沒收攏完之前
  // 就已經 hug 好自己的內容，容器右側會先空出一截，等寬度動畫追上來才
  // 補滿，看起來像「先跳、才滑」而不是單純滑動
  useEffect(() => {
    if (wasHomeRef.current === null) {
      wasHomeRef.current = isHome;
      return;
    }
    if (wasHomeRef.current === isHome) return;
    wasHomeRef.current = isHome;
    setIsResizing(true);
    const t = setTimeout(() => setIsResizing(false), WIDTH_TRANSITION_MS);
    return () => clearTimeout(t);
  }, [isHome]);

  const useFillLayout = isHome || isResizing;

  // 灰底的選中背景改用一顆獨立的指示器量出當前分頁按鈕的實際位置／寬度
  // 再滑過去，不是每顆按鈕各自切換背景色。沒有寬度變化的一般切換
  // （例如回饋<->兌換）：量一次、套自己的 CSS transition 滑過去就好，
  // 按鈕位置在動畫期間是固定的
  useEffect(() => {
    if (isResizing) return;
    const el = tabRefs.current[activeIndex];
    if (!el) return;
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeIndex, isResizing]);

  // 寬度真的在變的這段期間（例如首頁<->其他頁），按鈕本身的位置每一幀
  // 都跟著容器寬度動畫在移動——量一次舊座標、再套 220ms 的 transition
  // 去追，會追不上還在動的按鈕，指示器看起來像亂跑。改成這段期間每一幀
  // 都重新量、不套自己的 transition，直接貼著按鈕的即時位置，動畫感完全
  // 靠容器寬度本身的過渡撐出來
  // 用 useLayoutEffect 不是 useEffect：後者要等瀏覽器畫完當前這一幀才會跑，
  // 這段期間指示器還停在切換前的舊位置，會多閃一幀錯的畫面；
  // useLayoutEffect 在瀏覽器真的畫出來之前就同步跑完，第一次量測才趕得上
  // 這一幀，不會有那個閃現
  useLayoutEffect(() => {
    if (!isResizing) return;
    let raf = 0;
    const tick = () => {
      const el = tabRefs.current[activeIndex];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [isResizing, activeIndex]);

  // 內縮膠囊的「自然寬度」（三顆按鈕各自 hug 自己的內容）沒辦法用 CSS
  // 直接跟 calc(100% - 32px) 之間做 transition——寬度要嘛是具體數字、
  // 要嘛是 auto，auto 沒辦法補動畫。這裡用一顆看不到、永遠用內縮排版
  // 的分身量出那個具體寬度，兩種寬度都變成確定的數字，才能讓瀏覽器
  // 在兩個數字之間平滑過渡
  useEffect(() => {
    const el = compactRef.current;
    if (!el) return;
    setCompactWidth(el.offsetWidth);
  }, []);

  const pillWidth = isHome
    ? "calc(100% - 32px)"
    : compactWidth != null
      ? `${compactWidth}px`
      : "auto";

  return (
    // pb-[34px] 是照著 Figma 那支手機外框量出來的「home indicator 安全區」，
    // 桌機預覽（sm 以上，外面那圈手機外框）照舊用這個固定值就好；
    // 真的用手機瀏覽器打開時（< sm），瀏覽器自己會佔掉一截高度，
    // 34px 疊上瀏覽器本身的安全區會多墊出一大截空白，改用
    // env(safe-area-inset-bottom) 才是那支手機真正的安全區高度，
    // 跟 StatusBar 處理頂部安全區是同一個邏輯
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[calc(env(safe-area-inset-bottom)+12px)] sm:pb-[34px]">
      {/* 看不到的內縮排版分身，純粹拿來量「自然寬度」是多少 */}
      <div
        ref={compactRef}
        aria-hidden
        className="pointer-events-none invisible absolute flex items-center rounded-[24px] p-1"
      >
        {TABS.map((tab) => (
          <div
            key={tab.href}
            className="flex flex-col items-center justify-center gap-1.5 rounded-[20px] px-7 py-1.5"
          >
            <img src={tab.icon} alt="" className="size-5" />
            <span className="text-[10px] leading-[11px]">{tab.label}</span>
          </div>
        ))}
      </div>

      <div
        className="pointer-events-auto relative flex items-center rounded-[24px] bg-[rgba(249,250,251,0.9)] p-1 shadow-[0px_4px_60px_0px_rgba(0,0,0,0.12)] backdrop-blur-[1.5px]"
        style={{
          width: pillWidth,
          transition:
            compactWidth != null ? `width ${WIDTH_TRANSITION_MS}ms ${EASING}` : "none",
        }}
      >
        {indicator && (
          <div
            className="absolute top-1 bottom-1 rounded-[20px] bg-[#e5e7eb]"
            style={{
              left: indicator.left,
              width: indicator.width,
              transition: isResizing
                ? "none"
                : `left ${INDICATOR_TRANSITION_MS}ms ${EASING}, width ${INDICATOR_TRANSITION_MS}ms ${EASING}`,
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
              className={`relative flex flex-col items-center justify-center gap-1.5 rounded-[20px] py-1.5 ${
                useFillLayout ? "flex-1" : "px-7"
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
