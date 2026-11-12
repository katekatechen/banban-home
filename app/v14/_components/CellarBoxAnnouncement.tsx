"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EASING } from "../_lib/page-transition";
import LottieImage from "./LottieImage";

// 藏酒盒上線公告卡：照 AFFOGATO「公告卡」規格（Figma 5551:1438）。
// 上方 329×219 公告圖，內容區 16 內距，標題 20/28 置中、內文 16/24，
// 底部一顆滿版 CTA。規格沒有關閉鈕，點卡片外的遮罩關掉。
// 上方放名莊藏酒盒的文字光環動畫（跟細節頁大圖同一支），填滿 329×219 置中裁切
export default function CellarBoxAnnouncement({
  onClose,
  onCta,
}: {
  onClose: () => void;
  onCta: () => void;
}) {
  // 掛到整個手機框上，才蓋得過 tabbar
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  useEffect(() => setFrame(document.getElementById("v14-frame")), []);
  if (!frame) return null;
  return createPortal(
    <div
      className="absolute inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-[2.5px]"
      style={{ animation: "announceModalFade 200ms ease both" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cellar-box-announce-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-[329px] flex-col overflow-hidden rounded-2xl bg-[#fefefe] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.06),0px_0.5px_4px_1px_rgba(0,0,0,0.02)]"
        style={{ animation: `announceModalIn 260ms ${EASING} both` }}
      >
        <LottieImage
          src="/v14/blindbox/advanced-ring.json"
          className="h-[219px] w-full shrink-0 bg-[#1e2939]"
        />
        <div className="flex flex-col gap-8 p-4">
          <div className="flex flex-col items-center gap-2.5">
            <p
              id="cellar-box-announce-title"
              className="w-full text-center text-[20px] font-semibold leading-7 text-[#1b1f26]"
            >
              拆開之前，誰都猜不到
            </p>
            <p className="w-full text-[16px] leading-6 text-[#1f1f1f]">
              藏酒盒上線了！每一盒都藏著一瓶好酒，市值保證不低於售價。經典、名莊兩款，盒裡有哪些酒先攤開給你看，開出來的那瓶直接收進你的酒窖。
            </p>
          </div>
          <button
            onClick={onCta}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#ff3b3b] px-4 text-[16px] font-semibold leading-6 text-white active:scale-[0.98]"
          >
            挑一盒來開
          </button>
        </div>
      </div>
    </div>,
    frame,
  );
}
