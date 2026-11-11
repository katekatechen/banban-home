"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GiftAirdropFloating } from "./GiftIllust";
import GiftResultImage from "./GiftResultImage";

// 拆禮物的整條流程，蓋在我的禮物頁上面：
// 開場動畫（禮物吊著氣球飄下來、雲從旁邊過）→ 結果卡（碎片噴出來）→ 截圖分享。
//
// 設計稿在結果那一張標了「彈出後會有 haptics (middle)」，所以動畫跑完、
// 結果卡彈出來的那一刻震一下。瀏覽器只有 navigator.vibrate，給不了 iOS 的
// impact 分級，真的要做 middle 要在 App 端用 UIImpactFeedbackGenerator(.medium)。
//
// 跟結帳頁一樣用 portal 掛到 #v14-frame，才蓋得過 tabbar。

const OPEN_MS = 1800;

export type GiftPrize = {
  qty: number;
  unit: string;
  name: string;
  value: number;
  // 結果圖：酒品盲盒用那一款盒子的禮包圖，沒給就用原本的商品卡
  image?: string;
};

type Phase = "opening" | "result" | "share";

export default function GiftOpenFlow({
  prize,
  remaining,
  onOpened,
  onNext,
  onClose,
}: {
  prize: GiftPrize;
  // 拆完這個之後還剩幾個沒拆，決定右邊那顆是「看下一個」還是「關閉」
  remaining: number;
  // 開場動畫跑完的那一刻：外面把已拆數量、總價值加上去
  onOpened: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [phase, setPhase] = useState<Phase>("opening");

  useEffect(() => {
    setFrame(document.getElementById("v14-frame"));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      navigator.vibrate?.(20);
      setPhase("result");
      onOpened();
    }, OPEN_MS);
    return () => clearTimeout(t);
    // 只在掛載時跑一次：這個元件每拆一個禮物就重新掛一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!frame) return null;

  const title = "恭喜！你總共獲得";

  return createPortal(
    <div className="absolute inset-0 z-[80]">
      {/* 壓暗底下的頁面 */}
      <div
        className="absolute inset-0 bg-[rgba(12,14,17,0.8)] backdrop-blur-[4px]"
        style={{ animation: "fadeIn 240ms ease both" }}
      />

      {phase === "opening" ? (
        <div className="absolute inset-0 overflow-hidden">
          {/* 兩朵雲各自飄過去，速度錯開才不會像同一張圖在平移 */}
          <img
            src="/v14/gift/cloud-left.svg"
            alt=""
            width={204}
            height={98}
            className="absolute left-0 top-[42%] opacity-90"
            style={{
              ["--cloud-from" as string]: "260%",
              ["--cloud-to" as string]: "-160%",
              animation: "giftCloudDrift 5.2s linear infinite",
            }}
          />
          <img
            src="/v14/gift/cloud-right.svg"
            alt=""
            width={180}
            height={80}
            className="absolute right-0 top-[62%] opacity-80"
            style={{
              ["--cloud-from" as string]: "180%",
              ["--cloud-to" as string]: "-220%",
              animation: "giftCloudDrift 7s linear infinite",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{ animation: `giftDrop ${OPEN_MS}ms cubic-bezier(0.22,0.9,0.3,1) both` }}>
              <div style={{ animation: "giftSway 2.6s ease-in-out infinite" }}>
                <GiftAirdropFloating scale={1.6} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <div
            className="flex w-full max-w-[300px] flex-col items-center"
            style={{ animation: "giftResultIn 420ms cubic-bezier(0.2,0.9,0.25,1) both" }}
          >
            <p className="px-4 text-center text-[24px] font-semibold leading-8 text-white">
              {title}
            </p>

            {/* 商品圖往上凸出卡片 143，設計稿上圖頂離標題還有 80，所以卡片壓低 223 */}
            <div className="relative mt-[223px] w-full rounded-[16px] bg-white p-6">
              <div className="absolute -top-[143px] left-0 w-[300px] overflow-hidden">
                <GiftResultImage burst src={prize.image} />
              </div>
              <div className="flex flex-col gap-4 pt-20 text-center">
                <div className="flex flex-col gap-1 text-[20px] leading-6 text-gray-800">
                  <p>
                    {prize.qty} {prize.unit}
                  </p>
                  <p>{prize.name}</p>
                </div>
                <p className="text-[14px] leading-[18px] text-gray-600">
                  價值 ${prize.value.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex w-full gap-4">
              <button
                onClick={() => setPhase("share")}
                className="flex max-h-14 flex-1 items-center justify-center gap-2 rounded-[16px] border border-white px-4 py-3 text-[16px] font-semibold leading-6 text-white"
              >
                <img
                  src="/v14/gift-result/icon-media-image.svg"
                  alt=""
                  className="size-6"
                />
                截圖分享
              </button>
              {remaining > 0 ? (
                <button
                  onClick={onNext}
                  className="flex max-h-14 flex-1 items-center justify-center gap-2 rounded-[16px] border border-white px-4 py-3 text-[16px] font-semibold leading-6 text-white"
                >
                  看下一個
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex max-h-14 flex-1 items-center justify-center gap-2 rounded-[16px] border border-white px-4 py-3 text-[16px] font-semibold leading-6 text-white"
                >
                  <img
                    src="/v14/gift-result/icon-cancel.svg"
                    alt=""
                    className="size-6"
                  />
                  關閉
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 截圖分享：由下往上的 sheet，裡面是一張可以截圖的深色卡 */}
      {phase === "share" && (
        <ShareSheet prize={prize} onClose={() => setPhase("result")} />
      )}
    </div>,
    frame,
  );
}

function ShareSheet({
  prize,
  onClose,
}: {
  prize: GiftPrize;
  onClose: () => void;
}) {
  const [up, setUp] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setUp(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className="absolute inset-0 bg-black/25"
        style={{ opacity: up ? 1 : 0, transition: "opacity 280ms ease" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 rounded-t-[16px] bg-white pb-10 pt-2"
        style={{
          transform: up ? "translateY(0)" : "translateY(100%)",
          transition: "transform 280ms cubic-bezier(0.2,0.9,0.25,1)",
        }}
      >
        <div aria-hidden className="h-[5px] w-9 rounded-full bg-gray-300" />
        <div className="flex w-full flex-col items-center gap-4 px-4">
          <p className="text-[20px] leading-6 text-gray-600">截圖分享</p>
          {/* 可以截圖的那張卡：深灰底、白卡、底下品牌字樣 */}
          <div className="relative h-[376px] w-[261px] overflow-hidden rounded-[4px] bg-[#364153]">
            <div className="absolute left-1/2 top-[53px] -translate-x-1/2">
              <GiftResultImage scale={0.6} src={prize.image} />
            </div>
            <div className="absolute left-1/2 top-[133px] flex h-[184px] w-[220px] -translate-x-1/2 flex-col justify-end rounded-[9.6px] bg-white p-[14.4px]">
              <div className="flex flex-col gap-4 pt-12 text-center">
                <p className="text-[12px] leading-4 tracking-[0.12px] text-gray-800">
                  看我在 AIFIAN 拿到
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col text-[16px] font-semibold leading-6 text-gray-800">
                    <p>
                      {prize.qty} {prize.unit}
                    </p>
                    <p>{prize.name}</p>
                  </div>
                  <p className="text-[12px] leading-4 tracking-[0.12px] text-gray-600">
                    價值 ${prize.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <img
              src="/v14/gift-result/aifian-logo.svg"
              alt="AIFIAN"
              width={49}
              height={15}
              className="absolute left-1/2 top-[340.5px] -translate-x-1/2"
            />
          </div>
        </div>
        <div className="w-[331px]">
          <button
            onClick={onClose}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] border border-gray-800 px-4 text-[16px] font-semibold leading-6 text-gray-800"
          >
            <img src="/v14/gift-result/icon-share.svg" alt="" className="size-6" />
            分享出去
          </button>
        </div>
        <div className="h-[21px] w-full" />
      </div>
    </>
  );
}
