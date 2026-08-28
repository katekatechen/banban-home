"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBar from "../_components/StatusBar";
import SectionSwitcher from "../_components/SectionSwitcher";
import {
  PRODUCTS,
  HOLDINGS,
  TOTAL_PORTFOLIO_VALUE,
  TOTAL_PORTFOLIO_CHANGE_PCT,
  type WineType,
} from "../_lib/mock-data";

const SORT_FILTERS = ["全部", "最新上架", "保值首選", "千元好物", "搭餐絕配"];

const CATEGORIES: { key: WineType | "全部"; label: string; icon: string }[] = [
  { key: "全部", label: "全部", icon: "/icons/cat-all.svg" },
  { key: "威士忌", label: "威士忌", icon: "/icons/cat-whisky.svg" },
  { key: "高粱", label: "高粱", icon: "/icons/cat-sorghum.svg" },
  { key: "白蘭地", label: "白蘭地", icon: "/icons/cat-brandy.svg" },
  { key: "紅酒", label: "紅酒", icon: "/icons/cat-redwine.svg" },
  { key: "白酒", label: "白酒", icon: "/icons/cat-whitewine.svg" },
];

export default function WineSelectPage() {
  const [sortFilter, setSortFilter] = useState(SORT_FILTERS[0]);
  const [category, setCategory] = useState<WineType | "全部">("全部");

  const products =
    category === "全部"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.wineType === category);

  return (
    <div className="flex flex-col bg-white">
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <SectionSwitcher active="wine" />
        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
          <img src="/icons/nav-reward.svg" alt="" className="size-4" />
          <span className="text-[14px] font-medium text-gray-800">
            999,999
          </span>
        </div>
      </div>

      <Link
        href="/v4/collection"
        className="mx-4 mb-3 flex items-center gap-3 rounded-2xl bg-gray-000 px-4 py-3"
      >
        <div className="flex -space-x-2">
          {HOLDINGS.slice(0, 3).map((h) => (
            <div
              key={h.id}
              className={`flex size-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-[16px] ${h.gradient}`}
            >
              {h.emoji}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <p className="text-[13px] text-gray-500">我的酒窖</p>
          <p className="text-[15px] font-semibold text-gray-800">
            ${TOTAL_PORTFOLIO_VALUE.toLocaleString()}{" "}
            <span className="text-[13px] font-medium text-emerald-600">
              (+{TOTAL_PORTFOLIO_CHANGE_PCT}%)
            </span>
          </p>
        </div>
        <span className="text-gray-300">›</span>
      </Link>

      <div className="relative">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 pr-12">
          {SORT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setSortFilter(f)}
              className={`shrink-0 rounded-lg px-3 py-2 text-[14px] font-semibold ${
                sortFilter === f
                  ? "bg-gray-800 text-gray-000"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-3 right-0 top-0 flex w-14 items-center justify-end bg-gradient-to-l from-white via-white to-transparent pr-4">
          <button className="pointer-events-auto flex size-6 items-center justify-center">
            <img src="/icons/filter-alt.svg" alt="篩選" className="size-6" />
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className="flex w-[52px] shrink-0 flex-col items-center gap-1"
          >
            <span
              className={`flex size-12 items-center justify-center rounded-full ${
                category === c.key ? "bg-red-50" : ""
              }`}
            >
              <img src={c.icon} alt="" className="size-10" />
            </span>
            <span
              className={`text-[12px] ${
                category === c.key
                  ? "font-semibold text-gray-900"
                  : "text-gray-500"
              }`}
            >
              {c.label}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 px-4 pb-6">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/v4/wine-select/${p.id}`}
            className="flex flex-col overflow-hidden rounded-lg"
          >
            <div
              className={`relative flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br text-[56px] ${p.gradient}`}
            >
              {p.tag && (
                <span className="absolute right-2 top-2 rounded-[10px] bg-black/60 px-2 py-1 text-[11px] font-semibold text-gray-000">
                  {p.tag}
                </span>
              )}
              {p.emoji}
            </div>
            <div className="flex flex-col gap-1 px-2 py-3">
              <p className="text-[12px] tracking-wide text-gray-500">
                {p.subtitle}
              </p>
              <p className="line-clamp-2 h-9 text-[14px] font-medium text-gray-800">
                {p.name}
              </p>
              <p className="text-[14px] text-gray-800">${p.price}</p>
            </div>
          </Link>
        ))}
        {products.length === 0 && (
          <p className="col-span-2 py-10 text-center text-[13px] text-gray-400">
            這個分類目前沒有商品
          </p>
        )}
      </div>
    </div>
  );
}
