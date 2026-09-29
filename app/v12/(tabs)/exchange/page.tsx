"use client";

import { useRouter } from "next/navigation";
import StatusBar from "../../_components/StatusBar";
import {
  EXCHANGE_PRODUCTS,
  REWARD_BALANCE,
  WISHES,
} from "../../_lib/mock-data";

// 導覽列浮在內容上面用漸層，不是佔自己一排空間的實色色塊，跟回饋分頁
// 同一套做法：GRADIENT_HEIGHT 比按鈕實際站的 FIXED_HEADER_HEIGHT 高一截，
// 讓漸層尾巴有地方淡出；內容的 paddingTop 對齊 GRADIENT_HEIGHT，
// 不然靜止狀態的內容會被半透明的漸層尾巴洗到
const FIXED_HEADER_HEIGHT = 96;
const GRADIENT_HEIGHT = 112;

// 兌換分頁是這版新增的：許願池搬到這裡（原本在回饋頁的許願池子分頁），
// 加上「熱門商品」——用回饋折抵一般商品（不只是酒），跟回饋分頁區分開來：
// 回饋分頁講「你賺了多少」，兌換分頁講「你可以拿去換什麼」
export default function ExchangePage() {
  const router = useRouter();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{
          height: GRADIENT_HEIGHT,
          background: `linear-gradient(to bottom, rgba(255,255,255,0.95) ${(FIXED_HEADER_HEIGHT / GRADIENT_HEIGHT) * 100}%, rgba(255,255,255,0) 100%)`,
        }}
      >
        <div className="pointer-events-auto">
          <StatusBar />
          <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-1">
            <p className="text-[20px] font-bold text-gray-900">兌換</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/v12/reward-history")}
                className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white">
                  <svg viewBox="0 0 16 16" fill="none" className="size-3">
                    <path
                      d="M8 12.5V3.5M8 3.5L4 7.5M8 3.5l4 4"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[14px] font-medium text-gray-800">
                  {REWARD_BALANCE.toLocaleString()}
                </span>
              </button>
              <button
                onClick={() => router.push("/v12/account")}
                aria-label="帳號"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
              >
                <img src="/figma/v12-profile.svg" alt="" className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[110px]"
        style={{ paddingTop: GRADIENT_HEIGHT }}
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[14px] font-bold text-gray-800">許願池</p>
            <p className="mb-3 text-[12px] text-gray-400">用回饋換喜歡的東西</p>
            {/* 卡寬用容器的百分比（86%），不是佔滿整排——這樣兩張卡片之間
                永遠留得出下一張的邊緣，看得出「還可以往右滑」，
                跟線上藏酒那排卡片同一套做法 */}
            <div className="no-scrollbar flex gap-4 overflow-x-auto">
              {WISHES.map((w) => (
                <div
                  key={w.id}
                  className="relative h-[168px] w-[86%] shrink-0 overflow-hidden rounded-2xl bg-gray-200"
                >
                  <img
                    src={w.image}
                    alt={w.name}
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[13px] font-semibold">{w.name}</p>
                    <p className="line-clamp-2 text-[12px] text-white/85">
                      {w.subtitle}
                    </p>
                    <p className="mt-1 text-[12.5px] font-semibold">
                      中獎價 ${w.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[14px] font-bold text-gray-800">熱門商品</p>
            <p className="mb-3 text-[12px] text-gray-400">用回饋折抵商品</p>
            <div className="grid grid-cols-2 gap-4">
              {EXCHANGE_PRODUCTS.map((p) => (
                <div key={p.id}>
                  {"image" in p ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="mb-2 aspect-square w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div
                      className="mb-2 aspect-square overflow-hidden rounded-2xl"
                      style={{ backgroundColor: p.color }}
                    />
                  )}
                  <p className="text-[11px] text-gray-400">{p.subtitle}</p>
                  <p className="line-clamp-1 text-[13px] font-semibold text-gray-800">
                    {p.name}
                  </p>
                  <p className="text-[13px] text-gray-800">
                    ${p.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
