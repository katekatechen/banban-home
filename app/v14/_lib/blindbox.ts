// 酒品盲盒：規格在 Notion「酒品盲盒功能規格 v1」。
//
// 第一版只做兩款盒子（入門盒、進階盒）。每一款是一個固定的獎池：哪些酒、
// 各幾瓶，開賣前全部公開；每瓶的機率 = 這支酒剩幾瓶 ÷ 獎池還剩幾瓶，
// 每開一盒就重算。盒數就是獎池瓶數加總，畫面上不講期數，賣完就 SOLD OUT。
//
// 買了不會馬上開：付款後收到一個「禮物」，到「我的禮物」拆開才知道是哪一瓶，
// 開出來的酒存進「我的收藏」。
//
// 狀態放在模組層級（跟購物車同一招）：兌換頁、我的禮物、我的收藏是不同頁，
// 只要不重新整理，買了幾盒、開出什麼都會留著。

import { useSyncExternalStore } from "react";
import { GIFT_SUMMARY } from "./mock-data";
import type { ProductDetail } from "./product-details";

export type Tier = "top" | "rare" | "select";
export type WineKind = "red" | "white" | "whisky" | "cognac";

export const TIER_LABEL: Record<Tier, string> = {
  top: "頂標",
  rare: "珍藏",
  select: "精選",
};

export const KIND_ICON: Record<WineKind, string> = {
  red: "/figma/cat-redwine.svg",
  white: "/figma/cat-whitewine.svg",
  whisky: "/figma/cat-whisky.svg",
  cognac: "/figma/cat-whisky.svg",
};

export type PoolWine = {
  id: string;
  name: string;
  tier: Tier;
  kind: WineKind;
  // 市值：用商店售價（Product Table 的起始價格）
  value: number;
  // 這一款放幾瓶
  qty: number;
  // 還剩幾瓶（開一盒少一瓶）
  left: number;
};

export type BlindBox = {
  id: "starter" | "advanced";
  name: string;
  price: number;
  // 保底市值：開出來的每一瓶都不低於這個數字
  floor: number;
  // 總共幾盒 = 獎池瓶數加總
  total: number;
  // 細節頁概覽的開頭：參考 Arena Club Time Box，先講盒裡是什麼樣的酒、
  // 再講適合誰，不講機制
  intro: string;
  pool: PoolWine[];
};

// 選酒照規格的「獎池選酒」：市值不低於保底、選品評分 15 分以上。
// 瓶數是試算：頂標 1 瓶（不超過 1%）、珍藏約一成、其餘是精選。
// 剩幾瓶是假裝已經開賣一陣子，機率才看得出會變動
const wine = (
  id: string,
  name: string,
  tier: Tier,
  kind: WineKind,
  value: number,
  qty: number,
  left: number,
): PoolWine => ({ id, name, tier, kind, value, qty, left });

