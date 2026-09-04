import StatusBar from "../_components/StatusBar";
import {
  type Conversation,
  sortedByRecent,
  splitTitleIcon,
} from "../_lib/chat-storage";

type SidebarPanelProps = {
  conversations: Conversation[];
  activeId?: string;
  onOpenConversation: (id: string) => void;
  onNewChat: () => void;
  onAccount: () => void;
  onOrders: () => void;
  onBackToHome: () => void;
};

// 側邊欄現在是水平輪播的最左格，不再是覆蓋整頁的抽屜——
// 放對話紀錄、訂單紀錄跟帳號設定，其他功能入口收進「功能」那一格，不重複。
export default function SidebarPanel({
  conversations,
  activeId,
  onOpenConversation,
  onNewChat,
  onAccount,
  onOrders,
  onBackToHome,
}: SidebarPanelProps) {
  return (
    <div className="relative flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <img src="/icons/logo-aifian-mark.svg" alt="AIFIAN" className="h-11" />
        <button
          onClick={onBackToHome}
          title="回到伴伴"
          className="flex size-9 items-center justify-center rounded-full border border-gray-100 bg-gray-000 text-gray-800"
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
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col px-4">
        <button
          onClick={onNewChat}
          className="flex items-center gap-3 py-3 text-left"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-gray-800"
          >
            <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.3-3.6A7.96 7.96 0 0 1 4 12Z" />
            <path d="M12 9v6" />
            <path d="M9 12h6" />
          </svg>
          <p className="text-[16px] font-medium text-gray-800">開新對話</p>
        </button>

        <button
          onClick={onOrders}
          className="flex items-center gap-3 py-3 text-left"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-gray-800"
          >
            <path d="m21 8.5-9-4.5-9 4.5v7l9 4.5 9-4.5Z" />
            <path d="m3 8.5 9 4.5 9-4.5" />
            <path d="M12 13v7" />
          </svg>
          <p className="text-[16px] font-medium text-gray-800">訂單紀錄</p>
        </button>
      </div>

      <div className="no-scrollbar mt-1 flex-1 touch-pan-y overflow-y-auto px-4 pt-2">
        {conversations.length > 0 ? (
          <>
            <p className="px-1 pb-2 text-[13px] font-medium text-gray-400">
              最近
            </p>
            {sortedByRecent(conversations).map((c) => {
              const { icon, label } = splitTitleIcon(c.title);
              return (
                <button
                  key={c.id}
                  onClick={() => onOpenConversation(c.id)}
                  className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left ${
                    c.id === activeId ? "bg-gray-100" : "bg-gray-000"
                  }`}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[17px]">
                    {icon}
                  </div>
                  <p className="truncate text-[14px] font-medium text-gray-800">
                    {label}
                  </p>
                </button>
              );
            })}
          </>
        ) : (
          <p className="px-1 pt-6 text-center text-[13px] text-gray-400">
            還沒有對話紀錄
          </p>
        )}
      </div>

      <button
        onClick={onAccount}
        className="flex shrink-0 items-center gap-3 border-t border-gray-100 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 text-left"
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-[17px]">
          🧑
        </div>
        <p className="flex-1 text-[15px] font-medium text-gray-800">Ben</p>
        <img src="/icons/acc-settings.svg" alt="" className="size-5" />
      </button>
    </div>
  );
}
