import Link from "next/link";
import StatusBar from "../_components/StatusBar";
import {
  HOLDINGS,
  TOTAL_PORTFOLIO_VALUE,
  TOTAL_PORTFOLIO_CHANGE_PCT,
} from "../_lib/mock-data";

export default function CollectionPage() {
  return (
    <div className="flex flex-col bg-white">
      <StatusBar />
      <div className="flex items-center px-2 pb-2 pt-1">
        <Link
          href="/v6/wine-select"
          className="flex size-10 items-center justify-center text-[20px] text-gray-800"
        >
          ‹
        </Link>
        <p className="flex-1 text-center text-[17px] font-semibold text-gray-800">
          我的收藏
        </p>
        <div className="size-10" />
      </div>

      <div className="flex items-center justify-between bg-gray-000 px-4 py-4">
        <p className="text-[14px] text-gray-700">酒品總現值</p>
        <p className="text-[18px] font-bold text-gray-800">
          ${TOTAL_PORTFOLIO_VALUE.toLocaleString()}{" "}
          <span className="text-[14px] font-semibold text-emerald-600">
            (+{TOTAL_PORTFOLIO_CHANGE_PCT}%)
          </span>
        </p>
      </div>

      <div className="flex flex-col">
        {HOLDINGS.map((h) => (
          <Link
            key={h.id}
            href={`/v6/collection/${h.id}`}
            className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5"
          >
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[26px] ${h.gradient}`}
            >
              {h.emoji}
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-medium text-gray-800">
                {h.name}
              </p>
              <p className="text-[13px] text-gray-400">x{h.qty}</p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-semibold text-gray-800">
                ${h.currentValue.toLocaleString()}
              </p>
              <p className="text-[13px] text-emerald-600">+{h.changePct}%</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
