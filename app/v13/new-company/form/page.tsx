"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import StatusBar from "../../_components/StatusBar";
import {
  ChevronDownIcon,
  MediaImageIcon,
  PlusIcon,
  UploadIcon,
} from "../../_components/CorpIcons";
import {
  COMPANY_NAME,
  submitApplication,
  updateDraft,
  useCorp,
} from "../../_lib/corp-account";
import { usePageSlide } from "../../_lib/page-transition";

// 企業驗證單頁表單（照 Figma G1 68:10838）：公司資料、負責人或代理人、公司存摺放在同一頁。
// - 統編輸入 8 碼後模擬查商工登記，帶出公司名稱讓用戶確認
// - 必填都完成、手機驗證通過，「送出申請」才可點；送出前再跳一次確認視窗
// - 中途點返回：有填過資料就先問「要離開嗎？」，離開回到個人帳號頁，草稿保留
// 只做體驗：查詢、寄驗證碼、上傳都是 setTimeout 假裝的

const CITIES: Record<string, string[]> = {
  台北市: ["信義區", "大安區", "中山區", "內湖區"],
  新北市: ["板橋區", "新店區", "三重區", "中和區"],
  台中市: ["西屯區", "北屯區", "南屯區"],
  高雄市: ["前鎮區", "苓雅區", "左營區"],
};

const RESEND_SECONDS = 35;

function Field({
  label,
  helper,
  helperColor,
  children,
}: {
  label: string;
  helper?: React.ReactNode;
  helperColor?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[14px] font-medium leading-5 text-gray-800">{label}</span>
      <span className="flex items-center border-b border-[#d1d5dc] focus-within:border-gray-800">
        {children}
      </span>
      {helper && (
        <span
          className="text-[13px] leading-[18px]"
          style={{ color: helperColor ?? "#6a7282" }}
        >
          {helper}
        </span>
      )}
    </label>
  );
}

const inputCls =
  "min-w-0 flex-1 bg-transparent py-2 text-[22px] leading-8 text-gray-800 outline-none placeholder:text-[#d1d5dc]";

function Select({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} appearance-none ${value ? "" : "text-[#d1d5dc]"}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none -ml-6 size-5 text-gray-800" />
    </>
  );
}

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-[20px] font-medium leading-7 text-gray-800">{title}</h2>
        <p className="text-[14px] leading-5 text-[#6a7282]">{intro}</p>
      </div>
      {children}
    </section>
  );
}

