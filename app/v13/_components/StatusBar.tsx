// 極簡狀態列：這版重點不在還原系統狀態列的每個像素，只是要在
// 標題正上方留出跟首頁一致的呼吸空間，四個頁面（首頁／回饋／帳號／通知）
// 共用同一份，之後要動版型只要改這裡。
//
// 真的用手機瀏覽器打開時（< sm），瀏覽器本身上面就有一條真的狀態列
// （真時間、真電量），這裡再疊一個假的「9:41」只會變成兩條狀態列疊在
// 一起，很奇怪——所以假狀態列只在 sm 以上的桌機預覽（外面那圈手機外框
// 的情境）才顯示，用來撐出「這是一支手機」的錯覺。真手機底下改成留一段
// 安全區高度（避開瀏海/動態島），不留假時間文字。
//
// light：底色太深時（首頁的夜晚天空）假時間改成白字
export default function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <>
      <div className="h-[env(safe-area-inset-top)] shrink-0 sm:hidden" />
      <div
        className="hidden shrink-0 items-center px-6 pt-4 pb-1 text-[13px] font-semibold sm:flex"
        style={{
          color: light ? "#ffffff" : "var(--color-gray-800, #1e2939)",
          // 首頁送出時等雲推到頂端才換回深字
          transition: `color 300ms ease ${light ? 0 : 500}ms`,
        }}
      >
        <span>9:41</span>
      </div>
    </>
  );
}
