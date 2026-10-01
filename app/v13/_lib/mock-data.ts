// v13 mock data（從 v12 複製）：延續 v11 的回饋／帳號／通知資料，加上這版新增的
// 兌換（線上藏酒／3C 商品）、我的收藏。刻意不跟其他版本共用，
// 每個 prototype 版本保持獨立，之後任一版本改動都不會互相牽動

export const REWARD_BALANCE = 14320;
// 只有回饋紀錄頁的大數字才會顯示到小數，跟 Figma 一致——其餘地方
// 一律只顯示整數 REWARD_BALANCE，這個小數尾數純粹是視覺上的裝飾
export const REWARD_BALANCE_DECIMAL = "15";
// v13 回饋頁上方改照 Figma 的數字：今天拿到 26.12、今日回饋率 8.64%
export const TODAY_REWARD_AMOUNT = 26.12;
export const TODAY_REWARD_RATE_PCT = 8.64;
export const TOTAL_ACCUMULATED_REWARD = 45678;

export type RewardTxn = {
  id: string;
  label: string;
  time: string;
  amount: number;
  icon?: "undo" | "wallet" | "exchange" | "reward";
};

export const REWARD_HISTORY: { month: string; items: RewardTxn[] }[] = [
  {
    month: "2025.01",
    items: [
      { id: "t1", label: "買酒回饋扣回", time: "2025/01/30 10:23", amount: -12, icon: "undo" },
      { id: "t2", label: "買酒回饋", time: "2025/01/19 11:23", amount: 12 },
      { id: "t3", label: "回饋許願池", time: "2025/01/30 10:23", amount: -1, icon: "wallet" },
      { id: "t4", label: "每日回饋", time: "2025/01/19 11:23", amount: 26 },
      { id: "t5", label: "轉售酒品", time: "2025/01/20 09:08", amount: 3626 },
      { id: "t6", label: "退款", time: "2025/01/22 23:59", amount: 300 },
      { id: "t7", label: "折抵", time: "2025/01/03 23:11", amount: -5, icon: "wallet" },
      { id: "t8", label: "其他", time: "2025/01/03 08:30", amount: 5 },
      { id: "t9", label: "轉出", time: "2025/01/03 07:31", amount: -500, icon: "exchange" },
      { id: "t10", label: "轉讓智能雲等級", time: "2025/01/20 09:08", amount: 3000 },
      { id: "t11", label: "推薦", time: "2025/01/16 20:57", amount: 100 },
    ],
  },
];

// 還沒有真的大頭貼照片時的替代方案：取姓名縮寫，跟 Slack/Google 那種
// 預設大頭貼一樣，只取第一個字母
export function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

export const AI_SELECT_CAPACITY = 1000;
export const AI_SELECT_FRESH = 997;
export const AI_SELECT_AGED = 1;
export const AI_SELECT_HOLDING = AI_SELECT_FRESH + AI_SELECT_AGED;

export const WINE_PICKS = [
  {
    id: "macallan-12",
    name: "麥卡倫 12 年雪莉桶",
    subtitle: "2025 威士忌",
    price: 999,
    image: "/figma/product-macallan.png",
    tag: "NEW",
  },
  {
    id: "louve-cortez",
    name: "樂露芙 克羅茲-艾米塔吉紅酒",
    subtitle: "2025 紅酒",
    price: 921,
    image: "/figma/product-redwine.png",
    tag: "NEW",
  },
];

export const RATE_FORECAST_POOL = 52000;
export const MEMBERSHIP_TIER = 1;
export const MEMBERSHIP_LEVEL = 200;

// 許願池可以往右滑看更多，卡片沿用同一套視覺（圖＋漸層＋疊字），
// 每張都要有「中獎價」，跟熱門商品那種一次性折抵不同——許願池是
// 投入回饋衝高好運，價格代表要衝到多高的池子才開獎
export const WISHES = [
  {
    id: "vision-pro",
    name: "Apple Vision Pro",
    subtitle: "現實與虛擬完美融合的新體驗，標題超過兩行會點點點",
    price: 1890,
    image: "/figma/wish-visionpro.png",
  },
  {
    id: "ricoh-gr3",
    name: "Ricoh GR III 相機",
    subtitle: "經典復古機身，隨手街拍神器",
    price: 400,
    image: "/figma/wish-camera.png",
  },
  {
    id: "bambi-glamping",
    name: "斑比跳跳頂級豪華露營",
    subtitle: "森林裡的豪華帳篷，兩天一夜",
    price: 256,
    image: "/figma/wish-camping.png",
  },
];

