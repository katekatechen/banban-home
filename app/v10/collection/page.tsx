"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import {
  HOLDINGS,
  TOTAL_PORTFOLIO_VALUE,
  TOTAL_PORTFOLIO_CHANGE_PCT,
} from "../_lib/mock-data";

// 照 Figma「我的收藏」節點（379:24854）還原：置中標題＋左上角返回鍵，
// 底下是總現值一行，再來是清單（不是格狀），每列縮圖＋名稱＋持有量＋現值/漲幅。
export default function CollectionPage() {
  const router = useRouter();
  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <div className="relative flex h-11 shrink-0 items-center px-4">
        <button
          onClick={() => router.back()}
          aria-label="返回"
          className="flex size-11 items-center justify-center rounded-[22px] border border-gray-200 bg-white shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]"
        >
          <img src="/figma/nav-arrow-left2.svg" alt="" className="size-5" />
        </button>
        <p className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold text-gray-800">
          我的收藏
        </p>
      </div>

      <div className="flex items-center justify-between p-4">
        <p className="text-[14px] font-semibold text-gray-800">酒品總現值</p>
        <div className="flex items-center gap-1">
          <p className="text-[14px] font-semibold text-gray-800">
            ${TOTAL_PORTFOLIO_VALUE.toLocaleString()}
          </p>
          <p className="text-[14px] font-semibold text-[#06c292]">
            (+{TOTAL_PORTFOLIO_CHANGE_PCT}%)
          </p>
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {HOLDINGS.map((h) => (
          <Link
            key={h.id}
            href={`/v10/collection/${h.id}`}
            className="flex items-center gap-2 border-b border-gray-200 p-4"
          >
            <div className="size-12 shrink-0 overflow-hidden rounded-lg">
              <img src={h.image} alt="" className="size-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="line-clamp-1 text-[14px] font-medium text-gray-800">
                {h.name}
              </p>
              <p className="text-[12px] tracking-[0.12px] text-[#6a7282]">
                x{h.qty}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-semibold text-gray-800">
                ${h.currentValue.toLocaleString()}
              </p>
              <p className="text-[12px] font-semibold tracking-[0.12px] text-[#06c292]">
                +{h.changePct}%
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
