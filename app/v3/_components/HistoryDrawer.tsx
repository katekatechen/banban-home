import { type Conversation, sortedByRecent } from "../_lib/chat-storage";
import Icon from "./Icon";

type HistoryDrawerProps = {
  conversations: Conversation[];
  activeId?: string;
  onClose: () => void;
  onNewChat: () => void;
  onOpenConversation: (id: string) => void;
  onOrders: () => void;
  onWineSelect: () => void;
  onAiSelect: () => void;
  onExperience: () => void;
  onAccount: () => void;
};

const NAV_ITEMS = [
  { key: "wine", label: "精選酒品", icon: "/icons/tab-wine-select.svg" },
  { key: "ai", label: "智能選品", icon: "/icons/tab-ai-select.svg" },
  { key: "experience", label: "體驗", icon: "/icons/tab-experience.svg" },
  { key: "account", label: "帳號", icon: "/icons/tab-account.svg" },
] as const;

export default function HistoryDrawer({
  conversations,
  activeId,
  onClose,
  onNewChat,
  onOpenConversation,
  onOrders,
  onWineSelect,
  onAiSelect,
  onExperience,
  onAccount,
}: HistoryDrawerProps) {
  const NAV_HANDLERS: Record<(typeof NAV_ITEMS)[number]["key"], () => void> = {
    wine: onWineSelect,
    ai: onAiSelect,
    experience: onExperience,
    account: onAccount,
  };
  return (
    <div
      className="fixed inset-y-0 left-0 z-40 flex w-full flex-col bg-white p-4"
      style={{ animation: "drawerIn 0.26s cubic-bezier(.2,.9,.25,1) both" }}
    >
      <div className="flex items-center justify-end px-1 pb-3">
        <button
          onClick={onClose}
          title="關閉"
          className="flex size-9 items-center justify-center rounded-lg text-gray-800"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <button
        onClick={onNewChat}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-gray-800"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.167.094 10 10 0 1 0-4.845-4.821" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
        開新對話
      </button>

      <button
        onClick={onOrders}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium text-gray-800"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
          <path d="M12 22V12" />
          <polyline points="3.29 7 12 12 20.71 7" />
          <path d="m7.5 4.27 9 5.15" />
        </svg>
        訂單紀錄
      </button>

      {/* 原本 tab bar 上的功能，收進側邊欄 */}
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

      <div className="no-scrollbar mt-2 flex-1 overflow-y-auto border-t border-gray-100 pt-2">
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
    </div>
  );
}
