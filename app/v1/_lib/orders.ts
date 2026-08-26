export type OrderStatus = "進行中" | "已完成" | "已取消";

export type Order = {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  gradient: string;
  source: "伴伴對話" | "精選酒品" | "我的收藏";
  status: OrderStatus;
  createdAt: number;
};

const STORAGE_ORDERS = "banbun-orders";
const STORAGE_SEEDED = "banbun-orders-seeded";

function genOrderNo(date: Date) {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.round(Math.random() * 900000 + 100000);
  return `AB-${ymd}-${rand}`;
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  seedIfEmpty();
  try {
    const saved = sessionStorage.getItem(STORAGE_ORDERS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

function saveOrders(orders: Order[]) {
  try {
    sessionStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

export function addOrder(
  order: Omit<Order, "id" | "createdAt" | "status" | "qty"> & { qty?: number },
) {
  if (typeof window === "undefined") return;
  const now = new Date();
  const orders = getOrders();
  orders.unshift({
    ...order,
    qty: order.qty ?? 1,
    id: genOrderNo(now),
    status: "進行中",
    createdAt: now.getTime(),
  });
  saveOrders(orders);
}

// 第一次造訪時塞兩筆示意用的歷史訂單，讓列表畫面(已完成/已取消分組、篩選)
// 一開始就有東西可以看，不用先跑一次結帳才看得到設計
function seedIfEmpty() {
  try {
    if (sessionStorage.getItem(STORAGE_SEEDED)) return;
    sessionStorage.setItem(STORAGE_SEEDED, "1");
    const existing = sessionStorage.getItem(STORAGE_ORDERS);
    if (existing) return;
    const daysAgo = (n: number) => Date.now() - n * 24 * 60 * 60 * 1000;
    const seeded: Order[] = [
      {
        id: genOrderNo(new Date(daysAgo(6))),
        name: "威嵐旗艦款美國單一麥芽威士忌",
        price: 1100,
        qty: 1,
        emoji: "🥃",
        gradient: "from-orange-800 to-amber-950",
        source: "精選酒品",
        status: "已完成",
        createdAt: daysAgo(6),
      },
      {
        id: genOrderNo(new Date(daysAgo(13))),
        name: "無香洗衣精 補充包",
        price: 259,
        qty: 2,
        emoji: "🧴",
        gradient: "from-sky-600 to-sky-900",
        source: "伴伴對話",
        status: "已取消",
        createdAt: daysAgo(13),
      },
    ];
    sessionStorage.setItem(STORAGE_ORDERS, JSON.stringify(seeded));
  } catch {
    // ignore
  }
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}
