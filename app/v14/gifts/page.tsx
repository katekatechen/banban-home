"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  GiftAirdropIllust,
  GiftEmptyIllust,
} from "../_components/GiftIllust";
import GiftOpenFlow, { type GiftPrize } from "../_components/GiftOpenFlow";
import {
  getOpenedWines,
  openPendingBox,
  takeBaseGift,
  useUnopenedGifts,
} from "../_lib/blindbox";
import StatusBar from "../_components/StatusBar";
import { GIFT_PRIZE, GIFT_RECORDS, GIFT_SUMMARY } from "../_lib/mock-data";
import { usePageSlide } from "../_lib/page-transition";

// 我的禮物：從帳號頁進來。
//
// 設計稿上有三種狀態，這裡都照著做，由資料決定看到哪一種：
// 1. 還有沒拆的禮物 → 空投插圖，底下掛「還有 N 個禮物沒拆」
// 2. 沒有沒拆的了 → 拆開的空盒子，底下寫「沒有新的禮物了」
// 3. 連紀錄都沒有 → 下面的「禮物紀錄」整塊不出現
//
// 頂列沒有套 BackHeader：那個元件是置中標題＋灰底圓鈕，設計稿這頁只有
// 一個裸的返回箭頭、標題在內容區裡，硬套會變成另一個樣子，所以這裡自己畫。

