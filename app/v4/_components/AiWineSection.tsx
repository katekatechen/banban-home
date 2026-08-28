"use client";

import { useState } from "react";
import StatusBar from "./StatusBar";
import SectionSwitcher from "./SectionSwitcher";
import AiSelectBody from "./AiSelectBody";
import WineSelectBody from "./WineSelectBody";

type AiWineSectionProps = {
  initialActive: "ai" | "wine";
};

// 智能選品跟精選酒品合併成一組，用左右滑動切換，取代原本各自獨立的頁面。
export default function AiWineSection({ initialActive }: AiWineSectionProps) {
  const [active, setActive] = useState<"ai" | "wine">(initialActive);
  const dark = active === "ai";

  return (
    <div className={`flex min-h-full flex-col ${dark ? "bg-gray-900" : "bg-white"}`}>
      <StatusBar dark={dark} />
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <SectionSwitcher active={active} dark={dark} onSelect={setActive} />
        <div
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${
            dark ? "bg-white/10" : "bg-gray-100"
          }`}
        >
          <img src="/icons/nav-reward.svg" alt="" className="size-4" />
          <span
            className={`text-[14px] font-medium ${dark ? "text-white" : "text-gray-800"}`}
          >
            999,999
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className="flex h-full w-[200%] transition-transform duration-300 ease-out"
          style={{ transform: active === "ai" ? "translateX(0%)" : "translateX(-50%)" }}
        >
          <div className="h-full w-1/2 overflow-y-auto bg-gray-900 text-white">
            <AiSelectBody />
          </div>
          <div className="h-full w-1/2 overflow-y-auto bg-white">
            <WineSelectBody />
          </div>
        </div>
      </div>
    </div>
  );
}
