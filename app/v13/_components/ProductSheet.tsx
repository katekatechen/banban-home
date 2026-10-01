"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { RecCard } from "../_lib/chat-storage";
import { EASING } from "../_lib/page-transition";
import { PRODUCT_DETAILS } from "../_lib/product-details";

// 商品細節頁：點對話裡的商品卡，從底部滑上來的 bottom sheet，照
// claude.ai/design「AIFIAN 伴伴」的商品 lightbox 手機版。
// 用 portal 掛到 v13 手機外框（#v13-frame）底下，不掛在首頁裡面——
// 首頁被 TabTransition 的 transform 包著，自己的 z-index 再高也蓋不過 tabbar
const SWIPE_DIST = 44;
const CLOSE_MS = 260;

type Phase = "show" | "out" | "in";

export default function ProductSheet({
  cards,
  startIndex,
  addedIds,
  onToggleCart,
  onBuy,
  onClose,
}: {
  cards: RecCard[];
  startIndex: number;
  addedIds: string[];
  onToggleCart: (card: RecCard) => void;
  onBuy: (card: RecCard) => void;
  onClose: () => void;
}) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [index, setIndex] = useState(startIndex);
  const [phase, setPhase] = useState<Phase>("show");
  const [dir, setDir] = useState(1);
  const [closing, setClosing] = useState(false);
  const animating = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
  }, []);

  const close = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, CLOSE_MS);
  };

  // 左右滑換商品：舊內容往滑動方向淡出 160ms，新內容從另一側滑進來 260ms
  const nav = (d: number) => {
    if (cards.length < 2 || animating.current) return;
    animating.current = true;
    setDir(d);
    setPhase("out");
    window.setTimeout(() => {
      setIndex((i) => (i + d + cards.length) % cards.length);
      scrollRef.current?.scrollTo({ top: 0 });
      setPhase("in");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setPhase("show");
          window.setTimeout(() => (animating.current = false), 280);
        }),
      );
    }, 170);
  };

  if (!frame) return null;

  const card = cards[index];
  const detail = PRODUCT_DETAILS[card.id];
  const added = addedIds.includes(card.id);

  const contentStyle: React.CSSProperties =
    phase === "out"
      ? {
          transform: `translateX(${dir > 0 ? -SWIPE_DIST : SWIPE_DIST}px)`,
          opacity: 0,
          transition:
            "transform 160ms cubic-bezier(.2,0,.2,1), opacity 160ms cubic-bezier(.2,0,.2,1)",
        }
      : phase === "in"
        ? {
            transform: `translateX(${dir > 0 ? SWIPE_DIST : -SWIPE_DIST}px)`,
            opacity: 0,
            transition: "none",
          }
        : {
            transform: "translateX(0)",
            opacity: 1,
            transition: `transform 260ms ${EASING}, opacity 260ms ${EASING}`,
          };

  return createPortal(
    <div
      onClick={close}
      className="absolute inset-0 z-50 flex items-end justify-center bg-[rgba(40,46,56,0.78)]"
      style={{
        animation: closing ? undefined : "fadeIn 200ms ease",
        opacity: closing ? 0 : 1,
        transition: `opacity ${CLOSE_MS}ms ease`,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy))
            nav(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
        className="relative flex max-h-[90%] w-full flex-col overflow-hidden rounded-t-[22px] bg-white"
        style={{
          animation: closing ? undefined : `sheetUp 300ms ${EASING}`,
          transform: closing ? "translateY(100%)" : "translateY(0)",
          transition: `transform ${CLOSE_MS}ms cubic-bezier(.2,0,.2,1)`,
        }}
      >
        {/* 頂部把手：疊在商品圖上，白色加陰影才看得到 */}
        <div className="absolute left-1/2 top-2.5 z-10 h-1 w-[38px] -translate-x-1/2 rounded-full bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.18)]" />

        <div
          ref={scrollRef}
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="flex flex-col" style={contentStyle}>
            <div
              role="img"
              aria-label={card.name}
              className="aspect-square w-full shrink-0 bg-[#eef0f2] bg-cover bg-center"
              style={
                card.image
                  ? { backgroundImage: `url('${card.image}')` }
                  : undefined
              }
            />

            <div className="px-5 pb-6 pt-[18px]">
              <p className="text-[21px] font-medium leading-[1.4] text-gray-800">
                {detail?.fullName ?? card.name}
              </p>
              <p className="mt-2.5 text-[24px] font-bold text-gray-800">
                NT$ {card.price.toLocaleString()}
              </p>

              {detail && (
                <>
                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[15px] font-bold text-gray-800">
                        概覽
                      </p>
                      <p className="text-[12px] text-[#a1a5ac]">伴伴整理</p>
                    </div>
                    <p className="whitespace-pre-line text-[14.5px] leading-[1.85] text-gray-800">
                      {detail.overview}
                    </p>
                  </div>

                  <div className="mt-7 border-t border-[#eef0f1] pt-6">
                    <p className="mb-3.5 text-[15px] font-bold text-gray-800">
                      規格
                    </p>
                    {detail.specs.map((row, i) => (
                      <div
                        key={row.label}
                        className="flex rounded-[8px] px-1 py-2.5"
                        style={{
                          background: i % 2 ? "#f8f9fa" : "transparent",
                        }}
                      >
                        <p className="w-[34%] shrink-0 text-[13.5px] text-[#a1a5ac]">
                          {row.label}
                        </p>
                        <p className="flex-1 text-[13.5px] font-semibold text-gray-800">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 rounded-[16px] border border-[#e8eaed] p-[18px]">
                    {detail.highlightSummary && (
                      <>
                        <p className="mb-3.5 text-[13.5px] text-[#a1a5ac]">
                          {detail.highlightSummary}
                        </p>
                        <div className="mb-4 h-px bg-[#eef0f1]" />
                      </>
                    )}
                    <div className="flex">
                      {detail.highlights.map((h, i) => (
                        <div
                          key={h.title}
                          className="min-w-0 flex-1 px-1.5"
                          style={{
                            borderLeft: i === 0 ? "none" : "1px solid #eef0f1",
                          }}
                        >
                          <p className="text-[13.5px] font-bold leading-[1.4] text-gray-800">
                            {h.title}
                          </p>
                          <p className="mt-1.5 text-[12px] text-[#a1a5ac]">
                            {h.sub}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-7 rounded-[16px] bg-[#f6f7f8] p-[18px]">
                    <p className="mb-3 text-[15px] font-bold text-gray-800">
                      大家怎麼說
                    </p>
                    {detail.reviewText ? (
                      <>
                        <p className="text-[14px] leading-[1.85] text-gray-800">
                          {detail.reviewText}
                        </p>
                        <div className="mt-3.5 flex flex-wrap gap-2">
                          {detail.reviewTags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-[#e2e5e9] bg-white px-3.5 py-1.5 text-[12.5px] text-gray-800"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 text-[11.5px] text-[#a1a5ac]">
                          AI 整理自社群公開討論，非逐字引用
                        </p>
                      </>
                    ) : (
                      <p className="text-[14px] leading-[1.7] text-[#a1a5ac]">
                        這個還沒人討論過，要不要第一個試試看
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 底部固定的操作列：圖片名稱價格都先顯示了，購買按鈕不用等 */}
        <div className="flex shrink-0 gap-3 border-t border-[#eef0f1] bg-white px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3.5">
          {added ? (
            <button
              onClick={() => onToggleCart(card)}
              className="flex flex-1 items-center justify-center gap-[7px] rounded-[12px] border border-[#1f8a5b] bg-[rgba(31,138,91,0.08)] p-[13px] text-[14.5px] font-semibold text-[#1f8a5b]"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              已加入購物車
            </button>
          ) : (
            <button
              onClick={() => onToggleCart(card)}
              className="flex flex-1 items-center justify-center gap-[7px] rounded-[12px] border border-[#dfe2e6] p-[13px] text-[14.5px] font-semibold text-gray-800"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              加入購物車
            </button>
          )}
          <button
            onClick={() => onBuy(card)}
            className="flex flex-1 items-center justify-center rounded-[12px] bg-[#ff5050] p-[13px] text-[14.5px] font-semibold text-white shadow-[0_2px_8px_rgba(255,80,80,0.32)]"
          >
            立即購買
          </button>
        </div>
      </div>
    </div>,
    frame,
  );
}
