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
      <div className="relative flex h-11 shrink-0 items-center justify-center px-4">
        <button
          onClick={() => exit(() => router.back())}
          aria-label="返回"
          className="absolute left-4 flex size-11 items-center justify-center rounded-[22px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
        </button>
        <p className="text-[17px] font-semibold leading-6 text-gray-800">企業資料</p>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-8 pt-6">
        {sections.map(([title, rows]) => (
          <section key={title} className="flex flex-col gap-3">
            <h2 className="text-[20px] font-medium leading-7 text-gray-800">{title}</h2>
            <div className="flex flex-col gap-3 rounded-xl bg-gray-000 p-4">
              {rows.map(([k, v]) => (
                <p key={k} className="flex items-start justify-between gap-4 text-[16px] leading-6">
                  <span className="shrink-0 text-[#6a7282]">{k}</span>
                  <span className="text-right font-medium text-gray-800">{v}</span>
                </p>
              ))}
            </div>
          </section>
        ))}
        <p className="text-[14px] leading-[18px] text-[#6a7282]">資料如需變更，請聯絡客服</p>
      </div>
    </div>
  );
}
