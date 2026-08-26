import StatusBar from "../_components/StatusBar";

const SETTINGS = [
  { label: "身分驗證", status: "未通過，點此重新驗證", warn: true },
  { label: "付款方式", status: "已綁定 1 張卡" },
  { label: "收件地址", status: "台北市．已設定" },
  { label: "通知設定", status: "" },
  { label: "關於 AIFIAN", status: "" },
];

export default function AccountPage() {
  return (
    <div className="flex flex-col bg-white">
      <StatusBar />
      <div className="flex flex-col gap-1 px-4 pb-4 pt-2">
        <p className="text-[20px] font-bold text-gray-800">帳號</p>
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

      <div className="flex flex-col">
        {SETTINGS.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5"
          >
            <p className="text-[14px] text-gray-800">{s.label}</p>
            <div className="flex items-center gap-1.5">
              <p
                className={`text-[13px] ${
                  s.warn ? "font-semibold text-brand" : "text-gray-400"
                }`}
              >
                {s.status}
              </p>
              <span className="text-gray-300">›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
