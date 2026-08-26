import Link from "next/link";
import StatusBar from "../_components/StatusBar";
import { PRODUCTS } from "../_lib/mock-data";

const CATEGORIES = ["全部", "威士忌", "高粱", "白蘭地", "紅酒", "白酒"];

export default function WineSelectPage() {
  return (
    <div className="flex flex-col bg-white">
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <p className="text-[20px] font-bold text-gray-800">精選酒品</p>
        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
          <span className="text-brand">💰</span>
          <span className="text-[14px] font-medium text-gray-800">
            999,999
          </span>
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {CATEGORIES.map((c, i) => (
          <span
            key={c}
            className={`shrink-0 rounded-lg px-3 py-2 text-[14px] font-semibold ${
              i === 0 ? "bg-gray-800 text-gray-000" : "bg-gray-100 text-gray-800"
            }`}
          >
            {c}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 px-4 pb-6">
        {PRODUCTS.map((p) => (
          <Link
            key={p.id}
            href={`/v1/wine-select/${p.id}`}
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
      </div>
    </div>
  );
}
