// 扁平向量版的滑翔翼：照圖檔 v13-home-plane-2.png 的輪廓描成幾塊多邊形
// （座標系跟圖檔一樣是 600×488，放進去位置、影子都不用改）。
// 不畫描邊，用深淺不同的紅分出受光面跟背光面，摺痕自然就出來了；
// 下面的骨架簡化成圓角粗線，跟扁平的雲同一個風格
const NOSE = "595 3";

// 兩套配色：red 是首頁原本的品牌紅；white 給「光暈版」首頁用，
// 白色機身疊在紅色光團上，跟開場畫面的白色 logo mark 一致
// 光暈版的白色滑翔翼外圍那圈光
export const GLIDER_GLOW: React.CSSProperties = {
  filter:
    "drop-shadow(0 0 6px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 18px rgba(255, 236, 228, 0.7))",
};

const TONES = {
  red: {
    frame: "#56769a",
    frameHi: "#86a6c4",
    leftWing: "#ff6355",
    fold: "#b8232a",
    keelLight: "#e73a33",
    keelDark: "#a01d25",
    rightWing: "#ff5f51",
    rightFold: "#f24a40",
  },
  white: {
    frame: "#ffffff",
    frameHi: "#ffffff",
    leftWing: "#ffffff",
    fold: "#e6dde3",
    keelLight: "#f6f2f5",
    keelDark: "#d9ccd4",
    rightWing: "#ffffff",
    rightFold: "#f5f1f4",
  },
};

export default function GliderSvg({
  className,
  tone = "red",
  frame = true,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
  tone?: keyof typeof TONES;
  // 要不要畫機翼下面的骨架（光暈版首頁不畫，只留機翼）
  frame?: boolean;
}) {
  const c = TONES[tone];
  return (
    <svg viewBox="0 0 600 488" className={className} style={style} aria-hidden>
      {/* 骨架：先畫，機翼會蓋住上半截。粗線加一道細的亮線，看起來是金屬管 */}
      {frame && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* 左邊斜桿往下、底桿斜過去，右邊直直往上接到右翼底下 */}
          <path
            d="M172 200 L154 300 Q150 318 166 328 L366 436 Q380 444 380 428 L380 360"
            stroke={c.frame}
            strokeWidth={22}
          />
          <path
            d="M172 200 L154 300 Q150 318 166 328 L366 436 Q380 444 380 428 L380 360"
            stroke={c.frameHi}
            strokeWidth={6}
          />
        </g>
      )}

      {/* 左翼：受光面 */}
      <path
        d={`M24 75 L${NOSE} L252 162 L198 236 Q186 243 172 233 L22 128 Q2 112 6 96 Q10 79 24 75 Z`}
        fill={c.leftWing}
      />
      {/* 左翼往下摺進去的那一面（缺口左邊） */}
      <path d={`M252 162 L198 236 L212 240 L262 182 Z`} fill={c.fold} />
      {/* 左翼下緣的厚度 */}
      <path
        d="M8 112 Q12 126 22 132 L172 236 Q187 246 200 239 L198 236 Q186 243 172 233 L22 128 Q10 121 8 112 Z"
        fill={c.fold}
      />
      {/* 中間的龍骨：左面中間色、右面背光最深 */}
      <path d={`M${NOSE} L252 162 L262 182 L291 288 Z`} fill={c.keelLight} />
      <path d={`M${NOSE} L291 288 L330 264 L346 248 Z`} fill={c.keelDark} />
      {/* 右翼：受光面 */}
      <path
        d={`M${NOSE} L346 248 L354 344 Q360 362 376 376 L486 470 Q500 484 520 485 L548 486 Q572 486 574 460 Z`}
        fill={c.rightWing}
      />
      {/* 右翼外側稍暗的一塊，分出摺痕 */}
      <path
        d={`M${NOSE} L430 330 L552 452 Q566 462 574 460 Z`}
        fill={c.rightFold}
      />
      {/* 右翼左緣的厚度 */}
      <path
        d="M346 248 L354 344 Q360 362 376 376 L486 470 Q470 472 458 463 L366 386 Q346 368 341 346 L336 258 Z"
        fill={c.fold}
      />
    </svg>
  );
}