function FileCard({
  title,
  file,
  action,
  onAction,
}: {
  title: string;
  file: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <MediaImageIcon className="size-6 text-[#99a1af]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[14px] font-medium leading-5 text-gray-800">{title}</span>
        <span className="truncate text-[13px] leading-[18px] text-[#6a7282]">{file}</span>
        <span className="text-[13px] font-medium leading-[18px] text-[#16a34a]">已上傳</span>
      </span>
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 text-[14px] font-medium leading-5 text-[#007595]"
      >
        {action}
      </button>
    </div>
  );
}

// AFFOGATO modal：標題、內文、兩顆並排按鈕（左外框、右主色）
function Dialog({
  open,
  title,
  body,
  cancel,
  confirm,
  loading,
  onCancel,
  onConfirm,
  onDismiss,
}: {
  open: boolean;
  title: string;
  body: string;
  cancel: string;
  confirm: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  // 點遮罩：預設等於取消
  onDismiss?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[#111827]/40" onClick={onDismiss ?? onCancel} />
      <div className="relative flex w-full max-w-[328px] flex-col gap-4 rounded-3xl bg-white p-6">
        <p className="text-center text-[20px] font-medium leading-7 text-gray-800">{title}</p>
        <p className="text-[16px] leading-6 text-[#364153]">{body}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="h-12 flex-1 rounded-full border border-gray-800 text-[16px] font-semibold text-gray-800"
          >
            {cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-brand text-[16px] font-semibold text-white"
          >
            {loading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              confirm
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CorpFormPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();
  const { draft: d } = useCorp();
  const [lookup, setLookup] = useState<"idle" | "loading" | "done">(
    d.taxId.length === 8 ? "done" : "idle",
  );
  const [countdown, setCountdown] = useState(0);
  const [uploading, setUploading] = useState<"main" | "backup" | null>(null);
  const [dialog, setDialog] = useState<"leave" | "submit" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  // 統編滿 8 碼：假裝查商工登記
  useEffect(() => {
    if (d.taxId.length !== 8) {
      setLookup("idle");
      return;
    }
    if (lookup === "done") return;
    setLookup("loading");
    const t = window.setTimeout(() => setLookup("done"), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.taxId]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown]);

  const emailOk = /^\S+@\S+\.\S+$/.test(d.email);
  const phoneDigits = d.phone.replace(/\D/g, "");
  const phoneVerified = d.otp.length === 6;
  const remaining = [
    lookup === "done",
    emailOk,
    !!d.city,
    !!d.district,
    !!d.address.trim(),
    !!d.name.trim(),
    phoneVerified,
    d.passbook,
  ].filter((ok) => !ok).length;

  const dirty =
    !!(d.taxId || d.email || d.city || d.address || d.name || d.phone) || d.passbook;

  const back = () => {
    if (dirty) setDialog("leave");
    else exit(() => router.back());
  };

  // 離開：回到帳號頁（越過新增企業帳號說明頁），草稿留著
  const leave = () => {
    setDialog(null);
    exit(() => window.history.go(-2));
  };

  const sendOtp = () => {
    updateDraft({ otpSent: true, otp: "" });
    setCountdown(RESEND_SECONDS);
    window.setTimeout(() => otpRef.current?.focus(), 50);
  };

  const upload = (which: "main" | "backup") => {
    setUploading(which);
    window.setTimeout(() => {
      updateDraft(which === "main" ? { passbook: true } : { backupPassbook: true });
      setUploading(null);
    }, 800);
  };

  const submit = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      submitApplication();
      router.replace("/v13/new-company/done");
    }, 900);
  };

  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 10);
    return [n.slice(0, 4), n.slice(4, 7), n.slice(7)].filter(Boolean).join(" ");
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white" style={style}>
      <StatusBar />
      <div className="relative flex h-11 shrink-0 items-center justify-center px-4">
        <button
          onClick={back}
          aria-label="返回"
          className="absolute left-4 flex size-11 items-center justify-center rounded-[22px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
        >
          <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
        </button>
        <p className="text-[17px] font-semibold leading-6 text-gray-800">企業驗證</p>
      </div>

      <div className="flex flex-1 flex-col gap-10 overflow-y-auto px-4 pb-8 pt-6">
        <Section title="公司資料" intro="請填寫公司登記上的資料，審核結果會寄到聯絡 Email。">
          <Field
            label="統一編號"
            helper={
              lookup === "done"
                ? `已查到：${COMPANY_NAME}`
                : lookup === "loading"
                  ? "查詢中…"
                  : "8 位數字"
            }
            helperColor={lookup === "done" ? "#007595" : undefined}
          >
            <input
              inputMode="numeric"
              value={d.taxId}
              onChange={(e) =>
                updateDraft({ taxId: e.target.value.replace(/\D/g, "").slice(0, 8) })
              }
              placeholder="12345678"
              className={inputCls}
            />
          </Field>
          <Field
            label="聯絡 Email"
            helper={
              d.email && !emailOk ? "Email 格式不正確" : "審核結果會寄到這個 Email"
            }
            helperColor={d.email && !emailOk ? "#e7000b" : undefined}
          >
            <input
              type="email"
              value={d.email}
              onChange={(e) => updateDraft({ email: e.target.value.trim() })}
              placeholder="name@company.com"
              className={inputCls}
            />
          </Field>
          <div className="flex gap-4">
            <Field label="縣市">
              <Select
                value={d.city}
                options={Object.keys(CITIES)}
                placeholder="請選擇"
                onChange={(v) => updateDraft({ city: v, district: "" })}
              />
            </Field>
            <Field label="行政區">
              <Select
                value={d.district}
                options={CITIES[d.city] ?? []}
                placeholder="請選擇"
                onChange={(v) => updateDraft({ district: v })}
              />
            </Field>
          </div>
          <Field label="詳細地址">
            <input
              value={d.address}
              onChange={(e) => updateDraft({ address: e.target.value })}
              placeholder="路名、門牌、樓層"
              className={inputCls}
            />
          </Field>
        </Section>

        <Section
          title="負責人或代理人"
          intro="可以是公司負責人，或公司授權的代理人"
        >
          <Field label="姓名" helper="中文或英文姓名，需與證件相同">
            <input
              value={d.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder="王小明"
              className={inputCls}
            />
          </Field>
          <div className="flex items-end gap-4">
            <Field
              label="手機號碼"
              helper={
                d.otpSent && !phoneVerified
                  ? countdown > 0
                    ? `0：${String(countdown).padStart(2, "0")}後可重新寄送`
                    : "沒收到可以重新寄送"
                  : undefined
              }
            >
              <input
                inputMode="tel"
                value={d.phone}
                disabled={phoneVerified}
                onChange={(e) =>
                  updateDraft({ phone: formatPhone(e.target.value), otpSent: false, otp: "" })
                }
                placeholder="0912 345 678"
                className={inputCls}
              />
            </Field>
            {!phoneVerified && (
              <button
                type="button"
                onClick={sendOtp}
                disabled={phoneDigits.length < 10 || countdown > 0}
                className="mb-[18px] h-12 shrink-0 rounded-full bg-brand px-4 text-[16px] font-semibold text-white disabled:bg-gray-100 disabled:text-[#99a1af]"
              >
                {d.otpSent ? (countdown > 0 ? "已寄送" : "重新寄送") : "傳送驗證碼"}
              </button>
            )}
          </div>

          {d.otpSent && (
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-medium leading-5 text-gray-800">驗證碼</span>
              <div className="relative flex gap-2" onClick={() => otpRef.current?.focus()}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <span
                    key={i}
                    className="flex h-[52px] flex-1 items-center justify-center rounded-xl border text-[22px] font-medium text-gray-800"
                    style={{
                      borderColor:
                        !phoneVerified && i === d.otp.length ? "#1e2939" : "#e5e7eb",
                      borderWidth: !phoneVerified && i === d.otp.length ? 1.5 : 1,
                    }}
                  >
                    {d.otp[i] ?? ""}
                  </span>
                ))}
                <input
                  ref={otpRef}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={d.otp}
                  disabled={phoneVerified}
                  onChange={(e) =>
                    updateDraft({ otp: e.target.value.replace(/\D/g, "").slice(0, 6) })
                  }
                  className="absolute inset-0 opacity-0"
                  aria-label="驗證碼"
                />
              </div>
              <p
                className="text-[13px] leading-[18px]"
                style={{ color: phoneVerified ? "#16a34a" : "#6a7282" }}
              >
                {phoneVerified
                  ? "手機驗證完成"
                  : `驗證碼已傳送至 ${d.phone}，輸入 6 碼後自動驗證`}
              </p>
              {!phoneVerified && (
                <button
                  type="button"
                  className="self-start text-[14px] font-medium leading-5 text-[#007595]"
                >
                  收不到驗證碼？
                </button>
              )}
            </div>
          )}
        </Section>

        <Section
          title="公司存摺"
          intro="戶名須為公司戶（含「股份有限公司」或「有限公司」字樣），不接受個人戶。"
        >
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-medium leading-5 text-gray-800">主要存摺</span>
            {d.passbook ? (
              <FileCard
                title="存摺封面"
                file="IMG_2048.HEIC・2.4 MB"
                action="重新上傳"
                onAction={() => upload("main")}
              />
            ) : (
              <button
                type="button"
                onClick={() => upload("main")}
                className="flex h-[84px] items-center justify-center gap-2 rounded-xl border border-dashed border-[#d1d5dc] text-[16px] font-medium text-gray-800"
              >
                {uploading === "main" ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-[#d1d5dc] border-t-gray-800" />
                ) : (
                  <>
                    <UploadIcon className="size-6" />
                    上傳存摺封面
                  </>
                )}
              </button>
            )}
            {d.backupPassbook && (
              <FileCard
                title="備用存摺"
                file="IMG_2051.HEIC・2.1 MB"
                action="移除"
                onAction={() => updateDraft({ backupPassbook: false })}
              />
            )}
            {!d.backupPassbook && (
              <button
                type="button"
                onClick={() => upload("backup")}
                className="flex h-12 items-center gap-2 self-start rounded-full border border-gray-800 px-4 text-[16px] font-semibold text-gray-800"
              >
                {uploading === "backup" ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-[#d1d5dc] border-t-gray-800" />
                ) : (
                  <PlusIcon className="size-5" />
                )}
                增加備用存摺（選填）
              </button>
            )}
            <p className="text-[13px] leading-[18px] text-[#6a7282]">
              可拍照或從相簿選擇，支援 JPG／PNG／HEIC，10 MB 以內
            </p>
          </div>
        </Section>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2 border-t border-gray-100 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 sm:pb-[34px]">
        <button
          onClick={() => setDialog("submit")}
          disabled={remaining > 0}
          className="flex h-12 w-full items-center justify-center rounded-full bg-brand text-[16px] font-semibold text-white disabled:bg-gray-100 disabled:text-[#99a1af]"
        >
          送出申請
        </button>
        {remaining > 0 && (
          <p className="text-[13px] leading-[18px] text-[#6a7282]">還有 {remaining} 項未填寫</p>
        )}
      </div>

      <Dialog
        open={dialog === "leave"}
        title="要離開嗎？"
        body="已填寫的資料會保留，下次從「新增企業帳號」進入可以接續填寫。"
        cancel="離開"
        confirm="繼續填寫"
        onCancel={leave}
        onConfirm={() => setDialog(null)}
        onDismiss={() => setDialog(null)}
      />
      <Dialog
        open={dialog === "submit"}
        title="確認送出"
        body="送出後將進入審核，統一編號等公司資料無法再修改。確定要送出嗎？"
        cancel="取消"
        confirm="確定送出"
        loading={submitting}
        onCancel={() => !submitting && setDialog(null)}
        onConfirm={submit}
      />
    </div>
  );
}
