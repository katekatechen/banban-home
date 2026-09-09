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

const STORAGE_MESSAGES = "banbun-v10-messages";

let nextId = 1;
export const genId = () => nextId++;
export const bumpNextId = (usedIds: number[]) => {
  nextId = Math.max(...usedIds, nextId - 1) + 1;
};

export const GREETING_TEXT =
  "你想要什麼，我來搞定！要買酒、買日用品，還是想聊聊回饋或理財，都可以直接說。";

export const DEFAULT_GREETING: Message[] = [
  { id: genId(), role: "bot", text: GREETING_TEXT },
];

// v10 每次進聊天室都像開新對話：畫面上只看得到這次的招呼語跟新訊息，
// 但底層還是把整段歷史都存著——往上滑可以把之前的對話內容分批載回來。
export function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = sessionStorage.getItem(STORAGE_MESSAGES);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

export function saveMessages(messages: Message[]) {
  try {
    sessionStorage.setItem(STORAGE_MESSAGES, JSON.stringify(messages));
  } catch {
    // ignore
  }
}
