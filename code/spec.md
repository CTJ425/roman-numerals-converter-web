# 羅馬數字 ⇄ 阿拉伯數字轉換器 — 技術規格書

> 本文件供 Claude Code 依此規格實作、容器化並準備 K8s 部署使用。

---

## 1. 專案概述

一個單頁網站，左側輸入羅馬數字、右側輸入阿拉伯數字，兩側即時雙向同步轉換。
前端使用 React + MUI，並以 Docker / docker-compose 容器化，未來可部署至 Kubernetes。

---

## 2. 功能需求

### 2.1 核心功能
- 畫面分為左右兩個輸入欄位：
  - **左側**：羅馬數字（Roman Numeral），輸入型態為文字（例如 `X`、`MCMXCIV`）。
  - **右側**：阿拉伯數字（Arabic Numeral），輸入型態為數字（例如 `10`、`1994`）。
- **左 → 右**：使用者變更左側羅馬數字，系統即時解析並將對應阿拉伯數字寫入右側。
  - 範例：左側輸入 `X` → 右側自動變為 `10`。
- **右 → 左**：使用者變更右側阿拉伯數字，系統即時轉換並將對應羅馬數字寫入左側。
  - 範例：右側輸入 `5` → 左側自動變為 `V`。
- **同步作法（不使用 `useEffect`）**：狀態更新必須完全在 `onChange` 事件處理器內以單向方式完成，不透過 `useEffect` 監聽兩側 state 互相同步。
  - 左側 `onChange`：更新左側 state，同時嘗試轉換並更新右側 state。
  - 右側 `onChange`：更新右側 state，同時嘗試轉換並更新左側 state。
  - 因狀態更新皆由單一使用者事件觸發、且方向單一，本質上不會產生迴圈，因此**不需要**額外的「輸入來源旗標」或 `useRef` 鎖定機制。

### 2.2 數值範圍與驗證
- 合法範圍：**1 ～ 3999**（傳統羅馬數字表示法上限）。
- 羅馬數字輸入需驗證格式是否合法（正規表示式驗證，例如不可為 `IIII`、`VV` 等非標準寫法）。
- 阿拉伯數字輸入限制為整數，超出 1–3999 範圍時顯示錯誤提示，不覆蓋另一側數值。
- **輸入狀態需區分「清空」與「非法」兩種情況**：
  - **清空（Empty）**：使用者將任一側欄位完全清空（空字串）時，**兩側同步清空**，視為初始狀態，**不顯示錯誤訊息**。
  - **非法輸入（Invalid）**：欄位非空但格式不合法（例如 `IIII`、`ABC`）或數值超出 1–3999 範圍（例如 `4500`）時：
    - 對應欄位顯示 MUI `TextField` 的 `error` 狀態與 `helperText` 錯誤訊息（例如「請輸入 1–3999 之間的合法羅馬數字」）。
    - 另一側欄位維持最後一個合法值，不清空、不誤轉換。

### 2.3 UI 佈局需求
- 置中卡片（MUI `Card` / `Paper`）內放置左右兩個 `TextField`，中間以圖示（例如 `SwapHoriz` icon）作為視覺分隔，象徵雙向轉換。
- 需支援響應式設計：寬螢幕左右並排，窄螢幕（手機）改為上下堆疊。
- 頁面需有標題／說明文字，告知使用者兩側皆可輸入且會互相同步。

---

## 3. 技術規格

### 3.1 技術選型
| 項目 | 選擇 |
|---|---|
| 前端框架 | React 18 |
| 建置工具 | Vite |
| UI 元件庫 | MUI (Material UI) v5 + Emotion |
| 語言 | JavaScript（如團隊偏好可改 TypeScript，本規格以 JS 撰寫範例） |
| 容器化 | Docker（multi-stage build）＋ docker-compose |
| 正式部署環境 | Kubernetes（Deployment / Service / Ingress） |
| Web Server（容器內） | Nginx（serve 靜態建置產物） |

