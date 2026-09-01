import { type Conversation, sortedByRecent } from "../_lib/chat-storage";
import Icon from "./Icon";

type HistoryDrawerProps = {
  conversations: Conversation[];
  activeId?: string;
  onClose: () => void;
  onNewChat: () => void;
  onOpenConversation: (id: string) => void;
  onBanbun: () => void;
  onWineSelect: () => void;
  onAiSelect: () => void;
  onOrders: () => void;
  onAccount: () => void;
};

const NAV_ITEMS = [
  { key: "banbun", label: "伴伴", icon: "/icons/tab-banbun.svg" },
  { key: "ai", label: "智能選酒", icon: "/icons/tab-ai-select.svg" },
  { key: "wine", label: "線上藏酒", icon: "/icons/tab-wine-select.svg" },
  { key: "orders", label: "訂單紀錄", icon: "/icons/tab-experience.svg" },
] as const;

export default function HistoryDrawer({
  conversations,
  activeId,
  onClose,
  onNewChat,
  onOpenConversation,
  onBanbun,
  onWineSelect,
  onAiSelect,
  onOrders,
  onAccount,
}: HistoryDrawerProps) {
  const NAV_HANDLERS: Record<(typeof NAV_ITEMS)[number]["key"], () => void> = {
    banbun: onBanbun,
    ai: onAiSelect,
    wine: onWineSelect,
    orders: onOrders,
  };
  return (
    <div
      className="fixed inset-y-0 left-0 z-40 flex w-full flex-col bg-white p-4"
      style={{ animation: "drawerIn 0.26s cubic-bezier(.2,.9,.25,1) both" }}
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <img src="/icons/logo-aifian-mark.svg" alt="AIFIAN" className="h-11" />
        <button
          onClick={onClose}
          title="返回"
          className="flex size-9 items-center justify-center rounded-full border border-white/60 bg-white/30 text-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* v6 沒有 tab bar，常用功能的快速跳轉都收進這裡 */}
      <div className="mt-2 flex flex-col border-t border-gray-100 pt-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={NAV_HANDLERS[item.key]}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-gray-800"
          >
            <Icon src={item.icon} className="size-5" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar mt-3 flex-1 overflow-y-auto border-t border-gray-100 pt-2">
        {conversations.length > 0 && (
          <p className="px-3 pb-2 text-[12px] font-medium text-gray-400">
            最近
          </p>
        )}
        {sortedByRecent(conversations).map((c) => (
          <button
            key={c.id}
            onClick={() => onOpenConversation(c.id)}
            className={`block w-full truncate rounded-xl px-3 py-3 text-left text-[14px] ${
              c.id === activeId
                ? "bg-gray-100 font-medium text-gray-800"
                : "text-gray-700"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* 帳號頭像置底，點擊進帳號設定 */}
      <button
        onClick={onAccount}
        className="flex shrink-0 items-center gap-3 border-t border-gray-100 px-3 pb-1 pt-3 text-left"
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-[17px]">
          🧑
        </div>
        <p className="flex-1 text-[15px] font-medium text-gray-800">阿福</p>
        <img src="/icons/acc-settings.svg" alt="" className="size-5" />
      </button>

      {/* 開新對話改成浮動按鈕，固定在右下角 */}
      <button
        onClick={onNewChat}
        className="absolute bottom-[92px] right-4 flex items-center gap-2 rounded-full bg-gray-800 py-3 pl-4 pr-5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        開新對話
      </button>
    </div>
  );
}
