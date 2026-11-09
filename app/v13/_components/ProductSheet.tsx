"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CartItem, RecCard } from "../_lib/chat-storage";
import { EASING, PAGE_TRANSITION_MS } from "../_lib/page-transition";
import { PRODUCT_DETAILS } from "../_lib/product-details";
import { money0, rewardPrice } from "../_lib/reward-price";

// 商品細節頁：有兩種開啟方式，由 present 決定。
// 「push」是兌換分頁用的，從右邊推進來的整頁，跟其他 push 頁面共用同一套滑動轉場；
// 「sheet」是對話裡點商品卡用的，從下往上升起的 bottom sheet：頂端收圓角、不會升到頂，
// 上面留一條縫看得到底下的對話，沒有關閉鍵，往下滑或點上面那條縫就收起來。
// 對話是一條連續的內容，從右邊推整頁會像離開對話去了別的地方，由下往上升起才像
// 在同一個對話上面疊一層，關掉之後還在原來的位置。
// 用 portal 掛到 v13 手機外框（#v13-frame）底下，不掛在首頁裡面——
// 首頁被 TabTransition 的 transform 包著，自己的 z-index 再高也蓋不過 tabbar
const SWIPE_DIST = 44;
// sheet 不升到頂，上面留這麼高的一條縫：看得到底下的對話還在，才像疊上去的一層；
// 這條縫也是關閉的去處（點一下收起來），所以不另外放關閉鍵
const SHEET_TOP_GAP = 72;
// 頁面上的注意事項小字（圖片活動、AI 整理來源）共用同一組字級與灰，
// 位置各自貼著它說明的東西，但看起來要是同一類的字
const NOTE_CLASS = "text-[13px] leading-[1.6] text-[#a1a5ac]";

// 注意事項小字：前面帶一個點，一眼看得出是條列的提醒。
// 點跟文字分成兩欄，第二行會對齊第一行的文字，不會繞到點的下面
function Note({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={`flex gap-1.5 ${NOTE_CLASS} ${className}`}>
      <span aria-hidden>•</span>
      <span>{children}</span>
    </p>
  );
}

type Phase = "show" | "out" | "in";

