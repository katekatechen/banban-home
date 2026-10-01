"use client";

import { useRouter } from "next/navigation";
import StatusBar from "../../_components/StatusBar";
import {
  ACCOUNT_PROFILE,
  ACCOUNT_ROWS,
  ACCOUNT_ROWS_SECONDARY,
  getInitials,
  UNREAD_NOTIFICATIONS,
} from "../../_lib/mock-data";

function Row({
  icon,
  label,
  trailing,
  href,
}: {
  icon: string;
  label: string;
  trailing?: string;
  href?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={href ? () => router.push(href) : undefined}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
    >
      <img src={icon} alt="" className="size-5 shrink-0" />
      <span className="flex-1 text-[14px] text-gray-800">{label}</span>
      {trailing && (
        <span className="text-[13px] text-gray-400">{trailing}</span>
      )}
      <svg viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 text-gray-300">
        <path
          d="M6 3.5L10.5 8L6 12.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// v13 帳號變成 tabbar 的第四個分頁（根路由），不是從頭像推頁進來的，
// 所以沒有返回鍵、也不套 usePageSlide 的推頁滑動，改成置左標題
export default function AccountPage() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <StatusBar />
      {/* 通知入口照 Figma 948:46205 放在「帳號」標題右邊（首頁的鈴鐺拿掉了） */}
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <p className="text-[24px] font-medium leading-8 text-gray-800">帳號</p>
        <button
          onClick={() => router.push("/v13/notifications")}
          aria-label="通知"
          className="relative flex size-11 items-center justify-center rounded-[22px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/bell.svg" alt="" className="size-5" />
          {UNREAD_NOTIFICATIONS > 0 && (
            <span className="absolute left-[20.5px] top-1.5 rounded-[20px] bg-brand px-1 py-0.5 text-[12px] font-bold leading-3 text-gray-000">
              {UNREAD_NOTIFICATIONS}
            </span>
          )}
        </button>
      </div>

      {/* 底部留白要讓過 tabbar（55px 膠囊＋底部安全區） */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+88px)] sm:pb-[110px]">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-800 text-[17px] font-semibold text-white">
            {getInitials(ACCOUNT_PROFILE.handle)}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-900">
              @{ACCOUNT_PROFILE.handle}
            </p>
            <p className="text-[12px] text-gray-400">
              {ACCOUNT_PROFILE.joined}
            </p>
          </div>
        </div>

        <div className="mx-5 mb-4 divide-y divide-gray-100 rounded-2xl border border-gray-100">
          {ACCOUNT_ROWS.map((r) => (
            <Row
              key={r.key}
              icon={r.icon}
              label={r.label}
              trailing={"trailing" in r ? r.trailing : undefined}
              href={"href" in r ? r.href : undefined}
            />
          ))}
        </div>

        <div className="mx-5 mb-4 divide-y divide-gray-100 rounded-2xl border border-gray-100">
          {ACCOUNT_ROWS_SECONDARY.map((r) => (
            <Row key={r.key} icon={r.icon} label={r.label} />
          ))}
        </div>

        <div className="mx-5 grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 py-5">
            <img src="/figma/icon-book-solid.svg" alt="" className="size-5" />
            <span className="text-[13px] text-gray-800">幫助中心</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 py-5">
            <img src="/figma/icon-contact-babu.svg" alt="" className="size-5" />
            <span className="text-[13px] text-gray-800">聯絡我們</span>
          </button>
        </div>

        <p className="px-5 pt-6 text-[11px] text-gray-300">版本 1.0.0</p>
      </div>
    </div>
  );
}
