"use client";

import { useRouter } from "next/navigation";

const EXIT_DURATION_MS = 220;

export default function BackButton({ dark = false }: { dark?: boolean }) {
  const router = useRouter();

  const handleBack = () => {
    // 讓目前頁面往右滑出去，動畫播完才真的導航離開，呼應進來時的 pageIn 效果
    const pageRoot = document.querySelector<HTMLElement>("[data-page-root]");
    if (!pageRoot) {
      router.back();
      return;
    }
    pageRoot.style.animation = `pageOut ${EXIT_DURATION_MS}ms cubic-bezier(.4,0,1,1) forwards`;
    setTimeout(() => router.back(), EXIT_DURATION_MS);
  };

  return (
    <button
      onClick={handleBack}
      title="返回"
      className={`flex size-8 items-center justify-center ${dark ? "text-white" : "text-gray-800"}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}
