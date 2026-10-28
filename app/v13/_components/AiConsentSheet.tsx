"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EASING } from "../_lib/page-transition";
import {
  consentCopy,
  declineConsent,
  errorCopy,
  grantConsent,
  useConsent,
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
  const vars = useConsent();
  const copy = consentCopy(vars);
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [shake, setShake] = useState(0);

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
    // 儲存失敗時停在 Sheet，不關掉也不放行
    if (!grantConsent()) {
      setSaveError(true);
      setShake((n) => n + 1);
      return;
    }
    setSaveError(false);
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
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#fff1f1]">
          <SparkIcon />
        </div>

        {/* 標題直接就是揭露本身：一眼看到重點，不用讀完內文才知道發生什麼事 */}
        <p className="text-[22px] font-medium leading-[1.35] text-gray-800">
          {copy.title}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <Line>{copy.what}</Line>
          <Line>{copy.scope}</Line>
          <Line>{copy.revoke}</Line>
        </div>

        {/* 連到隱私政策裡「第三方 AI 處理」那一段的錨點，不是只連到首頁 */}
        <button
          type="button"
          className="mt-4 w-fit text-[14px] font-medium text-[#4a5565] underline underline-offset-4"
        >
          {copy.policy}
        </button>

        {saveError && (
          <p
            key={shake}
            className="mt-4 rounded-xl bg-[#fff1f1] px-3 py-2.5 text-[13.5px] leading-[1.5] text-[#c81e1e]"
            style={{ animation: "fadeIn 200ms ease" }}
          >
            {errorCopy.save}
          </p>
        )}

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

function Line({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-[9px] size-1 shrink-0 rounded-full bg-[#c8cdd3]" />
      <p className="text-[14.5px] leading-[1.75] text-[#4a5565]">{children}</p>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ff3b3b"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 4.5c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z" />
      <path d="M18 3v4M16 5h4" />
    </svg>
  );
}
