# 羅馬數字 ⇄ 阿拉伯數字轉換器 (Roman ⇄ Arabic Numeral Converter)

本專案是一個兼具**前端網頁**與 **Kubernetes GitOps 部署**的雙向轉換器專案。

---

## 1. 專案目的 (Project Purpose)

提供直覺且高質感的前端介面，讓使用者可以進行 1 至 3999 之間的羅馬數字與阿拉伯數字之雙向即時轉換，並具備嚴格的格式校驗與極致的使用者體驗。本專案同時作為 **Kubernetes 實驗室 (K8s Lab)** 驗證 ArgoCD 與 Kustomize 部署流程的範例專案。

---

## 2. 專案目錄結構 (Project Layout)

```text
/home/ivan/hclab/k8s-ops/app/roman-numerals-converter-web/
├── code/                                # 1. 前端網頁專案原始碼 (React + Vite + Dockerfile)
│   ├── src/                             # 網頁核心原始碼
│   ├── Dockerfile                       # 容器化建置設定
│   ├── package.json                     # 套件相依性設定
│   └── README.md                        # 本地開發與單元測試說明
│
└── manifests/                           # 2. Kubernetes 部署設定 (GitOps)
    ├── base/                            # 基礎部署資源 (Deployment, Service)
    └── overlays/                        # 環境覆寫設定 (dev 環境設定)
```

---

## 3. 安裝與執行方式 (Installation & Execution)

### A. 本地開發與測試 (Local Development)
如果您需要修改程式碼、啟動開發伺服器或執行測試：
1. 進入 `code` 資料夾：
   ```bash
   cd code
   ```
2. 安裝套件：
   ```bash
   npm install
   ```
3. 啟動熱重載開發伺服器 (`http://localhost:5173`)：
   ```bash
   npm run dev
   ```
4. 執行 Vitest 單元測試（數值轉換核心演算法測試）：
   ```bash
   npm run test
   ```
*詳細的開發指南請參閱 [code/README.md](file:///home/ivan/hclab/k8s-ops/app/roman-numerals-converter-web/code/README.md)。*

---

### B. Docker 容器化測試 (Local Containerization)
如果您想要在本機以與生產環境相同的 Nginx 託管網頁環境進行測試：
1. 進入 `code` 資料夾：
   ```bash
   cd code
   ```
2. 一鍵建置並在背景啟動容器 (`http://localhost:8080`)：
   ```bash
   docker compose up -d --build
   ```
3. 停止服務：
   ```bash
   docker compose down
   ```

---

### C. Kubernetes 部署 (GitOps via ArgoCD)
本專案的部署已被完全納入 `k8s-ops` 儲存庫的 ArgoCD 自動化管線中：
1. **宣告設定檔**：位於 [infrastructure/argocd/applications/roman-numerals-converter-web.yaml](file:///home/ivan/hclab/k8s-ops/infrastructure/argocd/applications/roman-numerals-converter-web.yaml)。
2. **部署清單**：ArgoCD 會監控並自動套用 [manifests/overlays/dev/](file:///home/ivan/hclab/k8s-ops/app/roman-numerals-converter-web/manifests/overlays/dev/) 的 Kustomize 配置。
3. **部署步驟**：
   - 確保已啟動 `root-app`（請參閱儲存庫根目錄的 [README.md](file:///home/ivan/hclab/k8s-ops/README.md)）。
   - ArgoCD 將自動在預設 namespace 中部署此專案，並透過 **MetalLB** 分配的 LoadBalancer IP 讓您可以從外部瀏覽器直接存取應用程式。
