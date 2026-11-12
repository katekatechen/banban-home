// 酒品盲盒：規格在 Notion「酒品盲盒功能規格 v1」。
//
// 第一版只做兩款盒子（入門盒、進階盒）。每一款有固定的酒款清單，分三個層級，
// 每個層級的機率是固定的，不會因為開出而改變；也沒有數量限制，會持續補貨，
// 所以不會 SOLD OUT。開盒時先照層級機率決定層級，再從那一層的酒款平均挑一款。
// 畫面上每個層級標出價值區間（那一層最便宜到最貴的市值）和機率。
//
// 買了不會馬上開：付款後收到一個「禮物」，到「我的禮物」拆開才知道是哪一瓶，
// 開出來的酒存進「我的酒窖」。
//
// 狀態放在模組層級（跟購物車同一招）：兌換頁、我的禮物、我的酒窖是不同頁，
// 只要不重新整理，買了幾盒、開出什麼都會留著。

import { useSyncExternalStore } from "react";
import { GIFT_SUMMARY } from "./mock-data";
import type { ProductDetail } from "./product-details";

export type Tier = "top" | "rare" | "select";
export type WineKind = "red" | "white" | "whisky" | "cognac";

export const TIER_LABEL: Record<Tier, string> = {
  top: "頂級",
  rare: "珍藏",
  select: "精選",
};

// 機率卡上的層級色塊：金、棕、藍。不用遊戲寶物常見的黃紫藍，避免抽卡聯想；
// 精選用比原本亮藍柔一點的藍，在深色底上看得清楚
export const TIER_COLOR: Record<Tier, { bg: string; text: string }> = {
  top: { bg: "#E2B84B", text: "#3A2A00" },
  rare: { bg: "#A86B43", text: "#FFFFFF" },
  select: { bg: "#5B8DEF", text: "#FFFFFF" },
};

// 細節頁酒款卡的示意酒瓶照：還沒有每支酒的商品照，先依酒類放一張
// （白酒也先用紅酒瓶，跟我的酒窖一樣是示意）
export const KIND_PHOTO: Record<WineKind, string> = {
  red: "/figma/product-redwine.png",
  white: "/figma/product-redwine.png",
  whisky: "/figma/product-whisky4.png",
  cognac: "/figma/product-whisky4.png",
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
  // 市值：以台灣售價為準（Product Table 台灣版的起始價格）
  value: number;
};

export type BlindBox = {
  id: "starter" | "advanced";
  name: string;
  price: number;
  // 保底市值：開出來的每一瓶都不低於這個數字
  floor: number;
  // 各層級的固定機率（%），加起來 100
  odds: Record<Tier, number>;
  // 細節頁概覽的開頭：參考 Arena Club Time Box，先講盒裡是什麼樣的酒、
  // 再講適合誰，不講機制
  intro: string;
  // 細節頁版型，兩款盒子各用一種方便比較：
  // classic：機率寫在最下面的三欄重點卡（原本的版型）
  // odds：價格下面放 IcyBox 式機率卡（深色保底區塊＋可展開的各層級機率）
  layout: "classic" | "odds";
  pool: PoolWine[];
};

// 選酒照規格的「獎池選酒」：市值不低於保底、選品評分 15 分以上。
// 機率沿用原本試算的比例：頂級 1% 以下、珍藏一成多、其餘是精選
const wine = (
  id: string,
  name: string,
  tier: Tier,
  kind: WineKind,
  value: number,
): PoolWine => ({ id, name, tier, kind, value });

