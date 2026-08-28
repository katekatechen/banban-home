"use client";

import { useDrawer } from "./DrawerContext";

export default function MenuButton({ className = "" }: { className?: string }) {
  const { openDrawer } = useDrawer();
  return (
    <button
      onClick={openDrawer}
      title="選單"
      className={`flex size-8 items-center justify-center ${className}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      >
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </svg>
    </button>
  );
}
