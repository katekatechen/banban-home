"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProductSheet from "../../_components/ProductSheet";
import StatusBar from "../../_components/StatusBar";
import Checkout from "../../_components/Checkout";
import {
  addToCart,
  loadCart,
  removeFromCart,
  saveCart,
  setPendingPrompt,
  type CartItem,
  type RecCard,
} from "../../_lib/chat-storage";
import {
  RECOMMENDED_PRODUCTS,
  REWARD_BALANCE,
  TRENDING_PRODUCTS,
  WISHES,
  WISHES_SOON,
} from "../../_lib/mock-data";

// 導覽列浮在內容上面用漸層，不是佔自己一排空間的實色色塊，跟回饋分頁
// 同一套做法：頭部實際內容高度桌機預覽（sm+）跟真手機瀏覽器（<sm）差了
// 一大截（96px vs 56px，StatusBar 有沒有假的 9:41 那行差別），兩邊要分開
// 設 GRADIENT 高度＋內容 paddingTop，不然真手機會照桌機的 112px 留白，
// 跟真正的頭部高度差了 56px，看起來間距過大。GRADIENT 高度都比實際內容
// 高一截（+16px）讓漸層尾巴有地方淡出；內容的 paddingTop 對齊 GRADIENT
// 高度，不然靜止狀態的內容會被半透明的漸層尾巴洗到
const HEADER_GRADIENT_CLASS =
  "h-[72px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95)_78%,rgba(255,255,255,0)_100%)] sm:h-[112px] sm:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95)_85.7%,rgba(255,255,255,0)_100%)]";
const HEADER_PADDING_CLASS = "pt-[72px] sm:pt-[112px]";

// 兌換分頁是這版新增的：許願池搬到這裡（原本在回饋頁的許願池子分頁），
// 加上「熱門商品」——用回饋折抵一般商品（不只是酒），跟回饋分頁區分開來：
// 回饋分頁講「你賺了多少」，兌換分頁講「你可以拿去換什麼」
// 兌換頁的商品攤成細節頁要的 RecCard 格式；沒有實拍圖的就讓細節頁顯示灰底
const toCards = (list: typeof TRENDING_PRODUCTS): RecCard[] =>
  list.map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    image: p.image,
  }));
const TRENDING_CARDS = toCards(TRENDING_PRODUCTS);
const RECOMMENDED_CARDS = toCards(RECOMMENDED_PRODUCTS);

