import type { CartItem } from "./chat-storage";
import { REWARD_BALANCE } from "./mock-data";

// 回饋折抵的試算，列表、商品細節頁、對話商品卡共用同一套，說法才會一致。
//
// 重點是回饋是「一整筆共用的額度」，不是每件商品自己的屬性：餘額 240 的時候，
// 兩件 129 的商品不可能都是 0 元。所以試算要扣掉購物車裡其他商品已經佔掉的額度，
// 加了第一件之後，第二件就會顯示實際要補的差額，不會到結帳才發現折不完。
//
// 商品本身已經在購物車裡時，扣的是「其他商品」佔掉的部分，不扣自己，
// 這樣加入購物車前後，同一張卡上的數字不會跳動（變的是別張卡）。
export type RewardPrice = {
  // 這件商品的原價
  price: number;
  // 用目前還能動用的回饋折抵後，還要付多少
  shortfall: number;
  // 回饋付得完全額
  fullyCovered: boolean;
};

export function rewardPrice(
  price: number,
  cart: CartItem[],
  selfId?: string,
): RewardPrice {
  const committed = cart.reduce(
    (sum, it) =>
      it.card.id === selfId ? sum : sum + it.card.price * it.qty,
    0,
  );
  const available = Math.max(0, REWARD_BALANCE - committed);
  const shortfall = Math.max(0, price - available);
  return { price, shortfall, fullyCovered: shortfall === 0 };
}

// 折抵後金額一律取整數顯示：餘額帶小數（240.2），但結帳實際折抵也是取整數，
// 兩邊要算出同一個數字
export const money0 = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 });
