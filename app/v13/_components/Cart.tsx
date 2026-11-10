"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  cartCountOf,
  removeFromCart,
  type CartItem,
} from "../_lib/chat-storage";
import { REWARD_BALANCE } from "../_lib/mock-data";

// 購物車頁：照現行 App 的購物車，點右上角購物車進來，是結帳前獨立的一頁。
// 這裡只做兩件事：看有什麼、把不要的移除；數量、備註、地址都留到結帳頁，
// 所以這頁沒有數量加減也沒有勾選。
//
// 折抵只出現在底部的合計，不標在每一列：回饋是整筆共用的額度，標在每件上面會
// 變成一堆加起來不成立的 $0（餘額 240 的時候，兩件 129 不可能都是 0 元）。
// 商品列維持原價，合計把原價劃掉、換成折抵後要付的，使用者在列表看到的那個
// 「$0」會在這裡以合計的形式再出現一次，體驗接得上，數字也站得住。
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
  // 折抵算在整筆訂單上，跟結帳頁同一套算法（運費是結帳頁才出現的，這裡只算商品）
  const reward = Math.floor(Math.min(REWARD_BALANCE, total));
  const payable = total - reward;

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
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] text-[#a1a5ac]">{count} 件合計</p>
              {reward > 0 && (
                <p className="mt-1 text-[13px] font-semibold text-[#1f8a5b]">
                  已用回饋折抵 −{money(reward)}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              {reward > 0 && (
                <p className="text-[13px] text-[#a1a5ac] line-through">
                  {money(total)}
                </p>
              )}
              <p
                className={`text-[26px] font-bold ${
                  payable === 0 ? "text-brand" : "text-gray-800"
                }`}
              >
                {money(payable)}
              </p>
            </div>
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
