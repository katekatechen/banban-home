@AGENTS.md

# AIFIAN 首頁改版 — 伴伴為主入口

## 用中文回覆

與我互動時請一律使用繁體中文。程式碼註解、commit message、UI 文案也用繁體中文（變數/函式名仍用英文）。

## 專案目標

這是一個**只做體驗、不做功能**的 prototype 專案，用來驗證想法。

### 探索主題

測試「伴伴作為主要互動入口」這個資訊架構——使用者能否理解三大服務(酒/日用品/代繳)的存在、能否順利透過伴伴對話完成買酒/買日用品、以及「我的收藏」限縮為只能賣出/領回(不能再買入存放)的體驗是否清楚易懂。詳見 [AIFIAN 首頁改版 PRD](https://app.notion.com/p/3c662a5ef535814cad18dcd1497c3d53)。

（更詳細的脈絡請看 `spec/kickoff.md` 與 `spec/context.md`，會邊做邊補。）

### 方法學的試驗場

同時把這個專案當成方法學的試驗場，探索如何用 Claude Code 快速產出：

- **低保真**：純文字、ASCII、wireframe 風格，用來談流程
- **中保真**：灰階 UI、佔位圖，用來談資訊結構與互動
- **高保真**：接近真實視覺、有動效、可點擊跳轉，用來談感受
- **可互動 demo**：模擬資料、模擬延遲、模擬錯誤狀態，用來給人試用

每做一個版本，紀錄一下「怎麼跟 Claude Code 溝通比較順」、「哪一步省了時間 / 哪一步反而拖慢」。

## 不要做的事

- ❌ **不要實作真的後端功能**：沒有真的 auth、沒有真的 DB、沒有真的 API 串接
- ❌ **不要寫測試**：prototype 階段不需要 unit / e2e 測試
- ❌ **不要追求 production-ready**：不需要 error boundary、loading skeleton 完整度、a11y 全覆蓋（除非該議題本身就是要驗證的體驗）
- ❌ **不要過度抽象**：寧可幾個畫面複製貼上，也不要先建一套通用元件系統
- ❌ **不要做沒被要求的功能**：先確認再加

需要「假裝」有後端時，用 mock data + `setTimeout` 模擬延遲就好。

## 技術棧

- **Next.js 16**（App Router、Turbopack）— 注意 Next 16 與訓練資料有 breaking change，動到框架 API 前先看 `node_modules/next/dist/docs/`
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **部署**：Vercel（GitHub 連動或 `vercel` CLI）

## 專案結構

```
app/                 # App Router 頁面
  layout.tsx
  page.tsx           # 對外預設版本入口（re-export from v1-lofi）
  globals.css
  v1-lofi/           # v1 低保真
public/              # 靜態資源
spec/                # 規格與操作文件
```

每個 prototype 版本建議放在獨立路由下，例如 `app/v1-lofi/`、`app/v2-midfi/`，方便並列比較與保留歷史版本。換對外預設版本只要改 `app/page.tsx` 的 re-export 來源。

## 開發指令

```bash
npm run dev       # 本地開發（http://localhost:3000）
npm run build     # 正式建置
npm run lint      # ESLint
```

## 文件導引

- `spec/kickoff.md` — 啟動對齊文件，開工前對齊重要決策
- `spec/context.md` — 既有產品 / 母產品的設計稿、規格連結
- `spec/playbook.md` — Prototype 工作流的方法與節奏（多方向探索、跟 Claude 合作的時機、常踩的坑）
- `spec/deployment-and-versions.md` — 部署、改版本、回復版本的 runbook
- `spec/git-commands.md` — Git 指令字典
