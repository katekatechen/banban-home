"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  cartCountOf,
  removeFromCart,
  setCartQty,
  type CartItem,
} from "../_lib/chat-storage";
import { REWARD_BALANCE } from "../_lib/mock-data";

// 結帳頁：點購物車或商品細節頁的「立即結帳」打開，照 claude.ai/design
//「AIFIAN 伴伴」的結帳頁手機版（全螢幕）。商品可以勾選要不要這次結、
// 調數量、移除；送達地址跟付款方式先放一組固定的假資料，回饋可以折抵。
// 跟商品細節頁一樣用 portal 掛到 #v13-frame，才蓋得過 tabbar
const FREE_SHIP = 490;
const SHIP_FEE = 60;
const ADDRESS = {
  name: "陳小安",
  phone: "+886 912 345 678",
  full: "台北市內湖區瑞光路 335 號",
};
const CARD_LAST = "4242";

const money = (n: number) => `NT$ ${n.toLocaleString()}`;

export default function Checkout({
  cart,
  onCartChange,
  onPaid,
  onClose,
}: {
  cart: CartItem[];
  onCartChange: (cart: CartItem[]) => void;
  // 付款完成：只結掉有勾選的商品，沒勾的留在購物車
  onPaid: (paidIds: string[]) => void;
  onClose: () => void;
}) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [deselected, setDeselected] = useState<string[]>([]);
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [points, setPoints] = useState("");
  const [removeTarget, setRemoveTarget] = useState<CartItem | null>(null);
  const [atBottom, setAtBottom] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (text: string) => {
    setToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  };

  const isSelected = (id: string) => !deselected.includes(id);
  const selectedItems = cart.filter((it) => isSelected(it.card.id));
  const cartCount = cartCountOf(cart);
  const selectedCount = cartCountOf(selectedItems);
  const subtotal = selectedItems.reduce(
    (sum, it) => sum + it.card.price * it.qty,
    0,
  );
  const freeShip = subtotal >= FREE_SHIP || subtotal === 0;
  const ship = freeShip ? 0 : SHIP_FEE;
  const total = subtotal + ship;
  const reward = Math.min(parseInt(points, 10) || 0, REWARD_BALANCE, total);
  const payable = total - reward;

  // 捲到最底、已經看得到金額明細時，底部操作列左邊的「實付」收起來，
  // 金額改寫進按鈕裡（照設計稿）
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 8);
  };
  useEffect(handleScroll, [cart.length]);

  const toggleSelect = (id: string) =>
    setDeselected((d) =>
      d.includes(id) ? d.filter((x) => x !== id) : [...d, id],
    );

  const changeQty = (it: CartItem, delta: number) => {
    const next = it.qty + delta;
    if (next < 1) {
      setRemoveTarget(it);
      return;
    }
    onCartChange(setCartQty(cart, it.card.id, next));
  };

  if (!frame) return null;

  return createPortal(
    <div
      className="absolute inset-0 z-[60] flex flex-col bg-white"
      style={{ animation: "fadeIn 200ms ease" }}
    >
      <div className="h-[env(safe-area-inset-top)] shrink-0 sm:h-10" />
      <div className="flex shrink-0 items-center gap-3 border-b border-[#e8eaed] px-[18px] py-4">
        <button
          onClick={onClose}
          aria-label="返回"
          className="-ml-1 flex size-[34px] items-center justify-center rounded-[9px] text-gray-800"
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
        <p className="text-[17px] font-bold text-gray-800">結帳</p>
        <div className="flex-1" />
        <p className="text-[13px] text-[#a1a5ac]">
          {selectedCount} / {cartCount} 件商品
        </p>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f5f7f7] p-[18px]"
      >
        {cart.length === 0 ? (
          <p className="px-5 py-[60px] text-center text-[14px] text-[#a1a5ac]">
            購物車是空的
          </p>
        ) : (
          <>
            <div className={`${CARD} px-4 py-1.5`}>
              {cart.map((it, i) => {
                const sel = isSelected(it.card.id);
                return (
                  <div
                    key={it.card.id}
                    className="py-4"
                    style={{
                      borderBottom:
                        i < cart.length - 1 ? "1px solid #eef0f1" : "none",
                    }}
                  >
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleSelect(it.card.id)}
                        aria-label={sel ? "這次不結" : "這次要結"}
                        aria-pressed={sel}
                        className="flex size-[22px] shrink-0 items-center justify-center self-center rounded-full border-[1.5px] transition-colors"
                        style={{
                          borderColor: sel ? "#ff5050" : "#cfd3d8",
                          background: sel ? "#ff5050" : "transparent",
                        }}
                      >
                        {sel && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                      <div
                        role="img"
                        aria-label={it.card.name}
                        className="size-[72px] shrink-0 rounded-[12px] bg-[#f0f2f4] bg-cover bg-center transition-opacity"
                        style={{
                          backgroundImage: it.card.image
                            ? `url('${it.card.image}')`
                            : undefined,
                          opacity: sel ? 1 : 0.45,
                        }}
                      />
                      <div
                        className="flex min-w-0 flex-1 flex-col transition-opacity"
                        style={{ opacity: sel ? 1 : 0.45 }}
                      >
                        <div className="flex items-start gap-2">
                          <p className="line-clamp-2 min-w-0 flex-1 text-[13.5px] leading-[1.45] text-gray-800">
                            {it.card.name}
                          </p>
                          <button
                            onClick={() => setRemoveTarget(it)}
                            aria-label="移除"
                            className="-mr-1 -mt-[3px] flex size-7 shrink-0 items-center justify-center rounded-[8px] text-[#a1a5ac]"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </button>
                        </div>
                        {it.card.subtitle && (
                          <p className="mt-[3px] text-[12px] text-[#a1a5ac]">
                            {it.card.subtitle}
                          </p>
                        )}
                        <div className="flex-1" />
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-[9px] border border-[#dfe2e6]">
                            <button
                              onClick={() => changeQty(it, -1)}
                              aria-label="減少數量"
                              className="flex size-[30px] items-center justify-center text-gray-500"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              >
                                <path d="M5 12h14" />
                              </svg>
                            </button>
                            <span className="min-w-[30px] text-center text-[14px] font-semibold text-gray-800">
                              {it.qty}
                            </span>
                            <button
                              onClick={() => changeQty(it, 1)}
                              aria-label="增加數量"
                              className="flex size-[30px] items-center justify-center text-gray-500"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              >
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-[15px] font-semibold text-gray-800">
                            {money(it.card.price * it.qty)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      value={specs[it.card.id] ?? ""}
                      onChange={(e) =>
                        setSpecs((s) => ({
                          ...s,
                          [it.card.id]: e.target.value,
                        }))
                      }
                      placeholder="＋ 備註規格"
                      className="ml-[84px] mt-2.5 h-9 w-[calc(100%-84px)] rounded-[10px] border border-[#eceef1] bg-[#fafbfb] px-3 text-[13px] text-gray-800 outline-none"
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => showToast("地址編輯這版還沒做")}
              className={`${CARD} mt-3.5 block w-full p-4 text-left`}
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-800">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                  送達地址
                </p>
                <span className="text-[14px] font-semibold text-[#ff5050]">
                  編輯
                </span>
              </div>
              <p className="mt-3 text-[16px] font-semibold text-gray-800">
                {ADDRESS.name}
                <span className="font-normal text-gray-500">
                  {" "}
                  · {ADDRESS.phone}
                </span>
              </p>
              <p className="mt-[5px] text-[15px] leading-[1.4] text-gray-500">
                {ADDRESS.full}
              </p>
            </button>

            <button
              onClick={() => showToast("更換付款方式這版還沒做")}
              className={`${CARD} mt-3.5 block w-full p-4 text-left`}
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-800">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                    <path d="M2.5 10h19" />
                  </svg>
                  付款方式
                </p>
                <span className="text-[14px] font-semibold text-[#ff5050]">
                  更換
                </span>
              </div>
              <div className="mt-3.5 flex items-center gap-3">
                <span className="flex h-[23px] w-[34px] items-center justify-center rounded-[4px] bg-[#1a1f71] text-[10px] font-extrabold italic text-white">
                  VISA
                </span>
                <span className="text-[16px] text-gray-800">
                  Visa ···· {CARD_LAST}
                </span>
              </div>
              <p className="mt-3 flex items-start gap-[7px] text-[12px] leading-[1.5] text-[#a1a5ac]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="mt-0.5 shrink-0"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8h.01M11 12h1v4h1" />
                </svg>
                <span>
                  本筆為跨國交易，發卡銀行可能加收國外交易手續費（此費用由發卡銀行收取，非本店收取）。
                </span>
              </p>
            </button>

            <div className={`${CARD} mt-3.5 p-4`}>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-800">
                  <img
                    src="/figma/reward-icon-hero.svg"
                    alt=""
                    className="size-[18px]"
                  />
                  回饋折抵
                </p>
                <p className="text-[13px] text-[#a1a5ac]">
                  可用 {REWARD_BALANCE.toLocaleString()}
                </p>
              </div>
              <div className="mt-3 flex gap-2.5">
                <input
                  value={points}
                  onChange={(e) =>
                    setPoints(e.target.value.replace(/[^\d]/g, ""))
                  }
                  inputMode="numeric"
                  placeholder="輸入折抵點數"
                  className="h-11 min-w-0 flex-1 rounded-[11px] border border-[#dfe2e6] bg-transparent px-3.5 text-[15px] text-gray-800 outline-none"
                />
                <button
                  onClick={() =>
                    setPoints(String(Math.min(REWARD_BALANCE, total)))
                  }
                  className="shrink-0 rounded-[11px] bg-[#f0f1f3] px-[15px] text-[14px] font-semibold text-gray-800"
                >
                  全部折抵
                </button>
              </div>
              {reward > 0 && (
                <p className="mt-2.5 text-[14px] font-semibold text-[#1f8a5b]">
                  已折抵 −{money(reward)}
                </p>
              )}
            </div>

            <div className={`${CARD} mt-3.5 px-[18px] py-4`}>
              <div className="mb-2.5 flex justify-between text-[14px] text-gray-500">
                <span>小計</span>
                <span className="text-gray-800">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[14px] text-gray-500">
                <span>運費</span>
                <span style={{ color: freeShip ? "#1f8a5b" : "#1e2939" }}>
                  {freeShip ? "免運費" : money(ship)}
                </span>
              </div>
              {!freeShip && subtotal > 0 && (
                <p className="mt-2 text-[12px] text-[#a1a5ac]">
                  再買 {money(FREE_SHIP - subtotal)} 即可免運
                </p>
              )}
              {reward > 0 && (
                <div className="mt-2.5 flex justify-between text-[14px] text-[#1f8a5b]">
                  <span>回饋折抵</span>
                  <span>−{money(reward)}</span>
                </div>
              )}
              <div className="my-3.5 h-px bg-[#eef0f1]" />
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-semibold text-gray-800">
                  實付
                </span>
                <span className="text-[22px] font-bold text-[#ff5050]">
                  {money(payable)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div
          className="flex shrink-0 items-center overflow-hidden border-t border-[#e8eaed] bg-white px-[18px] pb-[calc(14px+env(safe-area-inset-bottom))] pt-3"
          style={{ gap: atBottom ? 0 : 14, transition: "gap 320ms ease" }}
        >
          <div
            className="shrink-0 overflow-hidden"
            style={{
              maxWidth: atBottom ? 0 : 160,
              opacity: atBottom ? 0 : 1,
              transition:
                "max-width 320ms cubic-bezier(.2,0,.2,1), opacity 240ms ease",
            }}
          >
            <p className="whitespace-nowrap text-[12px] text-[#a1a5ac]">實付</p>
            <p className="mt-[3px] whitespace-nowrap text-[20px] font-bold text-gray-800">
              {money(payable)}
            </p>
          </div>
          <button
            disabled={selectedItems.length === 0}
            onClick={() => onPaid(selectedItems.map((it) => it.card.id))}
            className="flex h-[52px] flex-1 items-center justify-center whitespace-nowrap rounded-[14px] bg-[#ff5050] text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(255,80,80,0.32)] disabled:bg-gray-300 disabled:shadow-none"
          >
            確認付款{atBottom ? ` ${money(payable)}` : ""}
          </button>
        </div>
      )}

      {removeTarget && (
        <div
          onClick={() => setRemoveTarget(null)}
          className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(15,18,23,0.42)] px-[26px]"
          style={{ animation: "fadeIn 200ms ease" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-[18px] bg-white px-5 pb-4 pt-[22px]"
          >
            <p className="text-center text-[19px] font-bold text-gray-800">
              移除商品
            </p>
            <p className="mt-2.5 text-center text-[15px] leading-[1.5] text-gray-500">
              確定要將「{removeTarget.card.name}」從訂單中移除嗎？
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setRemoveTarget(null)}
                className="h-12 flex-1 rounded-full border border-gray-200 text-[16px] font-semibold text-gray-800"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onCartChange(removeFromCart(cart, removeTarget.card.id));
                  setRemoveTarget(null);
                }}
                className="h-12 flex-1 rounded-full bg-[#ff5050] text-[16px] font-bold text-white"
              >
                移除
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center px-4">
          <p
            className="rounded-full bg-gray-800/90 px-4 py-2 text-[13px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
            style={{ animation: "fadeIn 200ms ease" }}
          >
            {toast}
          </p>
        </div>
      )}
    </div>,
    frame,
  );
}

const CARD = "rounded-[16px] bg-white shadow-[0_2px_4px_0_rgba(24,24,28,0.06)]";
