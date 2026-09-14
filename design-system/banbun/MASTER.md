# 伴伴設計方向 · MASTER

依 ui-ux-pro-max 的風格資料庫產生,但色票與字型改用專案既有的 AIFIAN 品牌設定,
沒有採用工具預設的通用 AI 紫色系(那是給沒有既有品牌的產品用的預設值)。

## 風格演進紀錄

1. **AI-Native UI + Minimalism & Swiss Style**（起點）：聊天室的打字動畫、對話
   氣泡、context card 本來就有這個風格的雛形。
2. **Bento Box Grid**（局部）：回饋頁「探索」分頁把匯率預測／智能雲會員併成
   並排兩格，跟智能選酒的大卡拉出層級差異。
3. **Neubrutalism / Bauhaus 粗框硬陰影**（試過，已整包改掉）：曾套在聊天室
   快速回覆按鈕和 Face ID 確認下單按鈕上，呼應「懂錢直男、帶傲嬌」的個性。
   後來使用者決定整個 v10 直接改成 Neumorphism，兩種風格沒辦法共存，
   這兩處已經改回 Neumorphism 的浮起／按壓效果，不再是粗框硬陰影。
4. **Neumorphism**：整個 v10 曾套用這個風格，見下方「Neumorphism 規格」（保留紀錄，
   目前已被下一步的 Glassmorphism 整包覆蓋，`.neu-*` class 已經不存在於程式碼裡，
   這節純粹留著給之後想比較「當時為什麼這樣選」用）。
5. **Glassmorphism**：整個 v10 曾套用這個風格，見下方「Glassmorphism 規格」
   （保留紀錄，`.glass-*` class 已經不存在於程式碼裡，被下一步的 Spatial UI
   整包覆蓋）。
6. **Spatial UI / VisionOS**：整個 v10 曾套用這個風格，見下方「Spatial UI 規格」
   （保留紀錄，`.spatial-*` class 已經不存在於程式碼裡，被下一步的 Flat Design
   整包覆蓋）。
7. **Flat Design**：整個 v10 曾套用這個風格，見下方「Flat Design 規格」
   （保留紀錄，`.flat-*` class 已經不存在於程式碼裡，被下一步的 iOS
   整包覆蓋）。
8. **iOS（現行原生介面語言，目前）**：使用者接著要求改成「ios 風格」，
   這裡解讀成現行 iOS（設定 App、原生列表那種質感），不是資料庫裡另外
   收錄的 2007-2012 舊 Skeuomorphism（擬皮革/玻璃鈕那個）。這個解讀沒有
   跟使用者確認過，如果其實想要的是懷舊擬真風，可以再說一聲改用
   Skeuomorphism 規格。`.flat-*` 已經整批改名成 `.ios-*` 並重寫規則。

## iOS（現行原生介面語言）規格

這個 app 從一開始就在模擬原生 iOS 外觀（`StatusBar` 組件、`pageIn`/`pageOut`
push 轉場動畫），前幾輪風格實驗都是在挑戰這層底下的「內容」怎麼做。這次算是
回頭讓內容跟外面的原生殼一致：

- `.ios-backdrop`：`#F2F2F7`，iOS 設定 App 那個標誌性的淺灰分組背景色
  （systemGroupedBackground）。
- `.ios-surface`（預設卡片/按鈕）：白底 + 0.5px 髮絲邊框（`--ios-separator:
  rgba(60,60,67,.29)`，抄 iOS 實際的 separator 語意色）+ 幾乎看不見的陰影，
  陰影只是用來定義邊界，不是用來做出「浮起」的視覺效果。
- `.ios-inset`（選中狀態）：不是變色，是白底 + 中等陰影浮出一塊，呼應
  `UISegmentedControl` 那顆會滑動的白色選取塊；淺灰底 + 中間浮出白色，
  是這次選中狀態的核心意象，跟前面幾版都不一樣。
- `.ios-accent`：品牌紅當作這個 App 自己的 tint color（很多第三方 iOS App
  本來就不用系統藍，用自己的品牌色），陰影非常淡。
- `.ios-pressable`：按下去是原生列表那種瞬間變暗一階(`rgba(60,60,67,.08)`
  疊上去)，不做位移、縮放、放大這些前幾版玩過的把戲。
- `ai-select` 那頁維持深色底，對應 iOS 深色模式的 secondarySystemBackground
  (`#1C1C1E`) / tertiarySystemBackground (`#2C2C2E`)，是這幾版裡第一次
  直接照著蘋果官方色票走，不是自己配的深色。
- 這版跟 Flat Design 一樣沒有對比度/效能疑慮，唯一算是新引入的技術細節是
  `.ios-inset` 用了比較明顯的陰影模擬 iOS 選取塊，其餘都是極淡陰影或髮絲邊框。

## Flat Design 規格（歷史紀錄，程式碼中已不存在）

跟前三版（Neumorphism／Glassmorphism／Spatial UI）比，這次是唯一一個完全相反
方向的風格：不用陰影、不用模糊、不用漸層暗示層次，純色色塊 + 細邊框分開就好。

