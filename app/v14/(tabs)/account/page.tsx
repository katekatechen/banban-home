"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import StatusBar from "../../_components/StatusBar";
import { UNREAD_NOTIFICATIONS } from "../../_lib/mock-data";
import { useUnopenedGifts } from "../../_lib/blindbox";
import {
  AtIcon,
  BuildingIcon,
  CheckCircleSolidIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  InfoIcon,
  PlusIcon,
  RefreshCircularIcon,
  ShoppingBagIcon,
} from "../../_components/CorpIcons";
import {
  COMPANY_NAME,
  MANAGER_NAME,
  PERSONAL_HANDLE,
  advanceVerification,
  initCorpFromUrl,
  requestSwitch,
  showToast,
  useCorp,
  type AccountMode,
} from "../../_lib/corp-account";
import { EASING } from "../../_lib/page-transition";

// v14 帳號分頁＋法人帳戶（企業帳號），照 Figma「法人帳戶｜流程」(55:30085)。
// - 標題就是目前的身分「個人帳號 ⌄／企業帳號 ⌄」，點標題打開切換選單
// - 標題下面只放帳號資料：個人是 @ID 與加入時間；企業是公司名稱與管理者
// - 企業帳號：header 深色；清單第一段只有一列「企業資料」，右側顯示審核狀態

const STATUS = {
  reviewing: { text: "審核中", color: "#00a6c4" },
  rejected: { text: "需補件", color: "#e7000b" },
  verified: { text: "已驗證", color: "#4a5565" },
} as const;

function Row({
  icon,
  title,
  desc,
  trailing,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  // 右側內容；沒給就是箭頭
  trailing?: React.ReactNode;
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
      {trailing ?? (
        <ChevronRightIcon className="size-6 shrink-0 text-gray-800" />
      )}
    </button>
  );
}

// 「已驗證 ✓」
const Verified = () => (
  <span className="flex shrink-0 items-center gap-2 text-[16px] leading-6 text-[#4a5565]">
    已驗證
    <img src="/figma/icon-security-pass.svg" alt="" className="size-6" />
  </span>
);

const Divider = () => <div className="mx-0 h-px shrink-0 bg-[#f3f4f6]" />;

const img = (src: string) => <img src={src} alt="" className="size-6" />;

