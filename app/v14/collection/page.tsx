"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusBar from "../_components/StatusBar";
import { getOpenedWines } from "../_lib/blindbox";
import {
  WINE_HOLDINGS,
  WINE_HOLDINGS_TOTAL_CHANGE_PCT,
  WINE_HOLDINGS_TOTAL_VALUE,
} from "../_lib/mock-data";
import { usePageSlide } from "../_lib/page-transition";

// 我的收藏：照 Figma 0j77VWDEI7rbmom5fT0tTb / 19491:22486。
// 淺灰底頁面、頂部一條「酒品總現值」、下面一列一瓶（wine cell）：
// 左邊酒的圖、品名最多兩行、數量；右邊市值跟漲跌。
// 酒品盲盒開出來的酒也是一列，跟其他收藏同一個格式，排在最上面（最新的）。
// 盲盒剛開出來還沒有漲跌，先寫 +0.00%

type Cell = {
  key: string;
  name: string;
  image: string;
  qty: number;
  value: number;
  changePct: number;
};

const pct = (n: number) => `+${n.toFixed(2)}%`;

export default function CollectionPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();
  const [blind] = useState(getOpenedWines);
  const blindValue = blind.reduce((sum, w) => sum + w.value, 0);

  const cells: Cell[] = [
    ...blind.map((w) => ({
      key: w.key,
      name: w.name,
      image: "/figma/product-wine-collection.png",
      qty: 1,
      value: w.value,
      changePct: 0,
    })),
    ...WINE_HOLDINGS.map((h) => ({
      key: h.id,
      name: h.name,
      image: h.image,
      qty: h.qty,
      value: h.currentValue,
      changePct: h.changePct,
    })),
  ];

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-[#f9fafb]"
      style={style}
    >
      <StatusBar />

      {/* 導覽列：左邊 36px 半透明白底圓形返回鈕，標題置中 */}
      <div className="relative flex h-11 shrink-0 items-center pl-4 pr-3">
        <button
          onClick={() => exit(() => router.back())}
          aria-label="返回"
          className="flex size-9 items-center justify-center"
        >
          <img
            src="/v14/collection/back-button.svg"
            alt=""
            width={36}
            height={36}
          />
        </button>
        <p className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold leading-6 text-gray-800">
          我的收藏
        </p>
      </div>

      {/* 酒品總現值 */}
      <div className="flex shrink-0 items-center justify-between bg-[#f3f4f6] p-4 text-[14px] font-semibold leading-[18px]">
        <p className="text-gray-800">酒品總現值</p>
        <div className="flex items-center gap-1">
          <p className="text-gray-800">
            ${(WINE_HOLDINGS_TOTAL_VALUE + blindValue).toLocaleString()}
          </p>
          <p className="text-[#06c292]">({pct(WINE_HOLDINGS_TOTAL_CHANGE_PCT)})</p>
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain">
        {cells.map((c) => (
          <div
            key={c.key}
            className="flex items-center gap-2 border-b border-[#e5e7eb] p-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <img
                src={c.image}
                alt=""
                className="size-12 shrink-0 rounded-[8px] object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="line-clamp-2 text-[14px] font-medium leading-[18px] text-gray-800">
                  {c.name}
                </p>
                <p className="text-[12px] leading-4 tracking-[0.12px] text-[#6a7282]">
                  x{c.qty.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 self-stretch justify-center font-semibold">
              <p className="text-[14px] leading-[18px] text-gray-800">
                ${c.value.toLocaleString()}
              </p>
              <p className="text-[12px] leading-4 tracking-[0.12px] text-[#06c292]">
                {pct(c.changePct)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
