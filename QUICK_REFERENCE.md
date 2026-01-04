# 🚀 Quick Reference - Kubernetes Deployment Commands

## Prerequisites Setup
```bash
# Enable Kubernetes in Docker Desktop
# Settings → Kubernetes → Enable Kubernetes

# Verify setup
kubectl cluster-info
kubectl get nodes
```

## 🐳 Build & Push Docker Images
```bash
# Backend
cd Backend
docker build -t amineouhiba/inventory-backend:latest .
docker push amineouhiba/inventory-backend:latest

# Frontend
cd frontend
docker build -t amineouhiba/inventory-frontend:latest .
docker push amineouhiba/inventory-frontend:latest
```

## ⚙️ Deploy with Kubernetes Manifests
```bash
# Create namespace
kubectl create namespace inventory-system

# Apply all manifests
cd k8s-manifests
kubectl apply -f .

# Verify deployment
kubectl get all -n inventory-system
kubectl get pods -n inventory-system
```

## 📦 Deploy with Helm
```bash
# Install Helm chart
helm install inventory-system ./helm/inventory-system \
  -f ./helm/values-dev.yaml \
  --namespace inventory-system \
  --create-namespace

# Check deployment
helm list -n inventory-system
kubectl get pods -n inventory-system
```

## 🔄 Setup ArgoCD
```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8088:443
# Open: https://localhost:8088

# Create application
argocd app create inventory-system \
  --repo https://github.com/amineouhiba26/Inventory.git \
  --path k8s-manifests \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace inventory-system \
  --revision devops \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

## 🌐 Access Application
```bash
# Frontend: http://localhost:30002
# Backend:  http://localhost:30001

# Or with port-forwarding
kubectl port-forward -n inventory-system svc/client-service 3000:3000
kubectl port-forward -n inventory-system svc/server-service 3001:3001
```

## 🧪 Test Deployment
```bash
# Test backend health
curl http://localhost:30001/health

# Test backend API
curl http://localhost:30001/products

# Open frontend
open http://localhost:30002
```

## 📊 Monitor & Debug
```bash
# Watch pods
kubectl get pods -n inventory-system -w

# View logs
kubectl logs -n inventory-system -l app=inventory-server --tail=50 -f
kubectl logs -n inventory-system -l app=inventory-client --tail=50 -f

# Check ArgoCD sync
argocd app get inventory-system
argocd app sync inventory-system
```

## 🔄 Update & Redeploy
```bash
# After code changes:
1. Rebuild Docker image with new tag
docker build -t amineouhiba/inventory-backend:v2.0 .
docker push amineouhiba/inventory-backend:v2.0

2. Update manifest/values.yaml with new image tag

3. Commit and push
git add .
git commit -m "Update to v2.0"
git push origin devops

4. ArgoCD auto-syncs (or manual sync)
argocd app sync inventory-system
```

## 🧹 Cleanup
```bash
# Delete application
kubectl delete -f k8s-manifests/
# Or
helm uninstall inventory-system -n inventory-system
# Or
argocd app delete inventory-system

# Delete ArgoCD
kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Delete namespace
kubectl delete namespace inventory-system
kubectl delete namespace argocd
```

## 🛠️ Common Issues & Fixes

### CORS Error
```bash
# Update Backend/index.js to allow frontend origin
# Rebuild and push image
cd Backend
docker build -t amineouhiba/inventory-backend:latest .
docker push amineouhiba/inventory-backend:latest

# Restart deployment
kubectl rollout restart deployment/server-deployment -n inventory-system
```

### Pods Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n inventory-system
kubectl logs <pod-name> -n inventory-system

# Check events
kubectl get events -n inventory-system --sort-by='.lastTimestamp'
```

### ArgoCD Out of Sync
```bash
# Manual sync
argocd app sync inventory-system --force

# Check diff
argocd app diff inventory-system
```

---

**Complete Documentation**: See `KUBERNETES_DOCKER_DESKTOP_DEPLOYMENT.md`
