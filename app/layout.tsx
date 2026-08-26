import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIFIAN 伴伴 Prototype",
  description: "AIFIAN 首頁改版 — 伴伴為主入口 prototype",
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
