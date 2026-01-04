# 🔧 Frontend API Connection Issue - Fix Guide

**Issue:** Frontend trying to connect to `localhost:3001` instead of `localhost:30001`

**Date:** 4 Janvier 2026

---

## 🐛 Problem Description

The frontend React app shows this error:
```
GET http://localhost:3001/products net::ERR_CONNECTION_REFUSED
Network Error: Failed to connect to backend API
```

### Root Cause
- Frontend `api.js` has fallback URL: `http://localhost:3001`
- Should be: `http://localhost:30001` (NodePort)
- Environment variable `REACT_APP_API_URL` is set correctly in Helm, but the Docker image was built before the fix

---

## ✅ Solution Applied

### 1. Fixed Source Code
Updated `Frontend/src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:30001',  // Changed from 3001 to 30001
  //...
});
```

### 2. Committed to Git
```bash
git add Frontend/src/services/api.js ARGOCD_DEPLOYMENT_COMPLETE.md
git commit -m "Fix frontend API URL to use NodePort 30001"
git push origin devops
```

Commit: `9ed33b7`

---

## 🔄 Deployment Options

### Option 1: Rebuild Docker Image (Recommended)

#### Step 1: Build New Image
```bash
cd Frontend
docker build -t amineouhiba/inventory-frontend:latest .
```

#### Step 2: Push to Docker Hub
```bash
docker push amineouhiba/inventory-frontend:latest
```

#### Step 3: Restart Pods (ArgoCD will auto-sync)
```bash
kubectl rollout restart deployment/client-deployment -n inventory-system
```

or force ArgoCD to pull latest image:
```bash
kubectl delete pods -l app=inventory-client -n inventory-system
```

---

### Option 2: Use Jenkins CI/CD (if configured)

Trigger Jenkins pipeline to:
1. Build frontend with latest code from `devops` branch
2. Push new image to Docker Hub
3. ArgoCD will auto-detect and redeploy

---

### Option 3: Quick Test with Port Forward (Temporary)

For immediate testing without rebuilding:

```bash
# Forward backend service to port 3001
kubectl port-forward svc/server-service -n inventory-system 3001:3001

# Frontend will now connect successfully at localhost:3001
```

**Note:** This is temporary - stops when terminal closes

---

### Option 4: Local Development Mode

Run frontend locally (outside Kubernetes):

```bash
cd Frontend
npm install
REACT_APP_API_URL=http://localhost:30001 npm start
```

Access at `http://localhost:3000` - will connect to Kubernetes backend at `localhost:30001`

---

## 🎯 Why This Happened

1. **React Build-Time vs Runtime:**
   - React environment variables are embedded at **build time**
   - Even though we set `REACT_APP_API_URL` in Helm values, the existing Docker image was built before this

2. **Fallback URL:**
   - When `REACT_APP_API_URL` isn't available, app uses fallback
   - Old fallback: `localhost:3001` (wrong)
   - New fallback: `localhost:30001` (correct)

3. **Docker Image Caching:**
   - Kubernetes uses cached Docker image from Docker Hub
   - Need to rebuild and push new image for changes to take effect

---

## ✅ Verification Steps

After rebuilding and deploying:

### 1. Check Pod Logs
```bash
kubectl logs -l app=inventory-client -n inventory-system
```

Should NOT see `ERR_CONNECTION_REFUSED`

### 2. Test Backend Connection
```bash
curl http://localhost:30001/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "service": "Inventory Management Backend"
}
```

### 3. Test Frontend
Open browser: `http://localhost:30002`
- Should load without Network errors
- Should fetch products from backend successfully

### 4. Check Browser Console
Open DevTools → Console
- Should NOT see `ERR_CONNECTION_REFUSED`
- Should see successful API requests to `localhost:30001`

---

## 📊 Current State

- ✅ Source code fixed in Git (`9ed33b7`)
- ✅ ArgoCD synced to latest commit
- ⏳ Docker image needs rebuild
- ⏳ Pods need restart with new image

---

## 🚀 Recommended Next Steps

1. **Check Docker Hub Rate Limits:**
   ```bash
   docker login
   ```

2. **Rebuild Frontend Image:**
   ```bash
   cd Frontend
   docker build -t amineouhiba/inventory-frontend:v1.0.1 .
   docker tag amineouhiba/inventory-frontend:v1.0.1 amineouhiba/inventory-frontend:latest
   ```

3. **Push to Docker Hub:**
   ```bash
   docker push amineouhiba/inventory-frontend:v1.0.1
   docker push amineouhiba/inventory-frontend:latest
   ```

4. **Update Helm Chart (Optional - for versioning):**
   ```bash
   vim helm/inventory-system/values.yaml
   # Change: frontend.image.tag: "v1.0.1"
   
   git add helm/inventory-system/values.yaml
   git commit -m "Update frontend image to v1.0.1"
   git push origin devops
   ```

5. **ArgoCD Auto-Syncs:**
   - Detects Helm chart change
   - Deploys new pods with v1.0.1 image
   - Frontend now uses correct API URL! 🎉

---

## 🎓 Lessons Learned

1. **Environment Variables in React:**
   - Must be prefixed with `REACT_APP_`
   - Embedded at build time, not runtime
   - Always rebuild image after changing env vars

2. **Docker Image Versioning:**
   - Use semantic versioning (v1.0.1, v1.0.2, etc.)
   - Tag both versioned and `latest`
   - Helps track changes and rollback

3. **GitOps Workflow:**
   - Code change → Git push → ArgoCD sync
   - But: Docker images must be rebuilt separately
   - CI/CD pipeline automates this

4. **Kubernetes Networking:**
   - NodePort: `localhost:30001` (external access)
   - ClusterIP: `service-name:port` (internal only)
   - Always use NodePort for browser access

---

## 📞 Quick Reference

- **Frontend URL:** http://localhost:30002
- **Backend URL:** http://localhost:30001
- **Health Check:** http://localhost:30001/health
- **ArgoCD UI:** https://localhost:8080 (after port-forward)

```bash
# Start ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

---

**Status:** 🔧 **Waiting for Docker image rebuild**

Once the new image is built and pushed, the frontend will connect successfully! 🚀
