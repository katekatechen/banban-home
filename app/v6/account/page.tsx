import Link from "next/link";
import StatusBar from "../_components/StatusBar";
import BackButton from "../_components/BackButton";

type Row = {
  key: string;
  icon: string;
  label: string;
  right?: string;
  warn?: boolean;
  badge?: number;
  href?: string;
};

const SETTINGS_1: Row[] = [
  {
    key: "verify",
    icon: "/icons/acc-verified-user.svg",
    label: "身分驗證",
    right: "未通過，點此重新驗證",
    warn: true,
  },
  {
    key: "security",
    icon: "/icons/acc-shield-check.svg",
    label: "帳號與安全性",
  },
  {
    key: "payment",
    icon: "/icons/acc-wallet.svg",
    label: "收款與付款",
  },
  {
    key: "orders",
    icon: "/icons/acc-clipboard-check.svg",
    label: "歷史交易紀錄",
    href: "/v6/orders",
  },
  {
    key: "gifts",
    icon: "/icons/acc-gift.svg",
    label: "我的禮物",
    badge: 1,
  },
  {
    key: "prefs",
    icon: "/icons/acc-settings.svg",
    label: "偏好設定",
  },
];

const SETTINGS_2: Row[] = [
  {
    key: "terms",
    icon: "/icons/acc-page.svg",
    label: "條款及隱私權",
  },
  {
    key: "feedback",
    icon: "/icons/acc-lightbulb.svg",
    label: "我有使用建議",
  },
];

export default function AccountPage() {
  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto bg-white">
      <StatusBar />
      <div className="flex flex-col gap-1 px-4 pb-4 pt-2">
        <div className="flex items-center gap-2">
          <BackButton />
          <p className="text-[20px] font-bold text-gray-800">帳號</p>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-full bg-gray-100 text-[24px]">
            🧑
          </div>
          <div>
            <p className="text-[16px] font-semibold text-gray-800">阿福</p>
            <p className="text-[13px] text-gray-500">fu@example.com</p>
          </div>
        </div>
      </div>

      <SettingsBlock rows={SETTINGS_1} />
      <div className="px-4 py-4">
        <div className="h-px w-full bg-[#f7f7f7]" />
      </div>
      <SettingsBlock rows={SETTINGS_2} />

      <div className="flex flex-col gap-4 px-4 py-6">
        <div className="flex items-center gap-3 rounded-lg border border-[#eee] p-4 shadow-[0px_2px_20px_0px_rgba(165,204,194,0.2)]">
          <span className="text-[32px]">🎁</span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] text-gray-800">一起買酒拿回饋！</p>
            <p className="text-[14px] text-gray-500">
              推薦朋友買酒，你們都能獲得{" "}
              <span className="font-semibold text-brand">$100</span> 回饋！
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-4 rounded-lg border border-gray-200 p-4 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.06)]">
            <img src="/icons/acc-book-solid.svg" alt="" className="size-6" />
            <p className="text-[16px] font-semibold text-gray-800">
              幫助中心
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-4 rounded-lg border border-gray-200 p-4 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.06)]">
            <img src="/icons/acc-babu.svg" alt="" className="size-6" />
            <p className="text-[16px] text-gray-800">聯絡我們</p>
          </div>
        </div>
      </div>

      <p className="px-4 pb-8 text-right text-[14px] text-gray-500">
        版本 1.0.0
      </p>
    </div>
  );
}

function SettingsBlock({ rows }: { rows: Row[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((r) => {
        const content = (
          <>
            <div className="flex flex-1 items-center gap-4 py-3">
              <img src={r.icon} alt="" className="size-6" />
              <p className="flex-1 text-[16px] text-gray-800">{r.label}</p>
            </div>
            <div className="flex items-center gap-1.5 py-2.5">
              {r.warn && (
                <span className="text-[16px] text-brand">{r.right}</span>
              )}
              {typeof r.badge === "number" && (
                <span className="flex size-6 items-center justify-center rounded-full bg-brand text-[14px] font-semibold text-white">
                  {r.badge}
                </span>
              )}
              <img
                src="/icons/acc-nav-arrow-right.svg"
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
