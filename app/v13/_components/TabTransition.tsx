"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EASING, PAGE_TRANSITION_MS } from "../_lib/page-transition";

// tabbar 四個分頁的順序，決定滑動方向：往右邊的分頁切過去，新內容從右邊
// 滑進來、舊內容往左邊滑出去；往左邊切則相反——跟 tabbar 上圖示的實際
// 左右順序一致，滑動方向才會跟使用者「往右/左點了一個分頁」的直覺一致
const TAB_ORDER = ["/v13", "/v13/rewards", "/v13/exchange", "/v13/account"];

type Slot = {
  key: number;
  path: string;
  node: React.ReactNode;
};

// 四個分頁是四個獨立路由，換路由時 Next 會直接卸載舊分頁、掛載新分頁，
// 沒有天然的「退場」時機可以做動畫。這裡自己疊兩張卡片：退場那張先留著、
// 進場那張先定位在畫面外，下一輪 rAF 才同時把兩張卡片的 transform 切過去，
// 靠 CSS transition 補出動畫，跟 usePageSlide 掛載頁面用的是同一套雙層
// rAF 手法，等動畫播完才把退場那張真的移除
export default function TabTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const keyRef = useRef(0);
  const [current, setCurrent] = useState<Slot>(() => ({
    key: keyRef.current,
    path: pathname,
    node: children,
  }));
  const [outgoing, setOutgoing] = useState<Slot | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    if (pathname === current.path) {
      setCurrent((c) => ({ ...c, node: children }));
      return;
    }

    const fromIndex = TAB_ORDER.indexOf(current.path);
    const toIndex = TAB_ORDER.indexOf(pathname);
    if (fromIndex === -1 || toIndex === -1) {
      keyRef.current += 1;
      setCurrent({ key: keyRef.current, path: pathname, node: children });
      setOutgoing(null);
      return;
    }

    setDirection(toIndex > fromIndex ? "right" : "left");
    setOutgoing(current);
    setEntering(false);
    keyRef.current += 1;
    setCurrent({ key: keyRef.current, path: pathname, node: children });

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntering(true));
    });
    const timer = setTimeout(
      () => setOutgoing(null),
      PAGE_TRANSITION_MS + 30,
    );
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const enterFrom = direction === "right" ? "translateX(100%)" : "translateX(-100%)";
  const exitTo = direction === "right" ? "translateX(-100%)" : "translateX(100%)";
  const transition = entering ? `transform ${PAGE_TRANSITION_MS}ms ${EASING}` : "none";

  return (
    <div className="relative h-full w-full overflow-hidden">
      {outgoing && (
        <div
          key={outgoing.key}
          className="absolute inset-0"
          style={{ transform: entering ? exitTo : "translateX(0)", transition }}
        >
          {outgoing.node}
        </div>
      )}
      <div
        key={current.key}
        className="absolute inset-0"
        style={{
          transform: outgoing ? (entering ? "translateX(0)" : enterFrom) : "translateX(0)",
          transition: outgoing ? transition : "none",
        }}
      >
        {current.node}
      </div>
    </div>
  );
}
