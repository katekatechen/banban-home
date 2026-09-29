import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIFIAN 伴伴 Prototype",
  description: "AIFIAN 首頁改版 — 伴伴為主入口 prototype",
};

// viewportFit: "cover" 讓瀏覽器願意回報 env(safe-area-inset-*)，
// 不加這個 CSS 裡讀到的安全區高度永遠是 0——v12 的 StatusBar
// 在真手機上要用這個值留出瀏海/動態島的安全間距，這裡才生效
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col bg-gray-100"
        style={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ["--font-app-sans" as any]:
            '"PingFang TC", "SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
