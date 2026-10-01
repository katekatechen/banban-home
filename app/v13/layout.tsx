import type { Viewport } from "next";

// 輸入框字級是 14px，iOS Safari 遇到小於 16px 的輸入框 focus 時會自動放大頁面，
// 設 maximumScale: 1 擋掉這個自動放大（iOS 10 之後使用者仍可手動雙指縮放）。
// 只放在 v13 layout，不影響其他版本；viewportFit 需重寫一次，因為 Next 會以這裡為準
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function V13Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#d9d5d2] sm:py-6">
      <div
        className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white sm:h-[900px] sm:rounded-[44px] sm:shadow-2xl"
        id="v13-frame"
        style={{ contain: "layout" }}
      >
        {children}
      </div>
    </div>
  );
}
