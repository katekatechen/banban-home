# Prototype 工作流 Playbook

跟 Claude Code 一起跑 prototype 探索的實作筆記。重點放在**方法**——什麼時候做什麼、怎麼讓多方向探索不互相打架、哪些坑會在第二次踩到。

具體指令查 `git-commands.md`、操作流程查 `deployment-and-versions.md`，這份只談**節奏與心智模型**。

---

## 1. 三個獨立的維度，不要混在一起

prototype 探索常同時在動三個東西：

| 維度 | 例 | 怎麼承接 |
|---|---|---|
| **保真度** | lo-fi → mid-fi → hi-fi | 不同 `app/v<N>-<fidelity>/` 路由 |
| **方向 / 假設** | 標準 SaaS 登入 vs AI 主導登入 | 不同 git branch（`explore/...-A`、`explore/...-B`） |
| **版本里程碑** | baseline → v1 完成 → v2 完成 | git tag |

**搞混的代價**：你會在一條 branch 上同時改保真度跟方向，最後說不清楚這個 preview URL 是在驗證什麼。

**簡單規則**：

- 一條 branch ＝ 一個假設 / 一個方向。**不要在同一條 branch 上同時試兩個方向**
- 一個 `app/v<N>-...` 資料夾 ＝ 一個保真度。**做新保真度開新資料夾，不要原地翻新舊的**
- 完成一個有意義的狀態就打 tag，名字要能讓未來的你看懂（不要 `v1`、用 `v1-lofi-r1` / `demo-2026-XX`）

---

## 2. 目錄結構與部署的對應

```
app/page.tsx                 ← 對外預設版本入口（一行 re-export 換版本）
app/v1-lofi/                 ← 版本 1：低保真
app/v2-midfi/                ← 版本 2：中保真
...
```

加上 git branch 的搭配：

| 我想⋯ | 怎麼做 |
|---|---|
| 對外只給一個版本，悄悄做下個版本 | 新版本資料夾在 main 上同時存在，但 `app/page.tsx` 還指舊版；做完就改 re-export |
| 同一個版本資料夾，試 A/B 兩條方向 | 開兩條 branch，各自改該資料夾，得到兩個 preview URL 比較 |
| 永遠保留某個歷史狀態 | 打 git tag，main 怎麼跑都不會弄丟 |
| 給人試用穩定版 | production URL（main） |
| 給人試用實驗版 | 該 branch 的 preview URL |

部署一定遵守：**main = 對外、其他 branch = 對內 / 嘗試**。main 不要直接 push（用 PR），這條規則救過自己很多次。

---

## 3. 一輪探索的節奏

每個方向走這四步：

### Step 1: 寫 spec（5–10 分鐘）

開新檔案 `spec/version<X>.md`，寫清楚：

- **想驗證的問題**：跑完這版你會回答什麼？
- **跟前一版的差別表**：哪些變、哪些保留
- **要新增 / 修改的畫面**
- **不在這版範圍**

**不寫 spec 的代價**：跑到一半會發現「咦這個改動屬於這版嗎」，然後 scope creep，然後 branch 變成什麼都改的大雜燴。

### Step 2: 開 branch + 實作

```bash
git checkout main && git checkout -b explore/v<N>-<X>
# 跟 Claude 一起做
```

實作過程把 spec 當對齊文件用——每加一個東西先問「這在 spec 裡嗎」。

### Step 3: Push 拿 preview URL

```bash
git add . && git commit -m "..."
git push -u origin explore/v<N>-<X>
```

Vercel 自動產 preview URL。**用這個 URL 給人試用 / 自己對比**，不是給你的 localhost。

### Step 4: 決定

三條路：

- **合進 main**：開 PR、merge → 變成對外或下個 baseline
- **保留不合**：branch 留著當「保留方案」，preview URL 也還在
- **放棄**：branch 不刪也沒關係（GitHub 會自動歸到 stale）

不要急著合。**多開幾條 branch 並排**，看完才決定哪條贏。

---

## 4. 跟 Claude 合作的節奏

### 何時讓 Claude 直接做

- 機械化操作：複製貼上、重寫元件、加 console、改顏色
- 你已經知道想要什麼、只差打字
- 寫 spec 之後的實作（spec 已經是合約）

### 何時要 Claude 先停下來

- 改 routing 結構 / 改檔案位置
- 範圍超出當前 spec
- 看到模糊指令，例如「再優化一下」、「讓它更⋯⋯」（什麼是「更⋯⋯」？）
- 任何破壞性 git 動作（force push、reset --hard、刪 branch）

寫進 `spec/kickoff.md` Part 2「對齊節奏」那段，Claude 就會自動配合。

### 開新方向時怎麼讓 Claude 給你**選項**而不是急著動手

問題長這樣比較有用：

❌ 「幫我做下一版的登入流程」（Claude 會直接做一個出來，但可能跟你心裡想的不同方向）

✅ 「下一版的登入流程，給我幾個**質的差異**的方向，不是優化版 A」（Claude 會列 3–7 個選項，你挑）

挑完之後再說「照這個方向，幫我寫 spec/version<X>.md 並實作」。

---

## 5. 常踩的坑

### git author email 不對 → Vercel 拒絕部署

新電腦 / 新環境第一次 commit 前先設：

```bash
git config --global user.name "..."
git config --global user.email "你 GitHub 上有驗證的 email"
```

email 必須是 GitHub Settings → Emails 已驗證的，否則 Vercel 會擋。

### 寫了檔案沒按存檔，Claude 讀到空檔案

`spec/<檔案>.md` 是空的時候，Claude 看到的就是空的，會問你內容。如果你以為已經寫好了——很可能是編輯器沒按存檔。把這個當成可疑訊號。

### Push 到 main 被擋

預期行為。改用 branch + PR。如果非要 push main（例如 cherry-pick 一個檔案），在 Claude Code 輸入框前面加 `!` 自己跑。

### 改完 spec 才發現方向選錯

spec 還沒實作前隨時可以改，**改 spec 比改 code 便宜 10 倍**。寫 spec 時不要急著動手，多花 5 分鐘想清楚 scope。

### 同一條 branch 改著改著變成「什麼都改了」

這就是 scope creep。對策：

- 每次 commit 前問自己「這個改動屬於 spec 哪一條」
- 不在 spec 裡的改動，記下來但不實作，等下一輪再說
- 真的緊急要修（bug 修正之類），開另一條 branch

---

## 6. 加速下次的祕訣

- **第一次的「初始化」工作流封裝成 slash command** — 下次新主題用一條 `/init-prototype "<主題>"` 跑完，省 30–60 分鐘
- **範本化你的 `spec/`** — 重複出現的文件（playbook、deployment、git-commands）寫成 template，下次直接帶
- **跨主題的學習回灌**：這次學到什麼讓你下次更快？回頭修 `~/.claude/init-prototype/` 裡的範本，下個專案就帶著新版開始

> 「方法學的試驗場」這件事比你做的 prototype 本身還值錢。每次跑完都花 10 分鐘想：哪一步省了時間？哪一步意外卡住？回灌到範本與 playbook。