export default function AccountPage() {
  const router = useRouter();
  const { corp, mode, toast } = useCorp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const unopenedGifts = useUnopenedGifts();
  useEffect(() => initCorpFromUrl(), []);

  const company = mode === "company" && corp !== "none";
  const fg = company ? "#ffffff" : "#1e2939";

  const copyHandle = () => {
    navigator.clipboard?.writeText(PERSONAL_HANDLE).catch(() => {});
    showToast("已複製 ID");
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+88px)] sm:pb-[110px]">
        {/* header：個人是淺灰底，企業是深色底 */}
        <div
          className="transition-colors duration-300"
          style={{ background: company ? "#1e2939" : "#f3f4f6" }}
        >
          <StatusBar light={company} />
          <div className="flex h-11 items-center justify-between px-4">
            {/* 標題就是切換入口 */}
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-1 transition-colors duration-300"
              style={{ color: fg }}
            >
              <span className="text-[24px] font-medium leading-8">
                {company ? "企業帳號" : "個人帳號"}
              </span>
              <ChevronDownIcon className="size-5" strokeWidth={2.4} />
            </button>
            <button
              onClick={() => router.push("/v14/notifications")}
              aria-label="通知"
              className="relative flex size-11 items-center justify-center rounded-[22px] bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
            >
              <img src="/figma/bell.svg" alt="" className="size-5" />
              {UNREAD_NOTIFICATIONS > 0 && (
                <span className="absolute left-[20.5px] top-1.5 rounded-[20px] bg-brand px-1 py-0.5 text-[13px] font-bold leading-3 text-gray-000">
                  {UNREAD_NOTIFICATIONS}
                </span>
              )}
            </button>
          </div>

          {/* 帳號資料：不負責切換 */}
          <div className="flex flex-col gap-2 px-4 pb-4 pt-6">
            {company ? (
              <>
                <p className="flex items-center gap-1 text-white">
                  <BuildingIcon className="size-5 shrink-0" />
                  <span className="text-[16px] font-semibold leading-6">
                    {COMPANY_NAME}
                  </span>
                </p>
                <p className="text-[14px] leading-[18px] text-[#d1d5dc]">
                  管理者 {MANAGER_NAME}
                </p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-2 text-gray-800">
                  <span className="flex items-center gap-1">
                    <AtIcon className="size-5 shrink-0" />
                    <span className="text-[16px] font-semibold leading-6">
                      {PERSONAL_HANDLE}
                    </span>
                  </span>
                  <button
                    onClick={copyHandle}
                    aria-label="複製 ID"
                    className="-m-1 p-1"
                  >
                    <CopyIcon className="size-4" />
                  </button>
                </p>
                <p className="text-[14px] leading-[18px] text-[#99a1af]">
                  2023 年 5 月加入
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 py-4">
          {company ? (
            <>
              {/* 企業驗證與企業資料合併成一列：右側只顯示審核狀態 */}
              <Row
                icon={<BuildingIcon className="size-6" />}
                title="企業資料"
                trailing={
                  corp === "verified" ? (
                    <Verified />
                  ) : (
                    <span
                      className="flex shrink-0 items-center gap-2 text-[16px] font-medium leading-6"
                      style={{
                        color: STATUS[corp as "reviewing" | "rejected"].color,
                      }}
                    >
                      {STATUS[corp as "reviewing" | "rejected"].text}
                      {corp === "reviewing" ? (
                        <RefreshCircularIcon className="size-6" />
                      ) : (
                        <ChevronRightIcon className="size-6 text-gray-800" />
                      )}
                    </span>
                  )
                }
                // demo：點一下模擬審核往下一步走（需補件 → 審核中 → 已驗證）
                onClick={advanceVerification}
              />
              <Divider />
            </>
          ) : (
            <Row
              icon={img("/figma/icon-verified-user.svg")}
              title="身分驗證"
              trailing={<Verified />}
            />
          )}

          <Row
            icon={img("/figma/icon-shield-check.svg")}
            title="帳號與安全性"
          />
          <Row icon={img("/figma/icon-wallet.svg")} title="收款與付款" />
          <Row icon={<ShoppingBagIcon className="size-6" />} title="訂單紀錄" />
          {!company && (
            <Row
              icon={img("/figma/icon-clipboard-check.svg")}
              title="我的收藏"
              onClick={() => router.push("/v14/collection")}
            />
          )}
          <Row
            icon={img("/figma/icon-clipboard-check.svg")}
            title="歷史交易紀錄"
          />
          {!company && (
            <>
              <Row icon={img("/figma/icon-community.svg")} title="推薦好友" />
              <Row
                icon={img("/figma/icon-gift.svg")}
                title="我的禮物"
                onClick={() => router.push("/v14/gifts")}
                trailing={
                  // 有沒拆的禮物：箭頭左邊多一顆品牌紅的數字
                  unopenedGifts > 0 ? (
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="min-w-5 rounded-full bg-brand px-1.5 text-center text-[13px] font-bold leading-5 text-white">
                        {unopenedGifts}
                      </span>
                      <ChevronRightIcon className="size-6 text-gray-800" />
                    </span>
                  ) : undefined
                }
              />
            </>
          )}
          <Row
            icon={img("/figma/icon-settings.svg")}
            title="偏好設定"
            onClick={() => router.push("/v14/preferences")}
          />
          <Divider />

          <Row icon={img("/figma/icon-page.svg")} title="條款及隱私權" />
          <Row icon={img("/figma/icon-lightbulb.svg")} title="我有使用建議" />

          <div className="grid grid-cols-2 gap-4 px-4 pb-2 pt-2">
            {[
              ["/figma/icon-book-solid.svg", "幫助中心"],
              ["/figma/icon-contact-babu.svg", "聯絡我們"],
            ].map(([icon, label]) => (
              <button
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)]"
              >
                <img src={icon} alt="" className="size-6" />
                <span className="text-[16px] font-medium leading-6 text-gray-800">
                  {label}
                </span>
              </button>
            ))}
          </div>
          <p className="px-4 pt-2 text-[14px] leading-[18px] text-gray-800">
            版本 10.5.0
          </p>
        </div>
      </div>

      {/* 頂部 snackbar（AFFOGATO Mode=Light）：從上面滑下來，蓋在標題列上 */}
      <div
        className="pointer-events-none absolute inset-x-0 z-30 flex justify-center px-4 top-[calc(env(safe-area-inset-top)+4px)] sm:top-[48px]"
        aria-live="polite"
      >
        {toast && (
          <p
            key={toast.id}
            className="snackbar-top rounded-lg bg-[#0c0e11]/80 px-4 py-3 text-[16px] leading-6 text-white backdrop-blur-[4px]"
          >
            {toast.text}
          </p>
        )}
      </div>

      <SwitchSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}