export default function GiftsPage() {
  const router = useRouter();
  const { style, exit } = usePageSlide();

  // 拆禮物會改到上面那兩個數字，所以放在 state 裡，不直接讀 mock
  const [summary, setSummary] = useState(GIFT_SUMMARY);
  // 開著就是正在拆；每拆一個換一個 key，讓開場動畫重新播
  const [opening, setOpening] = useState(0);
  // 還沒拆的數量跟帳號頁、tabbar 紅點讀同一份：原本的禮物＋買了沒拆的酒品盲盒
  const unopened = useUnopenedGifts();
  const [blindRecords, setBlindRecords] = useState(getOpenedWines);
  const [prize, setPrize] = useState<GiftPrize>(GIFT_PRIZE);
  const { opened, value } = summary;
  const hasUnopened = unopened > 0;
  const hasRecords = GIFT_RECORDS.length + blindRecords.length > 0;

  // 拆下一個：先拆酒品盲盒（剛買的那個最有感），沒有了才拆原本的禮物。
  // 點下去就扣掉沒拆的數量，蓋在上面的結果卡才知道後面還有沒有
  const startOpen = () => {
    const w = openPendingBox();
    if (w) {
      setBlindRecords(getOpenedWines());
      setPrize({
        qty: 1,
        unit: "瓶",
        name: w.name,
        value: w.value,
        image: `/v14/gift-result/blindbox-${w.boxId}.png`,
      });
    } else {
      takeBaseGift();
      setPrize(GIFT_PRIZE);
    }
    setOpening((n) => n + 1);
  };

  const openGift = () =>
    setSummary((s) => ({
      ...s,
      opened: s.opened + 1,
      value: s.value + prize.value,
    }));

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#fefefe]" style={style}>
      <StatusBar />

      <div className="flex h-10 shrink-0 items-center px-4">
        <button
          onClick={() => exit(() => router.back())}
          aria-label="返回"
          className="flex size-6 items-center justify-center"
        >
          <img src="/figma/nav-arrow-left.svg" alt="" className="size-6" />
        </button>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pb-10">
        {/* 標題與兩個數字 */}
        <div className="flex flex-col gap-4 p-4 text-gray-800">
          <p className="text-[24px] font-medium leading-8">我的禮物</p>
          <div className="flex h-[68px] items-center gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[16px] leading-6">已拆禮物</p>
              <p className="text-[34px] font-semibold leading-10">{opened}</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[16px] leading-6">禮物總價值</p>
              <p className="text-[34px] font-semibold leading-10">
                {value > 0 ? `$${value.toLocaleString()}` : 0}
              </p>
            </div>
          </div>
        </div>

        {/* 插圖：有沒拆的就是空投，沒有就是拆開的空盒子 */}
        <div className="mt-10 flex justify-center px-4">
          {hasUnopened ? (
            <button
              type="button"
              onClick={startOpen}
              aria-label={`拆禮物，還有 ${unopened} 個沒拆`}
              className="relative active:scale-[0.97] transition-transform"
            >
              <GiftAirdropIllust />
              {/* 「還有 N 個禮物沒拆」：壓在插圖下緣，尖角朝上指著禮物 */}
              <div className="absolute left-1/2 top-[182px] flex -translate-x-1/2 flex-col items-center drop-shadow-[0px_2px_10px_rgba(165,204,194,0.2)]">
                <div className="relative mb-[-4px] h-[11.5px] w-[16.5px]">
                  <img
                    src="/v14/gift/tooltip-arrow.svg"
                    alt=""
                    width={12.0394}
                    height={8.05742}
                    style={{
                      position: "absolute",
                      left: 2.23,
                      top: 0.57,
                      maxWidth: "none",
                    }}
                  />
                </div>
                <div className="flex items-center justify-center rounded-[24px] bg-gray-800 px-4 py-2">
                  <p className="whitespace-nowrap text-center text-[14px] font-semibold leading-[18px] text-white">
                    還有 {unopened} 個禮物沒拆
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div className="flex flex-col items-center">
              <GiftEmptyIllust />
              <p className="mt-[14px] text-[14px] leading-[18px] text-gray-400">
                沒有新的禮物了
              </p>
            </div>
          )}
        </div>

        {/* 禮物紀錄：一包一包，點進去看那一包拆到什麼 */}
        {(hasRecords || hasUnopened) && (
          <div className="mt-16">
            <div className="flex h-14 items-center px-4">
              <p className="text-[20px] font-semibold leading-6 text-gray-800">
                禮物紀錄
              </p>
            </div>
            {hasRecords ? (
              <div className="flex flex-col gap-2">
                {/* 酒品盲盒開出來的酒排最上面（最新的），格式跟原本的商品紀錄一樣：
                    圖、名稱、數量、時間。圖用那一款盒子的禮包圖；禮包圖是白底 JPG，
                    用 multiply 疊在灰底上，白色就會透出灰底，跟其他紀錄的去背圖一樣 */}
                {blindRecords.map((r) => (
                  <div key={r.key} className="flex items-center gap-4 px-4">
                    <div className="shrink-0 rounded-[8px] bg-gray-100 p-2">
                      <img
                        src={`/v14/gift-record/blindbox-${r.boxId}.jpg`}
                        alt=""
                        width={60}
                        height={47.94}
                        className="block h-[47.94px] w-[60px] object-cover mix-blend-multiply"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="flex items-center justify-between gap-3 text-[16px] leading-6 text-gray-800">
                        <p className="min-w-0 truncate font-semibold">
                          {r.name}
                        </p>
                        <p className="shrink-0">1</p>
                      </div>
                      <p className="text-[14px] leading-[1.6] text-gray-500">
                        {r.time}
                      </p>
                    </div>
                  </div>
                ))}
                {GIFT_RECORDS.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 px-4">
                    <div className="shrink-0 rounded-[8px] bg-gray-100 p-2">
                      <img
                        src={
                          r.kind === "product"
                            ? "/v14/gift-record/whisky-card.png"
                            : "/v14/gift-record/reward-coin.png"
                        }
                        alt=""
                        width={60}
                        height={47.94}
                        className="block h-[47.94px] w-[60px] object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="flex items-center justify-between gap-3 text-[16px] leading-6 text-gray-800">
                        <p className="min-w-0 truncate font-semibold">
                          {r.name}
                        </p>
                        <p className="shrink-0">{r.amount.toLocaleString()}</p>
                      </div>
                      <p className="text-[14px] leading-[1.6] text-gray-500">
                        {r.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-2 text-[16px] leading-6 text-gray-400">
                還沒有任何紀錄
              </p>
            )}
          </div>
        )}
      </div>

      {opening > 0 && (
        <GiftOpenFlow
          key={opening}
          prize={prize}
          remaining={unopened}
          onOpened={openGift}
          onNext={startOpen}
          onClose={() => setOpening(0)}
        />
      )}
    </div>
  );
}
