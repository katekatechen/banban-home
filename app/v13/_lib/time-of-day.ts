// 首頁插圖的四種配色：清晨、白天、黃昏、夜晚。
// 底色不跟著時間變，一律用白天；要看其他配色，網址加 ?time=dawn / day / dusk / night。
// 招呼語還是跟著使用者當下的時間換（早安、晚上好…）
export type Period = "dawn" | "day" | "dusk" | "night";

const PERIODS: Period[] = ["dawn", "day", "dusk", "night"];

const periodOfHour = (h: number): Period =>
  h >= 5 && h < 8
    ? "dawn"
    : h >= 8 && h < 16
      ? "day"
      : h >= 16 && h < 19
        ? "dusk"
        : "night";

// 招呼語分三段：早上 5 到 11 點、下午 11 到 18 點、晚上 18 到隔天 5 點
export function greetingOf(hour: number) {
  if (hour >= 5 && hour < 11) return "早安！今天想聊點什麼？";
  if (hour >= 11 && hour < 18) return "午安！今天想聊點什麼？";
  return "晚上好！想聊點什麼嗎？";
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