### 3.2 專案目錄結構
```
roman-arabic-converter/
├── src/
│   ├── main.jsx              # React 進入點
│   ├── App.jsx                # 主畫面（左右欄位 + 狀態管理）
│   ├── utils/
│   │   └── romanNumeral.js    # 轉換演算法（純函式，含單元測試）
│   └── theme.js               # MUI 自訂主題（選用）
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── nginx.conf                 # 容器內 Nginx 設定（SPA fallback）
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── configmap.yaml         # 如需注入環境變數
└── spec.md                    # 本文件
```

### 3.3 轉換演算法規格

**阿拉伯數字 → 羅馬數字** (`arabicToRoman(num)`)
- 使用標準對照表，由大到小依序扣除：
  `[1000:'M', 900:'CM', 500:'D', 400:'CD', 100:'C', 90:'XC', 50:'L', 40:'XL', 10:'X', 9:'IX', 5:'V', 4:'IV', 1:'I']`
- 輸入非 1–3999 整數時回傳 `null` 或拋出可被捕捉的錯誤。

**羅馬數字 → 阿拉伯數字** (`romanToArabic(str)`)
- **必須先明確排除空字串**（`str.trim() === ''` 時直接回傳代表「清空」的特殊值，由呼叫端另行判斷為 Empty 狀態，不視為 Invalid）。
- 空字串以外，才以正規表示式驗證合法格式：
  `/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/`
  - ⚠️ 注意：此正則的每一組皆可為長度 0（`{0,3}` 或帶 `?`），因此**空字串本身會通過此正則**。必須在呼叫前（或正則之外）額外檢查非空，否則會誤判空字串為合法輸入。
- 驗證通過後，逐字元比對數值，若後一字元數值大於前一字元則相減、否則相加。
- 格式不合法（且非空字串）時回傳 `null`，由呼叫端顯示錯誤。

**同步邏輯（單向、無 `useEffect`）**
- 使用兩個獨立 state：`roman`（string）、`arabic`（string，供 `TextField` 顯示，避免數字前導狀態問題）。
- 左側 `onChange(value)`：
  1. `setRoman(value)`。
  2. 若 `value` 為空字串 → `setArabic('')`，清除左右兩側錯誤狀態。
  3. 否則呼叫 `romanToArabic(value)`：成功 → `setArabic(String(result))`，清除錯誤；失敗 → 設定左側 `error=true` 並顯示 `helperText`，`arabic` 維持不變。
- 右側 `onChange(value)`：對稱邏輯，呼叫 `arabicToRoman(Number(value))`。
- 兩個處理器互不呼叫、互不監聽，狀態更新僅由觸發事件的那一側發動，天然不會形成迴圈。

### 3.4 元件規格
- `<App />`：頁面容器，套用 MUI `ThemeProvider` 與 `CssBaseline`。
- `<ConverterCard />`：內含兩個 `TextField`（`variant="outlined"`）與中央圖示，管理雙向同步狀態與錯誤訊息。
- 建議使用 MUI 元件：`Container`、`Paper`/`Card`、`Grid` 或 `Stack`（響應式排列）、`TextField`、`Typography`、`IconButton`／`SvgIcon`。

### 3.5 測試需求（建議）
- 對 `romanNumeral.js` 撰寫單元測試（Vitest），涵蓋：
  - 邊界值：`1 ↔ I`、`3999 ↔ MMMCMXCIX`。
  - 減法規則：`4 ↔ IV`、`9 ↔ IX`、`40 ↔ XL`、`90 ↔ XC`、`400 ↔ CD`、`900 ↔ CM`。
  - 非法輸入：`0`、`4000`、`IIII`、`ABC`。

---

## 4. 容器化需求

### 4.1 Dockerfile（multi-stage build）
- **Stage 1（build）**：以 `node:20-alpine` 安裝依賴並執行 `npm run build`，產出 `dist/`。
- **Stage 2（runtime）**：以 `nginx:alpine` 為底，將 `dist/` 複製至 `/usr/share/nginx/html`，並套用自訂 `nginx.conf`（需設定 SPA fallback：所有路徑導回 `index.html`）。
- 對外開放埠號：`80`。
- 需包含 `.dockerignore`（排除 `node_modules`、`dist`、`.git` 等）。

