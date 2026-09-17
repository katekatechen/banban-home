// 聊天室的訊息模型：拿 v9 那套（bot/user 訊息、推薦卡、快速回覆、
// 依 stage 分支）當底，砍掉購物車／FaceID 下單那條線——v11 目前沒有
// 對應的商品頁跟結帳流程，硬接只會做出一個按了沒反應的假按鈕

export type RecCard = {
  name: string;
  subtitle: string;
  price: number;
  image?: string;
};

export type Message = {
  id: number;
  role: "bot" | "user";
  text?: string;
  quickReplies?: string[];
  card?: RecCard;
};

export type Stage = "idle" | "await_wine_budget" | "done";

let nextId = 1;
export const genId = () => nextId++;

export const GREETING_TEXT =
  "嗨，我是 AIFIAN。想買酒、看智能選品，或聊聊回饋，都可以直接說。";