export const BLIND_BOXES: BlindBox[] = [
  {
    id: "starter",
    name: "經典",
    price: 1200,
    floor: 1200,
    odds: { top: 0.5, rare: 12, select: 87.5 },
    layout: "classic",
    intro:
      "從百富、人頭馬到勃根地新生代酒莊，威士忌、干邑、紅酒都可能是你開到的那一瓶。給想認識好酒、也想來點驚喜的你。",
    pool: [
      wine("rouget-2021", "2021 艾曼紐埃爾・侯熱 勃根地紅酒", "top", "red", 5000),
      wine("port-charlotte", "布萊迪波夏波爾多桶", "rare", "whisky", 3200),
      wine("drouhin-greves", "2018 約瑟夫・德魯漢 博恩一級園「格雷夫」紅酒", "rare", "red", 3500),
      wine("chevillon-2010", "2010 羅伯・薛維昂 夜聖喬治老藤紅酒", "rare", "red", 3500),
      wine("lignier-regnard", "2020 修伯特.利尼耶酒莊 哲維瑞香貝丹「赫納爾」紅酒", "rare", "red", 2800),
      wine("rouget-ptg", "2022 艾曼紐・侯熱 勃根地巴索圖紅酒", "rare", "red", 2500),
      wine("morey-2017", "2017 卡羅琳・莫雷 夏薩涅-蒙哈榭 紅酒", "rare", "red", 2100),
      wine("morey-2021", "2021 卡羅琳・莫雷 夏薩涅-蒙哈榭 紅酒", "rare", "red", 2000),
      wine("balvenie-14", "百富加勒比桶14年", "rare", "whisky", 1800),
      wine("balvenie-sweet", "百富糖心12年", "select", "whisky", 1550),
      wine("balvenie-dw", "百富雙桶12年", "select", "whisky", 1400),
      wine("remy-1738", "人頭馬 1738 特優香檳干邑", "select", "cognac", 1350),
      wine("classic-laddie", "布萊迪經典萊迪", "select", "whisky", 1280),
      wine("remy-vsop", "人頭馬 VSOP 干邑", "select", "cognac", 1250),
    ],
  },
  {
    id: "advanced",
    name: "名莊",
    // 保底跟售價一樣：盒內最便宜的是 4,800 的拉・里奧特，售價就定在這裡
    price: 4800,
    floor: 4800,
    odds: { top: 1, rare: 14, select: 85 },
    layout: "odds",
    intro:
      "以勃根地特級園與一級園為主，拉菲昂伯爵、費維利、蓬索、茂-卡慕澤這些藏家熟悉的名莊都在盒裡。給已經有收藏習慣、想開一瓶有份量好酒的你。",
    pool: [
      wine("lafon-charmes", "2012 拉菲昂伯爵酒莊 默索一級園「夏姆」白酒", "top", "white", 17500),
      wine("lignier-michelot", "2018 里尼耶-米歇洛 克洛德拉羅什 特級園紅酒", "rare", "red", 8800),
      wine("meo-cras", "2013 茂-卡慕澤 香波-慕思尼 一級園「勒・克拉」紅酒", "rare", "red", 8000),
      wine("lignier-csd", "2019 喬治·利尼葉酒莊聖丹尼特級園紅酒", "rare", "red", 8000),
      wine("drouhin-laroze", "2017 卓林-拉洛茲 香貝丹-貝茲 特級園紅酒", "rare", "red", 7500),
      wine("ponsot-corton", "2009 蓬索酒莊 科爾登「大黃蜂」特級園 紅酒", "rare", "red", 7500),
      wine("faiveley-cdv", "2019 費維利酒莊 武若園 特級園紅酒", "rare", "red", 7000),
      wine("lamarche-ech", "2006 佛朗索瓦・拉馬許 艾雪索特級園紅酒", "rare", "red", 6800),
      wine("balvenie-21", "百富波特桶21年", "select", "whisky", 5500),
      wine("lafon-volnay", "2014 拉菲昂伯爵酒莊 沃爾內一級園「中段桑特諾」紅酒", "select", "red", 4900),
      wine("lignier-riotte", "2019 修伯特・利尼耶 莫雷-聖丹尼「拉・里奧特」一級園紅酒", "select", "red", 4800),
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
  name: `${b.name}藏酒盒`,
  subtitle: `保證市值 NT$${b.floor.toLocaleString()} 以上`,
  price: b.price,
  image: `/v14/blindbox/${b.id}.jpg`,
}));

// 細節頁大圖改用 Lottie 動畫的盒子（用商品 id 對應）。兌換頁列表、購物車、結帳等
// 其他地方還是用靜態圖。名莊藏酒盒是木盒加光環的循環動畫
export const PRODUCT_LOTTIE: Record<string, string> = {
  "blindbox-advanced": "/v14/blindbox/advanced-ring.json",
};

export const boxIdOfProduct = (productId: string): BlindBox["id"] | null => {
  if (!productId.startsWith(PRODUCT_PREFIX)) return null;
  const id = productId.slice(PRODUCT_PREFIX.length);
  return BLIND_BOXES.some((b) => b.id === id) ? (id as BlindBox["id"]) : null;
};

export const isBlindBoxProduct = (productId: string) =>
  boxIdOfProduct(productId) !== null;

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

// ---- 商品細節頁的內容 ----
// 細節頁沿用一般商品的版型（概覽、規格、重點卡、大家怎麼說），
// 盒內酒款、價值區間跟機率寫進概覽的文字裡，就像後台的商品說明欄位
const money = (n: number) => `NT$${n.toLocaleString()}`;
const pct = (n: number) => `${n}%`;

