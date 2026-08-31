import StatusBar from "./StatusBar";
import AiSelectSummaryCard from "./AiSelectSummaryCard";
import WineSelectBody from "./WineSelectBody";

// 智能選品跟精選單品合併成「酒藏」——不是左右滑動切換，而是同一頁上下堆疊：
// 智能選品的持有摘要在最上面，精選單品的可瀏覽貨架直接接在下面，
// 讓精選單品隨時撐著智能選品，不會被滑走看不到。
export default function AiWineSection() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <p className="text-[20px] font-bold text-gray-800">酒藏</p>
        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
          <img src="/icons/nav-reward.svg" alt="" className="size-4" />
          <span className="text-[14px] font-medium text-gray-800">
            999,999
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 pb-6 pt-2">
        <div className="px-4">
          <AiSelectSummaryCard />
        </div>

        <div id="picks-shelf" className="flex flex-col gap-3">
          <div className="px-4">
            <p className="text-[16px] font-semibold text-gray-800">精選單品</p>
            <p className="mt-0.5 text-[12px] text-gray-400">
              智能選品持有的酒，都是從這裡精選出來
            </p>
          </div>
          <WineSelectBody />
        </div>
      </div>
    </div>
  );
}
