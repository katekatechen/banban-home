"use client";

import StatusBar from "../../_components/StatusBar";
import { useCorp } from "../../_lib/corp-account";
import { usePageSlide } from "../../_lib/page-transition";

// 申請已送出（照 Figma G4）：這時候企業帳號才建立，狀態是審核中。
// 「回到帳號頁」越過說明頁回到帳號分頁，帳號已經切到企業帳號
export default function CorpDonePage() {
  const { style, exit } = usePageSlide();
  const { profile } = useCorp();

  const rows: [string, string][] = [
    ["公司統一編號", profile.taxId],
    ["負責人或代理人", profile.contactName],
    ["主要存摺", "已上傳"],
  ];

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-white"
      style={style}
    >
      <StatusBar />
      <div className="flex h-11 shrink-0 items-center justify-center px-4">
        <p className="text-[17px] font-semibold leading-6 text-gray-800">
          企業驗證
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-4 pb-6 pt-24">
        <span className="flex size-[72px] items-center justify-center rounded-full bg-[#dcfce7]">
          <svg
            viewBox="0 0 24 24"
            className="size-8"
            fill="none"
            stroke="#16a34a"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13L9 17L19 7" />
          </svg>
        </span>
        <h1 className="text-[24px] font-medium leading-8 text-gray-800">
          申請已送出
        </h1>
        <p className="text-center text-[16px] leading-6 text-[#4a5565]">
          審核約 1 至 3 個工作天。結果會寄到 {profile.email} 通知你。
        </p>
        <div className="flex w-full flex-col gap-3 rounded-xl bg-gray-000 p-4">
          {rows.map(([k, v]) => (
            <p
              key={k}
              className="flex items-center justify-between gap-4 text-[16px] leading-6"
            >
              <span className="text-[#6a7282]">{k}</span>
              <span className="font-medium text-gray-800">{v}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 sm:pb-[34px]">
        <button
          onClick={() => exit(() => window.history.go(-2))}
          className="flex h-12 w-full items-center justify-center rounded-full bg-brand text-[16px] font-semibold text-white"
        >
          回到帳號頁
        </button>
      </div>
    </div>
  );
}
