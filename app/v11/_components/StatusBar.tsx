// 極簡狀態列：這版重點不在還原系統狀態列的每個像素，只是要在
// 標題正上方留出跟首頁一致的呼吸空間，四個頁面（首頁／回饋／帳號／通知）
// 共用同一份，之後要動版型只要改這裡
export default function StatusBar() {
  return (
    <div className="flex shrink-0 items-center px-6 pt-4 pb-1 text-[13px] font-semibold text-gray-800">
      <span>9:41</span>
    </div>
  );
}
