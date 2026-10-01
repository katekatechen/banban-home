// 聊天室的訊息模型：拿 v9 那套（bot/user 訊息、推薦卡、快速回覆、
// 依 stage 分支）當底。v13 對話改成在首頁原地展開（不是另外推一頁），
// 一則 AI 訊息可以是「一段文字＋底下一張或一排商品卡」，照 Figma 981:24621

export type RecCard = {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  image?: string;
};

export type Message = {
  id: number;
  role: "bot" | "user";
  text?: string;
  quickReplies?: string[];
  cards?: RecCard[];
};

export type Stage = "idle" | "await_wine_budget" | "done";

let nextId = 1;
export const genId = () => nextId++;

export const GREETING_TEXT =
  "嗨，我是 AIFIAN。想買東西、看回饋，或聊聊怎麼賺回饋，都可以直接說。";

// 對話狀態存在模組層級：切去回饋／兌換分頁再切回來，首頁會重新掛載，
// 存在 component state 裡的對話會整個不見。放這裡的話只要不重新整理頁面，
// 回到聊天分頁還是同一段對話
export type ChatSnapshot = {
  open: boolean;
  messages: Message[];
  stage: Stage;
  selected: string[];
  cartCount: number;
};

let snapshot: ChatSnapshot | null = null;

export const loadChat = (): ChatSnapshot =>
  snapshot ?? {
    open: false,
    messages: [{ id: genId(), role: "bot", text: GREETING_TEXT }],
    stage: "idle",
    selected: [],
    cartCount: 0,
  };

export const saveChat = (next: ChatSnapshot) => {
  snapshot = next;
};
