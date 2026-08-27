"use client";

import { type Product } from "../_lib/mock-data";

type WineSheetProps = {
  product: Product;
  onClose: () => void;
  onAskBanbun: () => void;
  onCheckout: () => void;
};

export default function WineSheet({
  product,
  onClose,
  onAskBanbun,
  onCheckout,
}: WineSheetProps) {
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
          className={`relative flex aspect-square w-full items-center justify-center bg-gradient-to-br text-[110px] ${product.gradient}`}
        >
          {product.tag && (
            <span className="absolute left-3.5 top-3.5 rounded-[10px] bg-black/60 px-2 py-1 text-[11px] font-semibold text-gray-000">
              {product.tag}
            </span>
          )}
          {product.emoji}
        </div>

        <div className="flex flex-col gap-1.5 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5">
          <p className="text-[16px] leading-[1.5] text-gray-800">
            {product.name}
          </p>
          <p className="text-[13px] text-gray-500">{product.subtitle}</p>
          <p className="mt-2 text-[32px] font-bold leading-none text-gray-800">
            ${product.price.toLocaleString()}
          </p>

          <div className="mt-4 flex gap-2.5">
            <button
              onClick={onAskBanbun}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-[14px] font-semibold text-gray-800"
            >
              問伴伴
            </button>
            <button
              onClick={onCheckout}
              className="flex-1 rounded-xl bg-brand py-3 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(255,59,59,0.32)]"
            >
              直接結帳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
