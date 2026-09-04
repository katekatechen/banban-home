"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
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
