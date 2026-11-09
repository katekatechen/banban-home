"use client";

import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import { COMPANY_NAME, useCorp } from "../_lib/corp-account";
import { usePageSlide } from "../_lib/page-transition";

// 企業資料（照 Figma H1 85:12140）：唯讀，集中顯示申請時填的資料。
// 審核中、需補件、已驗證都能從帳號頁的「企業資料」進來；之後若開放變更聯絡人，入口放這頁
export default function CompanyInfoPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();
  const { profile } = useCorp();

  const sections: [string, [string, string][]][] = [
    [
      "公司資料",
      [
        ["公司名稱", COMPANY_NAME],
        ["統一編號", profile.taxId],
        ["公司地址", profile.address],
        ["聯絡 Email", profile.email],
      ],
    ],
    [
      "負責人或代理人",
      [
        ["姓名", profile.contactName],
        ["手機", profile.contactPhone],
      ],
    ],
    [
      "公司存摺",
      [
        ["主要存摺", "已上傳"],
        ["備用存摺", profile.backupPassbook ? "已上傳" : "未提供"],
      ],
    ],
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white" style={style}>
      <StatusBar />
      <div className="flex h-11 shrink-0 items-center px-4">
        <button
          onClick={() => exit(() => router.back())}
          aria-label="返回"
          className="flex size-11 items-center justify-center rounded-[22px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
        </button>
      </div>

      {/* 照設定頁（帳號與安全性、收款與付款）的排版：大標靠左、左標籤右數值、群組間用粗灰線分隔 */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="flex flex-col gap-2 px-4 pb-2 pt-4">
          <h1 className="text-[20px] font-medium leading-7 text-gray-800">企業資料</h1>
          <p className="text-[16px] leading-6 text-[#6a7282]">資料如需變更，請聯絡客服</p>
        </div>
        {sections.map(([title, rows]) => (
          <section key={title}>
            <div className="py-4">
              <div className="h-2 bg-gray-100" />
            </div>
            <h2 className="px-4 pb-2 text-[18px] font-semibold leading-6 text-gray-800">{title}</h2>
            {rows.map(([k, v]) => (
              <div key={k} className="flex min-h-12 items-center justify-between gap-4 px-4 text-[16px] leading-6">
                <span className="shrink-0 text-gray-800">{k}</span>
                <span className="text-right text-[#6a7282]">{v}</span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
