// 全部功能清單。首頁的隨機 3 宮格跟「功能」面板的完整列表共用同一份資料，
// 差別只在首頁抽 3 個當捷徑、功能面板顯示全部 8 個。
// 故意混雜投資（智能選酒/匯率預測）、消費（買特斯拉）、購物（線上藏酒）、
// 遊戲化（回饋許願池），不特別歸類——目的是讓用戶感受到伴伴能碰的服務很廣。
export type ServiceItem = {
  key: string;
  label: string;
  emoji: string;
  href: string;
  disabled: boolean;
};

export const SERVICE_POOL: ServiceItem[] = [
  { key: "ai-select", label: "智能選酒", emoji: "🥃", href: "/v8/ai-select", disabled: false },
  { key: "wine-select", label: "線上藏酒", emoji: "🍷", href: "/v8/wine-select", disabled: false },
  { key: "reward-marketplace", label: "回饋許願池", emoji: "🎁", href: "/v8/reward-marketplace", disabled: false },
  { key: "rate-forecast", label: "匯率預測", emoji: "💱", href: "/v8/rate-forecast", disabled: false },
  { key: "bill", label: "代繳帳單", emoji: "💳", href: "#", disabled: true },
  { key: "tesla", label: "買特斯拉", emoji: "🚗", href: "#", disabled: true },
  { key: "btc", label: "買比特幣", emoji: "₿", href: "#", disabled: true },
  { key: "solar", label: "太陽能板發電", emoji: "☀️", href: "#", disabled: true },
] as const;
