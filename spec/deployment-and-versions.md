# 部署與版本操作指南

這份文件是給未來的自己看的 runbook：要新增版本、切換對外預設、用 branch 探索方向、回復到某個歷史狀態時，照著做就行。

關係檔案：`spec/git-commands.md` 是「每條指令各自代表什麼」的字典，這份是「什麼情境用什麼流程」的 runbook。

---

## 0. 假設的設置

- **Repo**：GitHub `<your-username>/<your-repo>`
- **部署**：Vercel（透過 GitHub 連動，push 自動部署）
- **Production URL**：`<your-project>.vercel.app`
- **預設版本機制**：`app/page.tsx` 用 re-export 指向某個版本資料夾（一開始 = `v1-lofi`）
- **版本資料夾命名**：`app/<v 編號>-<保真度或主題>/`，例如 `app/v1-lofi/`、`app/v2-midfi/`

```
app/
├── page.tsx              # 對外預設入口（re-export）
├── layout.tsx            # 共用 layout
├── v1-lofi/page.tsx      # v1 低保真
├── v2-midfi/page.tsx     # （未來）v2 中保真
└── v3-hifi/page.tsx      # （未來）v3 高保真
```

---

## 1. 日常開發 → 部署

### 本地開發

```bash
npm run dev      # http://localhost:3000
npm run build    # 部署前先跑一次驗 build 沒壞
```

### 推上去看 Vercel 部署結果

- **push 到 `main`** → 自動更新 production
- **push 到任何其他 branch** → Vercel 自動產生一個 preview URL（在該 branch 的 GitHub 頁、或 Vercel dashboard 的 Deployments 看到）

### 防護建議：不要直接 push 到 main

實務上建議所有改動走 branch + PR 流程：

- 在 branch 上做、push branch 看 preview、確認 OK 再合回 main
- 這樣 main 一直是「對外發佈線」，不會被未驗證的 commit 污染
- 如果你的 Claude Code 設定有「禁止 push 到 default branch」的規則，Claude 就會自動配合這個流程，要 push main 時會請你自己跑

---

## 2. 建立新版本（v2、v3...）

### 步驟

1. 在 `app/` 下建新資料夾 + `page.tsx`：

   ```bash
   mkdir app/v2-midfi
   ```

   寫 `app/v2-midfi/page.tsx`，記得 export `default` 跟 `metadata`（參考 `app/v1-lofi/page.tsx`）。

2. 不用動 `app/page.tsx`——除非你要把預設版本切到 v2（見下一節）。

3. 推上去：

   ```bash
   git add app/v2-midfi/
   git commit -m "建立 v2-midfi 空殼"
   git checkout -b explore/v2-midfi
   git push -u origin explore/v2-midfi
   ```

4. 在 GitHub PR 頁或 Vercel dashboard 拿 preview URL，點開 `<preview-url>/v2-midfi` 看新版本。

### 命名建議

- 一個保真度一個版本：`v1-lofi`、`v2-midfi`、`v3-hifi`
- 同一保真度想試多個方向時，加主題後綴：`v2-midfi-card`、`v2-midfi-feed`
- 一旦建好就**不要改名字**——改名等於 URL 改變，給人試用的舊連結會壞

---

## 3. 切換對外預設版本

`<your-project>.vercel.app` 顯示哪一版，由 `app/page.tsx` 的 re-export 決定。

### 改法

打開 `app/page.tsx`，改這兩行的來源：

```tsx
// 從 v1-lofi 改成 v2-midfi
export { default } from "./v2-midfi/page";
export { metadata } from "./v2-midfi/page";
```

### 推上去

```bash
git add app/page.tsx
git checkout -b chore/switch-default-to-v2
git commit -m "切換對外預設版本為 v2-midfi"
git push -u origin chore/switch-default-to-v2
# 接下來在 GitHub 上開 PR、merge，Vercel 會自動部署 main
```

### 提醒

- 舊版本的直接路由（例如 `/v1-lofi`）**不會消失**，只是不再是首頁
- 想徹底拿掉某版本要刪整個 `app/v1-lofi/` 資料夾——但通常不建議，留著當對照組

---

## 4. 用 branch 並列探索多個方向

當你想針對「同一個保真度 / 同一個議題」試 A 跟 B 兩種方向，用 branch：

```bash
git checkout -b explore/v2-A
# ...做 A 方向，commit
git push -u origin explore/v2-A
# 拿到 preview URL: <project>-git-explore-v2-A-<...>.vercel.app

git checkout main
git checkout -b explore/v2-B
# ...做 B 方向
git push -u origin explore/v2-B
# 拿到另一個 preview URL
```

