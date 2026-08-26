"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusBar from "./StatusBar";

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
}: ProductDetailProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"status" | "info">("status");
  const [action, setAction] = useState<null | "bought" | "sold" | "redeemed">(
    null,
  );

  return (
    <div className="flex flex-col bg-white">
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
              className="flex size-9 items-center justify-center rounded-full bg-white/90 text-[18px] text-gray-800"
            >
              ‹
            </button>
            <button className="flex size-9 items-center justify-center rounded-full bg-white/90 text-[16px]">
              🎧
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-40 pt-5">
        <div>
          <p className="text-[20px] font-bold text-gray-800">{name}</p>
          <p className="mt-1 text-[13px] text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[22px] font-bold text-gray-800">
            ${price.toLocaleString()}
          </p>
          <p className="text-[12px] text-gray-400">最後更新：{lastUpdated}</p>
        </div>
        <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-brand px-3 py-1.5">
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
            <div className="mt-3 flex gap-6 border-b border-gray-100">
              <button
                onClick={() => setTab("status")}
                className={`pb-2.5 text-[14px] font-semibold ${
                  tab === "status"
                    ? "border-b-2 border-brand text-brand"
                    : "text-gray-400"
                }`}
              >
                持有狀態
              </button>
              <button
                onClick={() => setTab("info")}
                className={`pb-2.5 text-[14px] font-semibold ${
                  tab === "info"
                    ? "border-b-2 border-brand text-brand"
                    : "text-gray-400"
                }`}
              >
                基本資訊
              </button>
            </div>

            {tab === "status" ? (
              <div className="mt-2 grid grid-cols-2 gap-4 rounded-2xl bg-gray-000 p-4">
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
              <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-gray-000 p-4 text-[13px] text-gray-600">
                <p>容量／酒精濃度：{subtitle}</p>
                <p>存放狀態：AIFIAN 代管酒窖</p>
                <p>最後更新：{lastUpdated}</p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-gray-000 p-4 text-[13px] text-gray-600">
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

      <div className="fixed inset-x-0 bottom-[100px] mx-auto flex w-full max-w-[430px] items-center gap-2 bg-gradient-to-t from-white via-white px-4 pb-2 pt-4">
        {holding && (
          <>
            <button
              onClick={() => setAction("redeemed")}
              className="flex flex-col items-center gap-0.5 rounded-2xl border border-gray-300 px-4 py-2.5 text-gray-700"
            >
              <span className="text-[16px]">🚚</span>
              <span className="text-[11px]">領回</span>
            </button>
            <button
              onClick={() => setAction("sold")}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl border border-brand px-4 py-2.5 text-brand"
            >
              <span className="text-[13px] font-semibold">賣出</span>
              <span className="text-[11px]">可賣出：{holding.qty} 瓶</span>
            </button>
          </>
        )}
        <button
          onClick={() => setAction("bought")}
          className="flex flex-[1.4] flex-col items-center justify-center rounded-2xl bg-brand py-2.5 text-white"
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
