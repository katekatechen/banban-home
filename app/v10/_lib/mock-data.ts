export type WineType = "威士忌" | "高粱" | "白蘭地" | "紅酒" | "白酒";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  emoji: string;
  gradient: string;
  category: "線上藏酒" | "日用品";
  wineType: WineType;
  tag?: string;
  // 真的商品照，照 Figma 的「線上藏酒」單品陳列補上；沒有的維持 emoji 佔位
  image?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "kinmen-58",
    name: "金門高粱酒（白標）",
    subtitle: "750ml．58.0% alc/vol",
    price: 550,
    emoji: "🍶",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "線上藏酒",
    wineType: "高粱",
  },
  {
    id: "macallan-12",
    name: "麥卡倫 12 年雪莉桶",
    subtitle: "2025 威士忌",
    price: 999,
    emoji: "🥃",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "線上藏酒",
    wineType: "威士忌",
    tag: "NEW",
    image: "/figma/product-macallan.png",
  },
  {
    id: "louve-cortez",
    name: "樂露芙 克羅茲-艾米塔吉紅酒",
    subtitle: "2025 紅酒",
    price: 921,
    emoji: "🍷",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "線上藏酒",
    wineType: "紅酒",
    image: "/figma/product-redwine.png",
  },
  {
    id: "wailan-flagship",
    name: "威嵐旗艦款美國單一麥芽威士忌",
    subtitle: "2025 威士忌",
    price: 1100,
    emoji: "🥃",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "線上藏酒",
    wineType: "威士忌",
    image: "/figma/product-whisky3.png",
  },
  {
    id: "wailan-cask",
    name: "威嵐啤酒桶過桶威士忌",
    subtitle: "2025 威士忌",
    price: 88200,
    emoji: "🥃",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "線上藏酒",
    wineType: "威士忌",
    image: "/figma/product-whisky4.png",
  },
  {
    id: "new-whisky",
    name: "威士忌新酒",
    subtitle: "投資新酒",
    price: 673,
    emoji: "🛢️",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "線上藏酒",
    wineType: "威士忌",
  },
];

export type Holding = {
  id: string;
  name: string;
  subtitle: string;
  qty: number;
  currentValue: number;
  changePct: number;
  avgCost: number;
  emoji: string;
  gradient: string;
  rating: number;
  lastUpdated: string;
  image?: string;
};

export const HOLDINGS: Holding[] = [
  {
    id: "kinmen-58",
    name: "金門高粱酒（白標）",
    subtitle: "750ml．58.0% alc/vol",
    qty: 14,
    currentValue: 7700,
    changePct: 9.16,
    avgCost: 503.86,
    emoji: "🍶",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    rating: 4,
    lastUpdated: "2026/07/25",
    image: "/figma/product-wine-collection.png",
  },
  {
    id: "new-whisky",
    name: "威士忌新酒",
    subtitle: "投資新酒",
    qty: 2,
    currentValue: 1346,
    changePct: 2.36,
    avgCost: 660,
    emoji: "🛢️",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    rating: 3,
    lastUpdated: "2026/08/10",
    image: "/figma/product-whisky3.png",
  },
];

export const TOTAL_PORTFOLIO_VALUE = HOLDINGS.reduce(
  (sum, h) => sum + h.currentValue,
  0,
);
export const TOTAL_PORTFOLIO_CHANGE_PCT = 8.09;
export const TODAY_REWARD_AMOUNT = 451.1;
export const REWARD_BALANCE = 14320;
export const TODAY_REWARD_RATE_PCT = 9;
// 總累積回饋比目前餘額多一些，反映歷史上已經花掉／提領掉的部分
export const TOTAL_ACCUMULATED_REWARD = REWARD_BALANCE + 980;
// 首頁鈴鐺通知的未讀數
export const NOTIFICATION_COUNT = 9;

// 智能選酒的持有狀況：跟線上藏酒的 HOLDINGS 是不同的酒窖，
// 初釀／純釀是持有時間長短的分級（純釀持有更久，回饋率更高）
export const AI_SELECT_CAPACITY = 1000;
export const AI_SELECT_FRESH = 997; // 初釀
export const AI_SELECT_AGED = 1; // 純釀
export const AI_SELECT_HOLDING = AI_SELECT_FRESH + AI_SELECT_AGED;

// 匯率預測本期累積獎金
export const RATE_FORECAST_POOL = 52000;

// 智能雲會員（即將下線的舊會員制度）：MEMBERSHIP_TIER 是卡面上的大數字（會員專屬層級），
// MEMBERSHIP_LEVEL 是旁邊「XX 級」的小字說明，兩者是不同的數字
export const MEMBERSHIP_TIER = 1;
export const MEMBERSHIP_LEVEL = 200;
export const MEMBERSHIP_COUNT = 0;
