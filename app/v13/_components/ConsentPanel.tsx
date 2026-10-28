"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_COPY_VERSION,
  PROVIDER_OPTIONS,
  initConsentFromUrl,
  setVars,
  useConsent,
  type ConsentVars,
} from "../_lib/ai-consent";

// Demo 用的狀態切換面板：掛在手機外框旁邊的灰底上，不是 App 的一部分。
// 每一個欄位對應 ai-consent.ts 裡的一個變數，點了馬上換，不用重新整理。
// 窄螢幕（真的用手機看）不顯示，改用網址參數切。
export default function ConsentPanel() {
  const vars = useConsent();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    initConsentFromUrl();
  }, []);

  return (
    <div className="pointer-events-none fixed left-4 top-4 z-[200] hidden w-[236px] flex-col sm:flex">
      <div className="pointer-events-auto overflow-hidden rounded-2xl bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
        >
          <span className="text-[12px] font-semibold tracking-wide text-gray-800">
            第三方 AI 同意・狀態切換
          </span>
          <span className="text-[11px] text-[#a1a6ab]">
            {open ? "收起" : "展開"}
          </span>
        </button>

        {open && (
          <div className="flex flex-col gap-3 border-t border-[#eef0f1] px-3.5 pb-3.5 pt-3">
            <Field
              label="同意狀態"
              hint="unset 是還沒問過"
              value={vars.consent}
              options={[
                ["unset", "未問過"],
                ["granted", "已同意"],
                ["declined", "已拒絕"],
                ["remote_off", "他機關閉"],
              ]}
              onPick={(consent) => setVars({ consent })}
            />
            <Field
              label="什麼時候跳同意"
              hint="send 是要送出才跳"
              value={vars.gate}
              options={[
                ["send", "要對話時"],
                ["enter", "進分頁就跳"],
              ]}
              onPick={(gate) => setVars({ gate })}
            />
            <Field
              label="說明二"
              hint="B 版會一併送帳戶資料"
              value={vars.scope}
              options={[
                ["A", "A 只送對話"],
                ["B", "B 含帳戶"],
              ]}
              onPick={(scope) => setVars({ scope })}
            />
            <Field
              label="傳送路徑"
              hint="轉送也要揭露，只是寫法不同"
              value={vars.relay}
              options={[
                ["direct", "App 直接送"],
                ["server", "經伺服器"],
              ]}
              onPick={(relay) => setVars({ relay })}
            />
            <Field
              label="模擬錯誤"
              hint="讀不到就當作未同意"
              value={vars.fail}
              options={[
                ["none", "無"],
                ["load", "讀取失敗"],
                ["save", "儲存失敗"],
              ]}
              onPick={(fail) => setVars({ fail })}
            />
            <Field
              label="供應商"
              value={vars.provider}
              options={PROVIDER_OPTIONS.map((p) => [p, p] as [string, string])}
              onPick={(provider) => setVars({ provider })}
            />

            <div className="border-t border-[#eef0f1] pt-2.5">
              <p className="text-[10.5px] leading-[1.6] text-[#a1a6ab]">
                文案版本 {CONSENT_COPY_VERSION}
                <br />
                {vars.receipt
                  ? `同意記錄 ${vars.receipt.at}`
                  : "沒有同意記錄"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field<K extends string>({
  label,
  hint,
  value,
  options,
  onPick,
}: {
  label: string;
  hint?: string;
  value: string;
  options: [K, string][];
  onPick: (v: K) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold text-gray-800">
        {label}
        {hint && (
          <span className="ml-1.5 font-normal text-[#a1a6ab]">{hint}</span>
        )}
      </p>
      <div className="flex flex-wrap gap-1">
        {options.map(([v, text]) => (
          <button
            key={v}
            onClick={() => onPick(v)}
            className="rounded-full px-2.5 py-1 text-[11px] leading-[1.4] transition-colors"
            style={{
              background: value === v ? "#ff3b3b" : "#f3f4f6",
              color: value === v ? "#ffffff" : "#4a5565",
            }}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { ConsentVars };