export default function ProductSheet({
  cards,
  startIndex,
  addedIds,
  cart,
  present = "push",
  onToggleCart,
  onBuy,
  onAsk,
  onClose,
}: {
  cards: RecCard[];
  startIndex: number;
  addedIds: string[];
  cart: CartItem[];
  // 從哪裡開：兌換分頁用 push（右進右出），對話裡用 sheet（下進下出）
  present?: "push" | "sheet";
  onToggleCart: (card: RecCard) => void;
  onBuy: (card: RecCard) => void;
  // 「繼續聊」：關掉細節頁，帶著商品名稱回到對話
  onAsk: (card: RecCard) => void;
  onClose: () => void;
}) {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [entered, setEntered] = useState(false);
  const [index, setIndex] = useState(startIndex);
  const [phase, setPhase] = useState<Phase>("show");
  const [dir, setDir] = useState(1);
  const [closing, setClosing] = useState(false);
  const animating = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFrame(document.getElementById("v13-frame"));
  }, []);

  // 兩層 rAF 才切到「就位」，確保瀏覽器真的畫過畫面外那一幀，
  // 不然 transition 會被合併掉、頁面直接跳到定位（理由見 page-transition.ts）
  useEffect(() => {
    if (!frame) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [frame]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, PAGE_TRANSITION_MS);
  };

  // 左右滑換商品：舊內容往滑動方向淡出 160ms，新內容從另一側滑進來 260ms
  const nav = (d: number) => {
    if (cards.length < 2 || animating.current) return;
    animating.current = true;
    setDir(d);
    setPhase("out");
    window.setTimeout(() => {
      setIndex((i) => (i + d + cards.length) % cards.length);
      scrollRef.current?.scrollTo({ top: 0 });
      setPhase("in");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setPhase("show");
          window.setTimeout(() => (animating.current = false), 280);
        }),
      );
    }, 170);
  };

  if (!frame) return null;

  const card = cards[index];
  const priced = rewardPrice(card.price, cart, card.id);
  const isSheet = present === "sheet";
  const detail = PRODUCT_DETAILS[card.id];
  const added = addedIds.includes(card.id);

  const contentStyle: React.CSSProperties =
    phase === "out"
      ? {
          transform: `translateX(${dir > 0 ? -SWIPE_DIST : SWIPE_DIST}px)`,
          opacity: 0,
          transition:
            "transform 160ms cubic-bezier(.2,0,.2,1), opacity 160ms cubic-bezier(.2,0,.2,1)",
        }
      : phase === "in"
        ? {
            transform: `translateX(${dir > 0 ? SWIPE_DIST : -SWIPE_DIST}px)`,
            opacity: 0,
            transition: "none",
          }
        : {
            transform: "translateX(0)",
            opacity: 1,
            transition: `transform 260ms ${EASING}, opacity 260ms ${EASING}`,
          };

  return createPortal(
    <>
      {/* sheet 的底幕：壓暗底下的對話，點一下（包含上面那條縫）就收起來 */}
      {isSheet && (
        <div
          onClick={close}
          aria-hidden
          className="absolute inset-0 z-40 bg-black/25"
          style={{
            opacity: entered && !closing ? 1 : 0,
            transition: `opacity ${PAGE_TRANSITION_MS}ms ${EASING}`,
          }}
        />
      )}
      <div
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          touch.current = null;
          // sheet 往下滑關掉：只認從最上面開始的下滑，不然會跟內容捲動打架
          if (isSheet && dy > 70 && Math.abs(dy) > Math.abs(dx)) {
            if ((scrollRef.current?.scrollTop ?? 0) <= 0) close();
            return;
          }
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy))
            nav(dx < 0 ? 1 : -1);
        }}
        className={`absolute z-50 flex flex-col overflow-hidden bg-white ${
          isSheet
            ? "inset-x-0 bottom-0 rounded-t-[20px] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
            : "inset-0"
        }`}
        style={{
          top: isSheet ? SHEET_TOP_GAP : undefined,
          transform:
            entered && !closing
              ? "translate(0, 0)"
              : isSheet
                ? "translateY(100%)"
                : "translateX(100%)",
          transition: entered
            ? `transform ${PAGE_TRANSITION_MS}ms ${EASING}`
            : "none",
        }}
      >
        {/* push 的返回鍵：疊在商品圖上，白底加陰影才看得到。
          sheet 沒有關閉鍵，改放一條把手，告訴人這層可以往下收 */}
        {isSheet ? (
          <div
            aria-hidden
            className="absolute left-1/2 top-2.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70 shadow-[0_0_3px_rgba(0,0,0,0.25)]"
          />
        ) : (
          <button
            onClick={close}
            aria-label="返回"
            className="absolute left-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
          >
            <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="flex flex-col" style={contentStyle}>
            <div
              role="img"
              aria-label={card.name}
              className="aspect-square w-full shrink-0 bg-[#eef0f2] bg-cover bg-center"
              style={
                card.image
                  ? { backgroundImage: `url('${card.image}')` }
                  : undefined
              }
            />

            <div className="px-5 pb-6 pt-[18px]">
              <p className="text-[21px] font-medium leading-[1.4] text-gray-800">
                {detail?.fullName ?? card.name}
              </p>
              {/* 價格：跟兌換列表、對話商品卡同一套說法，原價加刪除線、下面是折抵後要付的，
                  點進來不會又變回原價。試算扣掉購物車裡其他商品已經佔掉的回饋 */}
              <div className="mt-2.5 flex flex-col gap-1">
                <p className="text-[13px] leading-4 text-[#4a5565]">
                  折抵後價格{" "}
                  <span className="line-through">
                    NT$ {card.price.toLocaleString()}
                  </span>
                </p>
                <p
                  className={`text-[24px] font-bold ${
                    priced.fullyCovered ? "text-brand" : "text-gray-800"
                  }`}
                >
                  NT$ {money0(priced.shortfall)}
                </p>
              </div>

              {detail && (
                <>
                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[15px] font-bold text-gray-800">
                        概覽
                      </p>
                      <p className="text-[12px] text-[#a1a5ac]">AI 整理</p>
                    </div>
                    <p className="whitespace-pre-line text-[14.5px] leading-[1.85] text-gray-800">
                      {detail.overview}
                    </p>
                  </div>

                  <div className="mt-7 border-t border-[#eef0f1] pt-6">
                    <p className="mb-3.5 text-[15px] font-bold text-gray-800">
                      規格
                    </p>
                    {detail.specs.map((row, i) => (
                      <div
                        key={row.label}
                        className="flex rounded-[8px] px-1 py-2.5"
                        style={{
                          background: i % 2 ? "#f8f9fa" : "transparent",
                        }}
                      >
                        <p className="w-[34%] shrink-0 text-[13.5px] text-[#a1a5ac]">
                          {row.label}
                        </p>
                        <p className="flex-1 text-[13.5px] font-semibold text-gray-800">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 rounded-[16px] border border-[#e8eaed] p-[18px]">
                    {detail.highlightSummary && (
                      <>
                        <p className="mb-3.5 text-[13.5px] text-[#a1a5ac]">
                          {detail.highlightSummary}
                        </p>
                        <div className="mb-4 h-px bg-[#eef0f1]" />
                      </>
                    )}
                    <div className="flex">
                      {detail.highlights.map((h, i) => (
                        <div
                          key={h.title}
                          className="min-w-0 flex-1 px-1.5"
                          style={{
                            borderLeft: i === 0 ? "none" : "1px solid #eef0f1",
                          }}
                        >
                          <p className="text-[13.5px] font-bold leading-[1.4] text-gray-800">
                            {h.title}
                          </p>
                          <p className="mt-1.5 text-[12px] text-[#a1a5ac]">
                            {h.sub}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 白底灰線，跟上面那張重點卡同一種框，兩張才像同一套；
                      內容來源的說明不放在卡裡，跟其他注意事項一起收到頁面最後 */}
                  <div className="mt-7 rounded-[16px] border border-[#e8eaed] p-[18px]">
                    <p className="mb-3 text-[15px] font-bold text-gray-800">
                      大家怎麼說
                    </p>
                    {detail.reviewText ? (
                      <>
                        <p className="text-[14px] leading-[1.85] text-gray-800">
                          {detail.reviewText}
                        </p>
                        <div className="mt-3.5 flex flex-wrap gap-2">
                          {detail.reviewTags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-[#f1f3f5] px-3.5 py-1.5 text-[12.5px] text-gray-800"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-[14px] leading-[1.7] text-[#a1a5ac]">
                        這個還沒人討論過，要不要第一個試試看
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* 商品圖多半直接取自來源網站，圖上常印著那邊的活動訊息，在這裡買並不適用。
                放在內容最後，不壓在圖上、也不擋在商品資訊前面。
                頁面上的注意事項（這句跟「大家怎麼說」裡的 AI 說明）共用 Note，
                同一個字級跟灰，各自貼著它說明的東西，看起來才像同一類小字。
                沒有圖的商品不顯示 */}
              {detail?.reviewText && (
                <Note className="mt-6">
                  大家怎麼說由 AI 整理自社群公開討論，非逐字引用
                </Note>
              )}
              {card.image && (
                <Note className={detail?.reviewText ? "mt-1.5" : "mt-6"}>
                  圖片上的活動優惠不適用於 AIFIAN 購買
                </Note>
              )}
            </div>
          </div>
        </div>

        {/* 底部固定的操作列（照參考圖）：左邊文字按鈕「繼續聊」帶著這個商品回對話，
            右邊兩顆膠囊按鈕是加入購物車跟立即結帳 */}
        <div className="flex shrink-0 items-center gap-2.5 border-t border-[#eef0f1] bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
          <button
            onClick={() => onAsk(card)}
            className="flex shrink-0 items-center gap-1 px-1.5 text-[15px] text-[#4a5565]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 4.5c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z" />
              <path d="M18 3v4M16 5h4" />
              <path d="M18.5 16.5v3M17 18h3" />
            </svg>
            繼續聊
          </button>
          {added ? (
            <button
              onClick={() => onToggleCart(card)}
              className="flex h-11 flex-1 items-center justify-center gap-1 rounded-full border-[1.5px] border-[#1f8a5b] bg-[rgba(31,138,91,0.08)] text-[15px] font-semibold text-[#1f8a5b]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              已加入
            </button>
          ) : (
            <button
              onClick={() => onToggleCart(card)}
              className="flex h-11 flex-1 items-center justify-center rounded-full border-[1.5px] border-gray-800 text-[15px] font-semibold text-gray-800"
            >
              加入購物車
            </button>
          )}
          <button
            onClick={() => onBuy(card)}
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-[#ef4d4d] text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(239,77,77,0.35)]"
          >
            立即結帳
          </button>
        </div>
      </div>
    </>,
    frame,
  );
}
