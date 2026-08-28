"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import HistoryDrawer from "../_components/HistoryDrawer";
import WineSheet from "../_components/WineSheet";
import { loadConversations, loadActiveId } from "../_lib/chat-storage";
import { PRODUCTS, type Product, type WineType } from "../_lib/mock-data";
import { ensureInCart } from "../_lib/cart";

const SORT_FILTERS = ["全部", "最新上架", "保值首選", "千元好物", "搭餐絕配"];

const WINE_CATEGORIES: { key: WineType | "全部"; label: string; icon: string }[] = [
  { key: "全部", label: "全部", icon: "/icons/cat-all.svg" },
  { key: "威士忌", label: "威士忌", icon: "/icons/cat-whisky.svg" },
  { key: "高粱", label: "高粱", icon: "/icons/cat-sorghum.svg" },
  { key: "白蘭地", label: "白蘭地", icon: "/icons/cat-brandy.svg" },
  { key: "紅酒", label: "紅酒", icon: "/icons/cat-redwine.svg" },
  { key: "白酒", label: "白酒", icon: "/icons/cat-whitewine.svg" },
];

const SERVICES = [
  {
    key: "wine",
    label: "買酒",
    desc: "送禮、投資、自己喝",
    emoji: "🍷",
    href: "/v2/banbun/chat?prompt=幫我找一支適合送禮的酒",
    disabled: false,
  },
  {
    key: "daily",
    label: "買日用品",
    desc: "生活雜貨，下單送到家",
    emoji: "🧴",
    href: "/v2/banbun/chat?prompt=我想買日用品",
    disabled: false,
  },
  {
    key: "bill",
    label: "代繳帳單",
    desc: "房租／房貸／信用卡，即將推出",
    emoji: "💳",
    href: "#",
    disabled: true,
  },
] as const;

const PROMPT_CHIPS = [
  "🥃 第一次喝威士忌，入門推薦",
  "🤔 普發一萬花在哪裡最划算？",
  "🎈 這個月有什麼回饋活動？",
  "💰 我想了解報稅的事情",
  "👍 乾拌麵推薦",
  "🌀 防災乾糧",
];

// 標題每次進首頁隨機換一句，都用同一個「你 OO，我 OO」節奏，
// 呼應伴伴從「幫你買東西」擴大成「個人助理」的定位
const HEADLINES = [
  "你想要什麼，\n我來搞定！",
  "什麼都能問，\n我來處理！",
  "你的大小事，\n我來包辦！",
  "買酒、繳費、算錢，都能找我！",
];

// mock：呼應「伴伴主動提醒待辦任務」story，之後接真的帳號狀態
const REMINDER = {
  text: "交易跟提領功能已暫停，請重新提交身分驗證",
  href: "/v2/account",
};

