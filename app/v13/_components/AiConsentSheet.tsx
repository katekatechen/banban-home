"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EASING } from "../_lib/page-transition";
import {
  consentCopy as copy,
  declineConsent,
  grantConsent,
} from "../_lib/ai-consent";

// 進入對話前的揭露與同意。照 App Store 5.1.2(i)：揭露要在 App 裡、
// 要指名供應商、要在傳送之前拿到明確同意。
//
// 這張 Sheet 不能滑掉、不能點背景關掉，只能在兩顆按鈕之間選。
// 理由：審核員要看到「使用者做了一個選擇」。滑掉等於沒選，之後再送訊息
// 還是要再問一次，不如一開始就把選擇收斂成兩顆按鈕。
// 所以這裡刻意不放上緣的拖曳條（那是「可以滑掉」的視覺承諾），
// 背景遮罩也沒有 onClick。
export default function AiConsentSheet({
  onAgree,
  onDecline,
}: {
  onAgree: () => void;
  onDecline: () => void;
}) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
  }, []);

  // 兩層 rAF 才切到「就位」，確保瀏覽器真的畫過畫面外那一幀（理由見 page-transition.ts）
  useEffect(() => {
    if (!frame) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [frame]);

  if (!frame) return null;

  const close = (done: () => void) => {
    setShown(false);
    window.setTimeout(done, 280);
  };

  const agree = () => {
    grantConsent();
    close(onAgree);
  };

  const decline = () => {
    declineConsent();
    close(onDecline);
  };

  return createPortal(
    <div className="absolute inset-0 z-[80]" role="dialog" aria-modal="true">
      {/* 遮罩沒有 onClick：點背景不關 */}
      <div
        className="absolute inset-0 bg-[#111827]/50"
        style={{ opacity: shown ? 1 : 0, transition: "opacity 250ms ease" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-7 sm:pb-[30px]"
        style={{
          transform: shown ? "translateY(0)" : "translateY(100%)",
          transition: `transform 300ms ${EASING}`,
        }}
      >
        {/* 圖示用 Iconoir 的 spark-solid（單顆四角星），填品牌紅、底色回到淡紅。
            AFFOGATO 只有複數的 sparks-solid，單顆的要從 Iconoir 拿，不過 AFFOGATO
            本來就是以 Iconoir 為底，路徑畫法一致。
            不放 Google 的 logo：Google 的商標規範禁止把品牌元素當成內容中最顯眼的
            元素，也禁止暗示合作關係，而這裡正好兩條都會踩到。指名供應商這件事由
            標題的文字負責，文字是規範明確允許的用法，審核要看的也是那一句 */}
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#fff1f1]">
          <img src="/figma/v13-spark-solid.svg" alt="" className="size-6" />
        </div>

        {/* 標題直接就是揭露本身：一眼看到重點，不用讀完內文才知道發生什麼事 */}
        <p className="text-[22px] font-medium leading-[1.35] text-gray-800">
          {copy.title}
        </p>

        <p className="mt-4 text-[14.5px] leading-[1.75] text-[#4a5565]">
          {copy.body}
        </p>

        {/* 連到隱私政策裡「第三方 AI 處理」那一段的錨點，不是只連到首頁 */}
        <button
          type="button"
          className="mt-4 w-fit text-[14px] font-medium text-[#4a5565] underline underline-offset-4"
        >
          {copy.policy}
        </button>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={agree}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-brand text-[16px] font-medium leading-6 text-white active:scale-[0.98]"
            style={{ transition: "transform 150ms ease" }}
          >
            {copy.agree}
          </button>
          <button
            onClick={decline}
            className="flex h-12 w-full items-center justify-center rounded-2xl text-[16px] font-medium leading-6 text-[#4a5565] active:bg-gray-50"
          >
            {copy.decline}
          </button>
        </div>
      </div>
    </div>,
    frame,
  );
}

