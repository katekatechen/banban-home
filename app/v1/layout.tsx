import TabBar from "./_components/TabBar";

export default function V1Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-300 sm:py-6">
      <div className="relative flex h-screen w-full max-w-[430px] flex-col overflow-hidden bg-white sm:h-[900px] sm:rounded-[44px] sm:shadow-2xl">
        <div className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden pb-[104px]">
          {children}
        </div>
        <TabBar />
      </div>
    </div>
  );
}
