"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "../_components/StatusBar";
import { getOrders, type Order } from "../_lib/orders";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  return (
    <div className="flex flex-col bg-white">
      <StatusBar />
      <div className="flex items-center px-2 pb-2 pt-1">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center text-[20px] text-gray-800"
        >
          ‹
        </button>
        <p className="flex-1 text-center text-[17px] font-semibold text-gray-800">
          我的訂單
        </p>
        <div className="size-10" />
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
        <div className="flex flex-col">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5"
            >
              <div
                className={`flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[26px] ${o.gradient}`}
              >
                {o.emoji}
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-medium text-gray-800">
                  {o.name}
                </p>
                <p className="text-[12px] text-gray-400">
                  {o.source} ·{" "}
                  {new Date(o.createdAt).toLocaleString("zh-TW", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-semibold text-gray-800">
                  ${o.price.toLocaleString()}
                </p>
                <p className="text-[12px] text-gray-500">已下單</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
