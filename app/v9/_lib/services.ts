// 全部功能清單，側邊欄直接列出來的功能項目。
// label 維持產品名稱（跟其他頁面的稱呼一致），description 用「伴伴幫你做什麼」
// 的口吻補一句，讓側邊欄讀起來是伴伴的能力清單，不是單純的功能選單。
export type ServiceItem = {
  key: string;
  label: string;
  description: string;
  emoji: string;
  href: string;
  disabled: boolean;
};

export const SERVICE_POOL: ServiceItem[] = [
  {
    key: "ai-select",
    label: "智能選酒",
    description: "幫你挑一組能每天賺回饋的酒",
    emoji: "🥃",
    href: "/v9/ai-select",
    disabled: false,
  },
  {
    key: "wine-select",
    label: "線上藏酒",
    description: "幫你把酒存好，之後轉售或領回都行",
    emoji: "🍷",
    href: "/v9/wine-select",
    disabled: false,
  },
  {
    key: "reward-marketplace",
    label: "回饋許願池",
    description: "幫你抽獎贏回饋，手氣好賺更多",
    emoji: "🎁",
    href: "/v9/reward-marketplace",
    disabled: false,
  },
  {
    key: "rate-forecast",
    label: "匯率預測",
    description: "幫你盯緊匯率漲跌，猜對拿回饋",
    emoji: "💱",
    href: "/v9/rate-forecast",
    disabled: false,
  },
  {
    key: "bill",
    label: "代繳帳單",
    description: "水電、電信帳單，幫你記著別錯過",
    emoji: "💳",
    href: "#",
    disabled: true,
  },
  {
    key: "solar",
    label: "太陽能板發電",
    description: "幫你顧太陽能板收益，一起賺回饋",
    emoji: "☀️",
    href: "#",
    disabled: true,
  },
] as const;
