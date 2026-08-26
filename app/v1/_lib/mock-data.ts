export type WineType = "威士忌" | "高粱" | "白蘭地" | "紅酒" | "白酒";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  emoji: string;
  gradient: string;
  category: "精選酒品" | "日用品";
  wineType: WineType;
  tag?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "kinmen-58",
    name: "金門高粱酒（白標）",
    subtitle: "750ml．58.0% alc/vol",
    price: 550,
    emoji: "🍶",
    gradient: "from-gray-700 to-gray-900",
    category: "精選酒品",
    wineType: "高粱",
  },
  {
    id: "macallan-12",
    name: "麥卡倫 12 年雪莉桶",
    subtitle: "2025 Whisky",
    price: 999,
    emoji: "🥃",
    gradient: "from-amber-700 to-amber-950",
    category: "精選酒品",
    wineType: "威士忌",
    tag: "熱銷",
  },
  {
    id: "louve-cortez",
    name: "樂露芙 克羅茲-艾米塔吉紅酒",
    subtitle: "2025 Wine",
    price: 921,
    emoji: "🍷",
    gradient: "from-rose-800 to-rose-950",
    category: "精選酒品",
    wineType: "紅酒",
    tag: "NEW",
  },
  {
    id: "wailan-flagship",
    name: "威嵐旗艦款美國單一麥芽威士忌",
    subtitle: "2025 Whisky",
    price: 1100,
    emoji: "🥃",
    gradient: "from-orange-800 to-amber-950",
    category: "精選酒品",
    wineType: "威士忌",
  },
  {
    id: "new-whisky",
    name: "威士忌新酒",
    subtitle: "投資新酒",
    price: 673,
    emoji: "🛢️",
    gradient: "from-stone-700 to-stone-900",
    category: "精選酒品",
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
    gradient: "from-gray-700 to-gray-900",
    rating: 4,
    lastUpdated: "2026/07/25",
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
    gradient: "from-stone-700 to-stone-900",
    rating: 3,
    lastUpdated: "2026/08/10",
  },
];

export const TOTAL_PORTFOLIO_VALUE = HOLDINGS.reduce(
  (sum, h) => sum + h.currentValue,
  0,
);
export const TOTAL_PORTFOLIO_CHANGE_PCT = 8.09;
