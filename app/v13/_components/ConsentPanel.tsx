"use client";

import { useEffect } from "react";
import {
  CONSENT_COPY_VERSION,
  PROVIDER,
  initConsentFromUrl,
  setConsentState,
  useConsent,
  type ConsentState,
} from "../_lib/ai-consent";

// Demo 用的狀態切換面板：掛在手機外框旁邊的灰底上，不是 App 的一部分。
// 供應商、傳送路徑、說明範圍、同意時機都已經定案，寫死在文案裡不再切換，
// 這裡只剩同意狀態。點了馬上換，不用重新整理。
// 窄螢幕（真的用手機看）不顯示，改用網址參數 ?consent= 切。
const OPTIONS: [ConsentState, string][] = [
  ["unset", "未問過"],
  ["granted", "已同意"],
  ["declined", "已拒絕"],
  ["remote_off", "他機關閉"],
];

export default function ConsentPanel() {
  const vars = useConsent();

  useEffect(() => {
    initConsentFromUrl();
  }, []);

  return (
    <div className="pointer-events-none fixed left-4 top-4 z-[200] hidden w-[236px] flex-col sm:flex">
      <div className="pointer-events-auto overflow-hidden rounded-2xl bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur">
        <p className="px-3.5 py-2.5 text-[12px] font-semibold tracking-wide text-gray-800">
          第三方 AI 同意・狀態切換
        </p>

        <div className="flex flex-col gap-3 border-t border-[#eef0f1] px-3.5 pb-3.5 pt-3">
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold text-gray-800">
              同意狀態
              <span className="ml-1.5 font-normal text-[#a1a6ab]">
                unset 是還沒問過
              </span>
            </p>
            <div className="flex flex-wrap gap-1">
              {OPTIONS.map(([v, text]) => (
                <button
                  key={v}
                  onClick={() => setConsentState(v)}
                  className="rounded-full px-2.5 py-1 text-[11px] leading-[1.4] transition-colors"
                  style={{
                    background: vars.consent === v ? "#ff3b3b" : "#f3f4f6",
                    color: vars.consent === v ? "#ffffff" : "#4a5565",
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#eef0f1] pt-2.5">
            <p className="text-[10.5px] leading-[1.6] text-[#a1a6ab]">
              供應商 {PROVIDER}・App 直接送
              <br />
              文案版本 {CONSENT_COPY_VERSION}
              <br />
              {vars.receipt ? `同意記錄 ${vars.receipt.at}` : "沒有同意記錄"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