### 4.2 docker-compose.yml
- 定義單一 service（例如 `web`），對應上述 Dockerfile build context。
- 埠號對應：例如 `8080:80`（本機 8080 對應容器 80）。
- 設定 `restart: unless-stopped`。
- 預留 `environment` 區塊供未來擴充（如 API 位址等，目前為純前端可留空）。

---

## 5. Kubernetes 部署規劃

> 本階段僅規劃 manifest 需求，實際 YAML 由 Claude Code 依此規格產出。

### 5.1 Deployment
- Image 來源：由 CI 建置後推送至 image registry（規格中先以 placeholder `<registry>/roman-arabic-converter:latest` 表示）。
- 建議 `replicas: 2`（可用性）。
- 設定 `resources.requests` / `resources.limits`（CPU、Memory，依實際負載測試調整，先給合理預設，如 `100m` / `128Mi` requests，`250m` / `256Mi` limits）。
- 設定 `readinessProbe` 與 `livenessProbe`：對容器 80 埠做 HTTP GET `/`。

### 5.2 Service
- `type: ClusterIP`，對外由 Ingress 統一入口。
- Port：`80` → Pod `80`。

### 5.3 Ingress
- 設定 host（依實際網域決定，先以 placeholder `roman-converter.example.com` 表示）。
- 建議搭配 cert-manager 處理 TLS（先在規格中註記為未來項目，非本次必要交付）。
- **本機測試注意事項**：因 host 為 placeholder domain，本機瀏覽器無法直接解析。README 需說明如何取得 Ingress Controller 的本機 IP（例如 `minikube ip` 或 Kind 的 LoadBalancer/NodePort IP），並指導使用者修改 `/etc/hosts`，將該 IP 對應到 `roman-converter.example.com`，才能於本機瀏覽器正確存取。

### 5.4 未來擴充項目（僅記錄，非本次實作範圍）
- HPA（Horizontal Pod Autoscaler）依 CPU 使用率自動擴縮。
- 獨立 Namespace（例如 `tools`）管理此類小工具服務。
- CI/CD pipeline 自動建置 image 並更新 K8s manifest（GitOps 或 CI 直接 `kubectl apply`）。

---

## 6. 設計步驟（給 Claude Code 的實作順序建議）

1. 使用 `npm create vite@latest` 建立 React 專案骨架，安裝 `@mui/material`、`@emotion/react`、`@emotion/styled`、`@mui/icons-material`。
2. 實作 `src/utils/romanNumeral.js`，完成 `arabicToRoman` 與 `romanToArabic` 兩個純函式（含空字串邊界處理），並撰寫對應單元測試（含空字串案例）。
3. 實作 `<ConverterCard />` 元件：建立左右 `TextField`，於各自 `onChange` 內以單向方式更新兩側 state（不使用 `useEffect`），並區分「清空」與「非法輸入」兩種狀態顯示。
4. 套用 MUI `ThemeProvider`，完成響應式版面（`Stack`/`Grid` + `direction` 依斷點切換）。
5. 本機以 `npm run dev` 驗證雙向轉換邏輯與各邊界案例。
6. 撰寫 `Dockerfile`（multi-stage）與 `nginx.conf`，本機 `docker build` 驗證。
7. 撰寫 `docker-compose.yml`，以 `docker compose up` 驗證容器化後行為與本機開發一致。
8. 撰寫 `k8s/` 目錄下 Deployment、Service、Ingress manifest（placeholder image 與 host 待實際環境填入）。
9. 撰寫簡易 `README.md`，說明本機開發、Docker 執行、K8s 部署三種啟動方式。

---

## 7. 交付標準（Definition of Done）

- [ ] 左右輸入即時雙向轉換，邏輯正確且無無窮迴圈（單向 `onChange` 更新，無 `useEffect` 互相監聽）。
- [ ] 清空任一側時，兩側同步清空且不顯示錯誤；非法輸入時才顯示錯誤提示，且不覆蓋另一側最後合法值。
- [ ] 響應式版面在手機寬度下仍可正常操作。
- [ ] `docker compose up` 可一鍵啟動並於瀏覽器存取。
- [ ] `k8s/` manifest 通過 `kubectl apply --dry-run=client -f k8s/` 語法驗證。
- [ ] README 涵蓋三種執行方式的操作指令。
