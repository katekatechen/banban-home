"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import { getOrders, type Order, type OrderStatus } from "../_lib/orders";

const FILTERS = ["全部", "進行中", "已完成"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_STYLE: Record<OrderStatus, string> = {
  進行中: "bg-gray-800 text-white",
  已完成: "bg-emerald-500 text-white",
  已取消: "bg-gray-300 text-gray-700",
};

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"訂單" | "詢問">("訂單");
  const [filter, setFilter] = useState<Filter>("全部");

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const filtered =
    filter === "全部" ? orders : orders.filter((o) => o.status === filter);

  const groups: { status: OrderStatus; items: Order[] }[] =
    filter === "全部"
      ? (["進行中", "已完成", "已取消"] as OrderStatus[])
          .map((status) => ({
            status,
            items: orders.filter((o) => o.status === status),
          }))
          .filter((g) => g.items.length > 0)
      : [{ status: filter as OrderStatus, items: filtered }];

  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex shrink-0 items-center px-2 pb-2 pt-1">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center text-[20px] text-gray-800"
        >
          ‹
        </button>
        <p className="flex-1 text-center text-[17px] font-semibold text-gray-800">
          訂單紀錄
        </p>
        <div className="size-10" />
      </div>

      <div className="flex shrink-0 gap-6 border-b border-gray-100 px-4">
        <button
          onClick={() => setTab("訂單")}
          className={`pb-2.5 text-[15px] font-semibold ${
            tab === "訂單"
              ? "border-b-2 border-gray-800 text-gray-800"
              : "text-gray-400"
          }`}
        >
          訂單
        </button>
        <button
          onClick={() => setTab("詢問")}
          className={`pb-2.5 text-[15px] font-semibold ${
            tab === "詢問"
              ? "border-b-2 border-gray-800 text-gray-800"
              : "text-gray-400"
          }`}
        >
          詢問
        </button>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
      {tab === "詢問" ? (
        <div className="flex flex-col items-center gap-2 px-4 py-20 text-center">
          <span className="text-[40px]">💬</span>
          <p className="text-[14px] text-gray-400">目前沒有詢問紀錄</p>
        </div>
      ) : (
        <>
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                  filter === f
                    ? "bg-gray-800 text-white"
                    : "border border-gray-300 text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-20 text-center">
              <span className="text-[40px]">📦</span>
              <p className="text-[14px] text-gray-500">還沒有訂單紀錄</p>
              <p className="text-[12px] text-gray-400">
                跟伴伴說你想要什麼，下單後會出現在這裡
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 px-4 pb-6">
              {groups.map((g) => (
                <div key={g.status} className="flex flex-col gap-3">
                  <p className="text-[13px] text-gray-400">{g.status}</p>
                  {g.items.map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${STATUS_STYLE[o.status]}`}
                        >
                          {o.status}
                        </span>
                        <span className="text-[12px] text-gray-400">
                          {formatDate(o.createdAt)}
                        </span>
                      </div>
                      <Link
                        href={`/v3/orders/${o.id}`}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[22px] ${o.gradient}`}
                        >
                          {o.emoji}
                        </div>
                        <p className="line-clamp-1 flex-1 text-[15px] text-gray-800">
                          {o.name}
                        </p>
                      </Link>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-gray-400">
                          訂單編號 {o.id}
                        </p>
                        <p className="text-[16px] font-bold text-gray-800">
                          NT${(o.price * o.qty).toLocaleString()}
                        </p>
                      </div>
                      {o.status !== "進行中" && (
                        <Link
                          href={`/v3/orders/${o.id}`}
                          className="self-start rounded-full border border-brand px-4 py-1.5 text-[13px] font-semibold text-brand"
                        >
                          再買一次
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
