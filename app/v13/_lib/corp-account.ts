"use client";

import { useSyncExternalStore } from "react";

// 法人帳戶（企業帳號）的假狀態：一個自然人最多對應一個企業帳號。
// 只做體驗，不接後端——狀態放在記憶體裡，切分頁、推頁都還在，重新整理就回到網址指定的情境。
//
// demo 用網址參數直接跳到某個情境（同一次開啟頁面只讀一次）：
//   ?corp=none（預設，還沒有企業帳號）| unverified | reviewing | rejected | verified
//   ?as=company   一開始就停在企業帳號（corp 不是 none 時才有效）
export type CorpStatus =
  | "none"
  | "unverified"
  | "reviewing"
  | "rejected"
  | "verified";
export type AccountMode = "personal" | "company";

type State = {
  corp: CorpStatus;
  mode: AccountMode;
  toast: { id: number; text: string } | null;
};

const STATUSES: CorpStatus[] = [
  "none",
  "unverified",
  "reviewing",
  "rejected",
  "verified",
];

const DEFAULT: State = { corp: "none", mode: "personal", toast: null };
let state: State = DEFAULT;
let initialized = false;
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function initCorpFromUrl() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const q = new URLSearchParams(window.location.search);
  const corp = q.get("corp") as CorpStatus | null;
  if (corp && STATUSES.includes(corp)) {
    set({
      corp,
      mode: corp !== "none" && q.get("as") === "company" ? "company" : "personal",
    });
  }
}

export function useCorp() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => DEFAULT,
  );
}

let toastTimer = 0;
export function showToast(text: string) {
  window.clearTimeout(toastTimer);
  set({ toast: { id: Date.now(), text } });
  toastTimer = window.setTimeout(() => set({ toast: null }), 2400);
}

export function switchMode(mode: AccountMode) {
  if (mode === state.mode) return;
  set({ mode });
  showToast(mode === "company" ? "已切換至企業帳號" : "已切換至個人帳號");
}

// 建立企業帳號：建立完直接切到企業帳號，驗證還沒完成
export function createCompany() {
  set({ corp: "unverified", mode: "company" });
  showToast("已建立企業帳號，切換至企業帳號");
}

// 點「企業驗證」模擬往下一個狀態走：未完成／需補件 → 送出審核 → 通過
export function advanceVerification() {
  if (state.corp === "unverified" || state.corp === "rejected") {
    set({ corp: "reviewing" });
    showToast("已送出企業驗證，審核約 1 至 3 個工作天");
  } else if (state.corp === "reviewing") {
    set({ corp: "verified" });
    showToast("企業驗證已通過");
  }
}

export const COMPANY_NAME = "範例科技股份有限公司";
export const PERSONAL_HANDLE = "Bella005_test";
