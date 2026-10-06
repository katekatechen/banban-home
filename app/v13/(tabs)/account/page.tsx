"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import StatusBar from "../../_components/StatusBar";
import { UNREAD_NOTIFICATIONS } from "../../_lib/mock-data";
import {
  AtIcon,
  BuildingIcon,
  CheckCircleIcon,
  CheckCircleSolidIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InfoIcon,
  PlusIcon,
} from "../../_components/CorpIcons";
import {
  COMPANY_NAME,
  PERSONAL_HANDLE,
  advanceVerification,
  initCorpFromUrl,
  switchMode,
  useCorp,
  type CorpStatus,
} from "../../_lib/corp-account";
import { EASING } from "../../_lib/page-transition";

// v13 帳號分頁＋法人帳戶（企業帳號），照 Figma「法人帳戶｜情境完稿」(1062:24469)。
// 個人、企業兩種身分共用同一個選單結構：企業帳號 → 帳號設定 → 其他。
// - 還沒有企業帳號：個人選單不放新增入口，點帳號名稱打開切換選單才看得到「新增企業帳號」
// - 已有企業帳號：切換選單只剩兩個帳號可選（一個自然人只能對應一個法人）
// - 企業帳號：header 深色，驗證通過前不顯示法人合約、企業資料

const TEAL = "#007595";

const STATUS_LABEL: Record<Exclude<CorpStatus, "none">, { text: string; color: string }> = {
  unverified: { text: "未完成", color: TEAL },
  reviewing: { text: "審核中", color: "#2b7fff" },
  rejected: { text: "需補件", color: "#ff3b3b" },
  verified: { text: "已驗證", color: "#4a5565" },
};

