"use client";

import { type Product } from "../_lib/mock-data";

type WineSheetProps = {
  product: Product;
  onClose: () => void;
  onAskBanbun: () => void;
  onCheckout: () => void;
};

const TAG_EMOJI: Record<string, string> = {
  穀物麥香: "🌾",
  焙烤熟成: "🔥",
  辛香尾韻: "🌶️",
  木質辛香: "🌳",
  新鮮水果: "🍇",
  黑色漿果: "🫐",
  胡椒香料: "🧂",
  核心果香: "🍒",
  海洋氣息: "🌊",
  滷味: "🥘",
  小菜: "🥗",
  熱炒: "🍳",
  黑巧克力: "🍫",
  雪茄: "🚬",
  起司: "🧀",
  紅肉燒烤: "🥩",
  燉牛肉: "🍲",
  硬質起司: "🧀",
  烤肉: "🍖",
  堅果: "🥜",
};

const CHARACTERISTIC_LABELS = [
  { key: "sweetness", label: "Sweetness" },
  { key: "acidity", label: "Acidity" },
  { key: "tannin", label: "Tannin" },
  { key: "alcohol", label: "Alcohol" },
  { key: "body", label: "Body" },
] as const;

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
        className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white"
        style={{ animation: "sheetUp 0.3s cubic-bezier(.2,.9,.25,1)" }}
      >
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <div
            className={`relative flex h-[220px] w-full items-center justify-center bg-gradient-to-br text-[90px] ${product.gradient}`}
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
            {product.tag && (
              <span className="absolute left-3.5 top-3.5 rounded-[10px] bg-black/60 px-2 py-1 text-[11px] font-semibold text-gray-000">
                {product.tag}
              </span>
            )}
            {product.emoji}
          </div>

          <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
            <div className="flex flex-col gap-2">
              <p className="text-[18px] font-medium leading-[24px] text-gray-800">
                {product.name}
              </p>
              <p className="text-[14px] text-gray-500">{product.subtitle}</p>
              <div className="flex items-center gap-1">
                <p className="text-[16px] font-medium text-gray-800">
                  ${product.price.toLocaleString()}
                </p>
                {product.lastUpdated && (
                  <p className="text-[12px] text-gray-400">
                    （最後更新：{product.lastUpdated}）
                  </p>
                )}
              </div>
              {product.rating && (
                <div className="flex w-fit items-center gap-1 rounded-lg border border-brand bg-gray-000 p-2">
                  <span className="text-[13px] font-medium text-brand">
                    AIFIAN Rating
                  </span>
                  <span className="text-[13px] text-brand">
                    {"★".repeat(product.rating)}
                    {"☆".repeat(5 - product.rating)}
                  </span>
                </div>
              )}
            </div>

            {(product.region || product.grape || product.winery || product.vintage) && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-gray-200 bg-gray-000 p-4">
                {product.region && (
                  <div>
                    <p className="text-[12px] text-gray-500">產區</p>
                    <p className="mt-1 text-[14px] text-gray-800">{product.region}</p>
                  </div>
                )}
                {product.winery && (
                  <div>
                    <p className="text-[12px] text-gray-500">酒莊</p>
                    <p className="mt-1 text-[14px] text-gray-800">{product.winery}</p>
                  </div>
                )}
                {product.grape && (
                  <div>
                    <p className="text-[12px] text-gray-500">品種</p>
                    <p className="mt-1 text-[14px] text-gray-800">{product.grape}</p>
                  </div>
                )}
                {product.vintage && (
                  <div>
                    <p className="text-[12px] text-gray-500">年份</p>
                    <p className="mt-1 text-[14px] text-gray-800">{product.vintage}</p>
                  </div>
                )}
              </div>
            )}

            {product.characteristics && (
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <p className="text-[16px] font-semibold text-gray-800">酒品特徵</p>
                <div className="flex h-[90px] items-stretch gap-3">
                  {CHARACTERISTIC_LABELS.map(({ key }) => (
                    <div key={key} className="flex h-full flex-1 flex-col justify-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-brand to-red-200"
                        style={{
                          height: `${product.characteristics![key as keyof typeof product.characteristics]}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  {CHARACTERISTIC_LABELS.map(({ key, label }) => (
                    <p
                      key={key}
                      className="flex-1 text-center text-[11px] text-gray-600"
                    >
                      {label}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {product.flavors && product.flavors.length > 0 && (
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-000 p-4">
                <p className="text-[16px] font-semibold text-gray-800">主要風味</p>
                <div className="flex gap-4">
                  {product.flavors.map((f) => (
                    <div key={f} className="flex flex-col items-center gap-1.5">
                      <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-[22px]">
                        {TAG_EMOJI[f] ?? "🍷"}
                      </span>
                      <p className="w-[52px] text-center text-[11px] leading-tight text-gray-600">
                        {f}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.pairings && product.pairings.length > 0 && (
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-000 p-4">
                <p className="text-[16px] font-semibold text-gray-800">餐酒搭配</p>
                <div className="flex gap-4">
                  {product.pairings.map((f) => (
                    <div key={f} className="flex flex-col items-center gap-1.5">
                      <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-[22px]">
                        {TAG_EMOJI[f] ?? "🍽️"}
                      </span>
                      <p className="w-[52px] text-center text-[11px] leading-tight text-gray-600">
                        {f}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.description && (
              <div className="flex flex-col gap-1.5 rounded-2xl border border-gray-200 bg-gray-000 p-4">
                <p className="text-[16px] font-semibold text-gray-800">酒品介紹</p>
                <p className="text-[14px] leading-[18px] text-gray-700">
                  {product.description}
                </p>
              </div>
            )}

            {product.badges && product.badges.length > 0 && (
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <p className="text-[16px] font-semibold text-gray-800">代表類型</p>
                <div className="flex flex-wrap gap-2">
                  {product.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-lg bg-gray-000 px-4 py-2 text-[14px] text-gray-800"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2.5 border-t border-gray-100 bg-white px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
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
  );
}
