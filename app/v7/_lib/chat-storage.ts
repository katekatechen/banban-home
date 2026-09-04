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

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  stage: Stage;
  updatedAt: number;
};

const STORAGE_CONVERSATIONS = "banbun-v7-conversations";
const STORAGE_ACTIVE_ID = "banbun-v7-active-conversation-id";

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

export function createConversation(): Conversation {
  return {
    id: `conv-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    title: "新對話",
    messages: DEFAULT_GREETING,
    stage: "idle",
    updatedAt: Date.now(),
  };
}

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = sessionStorage.getItem(STORAGE_CONVERSATIONS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

export function saveConversations(list: Conversation[]) {
  try {
    sessionStorage.setItem(STORAGE_CONVERSATIONS, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function loadActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_ACTIVE_ID);
  } catch {
    return null;
  }
}

export function saveActiveId(id: string) {
  try {
    sessionStorage.setItem(STORAGE_ACTIVE_ID, id);
  } catch {
    // ignore
  }
}

export function deriveTitle(messages: Message[]): string | null {
  const firstUser = messages.find((m) => m.role === "user" && m.text);
  if (!firstUser?.text) return null;
  return firstUser.text.length > 16
    ? firstUser.text.slice(0, 16) + "…"
    : firstUser.text;
}

export function sortedByRecent(list: Conversation[]) {
  return list.slice().sort((a, b) => b.updatedAt - a.updatedAt);
}

// 從 chips/quick reply 開始的對話，標題常常是「emoji + 空白 + 文字」
// （例如「💰 我想了解報稅的事情」），側邊欄想把 emoji 獨立當圖示顯示，
// 其餘文字當標題，所以拆出來用；沒有 emoji 開頭的話給預設對話泡泡圖示。
const EMOJI_PREFIX = /^(\p{Extended_Pictographic}️?)\s*/u;

export function splitTitleIcon(title: string): { icon: string; label: string } {
  const match = title.match(EMOJI_PREFIX);
  if (match && title.slice(match[0].length).length > 0) {
    return { icon: match[1], label: title.slice(match[0].length) };
  }
  return { icon: "💬", label: title };
}
