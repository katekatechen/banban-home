"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusBar from "../_components/StatusBar";
import {
  BuildingIcon,
  CheckCircleSolidIcon,
  CheckIcon,
  ClockIcon,
} from "../_components/CorpIcons";
import { createCompany } from "../_lib/corp-account";
import { usePageSlide } from "../_lib/page-transition";

// 新增企業帳號的說明頁（照 Figma A3 1063:29053）：先講清楚是什麼、能做什麼、要準備什麼，
// 再讓使用者開始建立。這版不做表單，按「開始建立」模擬建立完成，直接切到企業帳號
export default function NewCompanyPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();
  const [creating, setCreating] = useState(false);

  const start = () => {
    setCreating(true);
    window.setTimeout(() => {
      createCompany();
      exit(() => router.back());
    }, 900);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white" style={style}>
      <StatusBar />
      <div className="relative flex h-11 shrink-0 items-center justify-center px-4">
        <button
          onClick={() => exit(() => router.back())}
          aria-label="返回"
          className="absolute left-4 flex size-11 items-center justify-center rounded-[22px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
        </button>
        <p className="text-[17px] font-semibold leading-6 text-gray-800">
          新增企業帳號
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 pt-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-100">
          <BuildingIcon className="size-7 text-gray-800" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-medium leading-8 text-gray-800">
            以公司名義使用 AIFIAN
          </h1>
          <p className="text-[14px] leading-5 text-[#4a5565]">
            企業帳號和個人帳號分開管理，付款、交易紀錄與合約都以公司為主體。
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-gray-000 p-4">
          <p className="text-[14px] font-semibold leading-5 text-gray-800">
            企業帳號可以
          </p>
          {["以公司名義付款與收款", "簽署法人合約", "個人與企業的交易紀錄分開"].map(
            (t) => (
              <p key={t} className="flex items-center gap-2 text-[14px] leading-5 text-[#364153]">
                <CheckIcon className="size-5 shrink-0 text-[#16a34a]" />
                {t}
              </p>
            ),
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-gray-000 p-4">
          <p className="text-[14px] font-semibold leading-5 text-gray-800">
            需要準備
          </p>
          <p className="flex items-center gap-2 text-[14px] leading-5 text-[#364153]">
            <CheckCircleSolidIcon className="size-5 shrink-0 text-[#16a34a]" />
            <span className="flex-1">負責人身分驗證</span>
            <span className="text-[12px] font-medium leading-4 text-[#16a34a]">
              已完成
            </span>
          </p>
          {["公司統一編號", "公司登記文件（照片或 PDF）"].map((t) => (
            <p key={t} className="flex items-center gap-2 text-[14px] leading-5 text-[#364153]">
              <span className="flex size-5 shrink-0 items-center justify-center">
                <span className="size-[17px] rounded-full border-[1.5px] border-[#d1d5dc]" />
              </span>
              {t}
            </p>
          ))}
        </div>

        <p className="flex items-center gap-1.5 text-[13px] leading-[18px] text-[#6a7282]">
          <ClockIcon className="size-4 shrink-0" />
          填寫約 5 分鐘，審核約 1 至 3 個工作天
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2 border-t border-gray-100 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 sm:pb-[34px]">
        <button
          onClick={start}
          disabled={creating}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-brand text-[16px] font-semibold text-white disabled:opacity-80"
        >
          {creating ? (
            <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            "開始建立"
          )}
        </button>
        <p className="text-[12px] leading-4 text-[#6a7282]">
          可以中途離開，進度會自動保存
        </p>
      </div>
    </div>
  );
}
