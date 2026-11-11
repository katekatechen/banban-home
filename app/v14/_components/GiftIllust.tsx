// 我的禮物頁的兩張插圖，都是設計稿裡一片一片的向量拼出來的
// （禮物盒、緞帶、吊牌、雲、氣球），檔案放在 public/v14/gift 跟 public/v14/gift-empty。
//
// 每一片都用設計稿量到的絕對位置擺，尺寸直接用 SVG 自己的 width/height，
// 不做 100% 拉伸：這些向量帶描邊，被拉伸過就會歪掉、線條粗細也會跑掉。
// 座標是以 216×196 這個框的左上角為原點。

type Piece = {
  src: string;
  l: number;
  t: number;
  w: number;
  h: number;
  // 旋轉／翻轉，設計稿上本來就有的
  tf?: string;
  // 疊加模式 multiply：陰影那幾片靠它壓出顏色
  blend?: boolean;
};

function Pieces({ dir, pieces }: { dir: string; pieces: Piece[] }) {
  return (
    <>
      {pieces.map((p, i) => (
        <img
          key={`${p.src}-${i}`}
          src={`${dir}/${p.src}.svg`}
          alt=""
          width={p.w}
          height={p.h}
          style={{
            position: "absolute",
            left: p.l,
            top: p.t,
            width: p.w,
            height: p.h,
            maxWidth: "none",
            transform: p.tf,
            mixBlendMode: p.blend ? "multiply" : undefined,
          }}
        />
      ))}
    </>
  );
}

// 還有禮物沒拆：禮物盒掛著氣球從天上掉下來，底色是天空藍
const AIRDROP: Piece[] = [
  { src: "cloud-left", l: -40.45, t: 36.25, w: 101.929, h: 48.9622 },
  {
    src: "cloud-right",
    l: 127.65,
    t: 128.2,
    w: 89.6551,
    h: 39.5658,
    tf: "scaleX(-1)",
  },
  { src: "box-body", l: 63.48, t: 91.7, w: 91.3651, h: 73.009 },
  {
    src: "box-shade-1",
    l: 102.33,
    t: 105.22,
    w: 46.5154,
    h: 5.19983,
    blend: true,
  },
  { src: "box-line", l: 97.37, t: 111.36, w: 1.69655, h: 50.1684, blend: true },
  {
    src: "box-shade-2",
    l: 69.67,
    t: 101.77,
    w: 24.7498,
    h: 8.41152,
    blend: true,
  },
  {
    src: "box-shade-3",
    l: 65.48,
    t: 114.54,
    w: 87.5142,
    h: 11.5762,
    blend: true,
  },
  { src: "ribbon", l: 74.71, t: 65.96, w: 52.8657, h: 90.7807 },
  {
    src: "tag-back",
    l: 134.8,
    t: 117.99,
    w: 15.4268,
    h: 28.3382,
    tf: "rotate(-19.23deg)",
    blend: true,
  },
  {
    src: "tag-front",
    l: 137.14,
    t: 110.83,
    w: 17.5307,
    h: 30.4422,
    tf: "rotate(-19.23deg)",
  },
  {
    src: "tag-hole",
    l: 140.95,
    t: 121.29,
    w: 11.1921,
    h: 10.1265,
    tf: "rotate(-17.9deg)",
  },
  {
    src: "bow",
    l: 106.65,
    t: 97.0,
    w: 35.7713,
    h: 19.4358,
    tf: "rotate(180deg) scaleY(-1)",
  },
  {
    src: "box-logo",
    l: 104.04,
    t: 146.99,
    w: 29.0283,
    h: 8.51632,
    tf: "rotate(-7.07deg)",
  },
  { src: "balloon", l: 76.04, t: -44.49, w: 65.1692, h: 71.4704 },
  { src: "balloon-shade", l: 83.44, t: -30.12, w: 18.3499, h: 28.0078 },
  {
    src: "balloon-shade-2",
    l: 96.08,
    t: -10.28,
    w: 43.6949,
    h: 36.851,
    blend: true,
  },
  { src: "string", l: 73.76, t: 60.02, w: 71.3821, h: 3.14896, tf: "rotate(91.68deg)" },
];

