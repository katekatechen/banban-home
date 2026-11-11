// 拆禮物結果上的那張圖：商品照片加上噴出來的彩色碎片。
// 設計稿是一張 300×239.7 的圖，碎片是 22 片各自獨立的向量，位置照設計稿擺。
//
// burst 開著的時候，每一片會從禮物盒的位置飛到自己的定位：外層 div 負責飛行
// （translate + scale），裡面的 img 保留設計稿上原本的旋轉，兩者分開才不會打架。
//
// 分享卡用同一張圖，只是整張縮到 0.6，所以尺寸用 scale 參數控制，
// 不另外量一組座標。

const W = 300;
const H = 239.7;

type Piece = {
  src: string;
  l: number;
  t: number;
  w: number;
  h: number;
  // 從哪裡飛過來（相對自己定位的位移）
  dx: number;
  dy: number;
  tf?: string;
  blend?: "multiply" | "screen";
};

const PIECES: Piece[] = [
  { src: "c-ball-pink", l: 100.07, t: 73.99, w: 26.46, h: 26.46, dx: 36.7, dy: 62.78, blend: "multiply" },
  { src: "c-ball-brown-fill", l: 248.23, t: 98.26, w: 33.5, h: 33.5, dx: -114.98, dy: 34.99, tf: "rotate(79.04deg)" },
  { src: "c-ball-brown-shade", l: 252.07, t: 101.66, w: 31.72, h: 29.02, dx: -117.93, dy: 33.83, tf: "rotate(-43.12deg)", blend: "multiply" },
  { src: "c-ball-coral-base", l: 0.57, t: 15.04, w: 38.81, h: 38.81, dx: 130.02, dy: 115.56, tf: "rotate(31.61deg)" },
  { src: "c-ball-coral-hi", l: 4.74, t: 21.0, w: 14.46, h: 10.49, dx: 138.03, dy: 123.75, tf: "rotate(-31.78deg)", blend: "screen" },
  { src: "c-ball-coral-shade", l: 2.65, t: 20.23, w: 36.75, h: 33.62, dx: 128.97, dy: 112.96, blend: "multiply" },
  { src: "c-ball-tan-base", l: 87.09, t: 56.35, w: 25.98, h: 25.98, dx: 49.92, dy: 80.65, tf: "rotate(31.61deg)" },
  { src: "c-ball-tan-shade", l: 88.46, t: 59.83, w: 24.6, h: 22.51, dx: 49.24, dy: 78.92, blend: "multiply" },
  { src: "c-ball-green-base", l: 248.62, t: 22.2, w: 24.48, h: 24.48, dx: -110.87, dy: 115.56, tf: "rotate(31.61deg)" },
  { src: "c-ball-green-shade", l: 249.93, t: 25.48, w: 23.18, h: 21.21, dx: -111.52, dy: 113.92, blend: "multiply" },
  { src: "c-ball-green-hi", l: 255.83, t: 25.66, w: 6.08, h: 4.41, dx: -108.87, dy: 122.13, tf: "rotate(-17.79deg)", blend: "screen" },
  { src: "c-ball-teal-base", l: 25.99, t: 140.29, w: 20.71, h: 20.71, dx: 113.66, dy: -0.64, tf: "rotate(31.61deg)" },
  { src: "c-ball-teal-shade", l: 27.09, t: 143.05, w: 19.61, h: 17.94, dx: 113.11, dy: -2.02, blend: "multiply" },
  { src: "c-strip-1", l: 180.03, t: 35.16, w: 14.46, h: 25.57, dx: -37.26, dy: 102.06, tf: "rotate(-99.9deg) scaleY(-1)" },
  { src: "c-strip-2", l: 37.46, t: 112.73, w: 19.31, h: 6.58, dx: 102.89, dy: 33.98, tf: "rotate(-10.39deg) scaleY(-1)" },
  { src: "c-strip-3", l: 225.6, t: 25.35, w: 12.6, h: 6.61, dx: -81.9, dy: 121.35, tf: "rotate(-54.24deg) scaleY(-1)" },
  { src: "c-strip-4", l: 53.42, t: 82.21, w: 12.6, h: 6.61, dx: 90.28, dy: 64.49, tf: "rotate(-54.24deg) scaleY(-1)" },
  { src: "c-strip-5", l: 247.47, t: 79.26, w: 13.39, h: 10.85, dx: -104.17, dy: 65.31 },
  { src: "c-strip-6", l: 258.83, t: 180.99, w: 10.7, h: 14.33, dx: -114.18, dy: -38.15, tf: "rotate(123.01deg) scaleY(-1)" },
  { src: "c-strip-7", l: 115.61, t: 144.21, w: 12.22, h: 12.84, dx: 28.28, dy: -0.63, tf: "rotate(-145.87deg)", blend: "multiply" },
  { src: "c-strip-8", l: 109.61, t: 141.21, w: 12.22, h: 12.84, dx: 34.28, dy: 2.37, tf: "rotate(-145.87deg)" },
  { src: "c-strip-9", l: 10.32, t: 67.68, w: 12.6, h: 18.23, dx: 133.38, dy: 73.2, tf: "rotate(115.69deg) scaleY(-1)" },
];

export default function GiftResultImage({
  scale = 1,
  burst = false,
}: {
  scale?: number;
  burst?: boolean;
}) {
  return (
    <div
      style={{ width: W * scale, height: H * scale }}
      className="relative overflow-hidden"
    >
      <div
        style={{
          width: W,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        className="relative overflow-hidden"
      >
        {/* 商品照片：設計稿上比框大一圈並往左上偏，露出的是中間那一段 */}
        <img
          src="/v14/gift-result/product-card.png"
          alt=""
          style={{
            position: "absolute",
            left: -6.33,
            top: -32.4,
            width: 330.72,
            height: 264.25,
            maxWidth: "none",
          }}
        />
        {PIECES.map((p, i) => (
          <div
            key={p.src}
            style={{
              position: "absolute",
              left: p.l,
              top: p.t,
              width: p.w,
              height: p.h,
              // 疊加模式要放在這一層：下面的 img 被 transform 包住會自成堆疊脈絡，
              // multiply 就只會跟透明背景相乘，陰影會變成一塊灰色蓋在球上
              mixBlendMode: p.blend,
              ...(burst
                ? ({
                    ["--cfx" as string]: `${p.dx}px`,
                    ["--cfy" as string]: `${p.dy}px`,
                    animation: `giftConfettiBurst 620ms cubic-bezier(0.18,0.9,0.3,1) ${
                      60 + (i % 7) * 26
                    }ms both`,
                  } as React.CSSProperties)
                : null),
            }}
          >
            <img
              src={`/v14/gift-result/${p.src}.svg`}
              alt=""
              width={p.w}
              height={p.h}
              style={{
                display: "block",
                width: p.w,
                height: p.h,
                maxWidth: "none",
                transform: p.tf,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
