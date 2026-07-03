# 專案開發工作紀錄 (work.md)

本文件紀錄羅馬數字與阿拉伯數字轉換器專案的開發進度、目前狀態與後續工作。

---

## 1. 已完成工作

1. **專案初始化**：
   * 在 `/home/ivan/k8s-ops/app/roman-numerals` 目錄下使用 `create-vite` 初始化 React/Vite 專案。
   * 將 React 版本調整為 `v18`（配合技術規格要求）。
   * 安裝相依套件：`@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`, 與開發測試工具 `vitest`。

2. **核心轉換演算法開發 (`src/utils/romanNumeral.js`)**：
   * 實作 `arabicToRoman`（阿拉伯數字 ⇄ 羅馬數字）：支援 1-3999 整數範圍驗證，透過標準對照表進行遞減拼接。
   * 實作 `romanToArabic`（羅馬數字 ⇄ 阿拉伯數字）：透過正規表示式先做嚴格格式驗證（排除如 `IIII` 等非法字串與空值），再以加減法則計算出對應的十進制數值。
   * 兩者皆加入防禦性設計，若輸入格式或數值超出範圍，會回傳 `null`。

3. **單元測試與驗證 (`src/utils/romanNumeral.test.js`)**：
   * 使用 Vitest 撰寫 9 大項測試案例，涵蓋邊界值（1 ↔ I, 3999 ↔ MMMCMXCIX）、減法規則（IV, IX, XL, XC, CD, CM）、大小寫不敏感、空白字元處理，以及各式非法輸入（如 `0`, `4000`, `IIII`, `ABC`）。
   * 執行 `npm run test`，**9 個測試案例全數通過 (100% Pass)**。

4. **UI 畫面與自訂主題設計**：
   * 修改 `index.html`：調整網頁語系為 `zh-TW`，設定網頁標題，並載入 Google Fonts 的 `Inter` 字型。
   * 自訂 Material UI 主題 (`src/theme.js`)：設定高質感的 Dark Mode 深色系樣式、圓角輸入框、漸層標題與微光背景。
   * 調整 `src/index.css` 與 `src/App.css`：建置頁面背景漸層與動態微光動畫 (`glow-bg`)。
   * 實作 `src/App.jsx`：
     * 配置左右雙向輸入欄位與置中交換圖示。
     * 實作在 `onChange` 事件中進行即時轉換，避免使用 `useEffect` 造成無窮迴圈。
     * 當使用者清空欄位時，兩側同步清空；若輸入非法字元，則維持另一側原值並顯示紅色錯誤提示。
     * 新增「快速測試範例」按鈕區與「傳統羅馬數字規則說明」卡片。

5. **問題修復與生產環境編譯驗證**：
   * 修正 `src/App.jsx` 中的圖示引用路徑，將 `@mui/icons-material/DeleteOutline` 與 `HelpOutline` 分別修改為新版之 `DeleteOutlined` 與 `HelpOutlined`。
   * 執行 `npm run build`，生產環境成功完成編譯，無任何錯誤或警告，靜態產物順利生成於 `dist/` 目錄。

6. **Docker 容器化開發與測試**：
   * 撰寫 `nginx.conf`（設定 SPA 靜態檔案路由、gzip 壓縮、以及快取控制）。
   * 撰寫 `Dockerfile`（採用 multi-stage build：Stage 1 編譯，Stage 2 使用 nginx 運行）。
   * 撰寫 `.dockerignore` 排除無用檔案與依賴。
   * 撰寫 `docker-compose.yml` 定義單一 Web 服務，將本機 `8080` 埠號對應至容器 `80` 埠。
   * 執行 `docker compose up -d` 啟動容器，並成功以 `curl` 驗證其能響應 HTTP 200 OK，隨後完成清理 (`docker compose down`)。

7. **Kubernetes 部署規劃與驗證**：
   * 於 `k8s/` 目錄下建立完整 Manifest 資源設定：
     * `k8s/deployment.yaml`：設定為 **1 個副本 (Replica)**，設定 `restartPolicy: Always` 以確保節點故障時容器能自動移轉 (Rescheduling) 與重啟，配置資源 Limits/Requests，並定義 liveness/readiness Probes。
     * `k8s/service.yaml`：配合 Gateway API 將服務型態調整為 **`ClusterIP`**，僅在叢集內部暴露埠號 80。
     * `k8s/gateway.yaml`：定義 **`Gateway`** 資源，監聽 HTTP 80 埠。
     * `k8s/httproute.yaml`：定義 **`HTTPRoute`** 資源，設定路由規則，將主機名稱 `roman.ivan.lab` 的流量導向 `roman-arabic-converter` 服務。
   * 執行 `kubectl apply --dry-run=client -f k8s/` 成功通過語法與結構驗證。
   * 撰寫 `README.md` 說明本地開發、Docker 執行、以及配合 Gateway API 與 MetalLB 在 K8s 部署之完整操作指令及 DNS 解析方式。

---

## 2. 後續維護與擴充建議 (未來展望)

1. **CI/CD Pipeline**：
   * 整合 GitHub Actions，在每次 Push 或 PR 時自動執行 `npm run test`。
   * 設定自動化建置 Docker 映像檔並推送至 Docker Registry (例如 Docker Hub 或 AWS ECR)。
   
2. **Kubernetes 自動擴縮 (HPA)**：
   * 依據 CPU/Memory 使用率配置 `HorizontalPodAutoscaler`，提升流量高峰期的系統彈性。
