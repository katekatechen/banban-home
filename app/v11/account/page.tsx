"use client";

import { useRouter } from "next/navigation";
import BackHeader from "../_components/BackHeader";
import StatusBar from "../_components/StatusBar";
import {
  ACCOUNT_PROFILE,
  ACCOUNT_ROWS,
  ACCOUNT_ROWS_SECONDARY,
  getInitials,
} from "../_lib/mock-data";
import { usePageSlide } from "../_lib/page-transition";

function Row({
  icon,
  label,
  trailing,
}: {
  icon: string;
  label: string;
  trailing?: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 px-5 py-3.5 text-left">
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

export default function AccountPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-white"
      style={style}
    >
      <StatusBar />
      <BackHeader title="帳號" onBack={() => exit(() => router.back())} />

      <div className="flex-1 overflow-y-auto pb-8">
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
            <Row key={r.key} icon={r.icon} label={r.label} trailing={r.trailing} />
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
