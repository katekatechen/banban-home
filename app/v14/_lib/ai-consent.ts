"use client";

import { useSyncExternalStore } from "react";

// 第三方 AI 的揭露與同意。App Store Review Guideline 5.1.2(i) 在 2025-11-13
// 加了「including with third-party AI」：把個人資料送給第三方 AI 之前，
// 要在 App 裡講清楚，而且要拿到明確同意。隱私權政策裡寫過不算。
//
// 已經定案、不再切換的三件事，寫死在文案裡：
//   供應商是 Google，畫面上一律指名 Google，不寫「第三方 AI 服務」
//   App 直接送給 Google，不經 AIFIAN 伺服器轉送
//   只送對話內容，不送回饋與收藏的帳戶資料
//   同意的時機是點輸入框的當下，在第一句話送出之前
//
// prototype 只剩同意狀態要切換，控制面板跟網址參數改的都是它：
//   ?consent=unset|granted|declined|remote-off   預設 unset

// unset 是還沒問過；declined 是按了「先不要」或在設定頁關掉；
// remote-off 是在其他裝置關掉，這台還不知道，送出訊息時才會被擋下來
export type ConsentState = "unset" | "granted" | "declined" | "remote_off";

// 同意記錄要帶文案版本號：文案改過之後，舊版同意不能直接沿用
export const CONSENT_COPY_VERSION = "2026-10-28.v1";

export const PROVIDER = "Google";

// 示意同意記錄長什麼樣：什麼時候同意的，同意的是哪一版文案
const RECEIPT = { at: "2026-10-28 09:12", version: CONSENT_COPY_VERSION };

type State = {
  consent: ConsentState;
  receipt: typeof RECEIPT | null;
};

const DEFAULT: State = { consent: "unset", receipt: null };

let state: State = DEFAULT;
let initialized = false;
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function initConsentFromUrl() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const c = new URLSearchParams(window.location.search).get("consent");
  if (c === "granted") setConsentState("granted");
  else if (c === "declined") setConsentState("declined");
  else if (c === "remote-off" || c === "remote_off") setConsentState("remote_off");
}

export function useConsent() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => DEFAULT,
  );
}

export const readConsent = () => state;

// 改同意狀態時，同意記錄要一起對齊：沒同意就不會有記錄
export function setConsentState(consent: ConsentState) {
  set({ consent, receipt: consent === "granted" ? RECEIPT : null });
}

// 按下「同意並開始」
export const grantConsent = () => setConsentState("granted");

// 按下「先不要」
export const declineConsent = () => setConsentState("declined");

// 設定頁的開關
export const setConsentEnabled = (on: boolean) =>
  setConsentState(on ? "granted" : "declined");

export const isConsented = (s: State) => s.consent === "granted";

// ───────── 文案 ─────────
// 三語都寫在 Sheet 規格裡，prototype 只放繁中

export const consentCopy = {
  title: `你的對話會傳送給 ${PROVIDER}`,
  // 原本是三個列點（送什麼／不送什麼／怎麼關掉），改成一段話收篇幅：
  // 列點每一條都要獨立成行，加上條目之間的間距，整張 Sheet 會長到蓋掉半個畫面。
  // 三件事本來就有先後關係，連起來讀其實更順。
  //
  // 第二句寫了不送卻送了，比不寫更危險，要跟實際傳送的欄位對得起來。
  // 「關閉後就無法使用 AI 對話」這個後果移到偏好設定的關閉確認上講，
  // 在這裡講只是讓人在同意前先怕一次
  body: `為了產生回覆，你在對話中輸入的文字會傳送給 ${PROVIDER} 處理。我們不會送出你的姓名、手機號碼、銀行帳號或持有紀錄。你可以隨時到「帳號 > 偏好設定」關閉。`,
  policy: "查看隱私權政策",
  // 按鈕上要有「同意」兩個字，這是審核員判斷是不是 explicit permission 的依據
  agree: "同意並開始",
  // 拒絕是有後果的，語氣不用「下次再說」那麼輕
  decline: "先不要",
};

// 輸入列上方那條 alert 的文案。照 AFFOGATO alert（Mode=Light, cta=button）的
// 結構寫：標題講現在是什麼狀況，內文講後果，按鈕是唯一的出口。
//
// 兩段都壓在十個字以內。alert 只有一行的寬度，標題與內文各自折行之後，
// 右邊的按鈕會被擠成兩層高，整條就不像同一個元件了。
//
// 這裡刻意不重複揭露「傳送給 Google」。揭露的位置是 Sheet，那是真正要拿到
// 同意的地方；alert 只負責說明為什麼不能打字，以及怎麼回到 Sheet。
export const noticeCopy = {
  blocked: {
    title: "AI 對話尚未開啟",
    body: "同意後就能開始對話",
    action: "查看並同意",
  },
  remoteOff: {
    title: "AI 對話已關閉",
    body: "你在其他裝置關閉了",
    action: "重新開啟",
  },
};

// 沒同意時輸入框的 placeholder
export const inputPlaceholder = "同意後才能開始對話";

export const settingsCopy = {
  title: "AI 對話資料使用",
  desc: `允許把對話內容傳送給 ${PROVIDER} 以產生回覆。`,
  offTitle: "關閉後就不能使用 AI 對話",
  offDesc: `你的對話內容不會再傳送給 ${PROVIDER}，AI 對話功能也會停用。已經存在的對話紀錄會保留。`,
  offConfirm: "關閉",
  offCancel: "取消",
  toastOff: "AI 對話已關閉",
  toastOn: "AI 對話已開啟",
};
