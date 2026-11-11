"use client";

import { useEffect, useState } from "react";
import StatusBar from "./StatusBar";
import {
  type FlavorKey,
  type PairingKey,
  type WineDetail as WineDetailData,
} from "../_lib/wine-details";

// 酒款細節頁：照 Figma「01 collection」的細節頁（node 19494:23489）。
// 從盲盒細節頁點盒內的酒打開，蓋在盲盒細節頁上面，返回就回到盲盒。
// 版面由上到下：酒瓶大圖、酒名與價格、AIFIAN Rating、產區酒莊品種年份、
// 酒品特徵長條圖、主要風味、餐酒搭配、酒品介紹、代表類型，底部固定買入按鈕。

const ASSET = "/v14/wine-detail";

const PROFILE_LABELS = ["Sweetness", "Acidity", "Tannin", "Alcohol", "Body"];

// 風味圖示：照設計稿各自的大小擺在 48×48 的格子正中間
const FLAVORS: Record<FlavorKey, { label: string; src: string; w: number; h: number }> = {
  roasted: { label: "焙烤熟成", src: "flavor-roasted.svg", w: 28.022, h: 29.0934 },
  oaky: { label: "木質辛香", src: "flavor-oaky.svg", w: 31.02, h: 31.01 },
  maritime: { label: "海洋氣息", src: "flavor-maritime.svg", w: 32.28, h: 31.48 },
  freshFruit: { label: "新鮮水果", src: "flavor-fresh-fruit.svg", w: 33.58, h: 28.12 },
  coreFruit: { label: "核心果香", src: "flavor-core-fruit.svg", w: 31.375, h: 31.375 },
};

// 餐酒搭配：三張食物圖在同一張圖上，照設計稿的裁切位置取出各自那一塊
const PAIRINGS: Record<PairingKey, { label: string; left: string; top: string; size: string }> = {
  duck: { label: "烤鴨", left: "-34.81%", top: "-171.42%", size: "303.73%" },
  chicken: { label: "烤雞", left: "-98.5%", top: "-30.51%", size: "294.98%" },
  goose: { label: "鵝肉", left: "-183.8%", top: "-183.48%", size: "320.49%" },
};

// 酒品特徵長條：每升一級高 27px，第一級 25px，最高 133px，跟設計稿的五根一樣
const barHeight = (level: number) => 25 + (level - 1) * 27;

