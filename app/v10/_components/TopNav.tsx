import Link from "next/link";
import { REWARD_BALANCE } from "../_lib/mock-data";

// 共用頂部導覽列：左邊 AIFIAN 品牌標（靠左對齊），右邊通知中心＋回饋數字並排——
// 取代原本左邊漢堡選單（開側邊欄）的版型，因為側邊欄已經拿掉了。
// 伴伴／回饋兩個分頁共用這個 header，帳號分頁維持自己原本的大頭貼版型。
export default function TopNav() {
  return (
    <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-1">
      {/* logo-aifian-mark.svg 這個檔案本身左側就內建了一截透明留白
          （量過像素，大約是圖高的 13% 寬），直接放大字會跟下面標題／
          標籤的左邊界對不齊，用負 margin 把那截留白吃掉才會真的切齊 */}
      <img
        src="/icons/logo-aifian-mark.svg"
        alt="AIFIAN"
        className="-ml-[13px] h-11"
      />
      <div className="flex items-center gap-2">
        <button
          title="通知"
          className="relative flex size-11 items-center justify-center rounded-full bg-white text-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
        >
          <img src="/icons/nav-bell.svg" alt="通知" className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand" />
        </button>
        <Link
          href="/v10/reward-history"
          className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
        >
          <img src="/icons/nav-reward.svg" alt="" className="size-7" />
          <span className="text-[15px] font-semibold text-gray-800">
            {REWARD_BALANCE.toLocaleString()}
          </span>
        </Link>
      </div>
    </div>
  );
}
