"use client";

import { useSyncExternalStore } from "react";

// 第三方 AI 的揭露與同意。App Store Review Guideline 5.1.2(i) 在 2025-11-13
// 加了「including with third-party AI」：把個人資料送給第三方 AI 之前，
// 要在 App 裡講清楚，而且要拿到明確同意。隱私權政策裡寫過不算。
//
// 我們的供應商是 Google，所以畫面上一律指名 Google，不寫「第三方 AI 服務」。
//
// 這支檔案把 prototype 要切換的東西全部集中在這裡：供應商、什麼時候跳同意、
// 說明二要用哪一版、現在是同意還是沒同意、要模擬哪個錯誤。
// 右邊的控制面板跟網址參數改的都是這份狀態：
//   ?consent=unset|granted|declined|remote-off   同意狀態（預設 unset）
//   ?gate=send|enter                             什麼時候跳同意（預設 send）
//   ?scope=A|B                                   說明二用哪一版（預設 A）
//   ?relay=direct|server                         App 直接送還是經伺服器轉送（預設 direct）
//   ?fail=none|load|save                         模擬讀取／儲存失敗（預設 none）
//   ?provider=Google                             換供應商名稱

// unset 是還沒問過；declined 是按了「先不要」或在設定頁關掉；
// remote-off 是在其他裝置關掉，這台還不知道，送出訊息時才會被擋下來
export type ConsentState = "unset" | "granted" | "declined" | "remote_off";
// send：點輸入框或送出第一句話才跳同意（對話真的要發生之前）
// enter：一進聊天分頁就跳，使用者還沒做任何事
export type Gate = "send" | "enter";
// A：只送對話內容；B：連回饋與收藏的帳戶資料一起送
export type Scope = "A" | "B";
export type Relay = "direct" | "server";
export type Fail = "none" | "load" | "save";

// 同意記錄要帶文案版本號：文案改過之後，舊版同意不能直接沿用
export const CONSENT_COPY_VERSION = "2026-10-28.v1";

export const PROVIDER_OPTIONS = ["Google", "Google Inc.", "Alphabet Inc."];

export type ConsentVars = {
  consent: ConsentState;
  gate: Gate;
  scope: Scope;
  relay: Relay;
  fail: Fail;
  provider: string;
};

type State = ConsentVars & {
  // 讀取同意狀態失敗：讀不到就當作未同意，不能當作已同意放行
  loadFailed: boolean;
  // 已同意的時間與文案版本，示意同意記錄長什麼樣
  receipt: { at: string; version: string } | null;
};

const DEFAULT: State = {
  consent: "unset",
  gate: "send",
  scope: "A",
  relay: "direct",
  fail: "none",
  provider: "Google",
  loadFailed: false,
  receipt: null,
};

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
  const q = new URLSearchParams(window.location.search);
  const patch: Partial<State> = {};

  const c = q.get("consent");
  if (c === "granted") patch.consent = "granted";
  else if (c === "declined") patch.consent = "declined";
  else if (c === "remote-off" || c === "remote_off")
    patch.consent = "remote_off";
  else if (c === "unset") patch.consent = "unset";

  if (q.get("gate") === "enter") patch.gate = "enter";
  if (q.get("scope") === "B") patch.scope = "B";
  if (q.get("relay") === "server") patch.relay = "server";

  const f = q.get("fail");
  if (f === "load" || f === "save") patch.fail = f;
  if (patch.fail === "load") patch.loadFailed = true;

  const p = q.get("provider");
  if (p) patch.provider = p;

  if (patch.consent === "granted")
    patch.receipt = { at: "2026-10-28 09:12", version: CONSENT_COPY_VERSION };

  set(patch);
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

// 控制面板改變數：改同意狀態時連帶把同意記錄跟讀取失敗一起對齊
export function setVars(patch: Partial<ConsentVars>) {
  const next: Partial<State> = { ...patch };
  if (patch.fail !== undefined) next.loadFailed = patch.fail === "load";
  if (patch.consent !== undefined)
    next.receipt =
      patch.consent === "granted"
        ? { at: "2026-10-28 09:12", version: CONSENT_COPY_VERSION }
        : null;
  set(next);
}

// 按下「同意並開始」。模擬儲存失敗時回 false，呼叫端要留在 Sheet 上，
// 不關掉也不放行
export function grantConsent(): boolean {
  if (state.fail === "save") return false;
  set({
    consent: "granted",
    loadFailed: false,
    receipt: {
      at: "2026-10-28 09:12",
      version: CONSENT_COPY_VERSION,
    },
  });
  return true;
}

// 按下「先不要」
export function declineConsent() {
  set({ consent: "declined", receipt: null });
}

// 設定頁的開關
export function setConsentEnabled(on: boolean) {
  set({
    consent: on ? "granted" : "declined",
    loadFailed: false,
    receipt: on
      ? { at: "2026-10-28 09:12", version: CONSENT_COPY_VERSION }
      : null,
  });
}

// 讀取失敗後按「再試一次」：這次讀成功，回到未同意
export function retryLoadConsent() {
  set({ loadFailed: false, fail: "none" });
}

export const isConsented = (s: State) => s.consent === "granted" && !s.loadFailed;

// ───────── 文案 ─────────
// 三語都寫在 Sheet 規格裡，prototype 只放繁中

export const consentCopy = (s: State) => ({
  title: `你的對話會傳送給 ${s.provider}`,
  // 經後端轉送一樣要揭露，只是寫法不同
  what:
    s.relay === "server"
      ? `為了產生回覆，你在對話中輸入的文字會經由 AIFIAN 伺服器傳送給 ${s.provider} 處理。`
      : `為了產生回覆，你在對話中輸入的文字會傳送給 ${s.provider} 處理。`,
  // A 和 B 二選一，不要兩段都放。寫了卻傳了，比不寫更危險
  scope:
    s.scope === "A"
      ? "我們不會傳送你的姓名、手機號碼、銀行帳號或持有紀錄。"
      : "為了回答你的回饋與收藏問題，也會一併傳送相關的帳戶資料。我們不會傳送你的姓名、手機號碼或銀行帳號。",
  revoke: "你可以隨時到「帳號 > 偏好設定」關閉。關閉後就無法使用 AI 對話。",
  policy: "查看隱私權政策",
  // 按鈕上要有「同意」兩個字，這是審核員判斷是不是 explicit permission 的依據
  agree: "同意並開始",
  // 拒絕是有後果的，語氣不用「下次再說」那麼輕
  decline: "先不要",
});

export const emptyStateCopy = (s: State) => ({
  title: "AI 對話尚未開啟",
  sub: `同意把對話傳送給 ${s.provider} 後，就可以開始對話。`,
  cta: "查看並同意",
  placeholder: "同意後才能開始對話",
});

export const settingsCopy = (s: State) => ({
  title: "AI 對話資料使用",
  desc: `允許把對話內容傳送給 ${s.provider} 以產生回覆。`,
  offTitle: "關閉後就不能使用 AI 對話",
  offDesc: `你的對話內容不會再傳送給 ${s.provider}，AI 對話功能也會停用。已經存在的對話紀錄會保留。`,
  offConfirm: "關閉",
  offCancel: "取消",
  toastOff: "AI 對話已關閉",
  toastOn: "AI 對話已開啟",
});

export const errorCopy = {
  remoteOff: "AI 對話已在其他裝置關閉。重新開啟後才能繼續對話。",
  load: "無法載入設定，請再試一次。",
  save: "無法儲存你的選擇，請再試一次。",
};
