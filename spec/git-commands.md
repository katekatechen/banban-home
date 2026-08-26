# Git / 部署指令參考

prototype 專案中常用指令的整理，**以「為什麼用它 / 它做什麼」為主**，未來看到忘記了可以查。

關係檔案：`spec/deployment-and-versions.md` 是「什麼情境用什麼流程」的 runbook；這份是「每條指令各自代表什麼」的字典。

---

## 0. 心智模型：Git 的四個地方

```
工作區           暫存區             本地 repo         遠端 repo
(working tree)  (staging)        (local .git)     (origin / GitHub)
       |                |                  |                  |
   你改檔案     git add       git commit      git push
       |                |                  |                  |
   git status     git diff       git log     gh / vercel
        ←  git restore     ←  git restore --staged  ←  git fetch / pull
```

- **工作區**：你看到、能編輯的檔案
- **暫存區**：「下一個 commit 要包進來的東西」放這裡
- **本地 repo**：commit 過的歷史，存在 `.git/` 資料夾
- **遠端 repo**：GitHub 上那份，叫做 `origin`

很多指令搞不清楚就是因為沒分清楚它在動哪個地方。下面每條指令會標出它影響哪一層。

---

## 1. 看狀態（讀，不改任何東西）

### `git status`

| 影響 | 不改任何東西 |
|---|---|
| 用途 | 列出工作區跟暫存區跟本地 repo 的差異 |

讓你看：
- 哪些檔案改過但還沒 `add`
- 哪些檔案 `add` 過但還沒 `commit`
- 哪些檔案是全新的（Untracked）

commit 前的習慣動作。

### `git diff` / `git diff --staged`

| 影響 | 不改任何東西 |
|---|---|
| 用途 | 看「實際改了哪幾行」 |

- `git diff`：工作區相對暫存區（已改但還沒 add）
- `git diff --staged`：暫存區相對最近一個 commit（已 add 但還沒 commit）
- `git diff main`：目前 branch 相對 `main`

### `git log`

```bash
git log --oneline -10           # 一行一個 commit、最近 10 筆
git log --oneline --decorate    # 加上分支 / tag 標示
git log --all --graph --oneline # 看所有分支的 commit 樹
```

### `git show <ref>`

看某個 commit / tag 的詳細內容：

```bash
git show HEAD                                            # 當下這個 commit
git show baseline                                        # 某個 tag 指向的 commit
git show HEAD --no-patch --format="Author: %an <%ae>"    # 只看作者
```

---

## 2. 製造歷史（會新增 commit / tag）

### `git add <路徑>`

| 影響 | 工作區 → 暫存區 |
|---|---|
| 用途 | 把改動「放進下一次 commit 的籃子」 |

```bash
git add app/v1-lofi/             # 整個資料夾下的所有改動
git add app/v1-lofi/page.tsx     # 單一檔案
git add .                        # 當下目錄底下的全部（小心：可能會加到不想加的東西）
git add -p                       # 逐段挑選要 add 哪些 hunk（互動式）
```

**經驗**：精準指定路徑比 `git add .` 安全。

### `git commit -m "訊息"`

| 影響 | 暫存區 → 本地 repo（產生新 commit） |
|---|---|
| 用途 | 把暫存區的內容定格成歷史快照 |

```bash
git commit -m "簡短的一句話訊息"

# 多行訊息（推薦）
git commit -m "$(cat <<'EOF'
標題（一句話）

詳細說明：
- 改了什麼
- 為什麼
EOF
)"
```

**重要**：commit 後**東西還只在你電腦**，要 push 才會到 GitHub。

### `git commit --amend --reset-author --no-edit`

| 影響 | **改寫**最新一個 commit（產生新 hash） |
|---|---|
| 用途 | 修正最新一個 commit（例如改作者 email、改訊息、補加忘記 add 的檔案） |

常見情境：commit author email 是錯的（例如 `<user>@<hostname>.local`）害 Vercel 拒部署，先 `git config user.email` 設對，再用這條把最新 commit 用新身份重簽。

**注意**：amend 會產生**新的 commit hash**。如果舊的已經 push 出去，要 force push（見後面）。

### `git tag <名字> [<commit>]`