function Row({
  icon,
  title,
  desc,
  label,
  labelColor,
  verified = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  label?: string;
  labelColor?: string;
  // 右邊是「已驗證 ✓」而不是箭頭
  verified?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-12 w-full items-center gap-4 px-4 py-3 text-left active:bg-gray-50"
    >
      <span className="flex size-6 shrink-0 items-center justify-center text-gray-800">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[16px] font-medium leading-6 text-gray-800">
          {title}
        </span>
        {desc && (
          <span className="text-[14px] leading-[18px] text-[#6a7282]">
            {desc}
          </span>
        )}
      </span>
      {label && (
        <span
          className={`shrink-0 text-[16px] leading-6 ${labelColor ? "font-medium" : ""}`}
          style={{ color: labelColor ?? "#4a5565" }}
        >
          {label}
        </span>
      )}
      {verified ? (
        <img src="/figma/icon-security-pass.svg" alt="" className="size-6 shrink-0" />
      ) : (
        <ChevronRightIcon className="size-6 shrink-0 text-gray-800" />
      )}
    </button>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-4 pt-2 text-[14px] leading-[18px] text-[#6a7282]">
      {children}
    </p>
  );
}

const Divider = () => <div className="h-px shrink-0 bg-[#f7f7f7]" />;

const img = (src: string) => <img src={src} alt="" className="size-6" />;

export default function AccountPage() {
  const router = useRouter();
  const { corp, mode, toast } = useCorp();
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => initCorpFromUrl(), []);

  const company = mode === "company" && corp !== "none";
  const status = corp === "none" ? null : STATUS_LABEL[corp];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+88px)] sm:pb-[110px]">
        {/* header：企業帳號是深色底（照 Figma B1 1062:24953） */}
        <div
          className="transition-colors duration-300"
          style={{ background: company ? "#1e2939" : "#ffffff" }}
        >
          <StatusBar light={company} />
          <div className="flex h-11 items-center justify-between px-4">
            <p
              className="text-[24px] font-medium leading-8 transition-colors duration-300"
              style={{ color: company ? "#ffffff" : "#1e2939" }}
            >
              帳號
            </p>
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

          {/* 帳號切換器：點名稱打開「切換帳號」 */}
          <div className="flex flex-col gap-2 px-4 pb-4 pt-6">
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 self-start"
              style={{ color: company ? "#ffffff" : "#1e2939" }}
            >
              <span className="flex items-center gap-1">
                {company ? (
                  <BuildingIcon className="size-5" />
                ) : (
                  <AtIcon className="size-5" />
                )}
                <span className="text-[16px] font-semibold leading-6">
                  {company ? COMPANY_NAME : PERSONAL_HANDLE}
                </span>
              </span>
              <ChevronDownIcon className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              {company ? (
                <span
                  className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[12px] font-medium leading-4 text-white"
                  style={{ background: TEAL }}
                >
                  {corp === "verified" && <CheckIcon className="size-3" />}
                  {corp === "verified" ? "企業帳號・已驗證" : "企業帳號"}
                </span>
              ) : (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[12px] font-medium leading-4 text-[#4a5565]">
                  個人帳號
                </span>
              )}
              <span className="text-[14px] leading-[18px] text-[#6a7282]">
                {company ? `管理者 @${PERSONAL_HANDLE}` : "2023 年 5 月加入"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 py-4">
          {/* 企業帳號：個人身分在已有企業帳號時才出現；企業身分顯示驗證與企業功能 */}
          {company ? (
            <>
              <SectionLabel>企業帳號</SectionLabel>
              {corp === "verified" ? (
                <Row
                  icon={<CheckCircleIcon className="size-6" />}
                  title="企業驗證"
                  label="已驗證"
                  verified
                />
              ) : (
                <Row
                  icon={<CheckCircleIcon className="size-6" />}
                  title="企業驗證"
                  desc={
                    corp === "reviewing"
                      ? "預計 1 至 3 個工作天完成"
                      : corp === "rejected"
                        ? "公司登記文件不清楚，請重新上傳"
                        : "完成驗證後即可簽署法人合約"
                  }
                  label={status!.text}
                  labelColor={status!.color}
                  onClick={advanceVerification}
                />
              )}
              {corp === "verified" && (
                <>
                  <Row
                    icon={img("/figma/icon-page.svg")}
                    title="法人合約"
                    label="1 份待簽署"
                    labelColor="#ff3b3b"
                  />
                  <Row icon={<BuildingIcon className="size-6" />} title="企業資料" />
                </>
              )}
              <Divider />
            </>
          ) : (
            corp !== "none" && (
              <>
                <SectionLabel>企業帳號</SectionLabel>
                <Row
                  icon={<BuildingIcon className="size-6" />}
                  title={COMPANY_NAME}
                  desc="點一下切換至企業帳號"
                  label={corp === "unverified" ? "驗證未完成" : status!.text}
                  labelColor={corp === "verified" ? undefined : status!.color}
                  onClick={() => switchMode("company")}
                />
                <Divider />
              </>
            )
          )}

          <SectionLabel>帳號設定</SectionLabel>
          <Row
            icon={img("/figma/icon-verified-user.svg")}
            title={company ? "負責人身分驗證" : "身分驗證"}
            label="已驗證"
            verified
          />
          <Row icon={img("/figma/icon-shield-check.svg")} title="帳號與安全性" />
          <Row icon={img("/figma/icon-wallet.svg")} title="收款與付款" />
          {!company && (
            <Row
              icon={img("/figma/icon-clipboard-check.svg")}
              title="我的收藏"
              onClick={() => router.push("/v13/collection")}
            />
          )}
          <Row icon={img("/figma/icon-clipboard-check.svg")} title="歷史交易紀錄" />
          {!company && (
            <>
              <Row icon={img("/figma/icon-community.svg")} title="推薦好友" />
              <Row icon={img("/figma/icon-gift.svg")} title="我的禮物" />
            </>
          )}
          <Row icon={img("/figma/icon-settings.svg")} title="偏好設定" />
          <Divider />

          <SectionLabel>其他</SectionLabel>
          <Row icon={img("/figma/icon-page.svg")} title="條款及隱私權" />
          <Row icon={img("/figma/icon-lightbulb.svg")} title="我有使用建議" />

          <div className="grid grid-cols-2 gap-4 px-4 pb-2 pt-4">
            {[
              ["/figma/icon-book-solid.svg", "幫助中心"],
              ["/figma/icon-contact-babu.svg", "聯絡我們"],
            ].map(([icon, label]) => (
              <button
                key={label}
                className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 p-4"
              >
                <img src={icon} alt="" className="size-6" />
                <span className="text-[16px] font-medium leading-6 text-gray-800">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* snackbar：固定在 tabbar 上方，不跟著捲 */}
      <div
        className="pointer-events-none absolute inset-x-0 z-30 flex justify-center bottom-[calc(env(safe-area-inset-bottom)+83px)] sm:bottom-[105px]"
        aria-live="polite"
      >
        {toast && (
          <div
            key={toast.id}
            className="corp-toast flex items-center gap-2 rounded-full bg-[#1e2939] px-4 py-2.5 text-[14px] font-medium leading-5 text-white shadow-[0px_4px_16px_rgba(0,0,0,0.12)]"
          >
            <CheckCircleIcon className="size-5" />
            {toast.text}
          </div>
        )}
      </div>

      <SwitchSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}

// 切換帳號 bottom sheet：掛到 #v13-frame，才蓋得過 tabbar
function SwitchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { corp, mode } = useCorp();
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  // 關閉時先播完滑下去的動畫才卸載
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => setFrame(document.getElementById("v13-frame")), []);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const r = requestAnimationFrame(() =>
        requestAnimationFrame(() => setShown(true)),
      );
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), 300);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!frame || !mounted) return null;
  const hasCompany = corp !== "none";
  const companyStatus =
    corp === "none"
      ? null
      : corp === "verified"
        ? { text: "已驗證", color: "#16a34a" }
        : corp === "unverified"
          ? { text: "驗證未完成", color: TEAL }
          : STATUS_LABEL[corp];

  const pick = (m: "personal" | "company") => {
    onClose();
    window.setTimeout(() => switchMode(m), 200);
  };

  const Option = ({
    name,
    meta,
    selected,
    onClick,
  }: {
    name: string;
    meta: React.ReactNode;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left"
      style={{
        background: selected ? "#fff5f5" : "#ffffff",
        borderColor: selected ? "#ff3b3b" : "#e5e7eb",
      }}
    >
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[16px] font-medium leading-6 text-gray-800">
          {name}
        </span>
        <span className="flex items-center gap-1 text-[14px] leading-[18px] text-[#6a7282]">
          {meta}
        </span>
      </span>
      {selected ? (
        <CheckCircleSolidIcon className="size-6 text-[#ff3b3b]" />
      ) : (
        <span className="size-[22px] rounded-full border-[1.5px] border-[#d1d5dc]" />
      )}
    </button>
  );

  return createPortal(
    <div className="absolute inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-[#111827]/40"
        style={{ opacity: shown ? 1 : 0, transition: "opacity 250ms ease" }}
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col gap-4 rounded-t-3xl bg-white pb-[calc(env(safe-area-inset-bottom)+24px)] pt-2 sm:pb-[34px]"
        style={{
          transform: shown ? "translateY(0)" : "translateY(100%)",
          transition: `transform 300ms ${EASING}`,
        }}
      >
        <div className="mx-auto h-1 w-9 rounded-full bg-[#d1d5dc]" />
        <p className="px-4 pt-2 text-[20px] font-medium leading-7 text-gray-800">
          切換帳號
        </p>
        <div className="flex flex-col gap-2 px-4">
          <Option
            name={PERSONAL_HANDLE}
            meta="個人帳號"
            selected={mode === "personal"}
            onClick={() => pick("personal")}
          />
          {hasCompany && (
            <Option
              name={COMPANY_NAME}
              meta={
                <>
                  企業帳號・
                  <span className="font-medium" style={{ color: companyStatus!.color }}>
                    {companyStatus!.text}
                  </span>
                </>
              }
              selected={mode === "company"}
              onClick={() => pick("company")}
            />
          )}
        </div>
        {/* 一個自然人只能對應一個法人：已經有企業帳號就不再出現新增 */}
        {!hasCompany && (
          <button
            onClick={() => {
              onClose();
              router.push("/v13/new-company");
            }}
            className="flex items-center gap-4 py-3 pl-8 pr-4 text-left"
          >
            <PlusIcon className="size-6 text-gray-800" />
            <span className="flex flex-1 flex-col gap-1">
              <span className="text-[16px] font-medium leading-6 text-gray-800">
                新增企業帳號
              </span>
              <span className="text-[14px] leading-[18px] text-[#6a7282]">
                以公司名義交易、簽署法人合約
              </span>
            </span>
            <ChevronRightIcon className="size-6 text-gray-800" />
          </button>
        )}
        <div className="px-4">
          <div className="flex gap-2 rounded-lg bg-gray-100 p-3">
            <InfoIcon className="mt-px size-4 shrink-0 text-[#99a1af]" />
            <p className="text-[13px] leading-[18px] text-[#4a5565]">
              {hasCompany
                ? "一個個人帳號只能建立一個企業帳號。切換後，付款、交易紀錄與合約都會以所選帳號為主體。"
                : "切換後，付款、交易紀錄與合約都會以所選帳號為主體。"}
            </p>
          </div>
        </div>
      </div>
    </div>,
    frame,
  );
}
