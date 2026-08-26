export type Order = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  gradient: string;
  source: "伴伴對話" | "精選酒品" | "我的收藏";
  createdAt: number;
};

const STORAGE_ORDERS = "banbun-orders";

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = sessionStorage.getItem(STORAGE_ORDERS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

export function addOrder(order: Omit<Order, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  try {
    const orders = getOrders();
    orders.unshift({
      ...order,
      id: `order-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      createdAt: Date.now(),
    });
    sessionStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  } catch {
    // ignore
  }
}
