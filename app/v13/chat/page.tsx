import ChatClient from "./ChatClient";

// 這裡刻意不包 Suspense：原本為了 useSearchParams() 包了
// <Suspense fallback={null}>，結果從首頁點進來時畫面會先整片空白
// 約 250ms（fallback 是 null），等內容備妥才開始從右邊滑進來——
// 白畫面才是使用者實際看到的主角，滑動反而看不出來。ChatClient 改成
// 在 effect 裡直接讀 window.location.search，不再觸發 Suspense，
// 頁面就能一掛載就跟著滑進來
export default function ChatPage() {
  return <ChatClient />;
}
