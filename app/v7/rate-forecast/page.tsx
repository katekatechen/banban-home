import StatusBar from "../_components/StatusBar";
import BackButton from "../_components/BackButton";

export default function RateForecastPage() {
  return (
    <div
      className="no-scrollbar flex h-full flex-col overflow-y-auto bg-white"
      style={{ animation: "pageIn 0.28s cubic-bezier(.2,.9,.25,1)" }}
    >
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <div className="flex items-center gap-2">
          <BackButton />
          <p className="text-[20px] font-bold text-gray-800">匯率預測</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
          <img src="/icons/nav-reward.svg" alt="" className="size-4" />
          <span className="text-[14px] font-medium text-gray-800">
            999,999
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
        <div className="flex flex-col gap-3 rounded-2xl bg-gray-000 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-gray-800">
              本期匯率預測
            </p>
            <span className="text-[22px]">💱</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-gray-500">本期累積獎金</p>
              <p className="text-[22px] font-bold text-gray-800">10,000</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-gray-500">我的號碼</p>
              <p className="text-[14px] text-gray-400">尚未預測</p>
            </div>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-gray-500">
          預測下週美元兌台幣匯率走勢，猜中區間的用戶平分本期獎金。
        </p>
      </div>
    </div>
  );
}
