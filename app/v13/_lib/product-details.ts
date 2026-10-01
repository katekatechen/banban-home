// 商品細節頁（點對話裡的商品卡打開）的假資料，版型跟文案照
// claude.ai/design「AIFIAN 伴伴」的商品 lightbox：概覽、規格、精選三點、大家怎麼說。
// 大師兄那筆直接沿用設計稿的內容跟實拍圖；其餘幾筆是照同一個格式補的示意資料

export type ProductDetail = {
  fullName: string;
  overview: string;
  specs: { label: string; value: string }[];
  highlights: { title: string; sub: string }[];
  highlightSummary?: string;
  // null 代表還沒有社群討論，細節頁會顯示「還沒人討論過」的空狀態
  reviewText: string | null;
  reviewTags: string[];
};

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  dashixiong: {
    fullName: "大師兄銷魂麵舖【台灣排隊名店】大師兄銷魂麻辣粗麵 4 入裝",
    overview:
      "大師兄銷魂麵舖的這款麻辣粗麵，將店裡大受歡迎的銷魂滋味，變成你在家也能輕鬆享受的快煮麵。它的麻辣醬料是精華所在，使用數十種天然中藥材、蔬果及辣椒，經過長達十小時的熬煮翻炒而成，每一滴都濃縮了豐富的香氣與風味。\n\n這款粗麵麵體厚實有嚼勁，能充分吸附麻辣醬汁，讓每一口都能品嚐到麻與辣在舌尖跳躍的層次感。不論是想解饞，或是想在家體驗排隊名店的美味，這款銷魂麻辣粗麵都是不錯的選擇。",
    specs: [
      { label: "產地", value: "台灣" },
      { label: "麵體", value: "粗麵" },
      { label: "內容量", value: "4 包／4 人份" },
      { label: "辣度", value: "麻辣" },
    ],
    highlights: [
      { title: "麻辣愛好者必試", sub: "風味" },
      { title: "免排隊享用名店美味", sub: "便利性" },
      { title: "送禮不失誤", sub: "送禮" },
    ],
    highlightSummary: "4入・粗麵",
    reviewText:
      "許多 Dcard 和 PTT 網友都提到，大師兄銷魂麻辣粗麵的辣度帶有後勁，麻辣交織的刺激感讓人非常享受，是愛吃辣的朋友必試的選擇。麵條口感 Q 彈有韌性，能完美抓住調味料的香氣，即使煮久一點也不易軟爛。辣油包的香氣被許多人稱讚，但建議第一次嘗試的人可以從少量開始添加，慢慢調整到自己喜歡的辣度。也有網友分享，加入溏心蛋或青菜一起搭配，能讓口感和味道更有層次感。",
    reviewTags: ["Dcard", "PTT"],
  },
  laotao: {
    fullName: "老饕乾拌麵 麻醬蒜香 4 入裝",
    overview:
      "麻醬蒜香口味走溫和路線，芝麻醬濃郁、蒜香明顯但不嗆，不吃辣的人也能放心吃。麵條是細扁麵，拌開後很快就能均勻沾上醬汁，煮好三分鐘就能上桌。\n\n如果家裡有人怕辣、有人愛辣，可以跟麻辣口味的一起買，一次照顧到不同口味。",
    specs: [
      { label: "產地", value: "台灣" },
      { label: "麵體", value: "細扁麵" },
      { label: "內容量", value: "4 包／4 人份" },
      { label: "辣度", value: "不辣" },
    ],
    highlights: [
      { title: "不吃辣也能吃", sub: "風味" },
      { title: "三分鐘上桌", sub: "便利性" },
      { title: "全家都能分", sub: "適合對象" },
    ],
    highlightSummary: "4入・細扁麵",
    reviewText:
      "網友多半提到麻醬味道濃、蒜香自然，口味比較溫和，適合當作宵夜或一個人吃的簡單一餐。也有人建議加一點醋或辣油，味道會更有變化。",
    reviewTags: ["Dcard"],
  },
  jinjiazhuang: {
    fullName: "金家莊 蒜辣拌麵 5 入裝",
    overview:
      "蒜辣口味主打大量蒜末加上微辣的辣油，香氣直接、蒜味很足，辣度落在大多數人都能接受的程度。寬麵條吃起來比較有口感，拌醬時不容易糊成一團。",
    specs: [
      { label: "產地", value: "台灣" },
      { label: "麵體", value: "寬麵" },
      { label: "內容量", value: "5 包／5 人份" },
      { label: "辣度", value: "小辣" },
    ],
    highlights: [
      { title: "蒜味控首選", sub: "風味" },
      { title: "寬麵有口感", sub: "麵體" },
      { title: "辣度好入口", sub: "辣度" },
    ],
    highlightSummary: "5入・寬麵",
    reviewText: null,
    reviewTags: [],
  },
  "macallan-12": {
    fullName: "麥卡倫 12 年雪莉桶 單一麥芽威士忌 700ml",
    overview:
      "麥卡倫 12 年雪莉桶是很多人入門單一麥芽威士忌的第一支，全程在雪莉酒桶中熟成，喝得到乾果、香草和淡淡的辛香料味，口感圓潤、尾韻偏甜。\n\n品牌辨識度高、包裝有質感，送長輩或商務送禮都很穩，是不容易出錯的選擇。",
    specs: [
      { label: "產地", value: "蘇格蘭" },
      { label: "年份", value: "12 年" },
      { label: "容量", value: "700ml" },
      { label: "酒精濃度", value: "40%" },
    ],
    highlights: [
      { title: "雪莉桶熟成", sub: "風味" },
      { title: "入門好上手", sub: "適合對象" },
      { title: "送禮有面子", sub: "送禮" },
    ],
    highlightSummary: "700ml・雪莉桶",
    reviewText:
      "PTT 威士忌版常把這支列為入門推薦，多數人提到雪莉桶的甜感明顯、酒精感不刺激，純飲或加一顆冰球都順口。也有人認為價格比同級酒款略高，主要是買品牌跟穩定度。",
    reviewTags: ["PTT", "Dcard"],
  },
  "louve-cortez": {
    fullName: "樂露芙 克羅茲-艾米塔吉紅酒 750ml",
    overview:
      "來自法國隆河北部的希哈紅酒，果香以黑莓、黑櫻桃為主，帶一點胡椒和煙燻感，單寧細緻、酒體中等，搭配烤肉或燉牛肉都很適合。",
    specs: [
      { label: "產地", value: "法國 隆河" },
      { label: "品種", value: "希哈" },
      { label: "容量", value: "750ml" },
      { label: "酒精濃度", value: "13.5%" },
    ],
    highlights: [
      { title: "搭烤肉很合", sub: "餐搭" },
      { title: "果香帶胡椒", sub: "風味" },
      { title: "酒體不厚重", sub: "口感" },
    ],
    highlightSummary: "750ml・希哈",
    reviewText: null,
    reviewTags: [],
  },
};