| 影響 | 在某個 commit 上貼一個書籤（不產生新 commit） |
|---|---|
| 用途 | 標記「歷史上的某個重要時刻」 |

```bash
git tag baseline                       # 對「目前 HEAD 所在的 commit」打 tag
git tag demo-2026-XX-XX <commit-hash>  # 對指定 commit 打 tag
git tag -l                             # 列出所有 tag
git tag -d <tag>                       # 刪掉 tag（本地）
```

**tag vs branch**：branch 會跟著 commit 移動，tag 釘死不動。`git checkout <tag>` 永遠回到同一個 commit。

---

## 3. 跟遠端同步

### `git remote add <名字> <url>` / `git remote -v`

```bash
git remote add origin https://github.com/<user>/<repo>.git
git remote -v
```

`origin` 只是個代號（慣例）。一般 repo 只連一個 remote。

### `git fetch origin`

| 影響 | 把遠端的最新狀態下載到本地，**但不合併到你的 branch** |
|---|---|
| 用途 | 「先看一下遠端發生什麼事」，再決定要不要 merge / rebase |

```bash
git fetch origin
git log origin/main --oneline -5
```

### `git push origin <branch>`

| 影響 | 本地 commit → 遠端 |

```bash
git push origin main                            # 推 main
git push origin explore/v2-A                    # 推某個 branch
git push origin baseline                        # 推 tag
git push --tags                                 # 推所有還沒 push 的 tag
```

### `git push -u origin <branch>`

第一次推一條新 branch 時用：

```bash
git push -u origin explore/v2-A
```

`-u`（== `--set-upstream`）讓 git 知道這條本地 branch 對應到遠端那條，之後在這條 branch 上：
- `git push` 不用再寫 origin 跟 branch 名字
- `git pull` 知道從哪拉
- `git status` 會告訴你「比遠端多 N commits」

第一次用 `-u`，之後就 `git push`。

### `git push --force` vs `--force-with-lease`

| 影響 | **改寫**遠端歷史（破壞性） |
|---|---|
| 用途 | 通常配合 `commit --amend` / `rebase` / 修錯 author 用 |

```bash
git push origin main --force                # 危險：直接覆蓋
git push origin main --force-with-lease     # 安全版：只在你 fetch 後遠端沒被別人動過時放行
```

**規則**：能用 `--force-with-lease` 就用它。對 tag 用 `--force` 是必要的（tag 本來就是要強制覆蓋指向）。

### `git pull origin <branch>`

| 影響 | 等於 `git fetch` + `git merge` |

```bash
git pull origin main                                 # 合進來，產生 merge commit
git pull --rebase origin main                        # rebase 模式：歷史線性
git pull --rebase --allow-unrelated-histories ...    # 兩邊歷史完全沒共同祖先（少見）
```

---

## 4. 分支操作

### `git branch`

```bash
git branch                          # 列出本地分支
git branch -a                       # 含遠端分支
git branch -d <name>                # 刪本地分支
```

### `git checkout <ref>` / `git checkout -b <name>`

```bash
git checkout main                          # 切到 main
git checkout baseline                      # 切到 tag（detached HEAD）
git checkout -b explore/v2-A               # 從目前 HEAD 長出新分支
git checkout -b explore/from-base baseline # 從某個 tag 長出新分支
```

新版 git 也可以用 `git switch <name>` / `git switch -c <name>`，更語意化。

### `git checkout <ref> -- <路徑>`

只動工作區，把指定檔案 / 資料夾恢復到某個 ref 的版本：

```bash
git checkout baseline -- app/v1-lofi/
# v1-lofi/ 變成 baseline 那時候的樣子，其他檔案不動
```

### `git cherry-pick <commit>`

把某 branch 上的單一 commit 拿過來應用到目前 branch：

```bash
git checkout main
git cherry-pick <commit-hash>
```

不會 merge 那條 branch 的歷史，只搬指定 commit 的「結果」。

---

## 5. 修補 / 回復

### `git revert <commit>`

| 影響 | 產生一個「反向 commit」抵銷某個 commit 的內容 |
|---|---|
| 用途 | 非破壞性的「撤回」 |

