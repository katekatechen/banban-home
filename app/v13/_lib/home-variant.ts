// 首頁插圖的版本：glow 是延續開場畫面的光暈版：滿版漸層、白色滑翔翼（預設）；
// sky 是天空漸層＋紅色滑翔翼。
// demo 時網址加 ?home=sky 切回天空版；同一次開啟頁面只讀一次，切分頁回來還是同一版
export type HomeVariant = "sky" | "glow";

let known: HomeVariant | null = null;

export const knownHomeVariant = () => known;

export function resolveHomeVariant(): HomeVariant {
  if (known) return known;
  known =
    new URLSearchParams(window.location.search).get("home") === "sky"
      ? "sky"
      : "glow";
  return known;
}
