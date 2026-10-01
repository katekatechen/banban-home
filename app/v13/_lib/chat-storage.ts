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

// 對話狀態存在模組層級：切去回饋／兌換分頁再切回來，首頁會重新掛載，
// 存在 component state 裡的對話會整個不見。放這裡的話只要不重新整理頁面，
// 回到聊天分頁還是同一段對話
// 購物車：同一個商品只佔一列，重複加入就是數量 +1。
// 對話、兌換頁、結帳頁都讀寫同一份（存在下面的模組層級快照裡）
export type CartItem = { card: RecCard; qty: number };

export const cartCountOf = (cart: CartItem[]) =>
  cart.reduce((sum, it) => sum + it.qty, 0);

export const addToCart = (cart: CartItem[], card: RecCard): CartItem[] =>
  cart.some((it) => it.card.id === card.id)
    ? cart.map((it) =>
        it.card.id === card.id ? { ...it, qty: it.qty + 1 } : it,
      )
    : [...cart, { card, qty: 1 }];

export const removeFromCart = (cart: CartItem[], id: string): CartItem[] =>
  cart.filter((it) => it.card.id !== id);

export const setCartQty = (
  cart: CartItem[],
  id: string,
  qty: number,
): CartItem[] => cart.map((it) => (it.card.id === id ? { ...it, qty } : it));

// 對話狀態存在模組層級：切去回饋／兌換分頁再切回來，首頁會重新掛載，
// 存在 component state 裡的對話會整個不見。放這裡的話只要不重新整理頁面，
// 回到聊天分頁還是同一段對話
export type ChatSnapshot = {
  open: boolean;
  historyLoaded: boolean;
  messages: Message[];
  stage: Stage;
  selected: string[];
  cart: CartItem[];
};

let snapshot: ChatSnapshot | null = null;

export const loadChat = (): ChatSnapshot =>
  snapshot ?? {
    open: false,
    historyLoaded: false,
    // 不放招呼語：對話是送出第一句話才展開的，一打開就是使用者自己那句
    messages: [],
    stage: "idle",
    selected: [],
    cart: [],
  };

export const saveChat = (next: ChatSnapshot) => {
  snapshot = next;
};

// 兌換頁拿不到首頁的 state，購物車直接讀寫這份快照；
// 回到聊天分頁時首頁重新掛載會讀到新的內容
export const loadCart = () => loadChat().cart;
export const saveCart = (cart: CartItem[]) => {
  snapshot = { ...loadChat(), cart };
};

// 從其他頁（兌換頁的「繼續聊」、線上藏酒）帶一句話回聊天分頁送出。
// 不靠網址的 ?prompt=：切分頁時首頁可能比網址更新還早掛載，讀不到參數
let pendingPrompt: string | null = null;
export const setPendingPrompt = (text: string) => {
  pendingPrompt = text;
};
export const takePendingPrompt = () => {
  const t = pendingPrompt;
  pendingPrompt = null;
  return t;
};