不改寫歷史，產生新 commit，所以可以放心對 main 用。

### `git reset --hard <commit>`

| 影響 | **破壞性**：直接把 branch 拉回某個 commit，後面的 commit 沒了 |
|---|---|
| 用途 | 「我想把這條 branch 整個倒退回去」 |

工作區、暫存區、本地 commit 全部變成那個 commit 的狀態。**對 main 別用**（除非你確定沒人 fork）。

### `git restore <檔案>` / `git restore --staged <檔案>`

```bash
git restore <file>            # 工作區的改動丟掉，恢復成上一個 commit 的樣子
git restore --staged <file>   # 從暫存區拿出來（取消 add）
```

---

## 6. 身份設定

### `git config user.name / user.email`

```bash
git config --global user.name "你的名字"
git config --global user.email "你 GitHub 上有驗證的 email"

git config user.email "work@company.com"   # 只設這個 repo
```

**為什麼重要**：Vercel / GitHub 會用 commit author email 比對你的帳號。email 對不上 → Vercel 拒絕部署、GitHub 不顯示頭像。

如何選 email：
- **直接用工作 / 個人 email**：在 GitHub Settings → Emails 確認已驗證
- **用 GitHub noreply**（不暴露真實 email）：`<id>+<username>@users.noreply.github.com`

---

## 7. Claude Code 的 `!` 前綴

```
! git push origin main         ← 在 Claude Code 輸入框打這個，會跳出 bash 模式直接執行
git push origin main           ← 在你的 terminal 直接打這個
```

兩個結果一樣，都是在你電腦的 shell 跑。差別只在「指令是從哪輸入的」。如果你的 Claude Code 設定有「禁止 push 到 default branch」的規則，被擋下時就用 `!` 前綴自己跑。

---

## 8. 跟 Vercel 的對應關係

| Git 動作 | Vercel 反應 |
|---|---|
| push 到 `main` | 自動更新 production |
| push 到其他 branch（含 `explore/*`） | 自動產生 preview URL（branch 一條一個） |
| push tag | 不影響部署（Vercel 看 commit + branch，不看 tag） |
| force push | Vercel 重新部署最新狀態 |
| 改 commit author email 但帳號對不上 GitHub | Vercel **拒絕部署**，需要修 author（見 §6） |

一條 branch = 一個 preview URL。所以「同時想看 baseline 跟方向 A」就是「main 部署的 production」+「explore/v2-A 的 preview URL」。

---

## 9. 快速查找：我想做什麼？

| 我想做⋯ | 用什麼 |
|---|---|
| 看現在改了什麼 | `git status` + `git diff` |
| 把改動存起來 | `git add` + `git commit` |
| 推到 GitHub | `git push -u origin <branch>`（首次）/ `git push`（之後） |
| 標記重要里程碑 | `git tag <name>` + `git push origin <name>` |
| 開新分支試方向 | `git checkout -b <branch>` |
| 看遠端最新狀態 | `git fetch origin` + `git log origin/main` |
| 從遠端拉新 commit | `git pull --rebase origin <branch>` |
| 回到某個 tag 的狀態看看 | `git checkout <tag>` |
| 把某資料夾恢復到 tag 的版本 | `git checkout <tag> -- <path>` |
| 把另一個 branch 上的某個 commit 搬過來 | `git cherry-pick <commit>` |
| 取消還沒 commit 的改動 | `git restore <file>` |
| 改最新 commit 的訊息 / 作者 / 內容 | `git commit --amend ...` + force push |
| 撤回一個已經 push 的 commit（非破壞性） | `git revert <commit>` |
| 把 branch 整個倒退（破壞性） | `git reset --hard <commit>` |

---

## 10. 不要做的

- ❌ 不要 `git push --force` 到 main（用 `--force-with-lease` 至少不會蓋到別人的東西）
- ❌ 不要對已經 push 出去的 commit `rebase` / `amend`，除非你了解後續要 force push 的影響
- ❌ 不要在工作區髒（有未 commit 改動）的狀態下隨便 `git checkout` 到別的 branch / tag——改動會跟過去
- ❌ 不要 `git add .` + `git commit -am "wip"`：訊息含糊、可能 commit 到不該 commit 的東西
