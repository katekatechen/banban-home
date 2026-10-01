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

  // 兌換頁「大家都在換」「猜你喜歡」的商品
  "power-bank-20w": {
    fullName: "20W PD 快充行動電源 10000mAh",
    overview:
      "10000mAh 容量大概可以幫手機充飽兩次，支援 20W PD 快充，30 分鐘就能把手機充到五成左右。機身跟一般手機差不多大，放包包或口袋都不佔空間。\n\n出門通勤、旅行都很實用，是用回饋兌換最多人選的 3C 配件之一。",
    specs: [
      { label: "容量", value: "10000mAh" },
      { label: "輸出功率", value: "最高 20W" },
      { label: "接口", value: "USB-C／USB-A" },
      { label: "重量", value: "約 210g" },
    ],
    highlights: [
      { title: "手機充兩次", sub: "容量" },
      { title: "30 分鐘充五成", sub: "快充" },
      { title: "通勤好帶", sub: "尺寸" },
    ],
    highlightSummary: "10000mAh・20W",
    reviewText:
      "網友多半提到充電速度穩定、外殼摸起來不會太燙，大小剛好可以跟手機疊在一起拿。也有人提醒要搭配支援 PD 的線材，才跑得到 20W。",
    reviewTags: ["Dcard", "PTT"],
  },
  "wailan-power-bank": {
    fullName: "威嵐隨行行動電源 5000mAh",
    overview:
      "5000mAh 的輕巧款，重量不到 120g，適合只需要臨時補一點電的時候。內建 USB-C 線，不用另外帶充電線。",
    specs: [
      { label: "容量", value: "5000mAh" },
      { label: "輸出功率", value: "最高 15W" },
      { label: "接口", value: "內建 USB-C 線" },
      { label: "重量", value: "約 115g" },
    ],
    highlights: [
      { title: "不到 120g", sub: "重量" },
      { title: "內建充電線", sub: "便利性" },
      { title: "臨時補電", sub: "適合情境" },
    ],
    highlightSummary: "5000mAh・內建線",
    reviewText: null,
    reviewTags: [],
  },
  "wailan-speaker": {
    fullName: "威嵐藍牙喇叭 防水攜帶款",
    overview:
      "手掌大小的藍牙喇叭，IPX7 防水，露營、浴室或戶外烤肉都能用。低音比同尺寸的喇叭飽滿，一次充飽可以連續播放約 12 小時。",
    specs: [
      { label: "防水等級", value: "IPX7" },
      { label: "續航", value: "約 12 小時" },
      { label: "藍牙", value: "5.3" },
      { label: "重量", value: "約 350g" },
    ],
    highlights: [
      { title: "IPX7 防水", sub: "耐用" },
      { title: "播放 12 小時", sub: "續航" },
      { title: "烤肉露營好用", sub: "適合情境" },
    ],
    highlightSummary: "IPX7・12 小時",
    reviewText: null,
    reviewTags: [],
  },
  "wailan-earbuds": {
    fullName: "威嵐旗艦款主動降噪藍牙耳機",
    overview:
      "主動降噪可以把捷運、飛機上的低頻噪音壓下來不少，通話時有環境音模式，不用拿下耳機也聽得到旁邊的人說話。單次續航約 8 小時，搭配充電盒可以撐一整週通勤。",
    specs: [
      { label: "降噪", value: "主動降噪 ANC" },
      { label: "續航", value: "耳機 8 小時／含充電盒 32 小時" },
      { label: "防水等級", value: "IPX4" },
      { label: "充電", value: "USB-C／無線充電" },
    ],
    highlights: [
      { title: "通勤降噪", sub: "降噪" },
      { title: "一週充一次", sub: "續航" },
      { title: "支援無線充", sub: "充電" },
    ],
    highlightSummary: "ANC・32 小時",
    reviewText:
      "不少人提到降噪效果在這個價位很有感，搭捷運時人聲跟車廂噪音都小很多。配戴舒適度評價不錯，長時間戴耳朵不太會痛；也有人覺得低音稍微偏重，可以用 App 調等化器。",
    reviewTags: ["Dcard", "Mobile01"],
  },
  "taiwan-tobacco-spicy-noodles": {
    fullName: "台酒麻辣乾拌麵 琴酒入麵 椒麻醇香 牛肉風味 4 入裝",
    overview:
      "這款是門前燴麵和台酒聯名推出的話題乾拌麵，最大特色是麵體加入了琴酒調味，煮熟後酒香會轉化成淡淡的植物系香氣，搭配椒麻醇香的牛肉風味醬料，吃起來麻、辣、香氣層次都比一般乾拌麵更豐富。\n\n包裝走沉穩的酒瓶質感設計，很適合喜歡喝酒、也喜歡重口味的人，當作辦公室團購或送禮的話題小物都很合適，聊開話匣子很有梗。",
    specs: [
      { label: "品牌", value: "門前燴麵 x 台酒" },
      { label: "風味", value: "椒麻牛肉風味" },
      { label: "特色", value: "琴酒入麵" },
      { label: "內容量", value: "4 包，淨重 130g／包" },
      { label: "辣度", value: "麻辣" },
    ],
    highlights: [
      { title: "琴酒入麵", sub: "特色" },
      { title: "麻辣夠味", sub: "風味" },
      { title: "送禮吸睛", sub: "話題性" },
    ],
    highlightSummary: "4入・琴酒入麵",
    reviewText: null,
    reviewTags: [],
  },
  "wailan-wireless-charger": {
    fullName: "威嵐 15W 無線充電盤",
    overview:
      "放上去就能充，支援 15W 無線快充，手機殼不超過 5mm 不用拆。底部有止滑墊，放床頭或辦公桌都很穩。",
    specs: [
      { label: "輸出功率", value: "最高 15W" },
      { label: "支援", value: "Qi 無線充電手機" },
      { label: "接口", value: "USB-C 輸入" },
      { label: "尺寸", value: "直徑約 10cm" },
    ],
    highlights: [
      { title: "放上去就充", sub: "便利性" },
      { title: "不用拆殼", sub: "相容性" },
      { title: "床頭桌面都穩", sub: "設計" },
    ],
    highlightSummary: "15W・Qi",
    reviewText: null,
    reviewTags: [],
  },
};
