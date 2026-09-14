"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBar from "./StatusBar";
import { REWARD_BALANCE } from "../_lib/mock-data";

type Row = {
  key: string;
  icon: string;
  label: string;
  right?: string;
  rightIcon?: string;
  href?: string;
};

const SETTINGS_1: Row[] = [
  {
    key: "verify",
    icon: "/figma/icon-verified-user.svg",
    label: "身分驗證",
    right: "已驗證",
    rightIcon: "/figma/icon-security-pass.svg",
  },
  {
    key: "security",
    icon: "/figma/icon-shield-check.svg",
    label: "帳號與安全性",
  },
  {
    key: "payment",
    icon: "/figma/icon-wallet.svg",
    label: "收款與付款",
  },
  {
    key: "orders",
    icon: "/figma/icon-clipboard-check.svg",
    label: "歷史交易紀錄",
    href: "/v10/orders",
  },
  {
    key: "referral",
    icon: "/figma/icon-community.svg",
    label: "推薦好友",
  },
  {
    key: "gifts",
    icon: "/figma/icon-gift.svg",
    label: "我的禮物",
  },
  {
    key: "prefs",
    icon: "/figma/icon-settings.svg",
    label: "偏好設定",
  },
];

const SETTINGS_2: Row[] = [
  {
    key: "terms",
    icon: "/figma/icon-page.svg",
    label: "條款及隱私權",
  },
  {
    key: "feedback",
    icon: "/figma/icon-lightbulb.svg",
    label: "我有使用建議",
  },
];

const COLLAPSE_DISTANCE = 40; // px，ID 區塊很矮，往上滑一點點就該換成 ID

// 帳號現在是 tab bar 的第三格，不再是側邊欄點進來的獨立頁面，
// 所以拿掉了 BackButton／pageIn 進場動畫——這裡本來就是一個「常駐分頁」。
// 版型照 Figma「帳號」節點（350:11826）還原，另外加上：往上滑時標題列固定在
// 最上面，「帳號」兩個字淡出換成 @ID，呼應回饋頁大數字收合進標題列的做法。
export default function AccountPanel() {
  const [progress, setProgress] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const p = Math.min(1, Math.max(0, e.currentTarget.scrollTop / COLLAPSE_DISTANCE));
    setProgress(p);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <StatusBar />
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <div className="relative h-full flex-1">
          <p
            className="absolute inset-y-0 left-0 flex items-center text-[24px] font-medium text-gray-800"
            style={{ opacity: 1 - progress, pointerEvents: progress > 0.5 ? "none" : "auto" }}
          >
            帳號
          </p>
          <div
            className="absolute inset-y-0 left-0 flex items-center gap-1"
            style={{ opacity: progress, pointerEvents: progress > 0.5 ? "auto" : "none" }}
          >
            <img src="/figma/avatar-babu.svg" alt="" className="size-5" />
            <p className="text-[16px] font-semibold text-gray-800">Tonnychang</p>
          </div>
        </div>
        <Link
          href="/v10/reward-history"
          className="flex items-center gap-1.5 rounded-[22px] bg-white py-1.5 pl-1.5 pr-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/reward-otter.svg" alt="" className="size-7" />
          <span className="text-[16px] font-medium text-gray-800">
            {REWARD_BALANCE.toLocaleString()}
          </span>
        </Link>
      </div>

      <div onScroll={handleScroll} className="no-scrollbar flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 px-4 pb-4 pt-2.5">
          <div className="flex items-center gap-1">
            <img src="/figma/avatar-babu.svg" alt="" className="size-5" />
            <p className="text-[16px] font-semibold text-gray-800">Tonnychang</p>
            <img src="/figma/icon-copy.svg" alt="複製" className="size-4" />
          </div>
          <p className="text-[14px] text-[#6a7282]">2025年 11 月加入</p>
        </div>

        <SettingsBlock rows={SETTINGS_1} />
        <div className="py-4">
          <div className="h-px w-full bg-[#f7f7f7]" />
        </div>
        <SettingsBlock rows={SETTINGS_2} />

        <div className="flex gap-4 px-4 py-6">
          <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-gray-200 p-4 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.06)]">
            <img src="/figma/icon-book-solid.svg" alt="" className="size-6" />
            <p className="text-[16px] font-medium text-gray-800">幫助中心</p>
          </div>
          <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-gray-200 p-4 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.06)]">
            <img src="/figma/icon-contact-babu.svg" alt="" className="size-6" />
            <p className="text-[16px] font-medium text-gray-800">聯絡我們</p>
          </div>
        </div>

        <p className="px-4 pb-[calc(env(safe-area-inset-bottom)+96px)] text-right text-[14px] text-[#1f1f1f]">
          版本 1.0.0
        </p>
      </div>
    </div>
  );
}

function SettingsBlock({ rows }: { rows: Row[] }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => {
        const content = (
          <>
            <div className="flex flex-1 items-center gap-4 py-3">
              <img src={r.icon} alt="" className="size-6" />
              <p className="flex-1 text-[16px] font-medium text-gray-800">{r.label}</p>
            </div>
            <div className="flex items-center gap-1.5 py-2.5">
              {r.right && (
                <span className="text-[16px] text-[#4a5565]">{r.right}</span>
              )}
              <img
                src={r.rightIcon ?? "/figma/nav-arrow-right3.svg"}
                alt=""
                className="size-6"
              />
            </div>
          </>
        );
        return r.href ? (
          <Link
            key={r.key}
            href={r.href}
            className="flex items-center justify-between px-4"
          >
            {content}
          </Link>
        ) : (
          <div key={r.key} className="flex items-center justify-between px-4">
            {content}
          </div>
        );
      })}
    </div>
  );
}