export default function WineDetail({
  wine,
  name,
  value,
  image,
  onClose,
}: {
  wine: WineDetailData;
  name: string;
  value: number;
  image: string;
  onClose: () => void;
}) {
  // 進場從右邊推進來，跟其他頁面換頁一樣
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const close = () => {
    setShown(false);
    setTimeout(onClose, 280);
  };
  const price = `$${value.toLocaleString()}`;

  return (
    <div
      className="absolute inset-0 z-[70] flex flex-col bg-[#f3f4f6]"
      style={{
        transform: shown ? "translateX(0)" : "translateX(100%)",
        transition: "transform 280ms cubic-bezier(0.2,0.9,0.25,1)",
      }}
    >
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {/* 酒瓶大圖，上面疊狀態列跟返回、客服兩顆按鈕 */}
        <div className="relative">
          <img src={image} alt={name} className="aspect-square w-full object-cover" />
          <div className="absolute inset-x-0 top-0">
            <StatusBar />
            <div className="flex h-11 items-center justify-between pl-4 pr-4">
              <button onClick={close} aria-label="返回" className="size-9">
                <img src={`${ASSET}/back-button.svg`} alt="" width={36} height={36} />
              </button>
              <img src={`${ASSET}/icon-headset.svg`} alt="" width={24} height={24} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 pt-4">
          <p className="text-[20px] font-medium leading-6 text-[#1e2939]">
            {wine.nameEn}
          </p>
          <p className="text-[16px] leading-6 text-[#6a7282]">{wine.spec}</p>
          <div className="flex items-center gap-1">
            <p className="text-[16px] font-medium leading-6 text-[#1e2939]">{price}</p>
            <p className="text-[12px] leading-4 tracking-[0.12px] text-[#6a7282]">
              (最後更新：2026/11/11)
            </p>
          </div>
          <div className="flex w-fit items-center gap-1 rounded-[8px] border border-[#d63535] bg-[#f9fafb] p-2">
            <p className="text-[14px] font-medium leading-[18px] text-[#d63535]">
              AIFIAN Rating
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <img
                  key={n}
                  src={`${ASSET}/${n <= wine.rating ? "star" : "star-empty"}.svg`}
                  alt=""
                  width={16}
                  height={16}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 pb-6 pt-6">
          {/* 產區、酒莊、品種、年份 */}
          <div className="grid grid-cols-[159px_1fr] gap-y-[17px] rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
            {[
              ["產區", wine.region],
              ["酒莊", wine.producer],
              ["品種", wine.grape],
              ["年份", wine.vintage],
            ].map(([label, v]) => (
              <div key={label} className="min-w-0">
                <p className="text-[12px] font-medium leading-4 text-[#6a7282]">{label}</p>
                <p className="mt-1 truncate text-[14px] font-medium leading-[18px] text-[#1e2939]">
                  {v}
                </p>
              </div>
            ))}
          </div>

          {/* 酒品特徵：五根長條，格線每 27px 一條 */}
          <div className="flex flex-col gap-2 rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
            <p className="text-[16px] font-semibold leading-6 text-[#1e2939]">酒品特徵</p>
            <div className="relative mx-auto h-[153px] w-[311px]">
              {[1, 28, 55, 82, 109].map((y) => (
                <div key={y} className="absolute left-px right-0 h-px bg-[#e5e7eb]" style={{ top: y - 1 }} />
              ))}
              <div className="absolute inset-x-0 top-[134px] h-px bg-[#d1d5dc]" />
              {wine.profile.map((level, i) => (
                <div key={PROFILE_LABELS[i]}>
                  <div
                    className="absolute w-8 rounded-t-[4px]"
                    style={{
                      left: 16 + i * 64,
                      top: 134 - barHeight(level),
                      height: barHeight(level),
                      background: "linear-gradient(to bottom, #ff9692, #d63535)",
                    }}
                  />
                  <p
                    className="absolute top-[137px] -translate-x-1/2 whitespace-nowrap text-[12px] leading-4 tracking-[0.12px] text-[#4a5565]"
                    style={{ left: 32 + i * 64 }}
                  >
                    {PROFILE_LABELS[i]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 主要風味 */}
          <div className="flex flex-col gap-2 rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
            <p className="text-[16px] font-semibold leading-6 text-[#1e2939]">主要風味</p>
            <div className="flex gap-4">
              {wine.flavors.map((k) => {
                const f = FLAVORS[k];
                return (
                  <div key={k} className="flex w-12 flex-col items-center gap-[3px]">
                    <div className="flex size-12 items-center justify-center">
                      <img src={`${ASSET}/${f.src}`} alt="" width={f.w} height={f.h} />
                    </div>
                    <p className="whitespace-nowrap text-[12px] leading-4 tracking-[0.12px] text-[#6a7282]">
                      {f.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 餐酒搭配 */}
          <div className="flex flex-col gap-1 rounded-[16px] border border-[#e5e7eb] bg-[#fefefe] p-4">
            <p className="text-[16px] font-semibold leading-6 text-[#1e2939]">餐酒搭配</p>
            <div className="flex gap-4">
              {wine.pairings.map((k) => {
                const p = PAIRINGS[k];
                return (
                  <div key={k} className="flex w-12 flex-col items-center gap-[3px]">
                    <div className="flex size-12 items-center justify-center">
                      <div className="relative size-[42px] overflow-hidden">
                        <img
                          src={`${ASSET}/food-sprite.png`}
                          alt=""
                          className="absolute max-w-none"
                          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
                        />
                      </div>
                    </div>
                    <p className="text-[12px] leading-4 tracking-[0.12px] text-[#6a7282]">
                      {p.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 酒品介紹 */}
          <div className="flex flex-col gap-1 rounded-[16px] border border-[#e5e7eb] bg-[#fefefe] p-4">
            <p className="text-[16px] font-semibold leading-6 text-[#1e2939]">酒品介紹</p>
            <p className="text-[14px] leading-[18px] text-[#1e2939]">{wine.intro}</p>
          </div>

          {/* 代表類型 */}
          <div className="flex flex-col gap-2 rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
            <p className="text-[16px] font-semibold leading-6 text-[#1e2939]">代表類型</p>
            <div className="flex flex-wrap gap-2">
              {wine.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-[8px] bg-[#f3f4f6] px-4 py-2 text-[14px] leading-[18px] text-[#1e2939]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定的買入按鈕 */}
      <div className="shrink-0 border-t border-[#eee] bg-[#fefefe] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-4">
        <button className="flex w-full flex-col items-center justify-center rounded-[16px] bg-[#ff3b3b] px-5 py-2 text-[#fefefe]">
          <span className="text-[16px] font-bold leading-6">買入</span>
          <span className="text-[12px] leading-4 tracking-[0.12px]">最新價：{price}</span>
        </button>
      </div>
    </div>
  );
}
