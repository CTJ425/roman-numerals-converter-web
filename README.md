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

## 3. Kubernetes 部署規劃 (Kubernetes Deployment)

專案的 Kubernetes 部署設定檔位於 [k8s/](file:///home/ivan/k8s-ops/app/roman-numerals/k8s/) 目錄下，包含 `Deployment`、`Service` 以及 Gateway API 資源。

### 事前準備 (安裝 Gateway API CRDs)
如果您的 Kubernetes 叢集尚未安裝 Gateway API CRDs，請先執行以下指令安裝（此處以 standard channel v1.1.0 為例）：
```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.1.0/standard-install.yaml
```

### 部署指令
```bash
# 套用所有 Kubernetes 資源定義檔 (包括 deployment, service, gateway 與 httproute)
kubectl apply -f k8s/
```

### 資源說明與技術設計
1. **Deployment** ([deployment.yaml](file:///home/ivan/k8s-ops/app/roman-numerals/k8s/deployment.yaml))：
   - 設定為 **1 個副本 (Replica)**。
   - `restartPolicy` 設定為 `Always`，配合 Deployment 控制器，可確保容器在節點故障或維護時，自動於其他可用節點上重建移轉（Rescheduling），並在異常終止時自動重啟。
   - 配置了資源 Limit 與 Request (CPU/Memory)，並設定 `livenessProbe` 與 `readinessProbe`。
2. **Service** ([service.yaml](file:///home/ivan/k8s-ops/app/roman-numerals/k8s/service.yaml))：
   - 採用 **`ClusterIP`** 型態，不對外直接暴露，僅供 Gateway 進行內部轉發。
3. **Gateway** ([gateway.yaml](file:///home/ivan/k8s-ops/app/roman-numerals/k8s/gateway.yaml))：
   - 定義 HTTP 入口點（Port 80），並指定 `gatewayClassName: nginx`（可依叢集內實際 Gateway Controller 調整）。
4. **HTTPRoute** ([httproute.yaml](file:///home/ivan/k8s-ops/app/roman-numerals/k8s/httproute.yaml))：
   - 設定路由規則，將主機名稱 `roman.ivan.lab` 的流量導向本專案的 Service。

### 網路與 DNS 存取設定說明
若要透過預期的網域名稱 `roman.ivan.lab` 存取此服務，請依照以下步驟進行設定：

1. 部署完畢後，取得 Gateway 服務分配到的 External IP。這取決於您所使用的 Gateway Controller。例如，若使用 Nginx Gateway Fabric，通常可以在對應的 namespace 取得其 LoadBalancer Service 的 IP：
   ```bash
   # 範例 (依實際 Controller 部署位置與名稱為準)
   kubectl get svc -n nginx-gateway
   ```
2. 在您的 DNS 伺服器（或本機 `/etc/hosts` 檔案）中，新增一筆紀錄將 `roman.ivan.lab` 指向該 Gateway 的 External IP。
   - 例如，在本機 `/etc/hosts` 中加入：
     ```text
     10.8.18.150  roman.ivan.lab
     ```
3. 設定完成後，即可直接在瀏覽器輸入 `http://roman.ivan.lab` 存取應用程式。
