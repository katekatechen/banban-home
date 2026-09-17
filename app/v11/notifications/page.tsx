"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BackHeader from "../_components/BackHeader";
import StatusBar from "../_components/StatusBar";
import { NOTIFICATIONS } from "../_lib/mock-data";
import { usePageSlide } from "../_lib/page-transition";

const FILTERS = ["帳戶動態", "產品新訊", "客服訊息"] as const;

export default function NotificationsPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("帳戶動態");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const rows = unreadOnly
    ? NOTIFICATIONS.filter((n) => n.unread)
    : NOTIFICATIONS;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white" style={style}>
      <StatusBar />
      <BackHeader title="通知" onBack={() => exit(() => router.back())} />

      <div className="flex shrink-0 gap-2 overflow-x-auto px-5 pb-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
              filter === f
                ? "border-gray-800 bg-gray-800 text-white"
                : "border-gray-200 text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex shrink-0 items-center justify-between px-5 pb-3">
        <p className="text-[12px] text-gray-400">今天</p>
        <label className="flex items-center gap-2 text-[12.5px] text-gray-500">
          僅顯示未讀
          <button
            onClick={() => setUnreadOnly((v) => !v)}
            aria-pressed={unreadOnly}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              unreadOnly ? "bg-brand" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                unreadOnly ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="flex flex-col divide-y divide-gray-100">
          {rows.map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-5 py-3.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
                  <path d="M8 2l6 12H2L8 2z" fill="currentColor" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="line-clamp-1 text-[13.5px] font-semibold text-gray-900">
                    {n.title}
                  </p>
                  <span className="shrink-0 text-[11px] text-gray-300">
                    {n.time}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-[18px] text-gray-500">
                  {n.body}
                </p>
              </div>
              {n.unread && (
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
