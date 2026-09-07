"use client";

import { useState } from "react";
import { type RecCard } from "../_lib/chat-storage";

type Stage = "idle" | "scanning" | "success";

type FaceIdOrderSheetProps = {
  card: RecCard;
  onClose: () => void;
  onConfirm: (finalTotal: number) => void;
};

// 手上可折抵的回饋，先寫死一個示意值（跟真的回饋餘額無關，純粹展示折抵這個步驟）
const AVAILABLE_REWARD = 100;

// 立即購買不再跳去結帳頁，直接在對話裡把明細看完＋一鍵刷臉下單，
// 呼應「伴伴幫你把事情辦完」而不是把使用者丟去另一個獨立流程
export default function FaceIdOrderSheet({
  card,
  onClose,
  onConfirm,
}: FaceIdOrderSheetProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [useReward, setUseReward] = useState(true);

  const qty = 1;
  const subtotal = card.price * qty;
  const redeemed = useReward ? Math.min(AVAILABLE_REWARD, subtotal) : 0;
  const total = subtotal - redeemed;

  const handleConfirm = () => {
    if (stage !== "idle") return;
    setStage("scanning");
    setTimeout(() => {
      setStage("success");
      setTimeout(() => onConfirm(total), 500);
    }, 1100);
  };

  return (
    <div
      onClick={stage === "idle" ? onClose : undefined}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full overflow-hidden rounded-t-[22px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5"
        style={{ animation: "sheetUp 0.3s cubic-bezier(.2,.9,.25,1)" }}
      >
        {stage === "idle" && (
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 flex size-9 items-center justify-center rounded-full bg-gray-000 text-gray-800"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}

        <p className="text-[18px] font-bold text-gray-800">確認訂單</p>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-000 p-3.5">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[22px] ${card.gradient}`}
          >
            {card.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[14px] leading-snug text-gray-800">
              {card.name}
            </p>
          </div>
          <p className="shrink-0 text-[13px] text-gray-500">數量 {qty}</p>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[14px]">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">金額</span>
            <span className="text-gray-800">${subtotal.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={() => setUseReward((v) => !v)}
            disabled={stage !== "idle"}
            className="flex items-center justify-between"
          >
            <span className="text-gray-500">使用回饋折抵</span>
            <span className="flex items-center gap-2">
              <span className={redeemed > 0 ? "text-brand" : "text-gray-400"}>
                {redeemed > 0 ? `-$${redeemed.toLocaleString()}` : "不使用"}
              </span>
              <span
                className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
                  useReward ? "bg-brand" : "bg-gray-300"
                }`}
              >
                <span
                  className={`size-4 rounded-full bg-white shadow-sm transition-transform ${
                    useReward ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </span>
            </span>
          </button>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">付款方式</span>
            <span className="flex items-center gap-1 text-gray-800">
              信用卡 •••• 4242
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="font-semibold text-gray-800">總計</span>
            <span className="text-[19px] font-bold text-gray-800">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={stage !== "idle"}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(255,59,59,0.32)] disabled:opacity-70"
        >
          {stage === "success" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={stage === "scanning" ? "animate-pulse" : ""}>
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              <path d="M9 10v1" />
              <path d="M15 10v1" />
              <path d="M9.5 15.5c1.5 1.2 3.5 1.2 5 0" />
            </svg>
          )}
          {stage === "idle" && "一鍵刷臉下單"}
          {stage === "scanning" && "驗證中…"}
          {stage === "success" && "驗證成功"}
        </button>
      </div>
    </div>
  );
}
