"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import { usePageSlide } from "../_lib/page-transition";
import { WINE_SHOP_PRODUCTS, type WineType } from "../_lib/mock-data";

const SORT_FILTERS = ["全部", "最新上架", "保值首選", "千元好物"];

const CATEGORIES: { key: WineType | "全部"; label: string; icon: string }[] = [
  { key: "全部", label: "全部", icon: "/figma/cat-all.svg" },
  { key: "威士忌", label: "威士忌", icon: "/figma/cat-whisky.svg" },
  { key: "高粱", label: "高粱", icon: "/figma/cat-sorghum.svg" },
  { key: "白蘭地", label: "白蘭地", icon: "/figma/cat-brandy.svg" },
  { key: "紅酒", label: "紅酒", icon: "/figma/cat-redwine.svg" },
  { key: "白酒", label: "白酒", icon: "/figma/cat-whitewine.svg" },
];

// 這版沒有結帳頁，購物車角標維持純視覺展示、不接任何動作——
// 沒建的功能不假裝可以點，寧可看起來單純一點
export default function WineSelectPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();
  const [sortFilter, setSortFilter] = useState(SORT_FILTERS[0]);
  const [category, setCategory] = useState<WineType | "全部">("全部");

  const products =
    category === "全部"
      ? WINE_SHOP_PRODUCTS
      : WINE_SHOP_PRODUCTS.filter((p) => p.wineType === category);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-white"
      style={style}
    >
      <StatusBar />
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <button
          onClick={() => exit(() => router.back())}
          className="flex size-11 items-center justify-center rounded-[22px] border border-gray-200 bg-white shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]"
        >
          <img src="/figma/nav-arrow-left.svg" alt="返回" className="size-5" />
        </button>
        <div className="flex items-center gap-1.5 rounded-[22px] border border-gray-200 bg-white px-3 py-2 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]">
          <img src="/figma/icon-cart.svg" alt="" className="size-5" />
          <span className="text-[13px] font-semibold text-gray-800">$1,999</span>
        </div>
      </div>

      <div className="relative shrink-0">
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-4 pr-14">
          {SORT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setSortFilter(f)}
              className={`shrink-0 rounded-lg px-2 py-2 text-[14px] font-semibold ${
                sortFilter === f ? "bg-gray-800 text-white" : "bg-[#f3f4f6] text-gray-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-16 items-center justify-end bg-gradient-to-r from-transparent via-white/80 to-white pr-4">
          <button className="pointer-events-auto flex size-6 items-center justify-center">
            <img src="/figma/icon-filter-alt.svg" alt="篩選" className="size-6" />
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-4 pb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className="flex w-[52px] shrink-0 flex-col items-center gap-0"
          >
            <span className="flex h-12 items-center justify-center">
              <img src={c.icon} alt="" className="size-10" />
            </span>
            <span
              className={`text-[12px] tracking-[0.12px] ${
                category === c.key ? "font-semibold text-[#1b1f26]" : "text-[#6b7483]"
              }`}
            >
              {c.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="flex flex-col overflow-hidden rounded-lg">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f6f7f8]">
                <img src={p.image} alt="" className="size-full object-cover" />
                {p.tag && (
                  <span className="absolute right-2 top-2 rounded-[10px] bg-gray-800 px-2 py-1 text-[12px] font-semibold text-white">
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 px-0 py-3">
                <p className="text-[12px] tracking-wide text-gray-500">
                  {p.subtitle}
                </p>
                <p className="line-clamp-2 h-9 text-[14px] font-medium text-gray-800">
                  {p.name}
                </p>
                <p className="text-[14px] text-gray-800">
                  ${p.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="col-span-2 py-10 text-center text-[13px] text-gray-500">
              這個分類目前沒有商品
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() =>
          router.push(`/v12/chat?prompt=${encodeURIComponent("我想買酒送到家")}`)
        }
        className="absolute bottom-[24px] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-[26px] bg-gray-800 px-6 py-4 shadow-[0px_4px_16px_0px_rgba(30,41,57,0.25)]"
      >
        <img src="/figma/icon-chat-bubble.svg" alt="" className="size-4" />
        <p className="text-[14px] font-semibold text-white">我想買酒送到家</p>
      </button>
    </div>
  );
}
