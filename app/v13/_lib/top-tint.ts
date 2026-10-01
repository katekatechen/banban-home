// 手機瀏覽器頂部狀態列的底色。一般的 Safari／Chrome 分頁裡，網頁畫不到狀態列
// 那一條，瀏覽器會拿 theme-color（舊版 iOS）或 html／body 的背景色
// （iOS 26 起改看這個）去塗。沒設的話就是預設白色，首頁插圖上方會多出一條白邊。
// 只在手機寬度（< sm）套用：桌機預覽外面有手機外框跟灰底，不能被改掉
export const HERO_TOP_TINT = "#b4c6d0";
const DEFAULT_TINT = "#ffffff";

export function setTopTint(color: string | null) {
  if (typeof window === "undefined") return;
  const mobile = window.matchMedia("(max-width: 639px)").matches;
  const value = mobile ? (color ?? DEFAULT_TINT) : "";
  document.documentElement.style.backgroundColor = value;
  document.body.style.backgroundColor = value;

  let meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = mobile ? (color ?? DEFAULT_TINT) : DEFAULT_TINT;
}