// 切換帳號 bottom sheet：掛到 #v14-frame，才蓋得過 tabbar
function SwitchSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { corp, mode } = useCorp();
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  // 關閉時先播完滑下去的動畫才卸載
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  // 正在切換到哪個帳號：選項顯示「切換中…」，其他選項先鎖住
  const [switching, setSwitching] = useState<AccountMode | null>(null);
  useEffect(() => setFrame(document.getElementById("v14-frame")), []);
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

  const pick = async (m: AccountMode) => {
    if (switching) return;
    if (m === mode) {
      onClose();
      return;
    }
    setSwitching(m);
    const ok = await requestSwitch(m);
    setSwitching(null);
    onClose();
    // 成功或失敗都是選單收起後，從上方滑入 snackbar；失敗就停在原本的帳號
    window.setTimeout(
      () =>
        showToast(
          ok
            ? m === "company"
              ? "已切換至企業帳號"
              : "已切換至個人帳號"
            : "切換失敗，請稍後再試",
        ),
      200,
    );
  };

  const Option = ({
    name,
    meta,
    value,
  }: {
    name: string;
    meta: string;
    value: AccountMode;
  }) => {
    const selected = mode === value && !switching;
    const loading = switching === value;
    const dimmed = switching !== null && !loading;
    return (
      <button
        onClick={() => pick(value)}
        disabled={switching !== null}
        className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-opacity"
        style={{
          borderColor: selected || loading ? "#1e2939" : "#e5e7eb",
          opacity: dimmed ? 0.4 : 1,
        }}
      >
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-[16px] font-medium leading-6 text-gray-800">
            {name}
          </span>
          <span className="text-[14px] leading-[18px] text-[#6a7282]">
            {meta}
            {loading && (
              <span className="font-medium text-gray-800">・切換中…</span>
            )}
          </span>
        </span>
        {loading ? (
          <span className="size-[22px] animate-spin rounded-full border-2 border-[#d1d5dc] border-t-[#1e2939]" />
        ) : selected ? (
          <CheckCircleSolidIcon className="size-6 text-[#ff3b3b]" />
        ) : (
          <span className="size-[22px] rounded-full border-[1.5px] border-[#d1d5dc]" />
        )}
      </button>
    );
  };

  return createPortal(
    <div className="absolute inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-[#111827]/40"
        style={{ opacity: shown ? 1 : 0, transition: "opacity 250ms ease" }}
        onClick={() => !switching && onClose()}
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
            name="個人帳號"
            meta={`@${PERSONAL_HANDLE}`}
            value="personal"
          />
          {hasCompany && (
            <Option name="企業帳號" meta={COMPANY_NAME} value="company" />
          )}
        </div>
        {/* 一個自然人只能對應一個法人：已經有企業帳號就不再出現新增 */}
        {!hasCompany && (
          <button
            onClick={() => {
              onClose();
              router.push("/v14/new-company");
            }}
            className="flex items-center gap-4 px-4 py-3 text-left"
          >
            <PlusIcon className="size-6 text-gray-800" />
            <span className="flex-1 text-[16px] font-medium leading-6 text-gray-800">
              新增企業帳號
            </span>
            <ChevronRightIcon className="size-6 text-gray-800" />
          </button>
        )}
        <div className="px-4">
          <div className="flex gap-2 rounded-lg bg-gray-100 p-3">
            <InfoIcon className="mt-px size-4 shrink-0 text-[#99a1af]" />
            <p className="text-[13px] leading-[18px] text-[#4a5565]">
              切換後，付款、交易紀錄都會以所選帳號為主體。
            </p>
          </div>
        </div>
      </div>
    </div>,
    frame,
  );
}
