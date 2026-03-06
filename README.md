# 🍇 聖靈的果子：靈修應用導師

基於加拉太書 5:22-23 的 AI 靈修輔助工具，使用 Google Gemini 分析生活處境並生成禱告文。

## 🏗 架構

```
瀏覽器（GitHub Pages） → Cloudflare Worker → Google Gemini API
                               ↑
                     GEMINI_API_KEY 存放於此（絕不暴露給前端）
```

---

## 🚀 部署步驟

### 第一步：Fork / Clone 此 Repo 並推到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

### 第二步：部署 Cloudflare Worker

#### 2a. 安裝 Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

#### 2b. 部署 Worker
```bash
cd cloudflare-worker
wrangler deploy
```
部署後會得到一個 Worker URL，例如：
`https://gemini-proxy.your-subdomain.workers.dev`

#### 2c. 設定環境變數（API Key）
在 Cloudflare Dashboard → Workers → gemini-proxy → Settings → Variables：

| Variable Name | Value | 類型 |
|---|---|---|
| `GEMINI_API_KEY` | `AIzaSy...你的Key` | Secret（加密） |
| `ALLOWED_ORIGIN` | `https://YOUR_USERNAME.github.io` | Plain Text |

> ⚠️ **務必選擇 "Encrypt" / Secret**，API Key 才不會明文顯示。

---

### 第三步：更新 index.html 中的 Worker URL

打開 `index.html`，找到這行並替換：

```js
// 改成您實際的 Worker URL
const WORKER_URL = "https://gemini-proxy.YOUR_SUBDOMAIN.workers.dev";
```

然後 commit 並 push：
```bash
git add index.html
git commit -m "Update Worker URL"
git push
```

---

### 第四步：啟用 GitHub Pages

1. 進入 GitHub Repo → **Settings** → **Pages**
2. Source 選擇：**GitHub Actions**
3. 儲存後等待 Actions 執行完成
4. 瀏覽 `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

## 📁 專案結構

```
.
├── index.html                    # 主網頁（部署至 GitHub Pages）
├── cloudflare-worker/
│   ├── gemini-proxy.js           # Cloudflare Worker 程式碼
│   └── wrangler.toml             # Worker 設定檔
└── .github/
    └── workflows/
        └── deploy.yml            # GitHub Actions 自動部署
```

---

## 🔒 安全機制

- API Key 存放於 **Cloudflare 加密環境變數**，永不傳送至瀏覽器
- CORS 限制僅允許您的 GitHub Pages 網域呼叫 Worker
- GitHub Repo 中無任何 secrets 或 API Key
