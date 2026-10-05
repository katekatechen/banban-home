// 首頁插圖的四種配色：清晨、白天、黃昏、夜晚。
// 底色不跟著時間變，一律用白天；要看其他配色，網址加 ?time=dawn / day / dusk / night。
// 招呼語還是跟著使用者當下的時間換（早安、晚上好…）
export type Period = "dawn" | "day" | "dusk" | "night";

export type SkyTheme = {
  // 天空（俯視下去其實是海）由上往下的漸層，[顏色, 位置%]
  sky: [string, number][];
  // 疊在天空漸層上面的一層（例如底部的圓弧光），沒有就不疊
  skyArc?: string;
  // 手機狀態列的底色，接天空最上緣
  top: string;
  // 前景、遠景雲的顏色（fill，也是雲底下那片的底色）跟右下月牙陰影的顏色（shade）。
  // 雲一律以白色為主，陰影帶一點該時段的色調
  front: { fill: string; shade: string };
  back: { fill: string; shade: string };
  // 海面的影子濃度倍率：夜晚月光弱，影子淡一點
  shadow: number;
  // 夜晚的海面月光閃點、機翼的閃燈
  glints: boolean;
  // AIFIAN logo 跟桌機預覽的假狀態列要不要改白字（底色太深時）
  lightHeader: boolean;
  // 地平線附近品牌色暖光的顏色：[中心, 半途]，延續開場畫面的光團
  warmGlow: [string, string];
  // 招呼語要不要用深色字（天空很淺的時段，白字會看不清楚）
  darkGreeting: boolean;
};

export const SKY_THEMES: Record<Period, SkyTheme> = {
  dawn: {
    sky: [
      ["#86b3d6", 0],
      ["#b7c3dd", 50],
      ["#efcbbd", 100],
    ],
    top: "#86b3d6",
    front: { fill: "#ffffff", shade: "#f6e1da" },
    back: { fill: "#fdf4f1", shade: "#efd6d0" },
    shadow: 0.8,
    glints: false,
    lightHeader: false,
    warmGlow: ["rgba(255, 48, 48, 0.32)", "rgba(255, 140, 90, 0.16)"],
    darkGreeting: false,
  },
  day: {
    // 照 Figma 1017:3714：上面白，往下漸漸變成天藍
    sky: [
      ["#ffffff", 8.17],
      ["#addef4", 62.5],
      ["#9ad0f1", 100],
    ],
    // 最底下的粉紅色（Figma #fddbdc）做成從畫面底部中間鼓起來的圓弧，不是一條橫的色帶
    skyArc:
      "radial-gradient(ellipse 120% 26% at 50% 100%, #fddbdc 0%, rgba(253, 219, 220, 0.9) 40%, rgba(253, 219, 220, 0) 100%)",
    top: "#ffffff",
    front: { fill: "#ffffff", shade: "#d9eef5" },
    back: { fill: "#f4fafc", shade: "#cfe7ef" },
    shadow: 1,
    glints: false,
    lightHeader: false,
    warmGlow: ["rgba(255, 48, 48, 0.16)", "rgba(255, 120, 90, 0.07)"],
    darkGreeting: true,
  },
  dusk: {
    sky: [
      ["#5b7bb5", 0],
      ["#8b84b8", 45],
      ["#e6a48c", 100],
    ],
    top: "#5b7bb5",
    front: { fill: "#ffffff", shade: "#f4d9cc" },
    back: { fill: "#fcefe9", shade: "#ecccc1" },
    shadow: 0.85,
    glints: false,
    lightHeader: false,
    warmGlow: ["rgba(255, 48, 48, 0.42)", "rgba(255, 110, 80, 0.2)"],
    darkGreeting: false,
  },
  night: {
    // 上面最深，往下透出一點靛紫色的微光，像地平線那邊還有光
    sky: [
      ["#0a1631", 0],
      ["#1b3260", 50],
      ["#4a5d93", 100],
    ],
    top: "#0a1631",
    front: { fill: "#f2f5fa", shade: "#c9d3e6" },
    back: { fill: "#dfe5f0", shade: "#b3bfd6" },
    shadow: 0.55,
    glints: true,
    lightHeader: true,
    warmGlow: ["rgba(255, 48, 48, 0.22)", "rgba(200, 40, 90, 0.1)"],
    darkGreeting: false,
  },
};

const PERIODS: Period[] = ["dawn", "day", "dusk", "night"];

const periodOfHour = (h: number): Period =>
  h >= 5 && h < 8
    ? "dawn"
    : h >= 8 && h < 16
      ? "day"
      : h >= 16 && h < 19
        ? "dusk"
        : "night";

// 招呼語跟著時段換；深夜（0 到 5 點）多一句「還沒睡嗎」
export function greetingOf(period: Period, hour: number) {
  if (period === "dawn") return "早安，今天想聊點什麼？";
  if (period === "dusk") return "傍晚了，今天想聊點什麼？";
  if (period === "night")
    return hour < 5 ? "還沒睡嗎？想聊點什麼？" : "晚上好，今天想聊點什麼？";
  return "嗨，今天想聊點什麼？";
}

// 同一次開啟頁面只算一次：切去其他分頁再回來，網址上的 ?time= 已經不在了，
// 還是沿用第一次算出來的時段
let known: { period: Period; greet: Period; hour: number } | null = null;

export const knownTime = () => known;

export function resolveTime() {
  if (known) return known;
  let hour = new Date().getHours();
  // 招呼語用的時段：跟著當下時間
  let greet = periodOfHour(hour);
  // 底色用的時段：預設白天，網址指定時才換
  let period: Period = "day";
  const q = new URLSearchParams(window.location.search).get("time");
  if (q && (PERIODS as string[]).includes(q)) {
    period = q as Period;
    greet = period;
    // 用網址指定時段時，招呼語取該時段的代表時間
    hour = { dawn: 6, day: 12, dusk: 17, night: 21 }[period];
  }
  known = { period, greet, hour };
  return known;
}