兩個 preview URL 同時存在，可以開兩個 tab 對比 / 拿給朋友盲測。決定哪個方向贏了再合回 main。

### 用 git worktree 同時跑兩個 dev server（進階）

```bash
git worktree add ../<repo>-B explore/v2-B
cd ../<repo>-B && npm install && npm run dev -- -p 3001
# A 跑在 :3000、B 跑在 :3001
```

---

## 5. 打 tag 標記里程碑

每完成一個值得保留的狀態（例如「v1-lofi 五個畫面填完」、「v2-midfi 第一輪定稿」），打 tag。tag 是「不會動的書籤」，比 branch 安全。

```bash
git tag v1-lofi-done
git push origin v1-lofi-done

git tag -l                # 列所有 tag
git show v1-lofi-done     # 看 tag 是哪個 commit
```

### 命名建議

- `v1-lofi-done`、`v2-midfi-r1`（r1 = round 1）、`demo-2026-XX-XX`（給特定 demo 場合的快照）
- 不要用 `latest`、`stable` 這種會浮動的字眼——tag 就是要永遠指同一個 commit

### 第一個 tag：baseline

剛初始化完的專案建議馬上打一個 `baseline` tag。日後不管探索得多遠，都還能用 `git checkout baseline` 回到「乾淨起點」。

---

## 6. 回復到舊版本

### 情境 A：「某個資料夾改壞了，想回到 tag 那時的狀態」

```bash
git checkout <tag> -- app/v1-lofi/
git status   # 確認改了什麼
git diff --staged
git commit -m "回復 v1-lofi 到 <tag>"
```

### 情境 B：「想讓 production 整個回到三個 commit 前」

非破壞性做法（推薦）：

```bash
git log --oneline -10           # 找到要回到的 commit hash
git checkout -b fix/rollback-to-X
git revert <壞掉的 commit hash>
git push -u origin fix/rollback-to-X
# 開 PR 合回 main
```

### 情境 C：「想對著舊 tag 開新 branch 繼續做」

```bash
git checkout -b explore/from-baseline baseline
# 從 baseline 那個快照長出新分支
```

### 情境 D：「我搞砸了 production 想立刻止血，先不動 git」

Vercel dashboard → 該 project → Deployments 頁 → 找到想要的舊部署 → 右側選單 **Promote to Production**。

只改 Vercel 的指向，不會動 git。適合「先快速回穩，回頭再從容處理 git」。

---

## 7. 故障排除 / 常見狀況

### Push 被擋：`Pushing directly to the default branch (main) bypasses PR review`

預期的防護規則。改用 branch + PR，或在 Claude Code 輸入框加 `!` 自己跑 push。

### Push 被拒：`Updates were rejected because the remote contains work...`

遠端跟本地歷史對不上。先 `git fetch origin` 看遠端有什麼，再決定：

- 遠端有真實內容 → `git pull --rebase origin <branch>`
- 遠端只是 stub（自動 README 之類）→ `git push --force`（**只在你確定遠端沒重要東西時用**）

### Vercel 部署失敗：`No GitHub account was found matching the commit author email address`

你的 git commit author email 跟 GitHub 上有驗證的 email 對不上。修法：

```bash
git config --global user.email "你 GitHub 上有驗證的 email"
git commit --amend --reset-author --no-edit
git push origin <branch> --force-with-lease
```

如果是 main 上的問題還要重打 tag：

```bash
git tag -d <tag>
git tag <tag>
git push origin <tag> --force
```

### Vercel 部署失敗：build error

先在本地跑 `npm run build` 重現。看 Vercel dashboard 的 build log，通常是 TypeScript / lint / missing env var。

### 我搞砸了 production 想立刻止血

到 Vercel dashboard 把上一個正常的 deployment **Promote to Production**（情境 D）。git 那邊之後再從容處理。

---

## 8. 不要做的事

- ❌ 不要 force push 到 `main`——遠端就是真相來源，覆蓋會丟東西（**例外**：修 commit author email 那種「修自己一個 commit」的情境，用 `--force-with-lease` OK）
- ❌ 不要為了「乾淨」rebase 已經 push 出去的 commit——別人（或你自己另一台機器）會跟你的 history 打架
- ❌ 不要刪 tag——tag 就是書籤，刪掉等於把錨點丟了
- ❌ 不要把版本資料夾改名——舊 preview URL、舊分享連結會壞
- ❌ 不要在沒 commit 的狀態切 branch / checkout tag——未 commit 的改動會跟過去