- `.flat-backdrop`：純色 `#F4F1EE`，沒有漸層。
- `.flat-surface`（預設卡片/按鈕）：白底 + 1.5px 淺灰邊框，沒有陰影。
- `.flat-inset`（選中/凹陷狀態）：改用品牌色的淺色色塊 `#FFE4E2` + 品牌紅邊框，
  用純色差異取代陰影差異來表示「這個被選中了」。
- `.flat-accent`（品牌色 CTA）：純色紅底 + 紅邊框，沒有陰影也沒有漸層。
- `.flat-pressable`：按下去只做簡單的透明度變化(`opacity: 0.7`)，不做位移、
  縮放或陰影把戲，符合 Flat Design「simple hover: color/opacity shift」的規則。
- 順手把兩處殘留的裝飾性雙色漸層也拿掉了：`reward-marketplace` 頁面的
  「最新願望」卡片背景、「即將實現」兩張沒有真實圖片的卡片，原本用
  `bg-gradient-to-br` 做兩色漸層當佔位背景，現在都改成純色；`wine-select`
  頁面篩選列右側的漸層＋模糊淡出遮罩，也改成純色色塊。
- `ai-select` 那頁維持深色底，改用 `.flat-surface-dark` / `.flat-inset-dark`，
  一樣是純色 + 細邊框，沒有陰影/模糊。
- 這是目前為止對比度/效能最沒有疑慮的一版：純色 + 不透明卡片沒有任何前幾版
  玻璃感/柔和陰影帶來的對比度風險，也不需要 `backdrop-filter`，效能成本最低。
  之前建立的「次要文字至少用 gray-500」規則繼續適用，不用再額外調整。

## Spatial UI (VisionOS) 規格（歷史紀錄，程式碼中已不存在）

跟 Glassmorphism 比，這次刻意做的幾個調整：模糊拉到 40px+、飽和度更高
（材質更像懸浮的一片玻璃，不是磨砂窗）；圓角加大到 28px（`--spatial-radius`）；
陰影改成兩層（貼近的清楚 + 擴散更開的），做出「浮在畫面上方」的空間感；
按下去的回饋從「壓下去」改成「放大」（`scale(1.03)`），呼應規格書裡寫的
gaze-hover 放大互動，而不是觸控的按壓感。

- 背景 `.spatial-backdrop` 維持淺色（沒有真的做成 visionOS 那種把整個畫面包進
  暗色房間/環境的效果）：這個 app 有大量文字直接印在背景上、沒有包在玻璃面裡，
  真的整頁改暗會讓那些文字全部看不到，這是刻意的折衷，不是沒注意到。如果之後
  想要更接近真正 visionOS 的暗色空間感，需要另外把這些直接印在背景上的文字
  顏色從深灰改成淺色/白色，範圍會涉及每一頁的標題、標籤、時間戳記，目前沒做。
- `.spatial-surface`(浮起)／`.spatial-inset`(選中/凹陷)／`.spatial-accent`
  (品牌色 CTA)三種面都用更厚的 `backdrop-filter: blur() saturate()`。
- `ai-select` 那頁維持深色底，改用 `.spatial-surface-dark` / `.spatial-inset-dark`，
  同樣厚模糊、高飽和度，換成白色系低透明度。
- 已知取捨：跟 Glassmorphism 一樣的對比度/效能考量還在，加上更重的模糊
  (40-44px)比 Glassmorphism 的 16-20px 效能成本更高，這個 prototype 階段
  沒有測過真機效能，正式使用前建議先確認。

## Glassmorphism 規格（歷史紀錄，程式碼中已不存在）

- 每一頁的底改成 `.glass-backdrop`：暖橘→粉→淺紫的淺色漸層,刻意把整條漸層
  壓在淺色範圍(不用飽和的品牌紅去鋪滿整頁),因為畫面上很多標題文字是直接印在
  這層底色上、沒有包在玻璃卡片裡,漸層太深會讓那些文字對比度不夠。飽和的品牌紅
  留給 `.glass-accent` 這種自帶白字的實心玻璃鈕。
- 三種面都用 `backdrop-filter: blur() saturate()` 讓底下的漸層透出來：
  `.glass-surface`(半透明白,浮起的卡片/按鈕預設狀態)、`.glass-inset`
  (更不透明、加 inset 陰影,選中狀態/輸入框/已加入購物車)、`.glass-accent`
  (半透明品牌紅,主要 CTA)。這幾個 class 定義在 `app/globals.css` 最下面,
  一樣只有 v10 會用到,沒有動 v1~v9 共用的 token。
- `ai-select` 那頁維持深色底(`bg-gray-900`),改用對應的深色玻璃
  `.glass-surface-dark` / `.glass-inset-dark`(白色系低透明度貼在深色背景上,
  比較接近 iOS 深色玻璃的觀感)。
- 圓形/藥丸形的元件疊加 `.glass-round`；商品縮圖這種本身有自己漸層色的元素,
  用只給模糊陰影不給玻璃背景的 `.glass-shadow`。
