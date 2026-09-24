import TabBar from "../_components/TabBar";

// 三個分頁（首頁／回饋／兌換）共用這層：TabBar 常駐在最上層、疊在
// 每個分頁自己的內容上面，切分頁時只是換路由本身，TabBar 不會跟著
// 重新掛載，也不會被 usePageSlide 的推頁滑動效果影響到
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      {children}
      <TabBar />
    </div>
  );
}
