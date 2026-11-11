// 酒款細節頁的假資料：照 Figma「01 collection」的細節頁（node 19494:23489）。
// 目前只有進階盒的 11 支酒可以點進來看。產區、酒莊、品種、年份照酒名填；
// 評分照 Product Table 選品評分換成五顆星（滿分 25，每 5 分一顆）；
// 酒品特徵、風味、餐酒搭配、介紹是示意內容，正式資料要再跟選品確認。

export type FlavorKey = "roasted" | "oaky" | "maritime" | "freshFruit" | "coreFruit";
export type PairingKey = "duck" | "chicken" | "goose";

export type WineDetail = {
  nameEn: string;
  spec: string; // 容量 · 酒精濃度
  region: string;
  producer: string;
  grape: string;
  vintage: string;
  rating: number; // 1–5 顆星
  // 甜度、酸度、單寧、酒精、酒體，各 1–5
  profile: [number, number, number, number, number];
  flavors: FlavorKey[];
  pairings: PairingKey[];
  intro: string;
  tags: string[];
};

export const WINE_DETAILS: Record<string, WineDetail> = {
  "lafon-charmes": {
    nameEn: "Domaine des Comtes Lafon Meursault 1er Cru 'Les Charmes'",
    spec: "750ml · 13.5% alc/vol",
    region: "Côte de Beaune",
    producer: "Comtes Lafon",
    grape: "Chardonnay",
    vintage: "2012",
    rating: 4,
    profile: [1, 4, 1, 3, 4],
    flavors: ["coreFruit", "oaky", "roasted"],
    pairings: ["chicken", "goose"],
    intro:
      "拉菲昂伯爵是默索的指標名莊，「夏姆」是酒莊招牌一級園。2012 年份帶著成熟的核果與奶油烤堅果香，酸度明亮，陳年潛力好。",
    tags: ["名莊白酒", "適合收藏", "適合搭餐"],
  },
  "lignier-michelot": {
    nameEn: "Domaine Lignier-Michelot Clos de la Roche Grand Cru",
    spec: "750ml · 13.5% alc/vol",
    region: "Côte de Nuits",
    producer: "Lignier-Michelot",
    grape: "Pinot Noir",
    vintage: "2018",
    rating: 4,
    profile: [1, 4, 3, 3, 4],
    flavors: ["freshFruit", "oaky", "coreFruit"],
    pairings: ["duck", "goose"],
    intro:
      "莫雷-聖丹尼新世代酒莊，近年口碑快速上升。克洛德拉羅什特級園結構紮實，紅黑莓果香氣集中，單寧細緻。",
    tags: ["特級園", "適合收藏"],
  },
  "meo-cras": {
    nameEn: "Méo-Camuzet Chambolle-Musigny 1er Cru 'Les Cras'",
    spec: "750ml · 13% alc/vol",
    region: "Côte de Nuits",
    producer: "Méo-Camuzet",
    grape: "Pinot Noir",
    vintage: "2013",
    rating: 4,
    profile: [1, 4, 2, 3, 3],
    flavors: ["freshFruit", "coreFruit", "oaky"],
    pairings: ["duck", "chicken"],
    intro:
      "茂-卡慕澤是勃根地頂級名莊之一。香波-慕思尼以優雅著稱，「勒・克拉」一級園有細緻的紅色莓果與花香，口感柔順。",
    tags: ["名莊一級園", "適合搭餐"],
  },
  "lignier-csd": {
    nameEn: "Georges Lignier Clos-Saint-Denis Grand Cru",
    spec: "750ml · 13.5% alc/vol",
    region: "Côte de Nuits",
    producer: "Georges Lignier",
    grape: "Pinot Noir",
    vintage: "2019",
    rating: 3,
    profile: [1, 3, 3, 3, 4],
    flavors: ["coreFruit", "oaky", "roasted"],
    pairings: ["duck", "goose"],
    intro:
      "喬治·利尼葉被視為入手特級園的好選擇。聖丹尼特級園香氣飽滿，2019 是溫暖的好年份，果味成熟、架構完整。",
    tags: ["特級園", "高 CP 值"],
  },
  "drouhin-laroze": {
    nameEn: "Drouhin-Laroze Chambertin-Clos de Bèze Grand Cru",
    spec: "750ml · 13.5% alc/vol",
    region: "Côte de Nuits",
    producer: "Drouhin-Laroze",
    grape: "Pinot Noir",
    vintage: "2017",
    rating: 4,
    profile: [1, 3, 4, 3, 4],
    flavors: ["coreFruit", "oaky", "roasted"],
    pairings: ["duck", "goose"],
    intro:
      "香貝丹-貝茲是勃根地最受推崇的特級園之一。卓林-拉洛茲的版本黑色果實濃郁，帶香料與森林底層氣息，適合再放幾年。",
    tags: ["特級園", "適合收藏"],
  },
  "ponsot-corton": {
    nameEn: "Domaine Ponsot Corton 'Cuvée du Bourdon' Grand Cru",
    spec: "750ml · 13% alc/vol",
    region: "Côte de Beaune",
    producer: "Domaine Ponsot",
    grape: "Pinot Noir",
    vintage: "2009",
    rating: 4,
    profile: [1, 3, 4, 3, 4],
    flavors: ["roasted", "oaky", "coreFruit"],
    pairings: ["duck", "goose"],
    intro:
      "蓬索是藏家圈的指標名莊。「大黃蜂」科爾登特級園已經過十多年熟成，香氣轉向皮革、香料與熟果，正值適飲。",
    tags: ["特級園", "熟成老酒"],
  },
  "faiveley-cdv": {
    nameEn: "Domaine Faiveley Clos de Vougeot Grand Cru",
    spec: "750ml · 13.5% alc/vol",
    region: "Côte de Nuits",
    producer: "Domaine Faiveley",
    grape: "Pinot Noir",
    vintage: "2019",
    rating: 4,
    profile: [1, 3, 4, 3, 4],
    flavors: ["coreFruit", "oaky", "freshFruit"],
    pairings: ["duck", "chicken"],
    intro:
      "費維利是歷史悠久的大型名莊，武若園是旗艦特級園之一。2019 年份果味飽滿、單寧有力，酒評普遍給出高分。",
    tags: ["特級園", "名莊旗艦"],
  },
  "lamarche-ech": {
    nameEn: "François Lamarche Echezeaux Grand Cru",
    spec: "750ml · 13% alc/vol",
    region: "Côte de Nuits",
    producer: "François Lamarche",
    grape: "Pinot Noir",
    vintage: "2006",
    rating: 4,
    profile: [1, 3, 3, 3, 3],
    flavors: ["roasted", "coreFruit", "oaky"],
    pairings: ["duck", "goose"],
    intro:
      "拉馬許位在沃恩-羅曼尼，近年評價大幅提升。2006 艾雪索特級園經過熟成，香氣層次豐富，口感柔和圓潤。",
    tags: ["特級園", "熟成老酒"],
  },
  "balvenie-21": {
    nameEn: "The Balvenie PortWood 21",
    spec: "700ml · 40% alc/vol",
    region: "Speyside",
    producer: "The Balvenie",
    grape: "單一麥芽",
    vintage: "21 年",
    rating: 4,
    profile: [3, 1, 1, 4, 4],
    flavors: ["coreFruit", "roasted", "oaky"],
    pairings: ["duck", "goose"],
    intro:
      "百富的經典年份款，21 年熟成後再放進波特桶過桶。帶有葡萄乾、蜂蜜與堅果香，口感圓潤甜美，尾韻悠長。",
    tags: ["單一麥芽", "送禮首選"],
  },
  "lafon-volnay": {
    nameEn: "Domaine des Comtes Lafon Volnay 1er Cru 'Santenots-du-Milieu'",
    spec: "750ml · 13.5% alc/vol",
    region: "Côte de Beaune",
    producer: "Comtes Lafon",
    grape: "Pinot Noir",
    vintage: "2014",
    rating: 4,
    profile: [1, 4, 3, 3, 3],
    flavors: ["freshFruit", "coreFruit", "oaky"],
    pairings: ["chicken", "duck"],
    intro:
      "拉菲昂伯爵的紅酒旗艦，「中段桑特諾」被視為沃爾內的標竿一級園。紅色莓果香氣純淨，酸度清爽，搭餐很好發揮。",
    tags: ["名莊一級園", "適合搭餐"],
  },
  "lignier-riotte": {
    nameEn: "Hubert Lignier Morey-Saint-Denis 1er Cru 'La Riotte'",
    spec: "750ml · 13.5% alc/vol",
    region: "Côte de Nuits",
    producer: "Hubert Lignier",
    grape: "Pinot Noir",
    vintage: "2019",
    rating: 3,
    profile: [1, 3, 3, 3, 3],
    flavors: ["freshFruit", "coreFruit", "oaky"],
    pairings: ["chicken", "duck"],
    intro:
      "修伯特・利尼耶被視為內行人之選。「拉・里奧特」一級園在 2019 年份拿到高分，果香鮮明，單寧柔順，現在喝就很好。",
    tags: ["一級園", "適合搭餐"],
  },
};
