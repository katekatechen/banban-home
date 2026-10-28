"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BackHeader from "../_components/BackHeader";
import StatusBar from "../_components/StatusBar";
import { EASING, usePageSlide } from "../_lib/page-transition";
import {
  initConsentFromUrl,
  isConsented,
  setConsentEnabled,
  settingsCopy,
  useConsent,
} from "../_lib/ai-consent";

// 帳號 > 偏好設定。同意要能隨時撤回，撤回的地方要找得到，
// 這是 Sheet 上那句「你可以隨時到『帳號 > 偏好設定』關閉」的落點。
//
// 開啟不用再問一次（開關本身加上旁邊那句說明就是明確同意），
// 關閉要再確認一次，因為關掉之後 AI 對話就不能用了，後果比較大。
export default function PreferencesPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();
  const vars = useConsent();
  const copy = settingsCopy(vars);
  const on = isConsented(vars);
  const [confirmOff, setConfirmOff] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    initConsentFromUrl();
  }, []);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2200);
  };

  const toggle = () => {
    if (on) {
      setConfirmOff(true);
      return;
    }
    setConsentEnabled(true);
    showToast(copy.toastOn);
  };

  const turnOff = () => {
    setConfirmOff(false);
    setConsentEnabled(false);
    showToast(copy.toastOff);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white" style={style}>
      <StatusBar />
      <BackHeader title="偏好設定" onBack={() => exit(() => router.back())} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="px-5 pb-2 pt-4 text-[12px] font-medium text-[#99a1af]">
          資料使用
        </p>
        <div className="flex items-start gap-4 px-5 py-3">
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[16px] font-medium leading-6 text-gray-800">
              {copy.title}
            </span>
            <span className="text-[14px] leading-[20px] text-[#6a7282]">
              {copy.desc}
            </span>
          </span>
          <Switch on={on} onToggle={toggle} label={copy.title} />
        </div>

        <div className="px-5 pb-8 pt-1">
          <p className="text-[12.5px] leading-[1.7] text-[#a1a6ab]">
            {on && vars.receipt
              ? `已於 ${vars.receipt.at} 同意，文案版本 ${vars.receipt.version}`
              : "尚未同意，AI 對話目前不能使用。"}
          </p>
        </div>

        <div className="h-2 bg-[#f6f7f8]" />

        <p className="px-5 pb-2 pt-4 text-[12px] font-medium text-[#99a1af]">
          其他
        </p>
        <DummyRow title="推播通知" value="已開啟" />
        <DummyRow title="語言" value="繁體中文" />
        <DummyRow title="貨幣" value="TWD" />
      </div>

      {confirmOff && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-[#111827]/40"
            onClick={() => setConfirmOff(false)}
          />
          <div
            className="relative w-full max-w-[320px] rounded-3xl bg-white px-5 pb-5 pt-6"
            style={{ animation: `dialogIn 220ms ${EASING}` }}
          >
            <p className="text-[18px] font-medium leading-[1.4] text-gray-800">
              {copy.offTitle}
            </p>
            <p className="mt-3 text-[14px] leading-[1.75] text-[#4a5565]">
              {copy.offDesc}
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setConfirmOff(false)}
                className="flex h-12 flex-1 items-center justify-center rounded-2xl border-[1.5px] border-gray-800 text-[16px] font-medium text-gray-800"
              >
                {copy.offCancel}
              </button>
              <button
                onClick={turnOff}
                className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-brand text-[16px] font-medium text-white"
              >
                {copy.offConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-28 z-[60] flex justify-center px-4">
          <p
            className="rounded-full bg-gray-800/90 px-4 py-2 text-[13px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
            style={{ animation: "fadeIn 200ms ease" }}
          >
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}

function Switch({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="relative mt-1 h-[30px] w-[50px] shrink-0 rounded-full transition-colors"
      style={{ background: on ? "#ff3b3b" : "#d1d5dc" }}
    >
      <span
        className="absolute top-[3px] size-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
        style={{
          left: on ? "23px" : "3px",
          transition: `left 200ms ${EASING}`,
        }}
      />
    </button>
  );
}

function DummyRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex min-h-12 items-center gap-4 px-5 py-3">
      <span className="flex-1 text-[16px] font-medium leading-6 text-gray-800">
        {title}
      </span>
      <span className="text-[14px] text-[#99a1af]">{value}</span>
    </div>
  );
}
