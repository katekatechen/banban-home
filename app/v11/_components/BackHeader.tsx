// 帳號／通知這兩頁共用的簡單頂列：返回鍵＋置中標題。
// 回饋頁的頂列還多了餘額跟探索/許願池分頁，結構差太多，另外寫，
// 不勉強套進同一個元件裡。
//
// 返回動作交給呼叫端決定（傳 onBack 進來），這裡不自己叫 router.back()——
// 頁面根節點的滑出動畫要先播完才能真的導頁，這段時序邏輯統一由
// usePageSlide() 管理，這個元件只負責畫按鈕本身
export default function BackHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="relative flex shrink-0 items-center justify-center px-4 pb-3 pt-3">
      <button
        onClick={onBack}
        aria-label="返回"
        className="absolute left-4 flex size-9 items-center justify-center rounded-full bg-gray-100"
      >
        <img src="/figma/nav-arrow-left.svg" alt="" className="size-5" />
      </button>
      <p className="text-[15px] font-semibold text-gray-900">{title}</p>
    </div>
  );
}