- 已知取捨：Glassmorphism 的資料庫建議本身就寫「不適合對比度要求高的場景」,
  這裡刻意把玻璃面的不透明度調得比一般教學建議的 0.1~0.3 更高(0.32~0.55),
  換取文字可讀性,但半透明面疊在漸層上,對比度還是比純白底弱,尤其在漸層較深的
  區塊要另外留意；`backdrop-filter` 在低階裝置或某些瀏覽器也有效能成本，
  這個 prototype 階段沒有特別測過效能，如果要正式使用建議先確認目標裝置。

## Neumorphism 規格（歷史紀錄，程式碼中已不存在）

- 全站背景改成柔和暖灰 `--neu-bg: #EAE6E3`（帶一點品牌紅的暖色調），取代原本
  白底 + 模擬原生 iOS 的質感。
- 兩種面：`.neu-surface`（浮起，預設狀態／可點擊卡片）跟 `.neu-inset`
  （凹陷，選中狀態／輸入框／已加入購物車）；品牌色的主要 CTA 用 `.neu-accent`
  （紅底浮起）。這幾個 class 定義在 `app/globals.css` 最下面，只有 v10 會用到，
  刻意沒有動 v1~v9 共用的 `--background` / `--color-gray-*` 等 token。
- `ai-select` 那頁維持深色底，改用對應的 `.neu-surface-dark` / `.neu-inset-dark`。
- 為了避免 Neumorphism 常見的「陰影很柔和但文字看不清楚」問題，次要文字統一用
  `gray-500` 以上，沒有再擴大使用 `gray-300`／`gray-400`（這兩色對白底/淺灰底
  對比度只有約 1.5:1／2.6:1，遠低於 WCAG AA 的 4.5:1）。
- 圓形/藥丸形的元件另外疊加 `.neu-round`；商品縮圖這種本身有自己漸層色的元素，
  用只給陰影不給背景的 `.neu-shadow`。
- 已知取捨：Neumorphism 本身在無障礙的風險評級較高（低對比、邊界不明顯），
  這裡用「維持較深的文字色」換取一部分清晰度，但陰影本身的對比還是偏低，
  之後如果要正式使用，建議針對色弱／低視力使用情境再測一次。

## 色票（沿用 app/globals.css，不覆蓋）

| Token | 值 | 用途 |
|---|---|---|
| `--color-primary` (brand) | `#FF3B3B` | 主要 CTA、強調色 |
| `--color-primary-dark` | `#852A2A` | 強調色的深版 |
| `--background` | `#FFFFFF` | 頁面底色 |
| `--foreground` / `--color-gray-800` | `#1E2939` | 主要文字 |
| `--color-gray-000/100/300/400/500/700` | 見 globals.css | 次要文字／分隔線 |

> 上一輪 UI 檢視發現 `gray-300`／`gray-400` 對白底對比度過低（約 1.5:1／2.6:1），
> 套用這個方向時如果新增文字顏色，優先選 `gray-500` 以上，不要再擴大使用
> `gray-300`／`gray-400` 在有意義的文字上。

## 字型（沿用既有設定，不引入 Google Fonts）

`app/layout.tsx` 已經用系統字型堆疊模擬原生 iOS 觀感：
`"PingFang TC", "SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft JhengHei"`。
這個 prototype 的整體質感建立在「看起來像原生 App」，換成 Outfit / Work Sans
這類 Google Fonts 會破壞這個效果，因此不採用工具預設的字型建議。

## 動效

Standard tier（200-400ms，ease-out 系列），沿用現有 `pageIn`/`pageOut`/`homeApproach`
等 keyframes 的節奏即可，不需要更誇張的進場動畫。新增的 Bento 格子如果要做進場動畫，
用簡單的 fade + 8px 位移，並尊重 `prefers-reduced-motion`。

## 目前套用進度

- [x] `RewardsPanel.tsx`「探索」分頁：匯率預測／智能雲會員改成並排的 bento 兩格
- [x] 全站（layout／TopNav／TabBar／BackButton／BanbunPanel／RewardsPanel／
      AccountPanel／ChatClient／ProductSheet／ProductDetail／FaceIdOrderSheet／
      checkout／collection／orders／ai-select／rate-forecast／reward-history／
      reward-marketplace／wine-select）依序改過 Neumorphism → Glassmorphism →
      Spatial UI (VisionOS) → Flat Design → iOS（現行原生介面語言）
- [x] 順手修掉 `reward-marketplace` 頁面「中獎價 `{{ value }}`」沒代換的樣板字
- [x] Flat Design 那輪順手拿掉 `reward-marketplace`／`wine-select` 殘留的裝飾性
      雙色漸層跟一處 `backdrop-blur`，改成純色（見「Flat Design 規格」）
- [ ] 智能選酒／線上藏酒／匯率預測／智能雲會員的視覺層級持續觀察是否需要再調整
- [ ] AI-Native UI 的 context card 左側強調色條、串流文字逐字浮現（尚未動手）
- [ ] 「ios 風格」目前解讀成現行 iOS，還沒跟使用者確認是不是想要
      2007-2012 那種懷舊 Skeuomorphism（見上方 iOS 規格的說明）