export default function ExchangePage() {
  const router = useRouter();
  // 「大家都在買」「猜你喜歡」點了打開跟對話裡同一個商品細節頁，
  // 左右滑可以切換同一排的其他商品；購物車狀態跟聊天分頁共用同一份
  const [sheet, setSheet] = useState<{
    cards: RecCard[];
    index: number;
  } | null>(null);
  // 購物車跟聊天分頁共用模組層級的同一份，這裡改了就寫回去
  const [cart, setCartState] = useState<CartItem[]>(loadCart);
  const setCart = (next: CartItem[]) => {
    setCartState(next);
    saveCart(next);
  };
  const addedIds = cart.map((it) => it.card.id);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (text: string) => {
    setToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 ${HEADER_GRADIENT_CLASS}`}
      >
        <div className="pointer-events-auto">
          <StatusBar />
          {/* 頂列照 Figma 948:46058：24px 標題，右邊回饋膠囊＋購物車（跟聊天分頁同一顆） */}
          <div className="flex h-11 shrink-0 items-center justify-between px-4">
            <p className="text-[24px] font-semibold leading-8 text-gray-800">
              兌換
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/v13/reward-history")}
                className="flex shrink-0 items-center gap-1.5 rounded-[22px] bg-white py-1.5 pl-1.5 pr-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
              >
                <img
                  src="/figma/reward-icon-hero.svg"
                  alt=""
                  className="size-7"
                />
                <span className="text-[16px] font-medium leading-6 text-gray-800">
                  {REWARD_BALANCE.toLocaleString()}
                </span>
              </button>
              <button
                aria-label="購物車"
                onClick={() => setCheckoutOpen(true)}
                className="relative flex h-11 items-center rounded-[22px] bg-white px-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
              >
                <img src="/figma/v13-cart.svg" alt="" className="size-5" />
                {cart.length > 0 && (
                  <span className="absolute -right-[3px] top-0 rounded-[20px] bg-brand px-1 py-0.5 text-[12px] font-bold leading-3 text-gray-000">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 左右邊界跟其他分頁統一 16px（照 Figma）：外層捲動區不留左右內距，
          標題各自內縮 16px；橫向卡片列的 16px 內距放在捲動列自己身上，
          卡片往右滑時才能一路滑到螢幕邊緣，不會在 16px 處被切掉 */}
      <div
        className={`flex-1 overflow-y-auto overscroll-contain bg-white ${HEADER_PADDING_CLASS}`}
      >
        <ProductRow
          title="大家都在買"
          subtitle="用回饋折抵商品"
          products={TRENDING_PRODUCTS}
          onOpen={(i) => setSheet({ cards: TRENDING_CARDS, index: i })}
        />
        <ProductRow
          title="猜你喜歡"
          subtitle="根據你的對話"
          products={RECOMMENDED_PRODUCTS}
          onOpen={(i) => setSheet({ cards: RECOMMENDED_CARDS, index: i })}
        />

        {/* 許願池（照 Figma 948:45714）：跟上面用回饋折抵的商品邏輯不同（這裡是抽獎），
            整區換成深色底做出區隔；底部多留一段讓深色延伸到 tabbar 底下 */}
        <div className="flex flex-col gap-4 bg-[#364153] pb-[140px]">
          <div>
            <div className="p-4">
              <div className="flex items-center gap-1">
                <p className="text-[16px] font-semibold leading-6 text-white">
                  許願池
                </p>
                <img
                  src="/figma/v13-nav-arrow-right-white.svg"
                  alt=""
                  className="size-5"
                />
              </div>
              <p className="text-[13px] leading-[18px] text-gray-400">
                用回饋換一個機會
              </p>
            </div>
            <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
              {WISHES.map((w) => (
                <div
                  key={w.id}
                  className="w-[calc(100%-32px)] shrink-0 overflow-hidden rounded-2xl bg-gray-800"
                >
                  <div className="relative h-[180px]">
                    <img
                      src={w.image}
                      alt={w.name}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <p className="absolute inset-x-4 bottom-4 line-clamp-2 text-[20px] leading-6 text-white">
                      {w.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold leading-[22px] text-white">
                        {w.name}
                      </p>
                      <p className="text-[16px] leading-6 text-white">
                        中獎價 ＄{w.price.toLocaleString()}
                      </p>
                    </div>
                    <button className="shrink-0 rounded-full bg-brand px-[18px] py-2 text-[14px] font-bold leading-5 text-white">
                      許願
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="p-4">
              <p className="text-[16px] font-bold leading-6 text-white">
                即將開獎
              </p>
              <p className="text-[13px] leading-[18px] text-gray-400">
                許願滿額就開獎
              </p>
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4">
              {WISHES_SOON.map((w) => (
                <div
                  key={w.id}
                  className="flex w-[168px] shrink-0 flex-col gap-2"
                >
                  <div className="relative size-[168px] overflow-hidden rounded-2xl">
                    <img
                      src={w.image}
                      alt={w.name}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute left-0 top-0 rounded-br-2xl rounded-tl-2xl bg-brand px-2 py-1 text-[14px] font-semibold leading-[18px] text-white">
                      差 {w.remaining.toLocaleString()}
                    </span>
                    {/* 底部進度條：目前累積到開獎門檻的比例 */}
                    <div className="absolute inset-x-0 bottom-0 h-2 backdrop-blur-[2.5px]">
                      <div
                        className="h-full rounded-bl-2xl bg-brand"
                        style={{ width: `${w.progress * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="truncate text-[16px] leading-6 text-gray-000">
                    {w.name}
                  </p>
                </div>
              ))}
              <div className="flex h-[168px] w-[137px] shrink-0 items-center justify-center rounded-2xl bg-gray-100">
                <p className="text-[14px] leading-[18px] text-gray-400">
                  看全部
                </p>
                <img
                  src="/figma/v13-nav-arrow-right-20.svg"
                  alt=""
                  className="size-5 opacity-40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {sheet && (
        <ProductSheet
          cards={sheet.cards}
          startIndex={sheet.index}
          addedIds={addedIds}
          onToggleCart={(card) =>
            setCart(
              addedIds.includes(card.id)
                ? removeFromCart(cart, card.id)
                : addToCart(cart, card),
            )
          }
          onBuy={(card) => {
            if (!addedIds.includes(card.id)) setCart(addToCart(cart, card));
            setSheet(null);
            setCheckoutOpen(true);
          }}
          onAsk={(card) => {
            setSheet(null);
            setPendingPrompt(`我想多了解「${card.name}」`);
            router.push("/v13");
          }}
          onClose={() => setSheet(null)}
        />
      )}

      {checkoutOpen && (
        <Checkout
          cart={cart}
          onCartChange={setCart}
          onClose={() => setCheckoutOpen(false)}
          onPaid={(paidIds) => {
            setCart(cart.filter((it) => !paidIds.includes(it.card.id)));
            setCheckoutOpen(false);
            showToast("前往付款・訂單已成立");
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-40 flex justify-center px-4">
          <p
            className="rounded-full bg-gray-800/90 px-4 py-2 text-[13px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
            style={{ animation: "fadeIn 200ms ease" }}
          >
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}

// 「大家都在買」「猜你喜歡」：照 Figma 948:45874，卡寬 168、圖片 1:1 圓角 16，
// 下面品名（最多兩行）跟價格，左右 8px 內縮；整排可以往右滑
function ProductRow({
  title,
  subtitle,
  products,
  onOpen,
}: {
  title: string;
  subtitle: string;
  products: typeof TRENDING_PRODUCTS;
  onOpen: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="px-4">
        <p className="text-[16px] font-semibold leading-6 text-gray-800">
          {title}
        </p>
        <p className="text-[14px] leading-[18px] text-gray-400">{subtitle}</p>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {products.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onOpen(i)}
            className="w-[168px] shrink-0 text-left"
          >
            {p.image ? (
              <img
                src={p.image}
                alt={p.name}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            ) : (
              <div
                className="aspect-square rounded-2xl"
                style={{ backgroundColor: p.color }}
              />
            )}
            <div className="flex flex-col gap-1 px-2 py-3">
              <p className="line-clamp-2 h-9 text-[14px] font-medium leading-[18px] tracking-[0.42px] text-gray-800">
                {p.name}
              </p>
              <p className="text-[14px] leading-[18px] text-gray-800">
                ${p.price.toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
