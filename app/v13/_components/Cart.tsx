"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  addToCart,
  cartCountOf,
  removeFromCart,
  type CartItem,
  type RecCard,
} from "../_lib/chat-storage";
import ProductSheet from "./ProductSheet";

// 購物車頁：照現行 App 的購物車，點右上角購物車進來，是結帳前獨立的一頁。
// 這裡只做兩件事：看有什麼、把不要的移除；數量、備註、地址都留到結帳頁，
// 所以這頁沒有數量加減也沒有勾選。
//
// 底部只報商品原價的合計，不在這裡講回饋折抵：折抵多少是結帳頁才決定的事
// （可以改折抵金額、還要加運費），在這裡先給一個數字，到結帳頁又變一個，反而更亂。
// 跟結帳頁一樣用 portal 掛到 #v13-frame，才蓋得過 tabbar
const money = (n: number) => `NT$${n.toLocaleString()}`;

export default function Cart({
  cart,
  onCartChange,
  onCheckout,
  onClose,
  onAsk,
}: {
  cart: CartItem[];
  onCartChange: (cart: CartItem[]) => void;
  onCheckout: () => void;
  onClose: () => void;
  // 從細節頁的「繼續聊」回到對話，由外面的分頁決定怎麼帶過去
  onAsk?: (card: RecCard) => void;
}) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  // 點商品列開出的細節頁。開的瞬間把當下的清單拍一份快照帶進去，
  // 之後在細節頁把商品移除時，左右滑動的那一疊不會跟著少一張、跳到別的商品
  const [detail, setDetail] = useState<{
    cards: RecCard[];
    index: number;
  } | null>(null);
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
          cart.map((it, i) => (
            <div
              key={it.card.id}
              role="button"
              tabIndex={0}
              onClick={() =>
                setDetail({ cards: cart.map((c) => c.card), index: i })
              }
              className="flex items-start gap-3 px-4 py-3.5 text-left active:bg-[#f7f8f9]"
              style={{
                borderTop: i === 0 ? "none" : "1px solid #f0f2f4",
              }}
            >
              <div
                role="img"
                aria-label={it.card.name}
                className="size-12 shrink-0 rounded-[8px] bg-[#f0f2f4] bg-cover bg-center"
                style={{
                  backgroundImage: it.card.image
                    ? `url('${it.card.image}')`
                    : undefined,
                }}
              />
              {/* 品名自己一行、金額自己一行：現行版的品名很長（常含括號規格），
                  跟金額擠在同一列的話，品名被壓到剩一半寬、四五個字就斷一次，
                  金額也會被推成每一列都不同的起點，一排看下來是歪的。
                  拆成上下之後品名有整行可用，金額全部對齊同一個左緣 */}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[15px] font-semibold leading-[1.4] text-gray-800">
                  {it.card.name}
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="text-[15px] text-gray-800">
                    {money(it.card.price * it.qty)}
                  </p>
                  <button
                    onClick={(e) => {
                      // 不要連帶開啟細節頁
                      e.stopPropagation();
                      onCartChange(removeFromCart(cart, it.card.id));
                    }}
                    className="shrink-0 text-[15px] text-[#ff5050]"
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="shrink-0 border-t border-[#e8eaed] bg-white px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
          <div className="flex items-end justify-between gap-3">
            <p className="text-[13px] text-[#a1a5ac]">{count} 件合計</p>
            <p className="shrink-0 text-[26px] font-bold text-gray-800">
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

      {/* 商品細節頁：從購物車點進來，跟兌換分頁一樣從右邊推進來。
          購物車本身是 z-60，所以細節頁要往上疊才蓋得過去 */}
      {detail && (
        <ProductSheet
          cards={detail.cards}
          startIndex={detail.index}
          addedIds={cart.map((it) => it.card.id)}
          cart={cart}
          present="push"
          z={70}
          onToggleCart={(card) =>
            onCartChange(
              cart.some((it) => it.card.id === card.id)
                ? removeFromCart(cart, card.id)
                : addToCart(cart, card),
            )
          }
          onBuy={(card) => {
            if (!cart.some((it) => it.card.id === card.id))
              onCartChange(addToCart(cart, card));
            setDetail(null);
            onCheckout();
          }}
          onAsk={(card) => {
            setDetail(null);
            onClose();
            onAsk?.(card);
          }}
          onClose={() => setDetail(null)}
        />
      )}
    </div>,
    frame,
  );
}
