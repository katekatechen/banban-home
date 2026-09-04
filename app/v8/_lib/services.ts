// 全部功能清單，側邊欄直接列出來的功能項目。
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
  { key: "solar", label: "太陽能板發電", emoji: "☀️", href: "#", disabled: true },
] as const;
