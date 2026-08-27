export type CartItem = {
  key: string;
  name: string;
  price: number;
  emoji: string;
  gradient: string;
  qty: number;
  source: "伴伴對話" | "精選酒品" | "我的收藏";
};

const STORAGE_CART = "banbun-v2-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = sessionStorage.getItem(STORAGE_CART);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

function saveCart(items: CartItem[]) {
  try {
    sessionStorage.setItem(STORAGE_CART, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function isInCart(key: string): boolean {
  return getCart().some((i) => i.key === key);
}

// 加入購物車：已在裡面就移除（跟商品卡/bottom sheet 的 icon 切換行為一致）
export function toggleCartItem(
  item: Omit<CartItem, "qty">,
): boolean {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.key === item.key);
  if (idx >= 0) {
    cart.splice(idx, 1);
    saveCart(cart);
    return false;
  }
  cart.push({ ...item, qty: 1 });
  saveCart(cart);
  return true;
}

// 直接購買：確保商品在購物車裡（沒有就加進去），供結帳頁使用
export function ensureInCart(item: Omit<CartItem, "qty">) {
  const cart = getCart();
  if (!cart.find((i) => i.key === item.key)) {
    cart.push({ ...item, qty: 1 });
    saveCart(cart);
  }
}

export function updateQty(key: string, qty: number) {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.key === key);
  if (idx < 0) return;
  if (qty <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].qty = qty;
  }
  saveCart(cart);
}

export function removeFromCart(key: string) {
  saveCart(getCart().filter((i) => i.key !== key));
}

export function clearCart() {
  saveCart([]);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
