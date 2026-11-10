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

// 結帳頁：從購物車頁的「立即結帳」或商品細節頁的「立即結帳」進來，
// 版型照現行 App 的結帳頁：白底、資訊分成幾塊淺灰卡（送至／回饋折抵／付款方式），
// 商品列可以勾選要不要這次結、調數量、備註規格，金額明細放在最後、不包在卡裡。
// 跟商品細節頁一樣用 portal 掛到 #v14-frame，才蓋得過 tabbar
const FREE_SHIP = 490;
const SHIP_FEE = 60;
const ADDRESS = {
  name: "kate chen",
  phone: "+886 933 587 430",
  full: "台北市內湖區瑞光路 335 號",
};
const CARD_LAST = "4242";

// 現行 App 的金額寫法是 NT$119，數字跟 NT$ 之間不空格
const money = (n: number) => `NT$${n.toLocaleString()}`;
// 淺灰卡：現行版把頁面底色留白，資訊區塊自己是灰的
const CARD = "rounded-[14px] bg-[#f3f5f7]";
// 「修改」「更換」這類次要操作在現行版是青色，不是品牌紅
const LINK = "text-[15px] font-semibold text-[#00b8db]";

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
  // null ＝ 還沒自己調過，預設就折到最大：從兌換頁的「折抵後 $0」一路點進來，
  // 在結帳看到的還是同一個數字，不用自己記得按「全部折抵」。
  // 自己輸入過之後才改用輸入的值，購物車再變動也不會偷偷蓋掉
  const [points, setPoints] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CartItem | null>(null);
  const [atBottom, setAtBottom] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFrame(document.getElementById("v14-frame"));
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
  const subtotal = selectedItems.reduce(
    (sum, it) => sum + it.card.price * it.qty,
    0,
  );
  const freeShip = subtotal >= FREE_SHIP || subtotal === 0;
  const ship = freeShip ? 0 : SHIP_FEE;
  const total = subtotal + ship;
  const maxRedeem = Math.floor(Math.min(REWARD_BALANCE, total));
  const reward =
    points === null
      ? maxRedeem
      : Math.min(parseInt(points, 10) || 0, REWARD_BALANCE, total);
  const payable = total - reward;

  // 捲到最底、已經看得到金額明細時，底部操作列左邊的「實付」收起來，
  // 金額改寫進按鈕裡（照現行版）
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
      {/* 標題置中，返回鍵壓在左邊 */}
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
        <p className="text-[17px] font-bold text-gray-800">結帳</p>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-4 pb-5"
      >
        {cart.length === 0 ? (
          <p className="px-5 py-[60px] text-center text-[14px] text-[#a1a5ac]">
            購物車是空的
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between py-3.5">
              <p className="flex items-center gap-2 text-[16px] font-bold text-gray-800">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
                  <path d="M3 7l2-4h14l2 4" />
                </svg>
                訂單商品
              </p>
              <p className="text-[13px] text-[#a1a5ac]">{cartCount} 件商品</p>
            </div>

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
                  {/* 勾選、縮圖、內容三欄；品名、金額、數量、備註規格都在第三欄裡，
                      所以它們的左緣對齊同一條線（照現行 App 的結帳頁） */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => toggleSelect(it.card.id)}
                      aria-label={sel ? "這次不結" : "這次要結"}
                      aria-pressed={sel}
                      className="mt-[5px] flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors"
                      style={{
                        borderColor: sel ? "#ff5050" : "#cfd3d8",
                        background: sel ? "#ff5050" : "transparent",
                      }}
                    >
                      {sel && (
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3.6"
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
                      className="size-11 shrink-0 rounded-[8px] bg-[#f0f2f4] bg-cover bg-center transition-opacity"
                      style={{
                        backgroundImage: it.card.image
                          ? `url('${it.card.image}')`
                          : undefined,
                        opacity: sel ? 1 : 0.45,
                      }}
                    />
                    <div
                      className="min-w-0 flex-1 transition-opacity"
                      style={{ opacity: sel ? 1 : 0.45 }}
                    >
                      <p className="line-clamp-2 text-[16px] leading-[1.35] text-gray-800">
                        {it.card.name}
                      </p>
                      {/* 金額跟單價一組在左，數量加減在右，兩者垂直置中對齊 */}
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[21px] font-bold leading-7 text-gray-800">
                            {money(it.card.price * it.qty)}
                          </p>
                          <p className="mt-0.5 text-[15px] text-[#a1a5ac]">
                            {money(it.card.price)} / {it.qty} 個
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center overflow-hidden rounded-full border border-[#dfe2e6]">
                          <button
                            onClick={() => changeQty(it, -1)}
                            aria-label="減少數量"
                            className="flex size-[42px] items-center justify-center text-gray-500"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            >
                              <path d="M5 12h14" />
                            </svg>
                          </button>
                          <span className="min-w-[26px] text-center text-[16px] font-semibold text-gray-800">
                            {it.qty}
                          </span>
                          <button
                            onClick={() => changeQty(it, 1)}
                            aria-label="增加數量"
                            className="flex size-[42px] items-center justify-center text-gray-500"
                          >
                            <svg
                              width="16"
                              height="16"
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
                        className="mt-3 h-12 w-full rounded-[10px] bg-[#f3f5f7] px-4 text-[15px] text-gray-800 outline-none placeholder:text-[#a1a5ac]"
                        style={{ opacity: sel ? 1 : 0.45 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => showToast("地址編輯這版還沒做")}
              className={`${CARD} mt-4 block w-full p-4 text-left`}
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-800">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 7.5h10v9h-10Z" />
                    <path d="M12.5 10.5h4l3 3v3h-7Z" />
                    <circle cx="6" cy="18" r="1.6" />
                    <circle cx="16.5" cy="18" r="1.6" />
                  </svg>
                  送至
                </p>
                <span className={LINK}>修改</span>
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

            <div className={`${CARD} mt-3 p-4`}>
              <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-800">
                <img
                  src="/figma/reward-icon-hero.svg"
                  alt=""
                  className="size-[18px]"
                />
                回饋折抵
              </p>
              <p className="mt-1.5 text-[14px] text-[#6b7280]">
                可用回饋 {REWARD_BALANCE.toLocaleString()}
              </p>
              <div className="mt-3 flex gap-2.5">
                <input
                  value={points ?? String(maxRedeem)}
                  onChange={(e) =>
                    setPoints(e.target.value.replace(/[^\d]/g, ""))
                  }
                  inputMode="numeric"
                  placeholder="輸入折抵回饋"
                  className="h-12 min-w-0 flex-1 rounded-[12px] border border-[#e3e6ea] bg-white px-3.5 text-[15px] text-gray-800 outline-none placeholder:text-[#a1a5ac]"
                />
                <button
                  onClick={() => setPoints(String(maxRedeem))}
                  className="shrink-0 rounded-[12px] bg-[#1d2839] px-[18px] text-[15px] font-semibold text-white"
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

            <button
              onClick={() => showToast("更換付款方式這版還沒做")}
              className={`${CARD} mt-3 block w-full p-4 text-left`}
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-800">
                  <svg
                    width="19"
                    height="19"
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
                <span className={LINK}>更換</span>
              </div>
              <div className="mt-3.5 flex items-center gap-3">
                <span className="flex h-[23px] w-[34px] items-center justify-center rounded-[4px] bg-white text-[10px] font-extrabold italic text-[#1a1f71]">
                  VISA
                </span>
                <span className="text-[16px] text-gray-800">
                  Visa ···· {CARD_LAST}
                </span>
              </div>
              <p className="mt-3 flex items-start gap-[7px] text-[13px] leading-[1.5] text-[#a1a5ac]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f0a020"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0"
                >
                  <path d="M12 4 2.5 20h19Z" />
                  <path d="M12 10v4M12 17h.01" />
                </svg>
                <span>
                  本筆交易為跨國交易，發卡銀行可能加收國外交易手續費；此費用由發卡銀行收取，非本店收取。
                </span>
              </p>
            </button>

            {/* 金額明細不包在卡裡，直接列在白底上（照現行版） */}
            <div className="mt-5">
              <div className="flex justify-between text-[15px]">
                <span className="text-gray-500">商品小計</span>
                <span className="text-gray-800">{money(subtotal)}</span>
              </div>
              <div className="mt-2.5 flex justify-between text-[15px]">
                <span className="text-gray-500">運費</span>
                <span style={{ color: freeShip ? "#1f8a5b" : "#1e2939" }}>
                  {freeShip ? "免運費" : money(ship)}
                </span>
              </div>
              {!freeShip && subtotal > 0 && (
                <p className="mt-2 text-[13px] text-[#a1a5ac]">
                  再買 {money(FREE_SHIP - subtotal)} 即可免運
                </p>
              )}
              {reward > 0 && (
                <div className="mt-2.5 flex justify-between text-[15px] text-[#1f8a5b]">
                  <span>回饋折抵</span>
                  <span>−{money(reward)}</span>
                </div>
              )}
              <div className="my-3.5 h-px bg-[#eef0f1]" />
              <div className="flex items-baseline justify-between">
                <span className="text-[16px] font-bold text-gray-800">
                  實付金額
                </span>
                <span className="text-[19px] font-bold text-gray-800">
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
              maxWidth: atBottom ? 0 : 190,
              opacity: atBottom ? 0 : 1,
              transition:
                "max-width 320ms cubic-bezier(.2,0,.2,1), opacity 240ms ease",
            }}
          >
            <p className="whitespace-nowrap text-[13px] text-[#a1a5ac]">
              實付 · 含運費 {money(ship)}
            </p>
            <p className="mt-[3px] whitespace-nowrap text-[22px] font-bold text-gray-800">
              {money(payable)}
            </p>
          </div>
          <button
            disabled={selectedItems.length === 0}
            onClick={() => onPaid(selectedItems.map((it) => it.card.id))}
            className="flex h-[52px] flex-1 items-center justify-center whitespace-nowrap rounded-full bg-[#ff5050] text-[16px] font-semibold text-white disabled:bg-gray-300"
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
