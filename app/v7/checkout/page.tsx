"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import {
  type CartItem,
  getCart,
  updateQty,
  removeFromCart,
  cartTotal,
} from "../_lib/cart";
import { addOrder } from "../_lib/orders";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const refresh = () => setItems(getCart());

  const total = cartTotal(items);

  const handlePay = () => {
    items.forEach((i) =>
      addOrder({
        name: i.name,
        price: i.price,
        qty: i.qty,
        emoji: i.emoji,
        gradient: i.gradient,
        source: i.source,
      }),
    );
    items.forEach((i) => removeFromCart(i.key));
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-white px-8 text-center">
        <span className="text-[48px]">🎉</span>
        <p className="text-[17px] font-semibold text-gray-800">
          訂單已成立
        </p>
        <p className="text-[13px] text-gray-500">
          會直接寄到你家，不會存放在 AIFIAN 裡面。付款流程之後再補。
        </p>
        <button
          onClick={() => router.push("/v7/banbun")}
          className="mt-4 rounded-full bg-brand px-6 py-2.5 text-[14px] font-semibold text-white"
        >
          回到伴伴
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex items-center gap-2 border-b border-gray-100 px-2 pb-3 pt-1">
        <button
          onClick={() => router.back()}
          className="flex size-8 items-center justify-center text-[20px] text-gray-700"
        >
          ‹
        </button>
        <p className="flex-1 text-[16px] font-bold text-gray-800">結帳</p>
        <p className="pr-3 text-[13px] text-gray-400">{items.length} 件商品</p>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto bg-gray-000 p-4">
        {items.length === 0 ? (
          <p className="pt-20 text-center text-[14px] text-gray-400">
            購物車是空的
          </p>
        ) : (
          <>
            <div className="flex flex-col divide-y divide-gray-100 rounded-2xl bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              {items.map((i) => (
                <div key={i.key} className="flex gap-3 py-4">
                  <div
                    className={`flex size-[64px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[26px] ${i.gradient}`}
                  >
                    {i.emoji}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start gap-2">
                      <p className="line-clamp-2 flex-1 text-[13.5px] leading-[1.4] text-gray-800">
                        {i.name}
                      </p>
                      <button
                        onClick={() => {
                          removeFromCart(i.key);
                          refresh();
                        }}
                        className="flex size-7 shrink-0 items-center justify-center text-gray-400"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">{i.source}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
                        <button
                          onClick={() => {
                            updateQty(i.key, i.qty - 1);
                            refresh();
                          }}
                          className="flex size-7 items-center justify-center text-gray-600"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-[13px] font-semibold text-gray-800">
                          {i.qty}
                        </span>
                        <button
                          onClick={() => {
                            updateQty(i.key, i.qty + 1);
                            refresh();
                          }}
                          className="flex size-7 items-center justify-center text-gray-600"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[14px] font-semibold text-gray-800">
                        ${(i.price * i.qty).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex justify-between text-[13px] text-gray-500">
                <span>小計</span>
                <span className="text-gray-800">${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] text-gray-500">
                <span>運費</span>
                <span className="text-emerald-600">免運</span>
              </div>
              <div className="my-1 h-px bg-gray-100" />
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] font-semibold text-gray-800">
                  總金額
                </span>
                <span className="text-[20px] font-bold text-brand">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex shrink-0 items-center gap-3 border-t border-gray-100 bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400">總金額</p>
            <p className="text-[18px] font-bold text-gray-800">
              ${total.toLocaleString()}
            </p>
          </div>
          <button
            onClick={handlePay}
            className="flex-1 rounded-2xl bg-brand py-3.5 text-[15px] font-semibold text-white"
          >
            前往付款
          </button>
        </div>
      )}
    </div>
  );
}
