"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import StatusBar from "../../_components/StatusBar";
import { getOrder, type Order, type OrderStatus } from "../../_lib/orders";
import { ensureInCart } from "../../_lib/cart";

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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrder(getOrder(decodeURIComponent(params.id)) ?? null);
  }, [params.id]);

  if (order === null) notFound();
  if (order === undefined) {
    return (
      <div className="flex h-full flex-col bg-white">
        <StatusBar />
      </div>
    );
  }

  const subtotal = order.price * order.qty;

  const handleCopy = () => {
    navigator.clipboard?.writeText(order.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReorder = () => {
    ensureInCart({
      key: order.name,
      name: order.name,
      price: order.price,
      emoji: order.emoji,
      gradient: order.gradient,
      source: order.source,
    });
    router.push("/v2/checkout");
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <StatusBar />
        <div className="flex items-center px-2 pb-2 pt-1">
          <button
            onClick={() => router.back()}
            className="flex size-10 items-center justify-center text-[20px] text-gray-800"
          >
            ‹
          </button>
          <p className="flex-1 text-center text-[17px] font-semibold text-gray-800">
            訂單詳情
          </p>
          <div className="size-10" />
        </div>

        <div className="flex flex-col gap-1 px-4 pb-2 pt-2">
          <span
            className={`w-fit rounded-md px-2 py-1 text-[11px] font-semibold ${STATUS_STYLE[order.status]}`}
          >
            {order.status}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 pb-4 text-[13px] text-gray-400"
        >
          <span>{order.id}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span>·</span>
          <span>{formatDate(order.createdAt)}</span>
          {copied && <span className="text-emerald-600">已複製</span>}
        </button>

        <div className="px-4">
          <p className="pb-2 text-[15px] font-semibold text-gray-800">商品</p>
          <div className="flex gap-3 border-b border-gray-100 pb-4">
            <div
              className={`flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[26px] ${order.gradient}`}
            >
              {order.emoji}
            </div>
            <div className="flex flex-1 items-start justify-between gap-2">
              <div>
                <p className="text-[14px] leading-[1.4] text-gray-800">
                  {order.name}
                </p>
                <p className="mt-1 text-[13px] text-gray-400">
                  NT${order.price.toLocaleString()}
                </p>
              </div>
              <p className="shrink-0 text-[13px] text-gray-400">
                x{order.qty}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 py-4">
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>商品小計</span>
              <span className="text-gray-800">
                NT${subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>運費</span>
              <span className="text-gray-800">NT$0</span>
            </div>
            <div className="my-1 h-px bg-gray-100" />
            <div className="flex justify-between text-[15px] font-semibold text-gray-800">
              <span>總計</span>
              <span>NT${subtotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 py-4 text-[13px]">
            <InfoRow label="付款方式" value="信用卡" />
            <InfoRow label="卡號" value="**** 4242" />
            <InfoRow label="收件人" value="阿福" />
            <InfoRow label="電話" value="+886 912-345-678" />
            <InfoRow label="地址" value="台北市大安區羅斯福路三段 1 號" />
            <InfoRow label="Email" value="fu@example.com" />
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2">
        <button
          onClick={handleReorder}
          className="w-full rounded-full bg-brand py-3.5 text-[15px] font-semibold text-white"
        >
          請伴伴再買一次
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-gray-400">{label}</span>
      <span className="text-right text-gray-800">{value}</span>
    </div>
  );
}
