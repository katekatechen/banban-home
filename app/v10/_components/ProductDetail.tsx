"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusBar from "./StatusBar";
import { addOrder } from "../_lib/orders";

type HoldingInfo = {
  qty: number;
  avgCost: number;
  currentValue: number;
  changePct: number;
};

type ProductDetailProps = {
  name: string;
  subtitle: string;
  price: number;
  emoji: string;
  gradient: string;
  rating: number;
  lastUpdated: string;
  holding?: HoldingInfo;
  source: "線上藏酒" | "我的收藏";
};

export default function ProductDetail({
  name,
  subtitle,
  price,
  emoji,
  gradient,
  rating,
  lastUpdated,
  holding,
  source,
}: ProductDetailProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"status" | "info">("status");
  const [action, setAction] = useState<null | "bought" | "sold" | "redeemed">(
    null,
  );

  return (
    <div className="flex h-full flex-col ios-backdrop">
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="relative">
          <div
            className={`flex h-[320px] items-center justify-center bg-gradient-to-br text-[100px] ${gradient}`}
          >
            {emoji}
          </div>
          <div className="absolute inset-x-0 top-0">
            <StatusBar dark />
            <div className="flex items-center justify-between px-4 pt-1">
              <button
                onClick={() => router.back()}
                aria-label="返回"
                className="ios-surface ios-pressable ios-round flex size-10 items-center justify-center text-[18px] text-gray-800"
              >
                ‹
              </button>
              <button
                aria-label="播放語音介紹"
                className="ios-surface ios-pressable ios-round flex size-10 items-center justify-center text-[16px]"
              >
                🎧
              </button>
            </div>
          </div>
        </div>

      <div className="flex flex-col gap-3 px-4 pb-6 pt-5">
        <div>
          <p className="text-[20px] font-bold text-gray-800">{name}</p>
          <p className="mt-1 text-[13px] text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[22px] font-bold text-gray-800">
            ${price.toLocaleString()}
          </p>
          <p className="text-[12px] text-gray-500">最後更新：{lastUpdated}</p>
        </div>
        <div className="ios-surface inline-flex w-fit items-center gap-1 px-3 py-1.5">
          <span className="text-[12px] font-semibold text-brand">
            AIFIAN Rating
          </span>
          <span className="text-[13px] text-brand">
            {"★".repeat(rating)}
            {"☆".repeat(5 - rating)}
          </span>
        </div>

        {holding ? (
          <>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setTab("status")}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-shadow ${
                  tab === "status" ? "ios-inset text-brand" : "text-gray-500"
                }`}
              >
                持有狀態
              </button>
              <button
                onClick={() => setTab("info")}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-shadow ${
                  tab === "info" ? "ios-inset text-brand" : "text-gray-500"
                }`}
              >
                基本資訊
              </button>
            </div>

            {tab === "status" ? (
              <div className="ios-inset mt-2 grid grid-cols-2 gap-4 p-4">
                <Stat label="持有現值" value={`$${holding.currentValue.toLocaleString()}`} />
                <Stat
                  label="總變化"
                  value={`+$${Math.round(
                    holding.currentValue - holding.avgCost * holding.qty,
                  ).toLocaleString()} (+${holding.changePct}%)`}
                  positive
                />
                <Stat label="購入均價" value={`$${holding.avgCost.toFixed(2)}`} />
                <Stat label="持有瓶數" value={`${holding.qty}`} />
              </div>
            ) : (
              <div className="ios-inset mt-2 flex flex-col gap-2 p-4 text-[13px] text-gray-600">
                <p>容量／酒精濃度：{subtitle}</p>
                <p>存放狀態：AIFIAN 代管酒窖</p>
                <p>最後更新：{lastUpdated}</p>
              </div>
            )}
          </>
        ) : (
          <div className="ios-inset mt-2 flex flex-col gap-2 p-4 text-[13px] text-gray-600">
            <p>{subtitle}</p>
            <p>由伴伴精選，直接寄送到你手上，不會存放在 AIFIAN 裡面。</p>
          </div>
        )}

        {action && (
          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-gray-800 px-4 py-3 text-white">
            <span className="text-[18px]">
              {action === "bought" ? "📦" : action === "sold" ? "💵" : "🚚"}
            </span>
            <p className="text-[13px]">
              {action === "bought" &&
                (holding
                  ? "已加購，這瓶會存放在你的 AIFIAN 酒窖裡。"
                  : "已下單，會直接寄到你家，不會存放在 AIFIAN 裡面。")}
              {action === "sold" && "已送出賣出申請，款項將匯入你的帳戶。"}
              {action === "redeemed" && "已送出領回申請，會直接寄送到你家。"}
            </p>
          </div>
        )}
      </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 ios-backdrop px-4 pb-2 pt-3">
        {holding && (
          <>
            <button
              onClick={() => setAction("redeemed")}
              className="ios-surface ios-pressable flex flex-col items-center gap-0.5 px-4 py-2.5 text-gray-700"
            >
              <span className="text-[16px]">🚚</span>
              <span className="text-[11px]">領回</span>
            </button>
            <button
              onClick={() => setAction("sold")}
              className="ios-surface ios-pressable flex flex-1 flex-col items-center gap-0.5 px-4 py-2.5 text-brand"
            >
              <span className="text-[13px] font-semibold">賣出</span>
              <span className="text-[11px]">可賣出：{holding.qty} 瓶</span>
            </button>
          </>
        )}
        <button
          onClick={() => {
            setAction("bought");
            addOrder({ name, price, emoji, gradient, source });
          }}
          className="ios-accent ios-pressable flex flex-[1.4] flex-col items-center justify-center py-2.5 text-white"
        >
          <span className="text-[14px] font-semibold">買入</span>
          <span className="text-[11px] text-white/80">
            最新價：${price.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-[12px] text-gray-500">{label}</p>
      <p
        className={`mt-0.5 text-[15px] font-semibold ${
          positive ? "text-emerald-600" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