// 價值區間：這一層最便宜到最貴；只有一款時就只寫一個數字
const tierRange = (box: BlindBox, tier: Tier) => {
  const values = box.pool.filter((w) => w.tier === tier).map((w) => w.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return lo === hi ? money(lo) : `${money(lo)}～${hi.toLocaleString()}`;
};

const boxRange = (box: BlindBox) => {
  const values = box.pool.map((w) => w.value);
  return `${money(Math.min(...values))}～${money(Math.max(...values))}`;
};

export function blindBoxDetail(productId: string): ProductDetail | undefined {
  const id = boxIdOfProduct(productId);
  if (!id) return undefined;
  const box = getBox(id);
  const top = box.pool.find((w) => w.tier === "top")!;
  const tiers: Tier[] = ["top", "rare", "select"];
  const poolText = tiers
    .map((t) => {
      const lines = box.pool
        .filter((w) => w.tier === t)
        .map((w) => `・${w.name}｜市值 ${money(w.value)}`);
      // 機率只公開到層級，不列每一款酒的機率
      return `【${TIER_LABEL[t]}】${tierRange(box, t)}｜機率 ${pct(box.odds[t])}\n${lines.join("\n")}`;
    })
    .join("\n\n");
  return {
    // 細節頁標題跟兌換頁列表用同一個名稱
    fullName: `${box.name}藏酒盒`,
    overviewSource: "by AIFIAN",
    // 概覽第一句就講最高可以開到什麼，用粗體強調
    overviewLead: `有機會開出市值 ${money(top.value)} 的${top.name}`,
    overview:
      box.layout === "odds"
        ? box.intro
        : `${box.intro}\n\n` +
          `每一盒保證開出市值 ${money(box.floor)} 以上的酒。付款後會收到 1 個禮物，到「我的禮物」拆開，開出的酒存進「我的酒窖」，之後可以領回或轉售。\n\n` +
          `盒內酒款、價值區間與機率\n\n${poolText}\n\n` +
          `各層級機率固定，不會因為開出而改變，酒款會持續補貨。市值以台灣售價為準。付款即完成交易，不提供退款。未滿 18 歲請勿購買。\n\n禁止酒駕　飲酒過量，有害健康`,
    specs: [
      { label: "內容", value: "1 瓶／盒" },
      { label: "保底市值", value: money(box.floor) },
      { label: "價值區間", value: boxRange(box) },
      { label: "盒內酒款", value: `${box.pool.length} 款` },
    ],
    ...(box.layout === "classic"
      ? {
          // 重點卡一欄很窄，價值區間拿掉 NT$ 才放得進一行，幣別看上面那句摘要
          highlights: tiers.map((t) => ({
            title: `${TIER_LABEL[t]} ${pct(box.odds[t])}`,
            sub: tierRange(box, t).replace("NT$", ""),
          })),
          highlightSummary: `最高 ${money(top.value)}・保底 ${money(box.floor)}`,
        }
      : {
        highlights: [],
        odds: {
          floor: money(box.floor),
          max: money(top.value),
          tiers: tiers.map((t) => ({
            label: TIER_LABEL[t],
            range: tierRange(box, t),
            pct: box.odds[t],
            color: TIER_COLOR[t].bg,
            text: TIER_COLOR[t].text,
            wines: box.pool
              .filter((w) => w.tier === t)
              .map((w) => ({
                id: w.id,
                name: w.name,
                value: money(w.value),
                image: KIND_PHOTO[w.kind],
              })),
          })),
          note: "各層級機率固定，不會因為開出而改變。市值以台灣售價為準。",
          steps: ["結帳後，\n收到禮物", "在「我的禮物」\n拆開", "存進\n我的酒窖"],
          legal: [
            "付款即完成交易，不提供退款。未滿 18 歲請勿購買。",
            "禁止酒駕　飲酒過量，有害健康",
          ],
        },
      }),
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
  // 哪一款盒子開出來的：禮物紀錄用它挑禮包圖
  boxId: BlindBox["id"];
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

// 拆開最早買的那一盒：先照固定的層級機率決定層級，再從那一層平均挑一款，
// 記進「開出來的酒」。沒有沒拆的盒子就回 null
export function openPendingBox(): OpenedWine | null {
  const id = pending[0];
  if (!id) return null;
  pending = pending.slice(1);
  emit();
  const box = getBox(id);
  let r = Math.random() * 100;
  const tier =
    (["top", "rare", "select"] as Tier[]).find((t) => {
      r -= box.odds[t];
      return r < 0;
    }) ?? "select";
  const candidates = box.pool.filter((w) => w.tier === tier);
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  openedSeq += 1;
  const result: OpenedWine = {
    key: `bb-${openedSeq}`,
    wineId: picked.id,
    name: picked.name,
    tier: picked.tier,
    kind: picked.kind,
    value: picked.value,
    boxId: box.id,
    boxName: box.name,
    time: stamp(),
  };
  opened = [result, ...opened];
  return result;
}
