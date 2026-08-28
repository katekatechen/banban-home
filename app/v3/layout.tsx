import AppShell from "./_components/AppShell";

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-300 sm:py-6">
      <div
        className="relative flex h-screen w-full max-w-[430px] flex-col overflow-hidden bg-white sm:h-[900px] sm:rounded-[44px] sm:shadow-2xl"
        style={{ contain: "layout" }}
      >
        {/* contain:layout 讓裡面任何 position:fixed 的元素（例如 HistoryDrawer）
            以這個手機外框當作定位邊界，而不是整個瀏覽器視窗 —
            桌面預覽時外框是置中的縮小版，不能讓 fixed 元素貼到瀏覽器邊緣 */}
        <AppShell>{children}</AppShell>
      </div>
    </div>
  );
}
