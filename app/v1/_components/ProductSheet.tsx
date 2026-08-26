"use client";

import { type RecCard } from "../_lib/chat-storage";

type ProductSheetProps = {
  card: RecCard;
  inCart: boolean;
  onClose: () => void;
  onToggleCart: () => void;
  onBuyNow: () => void;
};

export default function ProductSheet({
  card,
  inCart,
  onClose,
  onToggleCart,
  onBuyNow,
}: ProductSheetProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full overflow-hidden rounded-t-[22px] bg-white"
        style={{ animation: "sheetUp 0.3s cubic-bezier(.2,.9,.25,1)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-10 flex size-9 items-center justify-center rounded-full bg-white/70 text-gray-800 backdrop-blur"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div
          className={`flex aspect-square w-full items-center justify-center bg-gradient-to-br text-[110px] ${card.gradient}`}
        >
          {card.emoji}
        </div>

        <div className="flex flex-col gap-1.5 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5">
          <p className="text-[16px] leading-[1.5] text-gray-800">
            {card.name}
          </p>
          <p className="text-[13px] text-gray-500">{card.desc}</p>
          <p className="mt-2 text-[32px] font-bold leading-none text-gray-800">
            ${card.price.toLocaleString()}
          </p>

          <div className="mt-4 flex gap-2.5">
            <button
              onClick={onToggleCart}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3.5 py-3 text-[14px] font-semibold ${
                inCart
                  ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                  : "border-gray-300 text-gray-800"
              }`}
            >
              {inCart ? (
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
              ) : (
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
              )}
              {inCart ? "已加入購物車" : "加入購物車"}
            </button>
            <button
              onClick={onBuyNow}
              className="flex-1 rounded-xl py-3 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(255,80,80,0.32)]"
              style={{ background: "#ff5050" }}
            >
              立即購買
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