// 兌換頁原本的「熱門商品」拆成兩排：大家都在換（熱門／社會認同，沒有
// 個人化資料可掛的商品）、猜你喜歡（個人化推薦）。同一批商品刻意混
// 3C／酒／食品幾種類型。台酒麻辣乾拌麵、20W 行動電源、威嵐旗艦款藍牙
// 耳機是使用者提供的真實商品照，其餘還沒有真的商品照，先用淺灰色佔位。
// 每排都放 3 件商品，才能橫向捲動、露出下一張的邊緣
// 兩排商品混了有真的照片跟只有色塊佔位的項目，兩個欄位都設成 optional，
// 不然某一排剛好全部都沒有 image（或都沒有 color）時，TS 會把該欄位窄化
// 成 never，畫面上 "image" in p 判斷式就會編譯不過
type ExchangeProduct = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image?: string;
  color?: string;
};

// 還沒有真的商品照的項目統一用淺灰色佔位，不要每個各自配一個深色調，
// 佔位色本身不該帶出「這個商品是什麼顏色」的錯誤資訊
const PLACEHOLDER_COLOR = "#E5E7EB";

export const TRENDING_PRODUCTS: ExchangeProduct[] = [
  {
    id: "power-bank-20w",
    name: "20W 行動電源",
    subtitle: "3C 配件",
    price: 8500,
    image: "/figma/product-power-bank-20w.jpg",
  },
  {
    id: "wailan-power-bank",
    name: "威嵐隨行行動電源",
    subtitle: "3C 配件",
    price: 1290,
    color: PLACEHOLDER_COLOR,
  },
  {
    id: "wailan-speaker",
    name: "威嵐藍牙喇叭",
    subtitle: "3C 配件",
    price: 2490,
    color: PLACEHOLDER_COLOR,
  },
];

export const RECOMMENDED_PRODUCTS: ExchangeProduct[] = [
  {
    id: "wailan-earbuds",
    name: "威嵐旗艦款藍牙耳機",
    subtitle: "3C 配件",
    price: 4990,
    image: "/figma/product-wailan-earbuds.jpg",
  },
  {
    id: "taiwan-tobacco-spicy-noodles",
    name: "台酒麻辣乾拌麵",
    subtitle: "台酒聯名 · 4 入裝",
    price: 150,
    image: "/figma/product-spicy-noodles.jpg",
  },
  {
    id: "wailan-wireless-charger",
    name: "威嵐無線充電盤",
    subtitle: "3C 配件",
    price: 990,
    color: PLACEHOLDER_COLOR,
  },
];

// 線上藏酒（瀏覽／可買）跟我的收藏（已持有）是兩份不同的清單，
// 沿用 v10 的分法：Product 是店裡陳列的酒，Holding 是使用者手上已經有的
export type WineType = "威士忌" | "高粱" | "白蘭地" | "紅酒" | "白酒";

export type WineProduct = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  wineType: WineType;
  image: string;
  tag?: string;
};

export const WINE_SHOP_PRODUCTS: WineProduct[] = [
  {
    id: "macallan-12",
    name: "麥卡倫 12 年雪莉桶",
    subtitle: "2025 威士忌",
    price: 999,
    wineType: "威士忌",
    image: "/figma/product-macallan.png",
  },
  {
    id: "louve-cortez",
    name: "樂露芙 克羅茲-艾米塔吉紅酒",
    subtitle: "2025 紅酒",
    price: 921,
    wineType: "紅酒",
    image: "/figma/product-redwine.png",
    tag: "NEW",
  },
  {
    id: "wailan-flagship",
    name: "威嵐旗艦款美國單一麥芽威士忌",
    subtitle: "2025 威士忌",
    price: 1100,
    wineType: "威士忌",
    image: "/figma/product-whisky3.png",
  },
  {
    id: "wailan-cask",
    name: "威嵐啤酒桶過桶威士忌",
    subtitle: "2025 威士忌",
    price: 88200,
    wineType: "威士忌",
    image: "/figma/product-whisky4.png",
  },
];

