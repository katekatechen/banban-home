// VectorField 跟 InputAirRing 共用的角度數學：兩個元件畫的都是「沒有方向性
// 的短線段」，同一套最短路徑內插／偽亂數雜訊只寫一次，兩邊都從這裡拿

// 線段本身沒有方向性（畫出來兩端對稱），所以角度只需要在半圈（π）裡取最短路徑
// 內插，不然 180° 附近會出現視覺上的「翻面」跳動
export const TAU_HALF = Math.PI;

export function lerpAngle(a: number, b: number, t: number, mod = TAU_HALF) {
  let diff = (b - a) % mod;
  if (diff > mod / 2) diff -= mod;
  if (diff < -mod / 2) diff += mod;
  return a + diff * t;
}

// 固定亂數種子，用來讓「思考中」的擾動每一顆看起來不一樣，但同一顆每次
// 跑到同一個 phase 時擾動方向要一致（不能每幀重抽亂數，會變成雪花雜訊）
export function seededNoise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
