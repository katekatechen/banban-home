// 首頁插圖的版本：sky 是天空＋雲＋紅色滑翔翼（預設）；
// glow 是延續開場畫面的光暈版：白底、紅色光團、白色滑翔翼，沒有雲。
// demo 時網址加 ?home=glow 切換；同一次開啟頁面只讀一次，切分頁回來還是同一版
export type HomeVariant = "sky" | "glow";

let known: HomeVariant | null = null;

export const knownHomeVariant = () => known;

export function resolveHomeVariant(): HomeVariant {
  if (known) return known;
  known =
    new URLSearchParams(window.location.search).get("home") === "glow"
      ? "glow"
      : "sky";
  return known;
}