export const BLIND_BOXES: BlindBox[] = [
  {
    id: "starter",
    name: "入門盒",
    price: 1200,
    floor: 1200,
    total: 200,
    intro:
      "從百富、人頭馬到勃根地新生代酒莊，威士忌、干邑、紅酒都可能是你開到的那一瓶。給想認識好酒、也想來點驚喜的你。",
    pool: [
      wine("rouget-2021", "2021 艾曼紐埃爾・侯熱 勃根地紅酒", "top", "red", 5000, 1, 1),
      wine("port-charlotte", "布萊迪波夏波爾多桶", "rare", "whisky", 3200, 3, 3),
      wine("drouhin-greves", "2018 約瑟夫・德魯漢 博恩一級園「格雷夫」紅酒", "rare", "red", 3500, 3, 2),
      wine("chevillon-2010", "2010 羅伯・薛維昂 夜聖喬治老藤紅酒", "rare", "red", 3500, 3, 3),
      wine("lignier-regnard", "2020 修伯特.利尼耶酒莊 哲維瑞香貝丹「赫納爾」紅酒", "rare", "red", 2800, 3, 2),
      wine("rouget-ptg", "2022 艾曼紐・侯熱 勃根地巴索圖紅酒", "rare", "red", 2500, 3, 3),
      wine("morey-2017", "2017 卡羅琳・莫雷 夏薩涅-蒙哈榭 紅酒", "rare", "red", 2100, 3, 3),
      wine("morey-2021", "2021 卡羅琳・莫雷 夏薩涅-蒙哈榭 紅酒", "rare", "red", 2000, 3, 2),
      wine("balvenie-14", "百富加勒比桶14年", "rare", "whisky", 1800, 3, 3),
      wine("balvenie-sweet", "百富糖心12年", "select", "whisky", 1550, 35, 28),
      wine("balvenie-dw", "百富雙桶12年", "select", "whisky", 1400, 35, 27),
      wine("remy-1738", "人頭馬 1738 特優香檳干邑", "select", "cognac", 1350, 35, 29),
      wine("classic-laddie", "布萊迪經典萊迪", "select", "whisky", 1280, 35, 26),
      wine("remy-vsop", "人頭馬 VSOP 干邑", "select", "cognac", 1250, 35, 28),
    ],
  },
  {
    id: "advanced",
    name: "進階盒",
    // 保底跟售價一樣：盒內最便宜的是 4,800 的拉・里奧特，售價就定在這裡
    price: 4800,
    floor: 4800,
    total: 100,
    intro:
      "以勃根地特級園與一級園為主，拉菲昂伯爵、費維利、蓬索、茂-卡慕澤這些藏家熟悉的名莊都在盒裡。給已經有收藏習慣、想開一瓶有份量好酒的你。",
    pool: [
      wine("lafon-charmes", "2012 拉菲昂伯爵酒莊 默索一級園「夏姆」白酒", "top", "white", 17500, 1, 1),
      wine("lignier-michelot", "2018 里尼耶-米歇洛 克洛德拉羅什 特級園紅酒", "rare", "red", 8800, 2, 2),
      wine("meo-cras", "2013 茂-卡慕澤 香波-慕思尼 一級園「勒・克拉」紅酒", "rare", "red", 8000, 2, 2),
      wine("lignier-csd", "2019 喬治·利尼葉酒莊聖丹尼特級園紅酒", "rare", "red", 8000, 2, 1),
      wine("drouhin-laroze", "2017 卓林-拉洛茲 香貝丹-貝茲 特級園紅酒", "rare", "red", 7500, 2, 2),
      wine("ponsot-corton", "2009 蓬索酒莊 科爾登「大黃蜂」特級園 紅酒", "rare", "red", 7500, 2, 2),
      wine("faiveley-cdv", "2019 費維利酒莊 武若園 特級園紅酒", "rare", "red", 7000, 2, 2),
      wine("lamarche-ech", "2006 佛朗索瓦・拉馬許 艾雪索特級園紅酒", "rare", "red", 6800, 2, 2),
      wine("balvenie-21", "百富波特桶21年", "select", "whisky", 5500, 29, 24),
      wine("lafon-volnay", "2014 拉菲昂伯爵酒莊 沃爾內一級園「中段桑特諾」紅酒", "select", "red", 4900, 28, 23),
      wine("lignier-riotte", "2019 修伯特・利尼耶 莫雷-聖丹尼「拉・里奧特」一級園紅酒", "select", "red", 4800, 28, 25),
    ],
  },
];

export const getBox = (id: BlindBox["id"]) =>
  BLIND_BOXES.find((b) => b.id === id)!;

// ---- 用現有後台上架：盲盒就是一般商品 ----
// 兌換頁的商品卡、商品細節頁、購物車、結帳都跟其他商品走同一套，
// 後台填得出來的就是商品名稱、副標、價格、商品圖、細節頁的文字欄位。
// 商品 id 用 blindbox- 開頭，結帳付款後靠這個前綴認出是盲盒，改成收到禮物
const PRODUCT_PREFIX = "blindbox-";