export default function BanbunHomePage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [homeInput, setHomeInput] = useState("");
  const [sortFilter, setSortFilter] = useState(SORT_FILTERS[0]);
  const [wineCategory, setWineCategory] = useState<WineType | "全部">("全部");
  const wineProducts =
    wineCategory === "全部"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.wineType === wineCategory);
  const [selectedWine, setSelectedWine] = useState<Product | null>(null);

  const handleAskBanbun = (product: Product) => {
    setSelectedWine(null);
    router.push(
      `/v2/banbun/chat?prompt=${encodeURIComponent(`幫我介紹一下${product.name}`)}`,
    );
  };

  const handleWineCheckout = (product: Product) => {
    ensureInCart({
      key: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      gradient: product.gradient,
      source: "精選酒品",
    });
    setSelectedWine(null);
    router.push("/v2/checkout");
  };
  // 標題固定從第一句開始 render（跟 SSR 結果一致，避免 hydration mismatch），
  // 掛載後才隨機換一句，符合「每次進首頁都會換」的需求
  const [headline, setHeadline] = useState(HEADLINES[0]);
  useEffect(() => {
    setHeadline(HEADLINES[Math.floor(Math.random() * HEADLINES.length)]);
  }, []);

  const submitHomeInput = () => {
    const text = homeInput.trim();
    if (!text) return;
    router.push(`/v2/banbun/chat?prompt=${encodeURIComponent(text)}`);
  };

  // 在首頁打開的是「快速預覽」：只有實際選了對話/開新對話/看訂單才會離開首頁，
  // 純粹打開看一眼、按 X 關掉的話會留在首頁，不會憑空多一個空對話。
  const conversations = drawerOpen ? loadConversations() : [];
  const activeId = drawerOpen ? (loadActiveId() ?? undefined) : undefined;

  return (
    <div className="relative flex flex-col overflow-hidden bg-white">
      {drawerOpen && (
        <HistoryDrawer
          conversations={conversations}
          activeId={activeId}
          onClose={() => setDrawerOpen(false)}
          onNewChat={() => router.push("/v2/banbun/chat?new=1")}
          onOpenConversation={(id) =>
            router.push(`/v2/banbun/chat?open=${id}`)
          }
          onOrders={() => router.push("/v2/orders")}
        />
      )}

      {/* 打開漢堡時，首頁整個往右滑出畫面，側欄改成滿版覆蓋 */}
      <div
        className="relative flex flex-col bg-white transition-transform duration-300 ease-out"
        style={{
          transform: drawerOpen ? "translateX(100%)" : "translateX(0)",
        }}
      >
        <StatusBar />

      {/* header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            title="對話紀錄"
            className="flex size-8 items-center justify-center text-gray-800"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            >
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <div className="relative flex size-8 items-center justify-center">
            <img src="/icons/nav-bell.svg" alt="通知" className="size-6" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
              9
            </span>
          </div>
        </div>
        <img src="/icons/logo-aifian.svg" alt="AIFIAN" className="h-4" />
        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
          <img src="/icons/nav-reward.svg" alt="" className="size-4" />
          <span className="text-[14px] font-medium text-gray-800">
            999,999
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
        <div className="flex flex-col gap-3">
          {/* 待辦提醒，跟紅色區塊分開顯示 */}
          <Link
            href={REMINDER.href}
            className="flex w-fit items-center gap-1.5 rounded-full bg-red-50 py-1.5 pl-1.5 pr-3"
          >
            <span className="flex size-[18px] items-center justify-center rounded-full bg-brand text-[11px] text-white">
              !
            </span>
            <span className="text-[12px] font-medium text-brand">
              {REMINDER.text}
            </span>
            <span className="text-[13px] font-bold text-brand">&rsaquo;</span>
          </Link>

          {/* hero — 扁平淺灰底 */}
          <div className="relative flex w-full flex-col overflow-hidden rounded-2xl bg-gray-100 px-5 pb-5 pt-5 text-gray-800">
            <Link href="/v2/banbun/chat" className="block">
              <p className="text-[14px] text-gray-500">嗨，我是伴伴</p>
              <p className="mt-1 whitespace-pre-line text-[28px] font-black leading-[1.2] text-gray-800">
                {headline}
              </p>
            </Link>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitHomeInput();
              }}
              className="relative z-10 mt-5 flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              <input
                value={homeInput}
                onChange={(e) => setHomeInput(e.target.value)}
                placeholder="你想要做什麼..."
                className="flex-1 bg-transparent px-2.5 text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-800 text-white"
              >
                ↑
              </button>
            </form>

            {/* 快速提問 chips，移到輸入框下方 */}
            <div className="no-scrollbar relative z-10 mt-3 flex gap-2 overflow-x-auto">
              {PROMPT_CHIPS.map((p) => (
                <Link
                  key={p}
                  href={`/v2/banbun/chat?prompt=${encodeURIComponent(p)}`}
                  className="shrink-0 rounded-full border border-gray-300 bg-white px-3.5 py-2 text-[13px] text-gray-700"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 三大服務發現 — 直的三欄，圖示在上、文字在下 */}
        <div className="flex flex-col gap-3">
          <p className="text-[16px] font-semibold text-gray-800">
            伴伴可以幫你
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {SERVICES.map((s) =>
              s.disabled ? (
                <div
                  key={s.key}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-gray-300 px-2 py-4 text-center opacity-60"
                >
                  <span className="text-[28px]">{s.emoji}</span>
                  <p className="text-[13px] font-semibold text-gray-700">
                    {s.label}
                  </p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">
                    敬請期待
                  </span>
                </div>
              ) : (
                <Link
                  key={s.key}
                  href={s.href}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-gray-000 px-2 py-4 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                >
                  <span className="text-[28px]">{s.emoji}</span>
                  <p className="text-[13px] font-semibold text-gray-800">
                    {s.label}
                  </p>
                  <p className="text-[11px] leading-tight text-gray-500">
                    {s.desc}
                  </p>
                </Link>
              ),
            )}
          </div>
        </div>

        {/* 伴伴精選 — 從獨立分頁移到首頁下方 */}
        <div className="flex flex-col gap-3">
          <p className="text-[16px] font-semibold text-gray-800">伴伴精選</p>

          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {SORT_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setSortFilter(f)}
                className={`shrink-0 rounded-lg px-3 py-2 text-[13px] font-semibold ${
                  sortFilter === f
                    ? "bg-gray-800 text-gray-000"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {WINE_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setWineCategory(c.key)}
                className="flex w-[52px] shrink-0 flex-col items-center gap-1"
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-full ${
                    wineCategory === c.key ? "bg-red-50" : ""
                  }`}
                >
                  <img src={c.icon} alt="" className="size-10" />
                </span>
                <span
                  className={`text-[12px] ${
                    wineCategory === c.key
                      ? "font-semibold text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {c.label}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {wineProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedWine(p)}
                className="flex flex-col overflow-hidden rounded-lg text-left"
              >
                <div
                  className={`relative flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br text-[56px] ${p.gradient}`}
                >
                  {p.tag && (
                    <span className="absolute right-2 top-2 rounded-[10px] bg-black/60 px-2 py-1 text-[11px] font-semibold text-gray-000">
                      {p.tag}
                    </span>
                  )}
                  {p.emoji}
                </div>
                <div className="flex flex-col gap-1 px-2 py-3">
                  <p className="text-[12px] tracking-wide text-gray-500">
                    {p.subtitle}
                  </p>
                  <p className="line-clamp-2 h-9 text-[14px] font-medium text-gray-800">
                    {p.name}
                  </p>
                  <p className="text-[14px] text-gray-800">${p.price}</p>
                </div>
              </button>
            ))}
            {wineProducts.length === 0 && (
              <p className="col-span-2 py-10 text-center text-[13px] text-gray-400">
                這個分類目前沒有商品
              </p>
            )}
          </div>
        </div>
      </div>
      </div>

      {selectedWine && (
        <WineSheet
          product={selectedWine}
          onClose={() => setSelectedWine(null)}
          onAskBanbun={() => handleAskBanbun(selectedWine)}
          onCheckout={() => handleWineCheckout(selectedWine)}
        />
      )}
    </div>
  );
}
