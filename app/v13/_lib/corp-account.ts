"use client";

import { useSyncExternalStore } from "react";

// 法人帳戶（企業帳號）的假狀態：一個自然人最多對應一個企業帳號。
// 只做體驗，不接後端——狀態放在記憶體裡，切分頁、推頁都還在，重新整理就回到網址指定的情境。
//
// 照 Figma「法人帳戶｜流程」：點「開始建立」先填表單，送出申請後才建立企業帳號，
// 所以沒有「建立了但還沒填完」的企業帳號；中途離開只是保留草稿，人留在個人帳號。
//
// demo 用網址參數直接跳到某個情境（同一次開啟頁面只讀一次）：
//   ?corp=none（預設，還沒有企業帳號）| reviewing | rejected | verified
//   ?as=company   一開始就停在企業帳號（corp 不是 none 時才有效）
//   ?switch=fail  切換帳號一律失敗，用來看失敗的 snackbar
export type CorpStatus = "none" | "reviewing" | "rejected" | "verified";
export type AccountMode = "personal" | "company";

// 申請表單的草稿：中途離開會留著，下次從「新增企業帳號」進來接續填
export type CorpDraft = {
  taxId: string;
  email: string;
  city: string;
  district: string;
  address: string;
  name: string;
  phone: string;
  otpSent: boolean;
  otp: string;
  passbook: boolean;
  backupPassbook: boolean;
};

export const EMPTY_DRAFT: CorpDraft = {
  taxId: "",
  email: "",
  city: "",
  district: "",
  address: "",
  name: "",
  phone: "",
  otpSent: false,
  otp: "",
  passbook: false,
  backupPassbook: false,
};

// 送出後的申請資料（申請已送出頁用）
export type CorpProfile = {
  taxId: string;
  address: string;
  email: string;
  contactName: string;
  contactPhone: string;
  backupPassbook: boolean;
};

// 用網址直接跳到審核中／已驗證時的預設資料
const DEMO_PROFILE: CorpProfile = {
  taxId: "24536806",
  address: "台北市信義區松仁路 100 號 10 樓",
  email: "finance@example.com",
  contactName: "張大同",
  contactPhone: "0912 345 678",
  backupPassbook: false,
};

type State = {
  corp: CorpStatus;
  mode: AccountMode;
  toast: { id: number; text: string } | null;
  draft: CorpDraft;
  profile: CorpProfile;
  switchFails: boolean;
};

const STATUSES: CorpStatus[] = ["none", "reviewing", "rejected", "verified"];

const DEFAULT: State = {
  corp: "none",
  mode: "personal",
  toast: null,
  draft: EMPTY_DRAFT,
  profile: DEMO_PROFILE,
  switchFails: false,
};
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
  const patch: Partial<State> = { switchFails: q.get("switch") === "fail" };
  if (corp && STATUSES.includes(corp)) {
    patch.corp = corp;
    patch.mode = corp !== "none" && q.get("as") === "company" ? "company" : "personal";
  }
  set(patch);
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

// 切換帳號：選單裡先顯示「切換中…」，成功或失敗都用頂部 snackbar 提醒。
// 失敗就停在原本的帳號，不另外開錯誤頁
export const SWITCH_DELAY_MS = 1000;
export function requestSwitch(mode: AccountMode): Promise<boolean> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (state.switchFails) {
        resolve(false);
        return;
      }
      set({ mode });
      resolve(true);
    }, SWITCH_DELAY_MS);
  });
}

export function updateDraft(patch: Partial<CorpDraft>) {
  set({ draft: { ...state.draft, ...patch } });
}

// 送出申請：這時候才建立企業帳號，直接進入審核中，並切到企業帳號
export function submitApplication() {
  const d = state.draft;
  set({
    corp: "reviewing",
    mode: "company",
    draft: EMPTY_DRAFT,
    profile: {
      taxId: d.taxId,
      address: `${d.city}${d.district}${d.address}`,
      email: d.email,
      contactName: d.name,
      contactPhone: d.phone,
      backupPassbook: d.backupPassbook,
    },
  });
}

// demo 捷徑：點「企業驗證」模擬審核結果往下一步走（需補件 → 審核中 → 通過）
export function advanceVerification() {
  if (state.corp === "rejected") {
    set({ corp: "reviewing" });
    showToast("已重新送出，審核約 1 至 3 個工作天");
  } else if (state.corp === "reviewing") {
    set({ corp: "verified" });
    showToast("企業驗證已通過");
  }
}

export const COMPANY_NAME = "範例科技股份有限公司";
export const PERSONAL_HANDLE = "Bella005_test";
// 管理者＝建立並操作企業帳號的人，姓名取自他個人帳號的身分驗證
export const MANAGER_NAME = "Bella Chen";
