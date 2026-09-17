// v11 專用的最小 mock data：只服務這一版探索用的三個頁面（回饋／帳號／通知），
// 刻意不跟 v10 的 _lib/mock-data.ts 共用——每個 prototype 版本保持獨立，
// 之後任一版本改動都不會互相牽動

export const REWARD_BALANCE = 14320;
// 只有回饋紀錄頁的大數字才會顯示到小數，跟 Figma 一致——其餘地方
// 一律只顯示整數 REWARD_BALANCE，這個小數尾數純粹是視覺上的裝飾
export const REWARD_BALANCE_DECIMAL = "15";
export const TODAY_REWARD_AMOUNT = 451.1;
export const TODAY_REWARD_RATE_PCT = 9.03;
export const TOTAL_ACCUMULATED_REWARD = 45678;

export type RewardTxn = {
  id: string;
  label: string;
  time: string;
  amount: number;
  // undo：扣回／退回；wallet：跟許願池或折抵有關；exchange：轉出到其他帳戶；
  // reward：一般的正向回饋入帳（預設）
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

export const LATEST_WISH = {
  name: "Apple Vision Pro",
  subtitle: "現實與虛擬完美融合的新體驗，標題超過兩行會點點點",
  price: 1890,
  image: "/figma/wish-visionpro.png",
};

export const UPCOMING_WISHES = [
  {
    id: "ricoh-gr3",
    name: "Ricoh GR III 相機",
    remaining: 400,
    image: "/figma/wish-camera.png",
  },
  {
    id: "bambi-glamping",
    name: "斑比跳跳頂級豪華露營",
    remaining: 256,
    image: "/figma/wish-camping.png",
  },
];

export const ACCOUNT_PROFILE = {
  handle: "Tonnychang",
  joined: "2025 年 11 月加入",
};

export const ACCOUNT_ROWS = [
  { key: "identity", icon: "/figma/icon-verified-user.svg", label: "身分驗證", trailing: "已驗證" },
  { key: "security", icon: "/figma/icon-shield-check.svg", label: "帳號與安全性" },
  { key: "payment", icon: "/figma/icon-wallet.svg", label: "收款與付款" },
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
