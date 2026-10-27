"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProductSheet from "../../_components/ProductSheet";
import { CheckCircleIcon } from "../../_components/CorpIcons";
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

// 商品飛進購物車的時間，跟聊天分頁對齊
const FLY_TO_CART_MS = 650;

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
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastId = useRef(0);
  const toastTimer = useRef<number | null>(null);
  // 購物車平常不佔位置，膠囊裡只有回饋數字；有東西、或商品正在飛過去的
  // 路上（cartPeek）才讓購物車出現，動畫才有落點
  const [cartPeek, setCartPeek] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cartIconRef = useRef<HTMLImageElement>(null);
  const showCart = cart.length > 0 || cartPeek;

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (text: string) => {
    toastId.current += 1;
    setToast({ id: toastId.current, text });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  // 加入購物車：複製一份商品圖疊在原位，沿著一道往左上鼓起的弧線邊飛邊縮小，
  // 落在右上角購物車正中間，接著購物車縮放一下、數字才 +1 跳出來。
  // 跟聊天分頁同一套做法：用 Web Animations API 直接動 DOM，不走 React state，
  // 動畫期間不會重繪整頁
  const flyToCart = (from: HTMLElement, onLand: () => void) => {
    const root = rootRef.current;
    const image = from
      .closest("[data-product-card]")
      ?.querySelector<HTMLElement>("[data-product-image]");
    if (!root || !image) {
      onLand();
      return;
    }
    setCartPeek(true);
    // 購物車是這一刻才出現的，要等 React 把它畫出來才量得到落點
    requestAnimationFrame(() => {
      const cartIcon = cartIconRef.current;
      if (!cartIcon) {
        onLand();
        setCartPeek(false);
        return;
      }
      const rootRect = root.getBoundingClientRect();
      const a = image.getBoundingClientRect();
      const b = cartIcon.getBoundingClientRect();
      const w = a.width;
      const endScale = 22 / w;
      const x0 = a.left - rootRect.left;
      const y0 = a.top - rootRect.top;
      const x1 = b.left + b.width / 2 - rootRect.left - (w * endScale) / 2;
      const y1 = b.top + b.height / 2 - rootRect.top - (w * endScale) / 2;
      // 中途點：垂直先走掉七成、水平只走三成，路徑往左上鼓成一道弧，
      // 不會衝出畫面上緣（購物車本來就貼著頂部）
      const midX = x0 + (x1 - x0) * 0.3;
      const midY = y0 + (y1 - y0) * 0.7;

      const ghost = image.cloneNode(true) as HTMLElement;
      ghost.querySelector("button")?.remove();
      ghost.removeAttribute("data-product-image");
      Object.assign(ghost.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: `${w}px`,
        height: `${a.height}px`,
        margin: "0",
        zIndex: "30",
        pointerEvents: "none",
        borderRadius: "16px",
        overflow: "hidden",
        transformOrigin: "0 0",
        boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
      });
      root.appendChild(ghost);
      const anim = ghost.animate(
        [
          {
            transform: `translate(${x0}px, ${y0}px) scale(1)`,
            borderRadius: "16px",
          },
          {
            transform: `translate(${midX}px, ${midY}px) scale(0.45)`,
            offset: 0.45,
          },
          {
            transform: `translate(${x1}px, ${y1}px) scale(${endScale})`,
            opacity: 0.7,
            borderRadius: `${w / 2}px`,
          },
        ],
        { duration: FLY_TO_CART_MS, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
      );
      anim.onfinish = () => {
        ghost.remove();
        cartIcon.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.3)", offset: 0.4 },
            { transform: "scale(0.92)", offset: 0.75 },
            { transform: "scale(1)" },
          ],
          { duration: 360, easing: "ease-out" },
        );
        window.setTimeout(() => {
          onLand();
          setCartPeek(false);
        }, 140);
      };
    });
  };

  return (
    <div
      ref={rootRef}
      className="relative flex h-full flex-col overflow-hidden bg-white"
    >
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
            {/* 回饋數字跟購物車照 Figma 1242:2710 收在同一顆膠囊裡，
                購物車平常不佔位置，有東西才出現在數字右邊 */}
            <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-[22px] border-[0.5px] border-white/50 bg-white/80 pl-2.5 pr-2 shadow-[0px_8px_12px_0px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              <button
                onClick={() => router.push("/v13/reward-history")}
                className="flex items-center gap-1.5"
              >
                <img
                  src="/figma/reward-icon-hero.svg"
                  alt=""
                  className="size-6"
                />
                <span className="text-[16px] font-medium leading-6 text-gray-800">
                  {REWARD_BALANCE.toLocaleString()}
                </span>
              </button>
              {showCart && (
                <button
                  aria-label="購物車"
                  onClick={() => setCheckoutOpen(true)}
                  className="relative flex h-11 w-7 items-center justify-center"
                >
                  <img
                    ref={cartIconRef}
                    src="/figma/v13-cart.svg"
                    alt=""
                    className="size-5"
                  />
                  {cart.length > 0 && (
                    <span className="absolute left-4 top-0.5 min-w-4 rounded-[20px] bg-brand px-1 py-0.5 text-center text-[12px] font-bold leading-3 text-gray-000">
                      {cart.length}
                    </span>
                  )}
                </button>
              )}
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
          addedIds={addedIds}
          onAddToCart={(p, from) => {
            if (addedIds.includes(p.id)) {
              setCart(removeFromCart(cart, p.id));
              return;
            }
            // 按下去先震一下，再讓商品飛進購物車，落地才真的加進去
            navigator.vibrate?.(18);
            flyToCart(from, () => {
              setCart(addToCart(cart, toCards([p])[0]));
              showToast("已加入購物車");
            });
          }}
        />
        <ProductRow
          title="猜你喜歡"
          subtitle="根據你的對話"
          products={RECOMMENDED_PRODUCTS}
          onOpen={(i) => setSheet({ cards: RECOMMENDED_CARDS, index: i })}
          addedIds={addedIds}
          onAddToCart={(p, from) => {
            if (addedIds.includes(p.id)) {
              setCart(removeFromCart(cart, p.id));
              return;
            }
            // 按下去先震一下，再讓商品飛進購物車，落地才真的加進去
            navigator.vibrate?.(18);
            flyToCart(from, () => {
              setCart(addToCart(cart, toCards([p])[0]));
              showToast("已加入購物車");
            });
          }}
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

      {/* snackbar：固定在 tabbar 上方，不跟著捲，樣式跟帳號分頁同一組 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+83px)] z-30 flex justify-center px-4 sm:bottom-[105px]"
        aria-live="polite"
      >
        {toast && (
          <div
            key={toast.id}
            className="corp-toast flex items-center gap-2 rounded-full bg-[#1e2939] px-4 py-2.5 text-[14px] font-medium leading-5 text-white shadow-[0px_4px_16px_rgba(0,0,0,0.12)]"
          >
            <CheckCircleIcon className="size-5" />
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
}

// 「大家都在買」「猜你喜歡」：照 Figma 1846:5705（exchange/product-card），卡寬 168、
// 圖片 1:1 圓角 16，圖片右下角浮一顆加入購物車按鈕。下面是品名（最多兩行）、
// 「折抵後價格」帶刪除線的原價，再來是折抵後實付金額。回饋足夠付全額時金額用
// 品牌色並在圖片左上角掛一個 $0 標籤，要補差額時用文字主色、不放標籤
function ProductRow({
  title,
  subtitle,
  products,
  addedIds,
  onOpen,
  onAddToCart,
}: {
  title: string;
  subtitle: string;
  products: typeof TRENDING_PRODUCTS;
  addedIds: string[];
  onOpen: (index: number) => void;
  onAddToCart: (
    product: (typeof TRENDING_PRODUCTS)[number],
    from: HTMLElement,
  ) => void;
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
        {products.map((p, i) => {
          // 折抵後要補的差額：回饋跟金額是 1:1，跟結帳頁同一套算法。
          // 餘額帶小數（240.2），金額取整數顯示，跟結帳頁實際折抵的結果一致
          const shortfall = Math.max(0, p.price - REWARD_BALANCE);
          const fullyCovered = shortfall === 0;
          const added = addedIds.includes(p.id);
          return (
            // 卡片本身是可點的，但裡面還有一顆加入購物車按鈕，所以外層
            // 不能用 <button>（button 不能包 button），改成 role="button"
            <div
              key={p.id}
              data-product-card
              role="button"
              tabIndex={0}
              onClick={() => onOpen(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onOpen(i);
              }}
              className="w-[168px] shrink-0 cursor-pointer text-left"
            >
              <div
                data-product-image
                className="relative aspect-square overflow-hidden rounded-2xl"
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div
                    className="size-full"
                    style={{ backgroundColor: p.color }}
                  />
                )}
                {fullyCovered && (
                  <span className="absolute left-0 top-0 rounded-br-2xl rounded-tl-2xl bg-brand px-2 py-1 text-[12px] font-bold leading-4 tracking-[0.12px] text-white">
                    $0
                  </span>
                )}
                {/* 已加入的樣式跟商品細節頁的「已加入」按鈕同一組綠：
                    邊框 #1f8a5b、底色是同一個綠的 8% 疊在白底上 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(p, e.currentTarget);
                  }}
                  aria-label={added ? "從購物車移除" : "加入購物車"}
                  aria-pressed={added}
                  className={`absolute bottom-2 right-2 flex items-center rounded-full border px-2 py-1.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06)] ${
                    added
                      ? "border-[#1f8a5b] bg-[#edf6f2]"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  {added ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1f8a5b"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <img
                      src="/figma/v13-add-to-cart.svg"
                      alt=""
                      className="size-5"
                    />
                  )}
                </button>
              </div>
              <div className="flex flex-col gap-2 p-2">
                <p className="line-clamp-2 h-9 text-[14px] font-medium leading-[18px] tracking-[0.42px] text-gray-800">
                  {p.name}
                </p>
                <div>
                  <p className="text-[12px] leading-4 tracking-[0.12px] text-[#4a5565]">
                    折抵後價格{" "}
                    <span className="line-through">
                      ${p.price.toLocaleString()}
                    </span>
                  </p>
                  <p
                    className={`text-[16px] font-semibold leading-5 ${
                      fullyCovered ? "text-brand" : "text-gray-800"
                    }`}
                  >
                    $
                    {shortfall.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
