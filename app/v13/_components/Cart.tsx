"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  cartCountOf,
  removeFromCart,
  type CartItem,
} from "../_lib/chat-storage";

// 購物車頁：照現行 App 的購物車，點右上角購物車進來，是結帳前獨立的一頁。
// 這裡只做兩件事：看有什麼、把不要的移除；數量、備註、地址、折抵都留到結帳頁，
// 所以這頁沒有數量加減也沒有勾選。底部是件數合計跟一顆「立即結帳」。
// 跟結帳頁一樣用 portal 掛到 #v13-frame，才蓋得過 tabbar
const money = (n: number) => `NT$${n.toLocaleString()}`;

export default function Cart({
  cart,
  onCartChange,
  onCheckout,
  onClose,
}: {
  cart: CartItem[];
  onCartChange: (cart: CartItem[]) => void;
  onCheckout: () => void;
  onClose: () => void;
}) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
  }, []);
  if (!frame) return null;

  const count = cartCountOf(cart);
  const total = cart.reduce((sum, it) => sum + it.card.price * it.qty, 0);

  return createPortal(
    <div
      className="absolute inset-0 z-[60] flex flex-col bg-white"
      style={{ animation: "fadeIn 200ms ease" }}
    >
      <div className="h-[env(safe-area-inset-top)] shrink-0 sm:h-10" />
      {/* 標題置中，返回鍵壓在左邊（跟現行 App 一樣） */}
      <div className="relative flex shrink-0 items-center justify-center px-[18px] py-4">
        <button
          onClick={onClose}
          aria-label="返回"
          className="absolute left-3 flex size-[34px] items-center justify-center rounded-[9px] text-gray-800"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <p className="text-[17px] font-bold text-gray-800">購物車</p>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {cart.length === 0 ? (
          <p className="px-5 py-[60px] text-center text-[14px] text-[#a1a5ac]">
            購物車是空的
          </p>
        ) : (
          cart.map((it) => (
            <div
              key={it.card.id}
              className="flex items-center gap-2.5 px-4 py-3"
            >
              <div
                role="img"
                aria-label={it.card.name}
                className="size-11 shrink-0 rounded-[8px] bg-[#f0f2f4] bg-cover bg-center"
                style={{
                  backgroundImage: it.card.image
                    ? `url('${it.card.image}')`
                    : undefined,
                }}
              />
              {/* 商品名稱最多三行，現行版的品名常常很長（含括號規格） */}
              <p className="line-clamp-3 min-w-0 flex-1 text-[15px] font-semibold leading-[1.35] text-gray-800">
                {it.card.name}
              </p>
              <p className="shrink-0 text-[15px] text-gray-800">
                {money(it.card.price * it.qty)}
              </p>
              <button
                onClick={() => onCartChange(removeFromCart(cart, it.card.id))}
                className="shrink-0 text-[15px] text-[#ff5050]"
              >
                移除
              </button>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="shrink-0 border-t border-[#e8eaed] bg-white px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] text-[#a1a5ac]">{count} 件合計</p>
            <p className="text-[26px] font-bold text-gray-800">
              {money(total)}
            </p>
          </div>
          <button
            onClick={onCheckout}
            className="mt-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#ff5050] text-[16px] font-semibold text-white"
          >
            立即結帳
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      )}
    </div>,
    frame,
  );
}
