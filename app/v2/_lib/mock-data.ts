export type WineType = "威士忌" | "高粱" | "白蘭地" | "紅酒" | "白酒";

export type Characteristics = {
  sweetness: number;
  acidity: number;
  tannin: number;
  alcohol: number;
  body: number;
};

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
  // 酒品內頁用（見 Figma node 19494:23489）
  region?: string;
  grape?: string;
  winery?: string;
  vintage?: string;
  rating?: number;
  lastUpdated?: string;
  characteristics?: Characteristics;
  flavors?: string[];
  pairings?: string[];
  description?: string;
  badges?: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "kinmen-58",
    name: "金門高粱酒（白標）",
    subtitle: "750ml．58.0% alc/vol",
    price: 550,
    emoji: "🍶",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "精選酒品",
    wineType: "高粱",
    region: "台灣．金門",
    grape: "高粱",
    winery: "金門酒廠",
    vintage: "現貨",
    rating: 4,
    lastUpdated: "2026/07/25",
    characteristics: { sweetness: 20, acidity: 15, tannin: 10, alcohol: 90, body: 70 },
    flavors: ["穀物麥香", "焙烤熟成", "辛香尾韻"],
    pairings: ["滷味", "小菜", "熱炒"],
    description:
      "金門高粱酒的經典白標款，選用當地栽種的高粱與花崗岩層過濾的地下水釀造，口感濃烈直接，尾韻帶著明顯的穀物香氣，是台灣白酒的代表之作。",
    badges: ["千元好物", "送禮首選"],
  },
  {
    id: "macallan-12",
    name: "麥卡倫 12 年雪莉桶",
    subtitle: "2025 Whisky",
    price: 999,
    emoji: "🥃",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "精選酒品",
    wineType: "威士忌",
    tag: "熱銷",
    region: "蘇格蘭．斯佩賽",
    grape: "單一麥芽",
    winery: "The Macallan",
    vintage: "12 年",
    rating: 5,
    lastUpdated: "2026/07/25",
    characteristics: { sweetness: 65, acidity: 30, tannin: 40, alcohol: 60, body: 75 },
    flavors: ["焙烤熟成", "木質辛香", "新鮮水果"],
    pairings: ["黑巧克力", "雪茄", "起司"],
    description:
      "在雪莉橡木桶中陳釀滿 12 年，帶出乾果、香料與淡淡巧克力的風味，口感圓潤均衡，是威士忌入門與送禮都適合的經典款。",
    badges: ["熱銷", "送禮首選"],
  },
  {
    id: "louve-cortez",
    name: "樂露芙 克羅茲-艾米塔吉紅酒",
    subtitle: "2025 Wine",
    price: 921,
    emoji: "🍷",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "精選酒品",
    wineType: "紅酒",
    tag: "NEW",
    region: "法國．隆河谷",
    grape: "Syrah",
    winery: "Domaine La Louve",
    vintage: "2021",
    rating: 4,
    lastUpdated: "2026/07/25",
    characteristics: { sweetness: 15, acidity: 55, tannin: 70, alcohol: 55, body: 65 },
    flavors: ["黑色漿果", "木質辛香", "胡椒香料"],
    pairings: ["紅肉燒烤", "燉牛肉", "硬質起司"],
    description:
      "產自隆河谷北部的希哈品種紅酒，單寧扎實、酸度明亮，帶有黑莓與黑胡椒的香氣，適合搭配重口味的紅肉料理。",
    badges: ["NEW", "適合搭餐"],
  },
  {
    id: "wailan-flagship",
    name: "威嵐旗艦款美國單一麥芽威士忌",
    subtitle: "2025 Whisky",
    price: 1100,
    emoji: "🥃",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "精選酒品",
    wineType: "威士忌",
    region: "美國",
    grape: "單一麥芽",
    winery: "威嵐酒廠",
    vintage: "旗艦款",
    rating: 4,
    lastUpdated: "2026/07/25",
    characteristics: { sweetness: 55, acidity: 25, tannin: 35, alcohol: 70, body: 68 },
    flavors: ["焙烤熟成", "新鮮水果", "核心果香"],
    pairings: ["烤肉", "雪茄", "黑巧克力"],
    description:
      "威嵐酒廠的旗艦單一麥芽威士忌，橡木桶陳釀帶出香草與焦糖甜香，尾韻略帶果香，風格介於蘇格蘭與美式波本之間。",
    badges: ["投資推薦"],
  },
  {
    id: "new-whisky",
    name: "威士忌新酒",
    subtitle: "投資新酒",
    price: 673,
    emoji: "🛢️",
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    category: "精選酒品",
    wineType: "威士忌",
    region: "台灣",
    grape: "麥芽新酒",
    winery: "本地酒廠",
    vintage: "新酒",
    rating: 3,
    lastUpdated: "2026/08/10",
    characteristics: { sweetness: 40, acidity: 35, tannin: 20, alcohol: 85, body: 50 },
    flavors: ["穀物麥香", "辛香尾韻"],
    pairings: ["堅果", "起司"],
    description:
      "尚未進桶陳年的威士忌新酒，口感直接鮮明，適合喜歡追蹤酒款從新酒到熟成、價值變化的投資型買家。",
    badges: ["投資新酒"],
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
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
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
    gradient: "from-[#EAE7DD] to-[#EAE7DD]",
    rating: 3,
    lastUpdated: "2026/08/10",
  },
];

export const TOTAL_PORTFOLIO_VALUE = HOLDINGS.reduce(
  (sum, h) => sum + h.currentValue,
  0,
);
export const TOTAL_PORTFOLIO_CHANGE_PCT = 8.09;
