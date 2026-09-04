export type RecCard = {
  name: string;
  desc: string;
  price: number;
  emoji: string;
  gradient: string;
};

export type Message = {
  id: number;
  role: "bot" | "user";
  text?: string;
  quickReplies?: string[];
  card?: RecCard;
  orderConfirmed?: boolean;
};

export type Stage =
  | "idle"
  | "await_wine_budget"
  | "await_daily_category"
  | "done";

const STORAGE_MESSAGES = "banbun-v8-messages";
const STORAGE_STAGE = "banbun-v8-stage";

let nextId = 1;
export const genId = () => nextId++;
export const bumpNextId = (usedIds: number[]) => {
  nextId = Math.max(...usedIds, nextId - 1) + 1;
};

export const DEFAULT_GREETING: Message[] = [
  {
    id: genId(),
    role: "bot",
    text: "你想要什麼，我來搞定！要買酒、買日用品，還是想聊聊回饋或理財，都可以直接說。",
  },
];

// v8 只有一段持續進行的對話，沒有「開新對話」也沒有歷史清單——
// 每次進聊天室都是接續同一段訊息，不會分岔出新的對話串
export function loadMessages(): Message[] {
  if (typeof window === "undefined") return DEFAULT_GREETING;
  try {
    const saved = sessionStorage.getItem(STORAGE_MESSAGES);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return DEFAULT_GREETING;
}

export function saveMessages(messages: Message[]) {
  try {
    sessionStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages));
  } catch {
    // ignore
  }
}

export function loadStage(): Stage {
  if (typeof window === "undefined") return "idle";
  try {
    return (sessionStorage.getItem(STORAGE_STAGE) as Stage) || "idle";
  } catch {
    return "idle";
  }
}

export function saveStage(stage: Stage) {
  try {
    sessionStorage.setItem(STORAGE_STAGE, stage);
  } catch {
    // ignore
  }
}