// 沒有禮物了：盒子已經拆開躺在地上，沒有底色
const EMPTY: Piece[] = [
  { src: "ground", l: 60.52, t: 142.95, w: 88.8343, h: 19.741 },
  { src: "box-body", l: 64.05, t: 97.14, w: 79.8649, h: 61.4088 },
  {
    src: "box-shade-1",
    l: 97.99,
    t: 106.54,
    w: 40.659,
    h: 4.61831,
    blend: true,
  },
  { src: "box-line", l: 93.66, t: 111.89, w: 1.56229, h: 43.8456 },
  {
    src: "box-shade-2",
    l: 69.5,
    t: 103.53,
    w: 21.6723,
    h: 7.41996,
    blend: true,
  },
  { src: "ribbon", l: 34.0, t: 150.26, w: 47.4404, h: 8.57221 },
  {
    src: "tag-back",
    l: 161.93,
    t: 140.95,
    w: 8.76868,
    h: 24.6887,
    tf: "rotate(-121.58deg) skewX(-18.63deg) scaleY(0.95)",
    blend: true,
  },
  {
    src: "tag-front",
    l: 163.17,
    t: 136.57,
    w: 10.7687,
    h: 27.3632,
    tf: "rotate(-121.58deg) skewX(-18.63deg) scaleY(0.95)",
  },
  {
    src: "tag-hole",
    l: 165.56,
    t: 145.58,
    w: 6.49576,
    h: 8.66362,
    tf: "rotate(-119.69deg) skewX(-17.59deg) scaleY(0.95)",
  },
  {
    src: "bow",
    l: 131.43,
    t: 138.54,
    w: 22.4492,
    h: 32.2454,
    tf: "rotate(124.44deg) scaleY(-1)",
  },
  {
    src: "box-logo",
    l: 99.52,
    t: 143.01,
    w: 25.3221,
    h: 7.429,
    tf: "rotate(-7.07deg)",
  },
  { src: "lid-edge", l: 67.33, t: 95.5, w: 73.2982, h: 18.2161 },
  { src: "lid-line", l: 103.66, t: 98.56, w: 1.0, h: 11.388 },
  { src: "lid-left", l: 52.84, t: 102.84, w: 42.3554, h: 27.8865 },
  { src: "lid-right", l: 94.57, t: 105.01, w: 61.4205, h: 25.0977 },
];

// 氣球比框還高，會被框的圓角裁掉一截，設計稿上就是這樣
export function GiftAirdropIllust() {
  return (
    <div className="relative h-[196px] w-[216px] overflow-hidden rounded-[64px] bg-[#b3f2ff]">
      <Pieces dir="/v14/gift" pieces={AIRDROP} />
    </div>
  );
}

// 拆禮物的開場動畫用：只要禮物盒跟氣球，沒有底色也不裁切，
// 讓它可以放大浮在壓暗的畫面中間。雲朵在動畫裡自己飄，所以這裡不帶
export function GiftAirdropFloating({ scale = 1 }: { scale?: number }) {
  const gift = AIRDROP.filter((p) => !p.src.startsWith("cloud-"));
  return (
    <div
      className="relative"
      style={{
        width: 216 * scale,
        height: 196 * scale,
      }}
    >
      <div
        className="relative size-full"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 216, height: 196 }}
      >
        <Pieces dir="/v14/gift" pieces={gift} />
      </div>
    </div>
  );
}

export function GiftEmptyIllust() {
  return (
    <div className="relative h-[196px] w-[216px]">
      <Pieces dir="/v14/gift-empty" pieces={EMPTY} />
    </div>
  );
}