export const BLIND_BOX_PRODUCTS = BLIND_BOXES.map((b) => ({
  id: `${PRODUCT_PREFIX}${b.id}`,
  name: `酒品盲盒・${b.name}`,
  subtitle: `保證市值 NT$${b.floor.toLocaleString()} 以上`,
  price: b.price,
  image: `/v14/blindbox/${b.id}.jpg`,
}));

export const boxIdOfProduct = (productId: string): BlindBox["id"] | null => {
  if (!productId.startsWith(PRODUCT_PREFIX)) return null;
  const id = productId.slice(PRODUCT_PREFIX.length);
  return BLIND_BOXES.some((b) => b.id === id) ? (id as BlindBox["id"]) : null;
};

export const isBlindBoxProduct = (productId: string) =>
  boxIdOfProduct(productId) !== null;

export const isSoldOutProduct = (productId: string) => {
  const id = boxIdOfProduct(productId);
  return id ? boxesAvailable(getBox(id)) <= 0 : false;
};

export const boxLeft = (box: BlindBox) =>
  box.pool.reduce((sum, w) => sum + w.left, 0);

// 最近開出：假的動態，讓詳情頁有「真的有人在開」的感覺
export const RECENT_OPENINGS: Record<
  BlindBox["id"],
  { who: string; wine: string; tier: Tier; ago: string }[]
> = {
  starter: [
    { who: "K***n", wine: "人頭馬 1738 特優香檳干邑", tier: "select", ago: "2 分鐘前" },
    { who: "a***9", wine: "2018 約瑟夫・德魯漢 博恩一級園「格雷夫」紅酒", tier: "rare", ago: "11 分鐘前" },
    { who: "M***y", wine: "百富雙桶12年", tier: "select", ago: "26 分鐘前" },
    { who: "c***o", wine: "布萊迪經典萊迪", tier: "select", ago: "1 小時前" },
  ],
  advanced: [
    { who: "J***e", wine: "2019 喬治·利尼葉酒莊聖丹尼特級園紅酒", tier: "rare", ago: "8 分鐘前" },
    { who: "w***2", wine: "百富波特桶21年", tier: "select", ago: "34 分鐘前" },
    { who: "S***a", wine: "2014 拉菲昂伯爵酒莊 沃爾內一級園「中段桑特諾」紅酒", tier: "select", ago: "2 小時前" },
  ],
};

// ---- 還沒拆的禮物 ----
// 帳號頁「我的禮物」右邊的數字、tabbar 帳號的紅點、我的禮物頁上的
// 「還有 N 個禮物沒拆」都讀同一個數字：原本就有的禮物（mock 裡的 1 個）
// ＋買了還沒拆的酒品盲盒。tabbar 一直掛著不會重新掛載，所以要能訂閱
let baseUnopened = GIFT_SUMMARY.unopened;
let pending: BlindBox["id"][] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const unopenedGiftCount = () => baseUnopened + pending.length;

export function useUnopenedGifts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    unopenedGiftCount,
    unopenedGiftCount,
  );
}

// 拆掉一個原本就有的禮物（不是盲盒的那種）
export const takeBaseGift = () => {
  baseUnopened = Math.max(0, baseUnopened - 1);
  emit();
};

export const addPendingBox = (id: BlindBox["id"]) => {
  pending = [...pending, id];
  emit();
};
export const pendingBoxCount = () => pending.length;

// 買了還沒拆的盒子已經佔掉一瓶酒，所以「本期還剩幾盒」要扣掉它們
export const boxesAvailable = (box: BlindBox) =>
  boxLeft(box) - pending.filter((id) => id === box.id).length;

// ---- 商品細節頁的內容 ----
// 細節頁沿用一般商品的版型（概覽、規格、重點卡、大家怎麼說），
// 盒內酒款跟機率寫進概覽的文字裡，就像後台的商品說明欄位。
// 每次打開都重算，機率跟剩幾盒才會跟著開出的瓶數變
const tierShare = (box: BlindBox, tier: Tier) => {
  const total = boxLeft(box);
  const n = box.pool.filter((w) => w.tier === tier).reduce((s, w) => s + w.left, 0);
  if (!total || !n) return "0%";
  const p = (n / total) * 100;
  return p < 0.1 ? "<0.1%" : `${p.toFixed(1)}%`;
};

