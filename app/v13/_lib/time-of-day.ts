// 首頁插圖跟著時間換底色：清晨、白天、黃昏、夜晚四個固定時段。
// demo 時不用等到晚上，網址加 ?time=dawn / day / dusk / night 就能直接切換
export type Period = "dawn" | "day" | "dusk" | "night";

export type SkyTheme = {
  // 天空（俯視下去其實是海）由上往下的漸層，[顏色, 位置%]
  sky: [string, number][];
  // 手機狀態列的底色，接天空最上緣
  top: string;
  // 前景、遠景雲的顏色（前景也是雲底下那片的底色）。雲一律以白色為主
  front: { fill: string };
  back: { fill: string };
  // 海面的影子濃度倍率：夜晚月光弱，影子淡一點
  shadow: number;
  // 夜晚的海面月光閃點、機翼的閃燈
  glints: boolean;
  // AIFIAN logo 跟桌機預覽的假狀態列要不要改白字（底色太深時）
  lightHeader: boolean;
};

export const SKY_THEMES: Record<Period, SkyTheme> = {
  dawn: {
    sky: [
      ["#86b3d6", 0],
      ["#b7c3dd", 50],
      ["#efcbbd", 100],
    ],
    top: "#86b3d6",
    front: { fill: "#ffffff" },
    back: { fill: "#f5dfda" },
    shadow: 0.8,
    glints: false,
    lightHeader: false,
  },
  day: {
    // 跟清晨一樣做出明顯的漸層：上面深一點的藍，往下變淺、帶一點暖白
    sky: [
      ["#4fa6d3", 0],
      ["#7fc3df", 50],
      ["#cdebee", 100],
    ],
    top: "#4fa6d3",
    front: { fill: "#ffffff" },
    back: { fill: "#d6ebf3" },
    shadow: 1,
    glints: false,
    lightHeader: false,
  },
  dusk: {
    sky: [
      ["#5b7bb5", 0],
      ["#8b84b8", 45],
      ["#e6a48c", 100],
    ],
    top: "#5b7bb5",
    front: { fill: "#ffffff" },
    back: { fill: "#f1d6cd" },
    shadow: 0.85,
    glints: false,
    lightHeader: false,
  },
  night: {
    // 上面最深，往下透出一點靛紫色的微光，像地平線那邊還有光
    sky: [
      ["#0a1631", 0],
      ["#1b3260", 50],
      ["#4a5d93", 100],
    ],
    top: "#0a1631",
    front: { fill: "#f2f5fa" },
    back: { fill: "#c3cde1" },
    shadow: 0.55,
    glints: true,
    lightHeader: true,
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
let known: { period: Period; hour: number } | null = null;

export const knownTime = () => known;

export function resolveTime() {
  if (known) return known;
  const now = new Date();
  let hour = now.getHours();
  const q = new URLSearchParams(window.location.search).get("time");
  let period = periodOfHour(hour);
  if (q && (PERIODS as string[]).includes(q)) {
    period = q as Period;
    // 用網址指定時段時，招呼語取該時段的代表時間
    hour = { dawn: 6, day: 12, dusk: 17, night: 21 }[period];
  }
  known = { period, hour };
  return known;
}
