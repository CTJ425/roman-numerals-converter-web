# 羅馬數字 ⇄ 阿拉伯數字轉換器 (Roman ⇄ Arabic Numeral Converter)

本專案是一個基於 React 18 + Material UI (MUI) v5 + Vite 開發的單頁應用程式 (SPA)。提供直覺的高質感深色調 (Dark Mode) 介面，讓使用者可以即時雙向轉換 1 至 3999 之間的羅馬數字與阿拉伯數字，並具備嚴格的格式與邊界值驗證。

---

## 1. 本地開發與測試 (Local Development & Testing)

本專案已設定好單元測試 (Vitest) 與前端熱重載開發伺服器。

### 安裝相依套件
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```
啟動後可在瀏覽器開啟 `http://localhost:5173` 進行即時開發與調試。

### 執行單元測試
本專案的數值轉換核心演算法位於 [romanNumeral.js](file:///home/ivan/k8s-ops/app/roman-numerals/src/utils/romanNumeral.js)，並在 [romanNumeral.test.js](file:///home/ivan/k8s-ops/app/roman-numerals/src/utils/romanNumeral.test.js) 中撰寫了完整測試案例，涵蓋邊界值、減法規則與各式非法輸入。
```bash
npm run test
```

### 生產環境編譯
```bash
npm run build
```
編譯完成後，靜態產物將輸出至 `dist/` 目錄。

---

## 2. Docker 容器化測試 (Docker Containerization)

專案內含 Dockerfile 與 Docker Compose 設定，採多階段建置 (Multi-stage Build) 以縮減映像檔大小，並在生產環境以 Nginx 託管靜態網頁與設定 SPA fallback 路由。

### 一鍵建置與啟動
```bash
docker compose up -d --build
```
* **存取網址**：開啟瀏覽器前往 `http://localhost:8080` 即可存取。
* **停止服務**：
  ```bash
  docker compose down
  ```

---

## 3. Kubernetes 部署規劃 (Kubernetes GitOps & ArgoCD)

> [!IMPORTANT]
> **備註 (Note)**：本專案已改為以 GitOps 架構進行佈署，Kubernetes 資源檔案已移至專案目錄下的 `manifests/`。此設定僅作為 **Kubernetes 實驗室 (K8s Lab) 測試與學習** 使用。

本專案採用 **ArgoCD + Kustomize** 的 GitOps 流程進行持續部署。

### 目錄結構
1. **應用程式 K8s 資源**：
   - 位於 [app/roman-numerals-converter-web/manifests/base/](file:///home/ivan/hclab/k8s-ops/app/roman-numerals-converter-web/manifests/base/) (基礎定義檔：Deployment, Service)。
   - 位於 [app/roman-numerals-converter-web/manifests/overlays/dev/](file:///home/ivan/hclab/k8s-ops/app/roman-numerals-converter-web/manifests/overlays/dev/) (環境特定覆寫檔)。
2. **ArgoCD 宣告清單**：
   - [infrastructure/argocd/root-app.yaml](file:///home/ivan/hclab/k8s-ops/infrastructure/argocd/root-app.yaml) (ArgoCD Root App / App of Apps 入口)。
   - [infrastructure/argocd/applications/roman-numerals-converter-web.yaml](file:///home/ivan/hclab/k8s-ops/infrastructure/argocd/applications/roman-numerals-converter-web.yaml) (此專案的 ArgoCD Application)。

### MetalLB 運作說明與事前準備
在地端、自建或裸機的 **K8s Lab 測試環境** 中，預設沒有內建的 LoadBalancer 實作。因此，本專案依賴 **MetalLB** 來實現 LoadBalancer 功能：
1. 請確保您的 K8s 叢集已安裝並設定好 **MetalLB**（包含 IPAddressPool 與 L2Advertisement）。
2. 當部署本專案的 Service 後，MetalLB 會自動從設定好的 IP 池中分配一個 External IP 給 `roman-arabic-converter` 服務。

### 部署指令
1. 確保您已將整個 `k8s-ops` 儲存庫提交並推送至您的遠端 Git 伺服器。
2. 替換 [root-app.yaml](file:///home/ivan/hclab/k8s-ops/infrastructure/argocd/root-app.yaml) 與 [roman-numerals-converter-web.yaml](file:///home/ivan/hclab/k8s-ops/infrastructure/argocd/applications/roman-numerals-converter-web.yaml) 中的 `repoURL` 欄位為您的 Git 倉庫 URL。
3. 在 K8s 叢集中套用 Root Application 以啟用 ArgoCD 自動同步：
   ```bash
   kubectl apply -f infrastructure/argocd/root-app.yaml
   ```

### 資源說明與技術設計
1. **Deployment** ([deployment.yaml](file:///home/ivan/hclab/k8s-ops/app/roman-numerals-converter-web/manifests/base/deployment.yaml))：
   - 設定為 **1 個副本 (Replica)**。
   - `restartPolicy` 設定為 `Always`，配合 Deployment 控制器，可確保容器在異常終止或節點故障時，自動於其他可用節點上重建移轉（Rescheduling）並重啟。
   - 配置了資源限制 Limit 與 Request (CPU 250m/100m, Memory 256Mi/128Mi)，並設定 `livenessProbe` 與 `readinessProbe` 以確保服務健康狀態。
2. **Service** ([service.yaml](file:///home/ivan/hclab/k8s-ops/app/roman-numerals-converter-web/manifests/base/service.yaml))：
   - 採用 **`LoadBalancer`** 型態，藉由 MetalLB 動態分配 External IP，以便從叢集外部直接存取。

### 存取設定與驗證步驟
1. 部署完畢後，確認 Pod 與 Service 是否正常啟動，並取得 MetalLB 分配到的 External IP：
   ```bash
   kubectl get svc -n default roman-arabic-converter
   ```
2. 當 `EXTERNAL-IP` 從 `<pending>` 變為具體 IP（例如 `192.168.1.200`）後，即可直接在瀏覽器輸入 `http://<EXTERNAL-IP>` 存取應用程式。
3. （選用）若想使用網域名稱存取，可在本機 `/etc/hosts` 檔案中新增對應紀錄：
   ```text
   192.168.1.200  roman.ivan.lab
   ```
   之後便可透過 `http://roman.ivan.lab` 進行存取。