export function blindBoxDetail(productId: string): ProductDetail | undefined {
  const id = boxIdOfProduct(productId);
  if (!id) return undefined;
  const box = getBox(id);
  const top = box.pool.find((w) => w.tier === "top")!;
  const money = (n: number) => `NT$${n.toLocaleString()}`;
  const tiers: Tier[] = ["top", "rare", "select"];
  const poolText = tiers
    .map((t) => {
      const lines = box.pool
        .filter((w) => w.tier === t)
        .map((w) => `・${w.name}｜市值 ${money(w.value)}`);
      // 機率只公開到層級，不列每一款酒的機率
      return `【${TIER_LABEL[t]}】機率 ${tierShare(box, t)}\n${lines.join("\n")}`;
    })
    .join("\n\n");
  return {
    // 細節頁標題跟兌換頁列表用同一個名稱
    fullName: `酒品盲盒・${box.name}`,
    overviewSource: "by AIFIAN",
    overview:
      `${box.intro}\n\n` +
      `每一盒保證開出市值 ${money(box.floor)} 以上的酒。付款後會收到 1 個禮物，到「我的禮物」拆開，開出的酒存進「我的收藏」，之後可以領回或轉售。\n\n` +
      `盒內酒款與機率\n\n${poolText}\n\n` +
      `全部開完就售完。市值以 AIFIAN 售價為準。付款即完成交易，不提供退款。未滿 18 歲請勿購買。\n\n禁止酒駕　飲酒過量，有害健康`,
    specs: [
      { label: "內容", value: "1 瓶／盒" },
      { label: "保底市值", value: money(box.floor) },
      { label: "盒內酒款", value: `${box.pool.length} 款` },
      {
        label: "剩餘",
        value:
          boxesAvailable(box) > 0
            ? `${boxesAvailable(box)} / ${box.total} 盒`
            : "SOLD OUT",
      },
    ],
    highlights: [
      { title: `頂標 ${money(top.value)}`, sub: `機率 ${tierShare(box, "top")}` },
      { title: `珍藏 ${tierShare(box, "rare")}`, sub: "機率" },
      { title: `精選 ${tierShare(box, "select")}`, sub: "機率" },
    ],
    highlightSummary: `保底 ${money(box.floor)}・${box.pool.length} 款酒`,
    reviewText: null,
    reviewTags: [],
  };
}

// ---- 開出來的酒 ----
export type OpenedWine = {
  key: string;
  wineId: string;
  name: string;
  tier: Tier;
  kind: WineKind;
  value: number;
  boxName: string;
  time: string;
};

let opened: OpenedWine[] = [];
let openedSeq = 0;
export const getOpenedWines = () => opened;

const stamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// 拆開最早買的那一盒：照剩餘瓶數加權隨機抽一瓶，扣掉庫存，記進「開出來的酒」。
// 沒有沒拆的盒子就回 null
export function openPendingBox(): OpenedWine | null {
  const id = pending[0];
  if (!id) return null;
  pending = pending.slice(1);
  emit();
  const box = getBox(id);
  const left = boxLeft(box);
  let r = Math.random() * left;
  const picked =
    box.pool.find((w) => {
      r -= w.left;
      return w.left > 0 && r < 0;
    }) ?? box.pool.find((w) => w.left > 0)!;
  picked.left -= 1;
  openedSeq += 1;
  const result: OpenedWine = {
    key: `bb-${openedSeq}`,
    wineId: picked.id,
    name: picked.name,
    tier: picked.tier,
    kind: picked.kind,
    value: picked.value,
    boxName: box.name,
    time: stamp(),
  };
  opened = [result, ...opened];
  return result;
}