export type WineHolding = {
  id: string;
  name: string;
  qty: number;
  currentValue: number;
  changePct: number;
  image: string;
};

export const WINE_HOLDINGS: WineHolding[] = [
  {
    id: "h1",
    name: "費維利酒莊武若園特級紅酒費維利酒莊武若園特級紅酒費維利…",
    qty: 99999,
    currentValue: 9999999,
    changePct: 100.5,
    image: "/figma/product-wine-collection.png",
  },
  {
    id: "h2",
    name: "費維利酒莊武若園特級紅酒費維利酒莊武若園特級紅酒費維利…",
    qty: 99999,
    currentValue: 9999999,
    changePct: 100.5,
    image: "/figma/product-wine-collection.png",
  },
  {
    id: "h3",
    name: "費維利酒莊武若園特級紅酒費維利酒莊武若園特級紅酒費維利…",
    qty: 99999,
    currentValue: 9999999,
    changePct: 100.5,
    image: "/figma/product-wine-collection.png",
  },
  {
    id: "h4",
    name: "費維利酒莊武若園特級紅酒費維利酒莊武若園特級紅酒費維利…",
    qty: 99999,
    currentValue: 9999999,
    changePct: 100.5,
    image: "/figma/product-wine-collection.png",
  },
];

export const WINE_HOLDINGS_TOTAL_VALUE = 1999999;
export const WINE_HOLDINGS_TOTAL_CHANGE_PCT = 100.5;

export const ACCOUNT_PROFILE = {
  handle: "Tonnychang",
  joined: "2025 年 11 月加入",
};

export const ACCOUNT_ROWS = [
  { key: "identity", icon: "/figma/icon-verified-user.svg", label: "身分驗證", trailing: "已驗證" },
  { key: "security", icon: "/figma/icon-shield-check.svg", label: "帳號與安全性" },
  { key: "payment", icon: "/figma/icon-wallet.svg", label: "收款與付款" },
  // Figma 這幾張靜態稿沒有畫出「我的收藏」的入口位置，這裡加在帳號頁
  // 是我自己補的合理位置，不是照著哪個節點還原的
  { key: "collection", icon: "/figma/icon-clipboard-check.svg", label: "我的收藏", href: "/v13/collection" },
  { key: "history", icon: "/figma/icon-clipboard-check.svg", label: "歷史交易紀錄" },
  { key: "referral", icon: "/figma/icon-community.svg", label: "推薦好友" },
  { key: "gifts", icon: "/figma/icon-gift.svg", label: "我的禮物" },
  { key: "prefs", icon: "/figma/icon-settings.svg", label: "偏好設定" },
];

export const ACCOUNT_ROWS_SECONDARY = [
  { key: "legal", icon: "/figma/icon-page.svg", label: "條款及隱私權" },
  { key: "feedback", icon: "/figma/icon-lightbulb.svg", label: "我有使用建議" },
];

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "2025 Le Rouvre Crozes Hermitage 價格上漲",
    body: "從 TWD 525 上漲至 TWD 528",
    time: "14:53",
    unread: true,
  },
  {
    id: "n2",
    title: "你購買的酒品已全數媒合",
    body: "趕快去查看你得 2025 智能選品吧！",
    time: "09:34",
    unread: true,
  },
  {
    id: "n3",
    title: "開獎時間截止",
    body: "Dyson Supersonic HD17（雲霧紫）未能在期限內衝高好運，已退還你投入的回饋。",
    time: "7/27",
    unread: false,
  },
  {
    id: "n4",
    title: "午安",
    body: "有 1 個禮物掉下來了",
    time: "7/27",
    unread: false,
  },
  {
    id: "n5",
    title: "你申請轉出的回饋已成功入帳",
    body: "你申請轉出的回饋 500 已成功匯入你的銀行帳號，目前回饋餘額為 1。",
    time: "7/27",
    unread: false,
  },
];

// 帳號頁鈴鐺上的紅點數字，跟通知頁實際的未讀則數一致
export const UNREAD_NOTIFICATIONS = NOTIFICATIONS.filter((n) => n.unread).length;
