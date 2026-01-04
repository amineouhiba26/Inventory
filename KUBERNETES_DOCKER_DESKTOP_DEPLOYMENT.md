# 🚀 Kubernetes Deployment Guide - Docker Desktop

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Kubernetes Cluster Setup](#step-1-kubernetes-cluster-setup)
- [Step 2: Build and Push Docker Images](#step-2-build-and-push-docker-images)
- [Step 3: Deploy with Kubernetes Manifests](#step-3-deploy-with-kubernetes-manifests)
- [Step 4: Deploy with Helm Charts](#step-4-deploy-with-helm-charts)
- [Step 5: GitOps with ArgoCD](#step-5-gitops-with-argocd)
- [Access Your Application](#access-your-application)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide documents the **Kubernetes deployment** of the MERN Stack Inventory Management System using:
- ✅ **Docker Desktop** - Local Kubernetes cluster
- ✅ **Kubernetes Manifests** - Deployments, Services, ConfigMaps
- ✅ **Helm Charts** - Package management and templating
- ✅ **ArgoCD** - GitOps continuous deployment

---

## 📦 Prerequisites

### 1. Install Required Tools

```bash
# Docker Desktop (includes Kubernetes)
# Download from: https://www.docker.com/products/docker-desktop

# Helm (Package Manager for Kubernetes)
brew install helm

# kubectl (Kubernetes CLI)
brew install kubectl

# ArgoCD CLI
brew install argocd
```

### 2. Verify Installations

```bash
# Check Docker
docker --version

# Check Kubernetes
kubectl version --client

# Check Helm
helm version

# Check ArgoCD CLI
argocd version --client
```

---

## 🔧 Step 1: Kubernetes Cluster Setup

### 1.1 Enable Kubernetes in Docker Desktop

1. Open **Docker Desktop**
2. Go to **Settings** → **Kubernetes**
3. Check **Enable Kubernetes**
4. Click **Apply & Restart**
5. Wait for Kubernetes to start (green indicator)

### 1.2 Verify Cluster is Running

```bash
# Check cluster info
kubectl cluster-info

# Check current context
kubectl config current-context
# Output: docker-desktop

# Check nodes
kubectl get nodes
# Output: docker-desktop   Ready   control-plane   ...
```

### 1.3 Create Namespace (Optional but Recommended)

```bash
# Create dedicated namespace for the application
kubectl create namespace inventory-system

# Set as default namespace
kubectl config set-context --current --namespace=inventory-system
```

---

## 🐳 Step 2: Build and Push Docker Images

### 2.1 Build Backend Image

```bash
# Navigate to backend directory
cd Backend

# Build Docker image
docker build -t amineouhiba/inventory-backend:latest .

# Push to Docker Hub
docker login
docker push amineouhiba/inventory-backend:latest
```

### 2.2 Build Frontend Image

```bash
# Navigate to frontend directory
cd ../frontend

# Build Docker image
docker build -t amineouhiba/inventory-frontend:latest .

# Push to Docker Hub
docker push amineouhiba/inventory-frontend:latest
```

### 2.3 Verify Images

```bash
# List local images
docker images | grep inventory

# Expected output:
# amineouhiba/inventory-backend    latest    ...
# amineouhiba/inventory-frontend   latest    ...
```

---

## ⚙️ Step 3: Deploy with Kubernetes Manifests

### 3.1 Project Structure

```
k8s-manifests/
├── namespace.yaml              # Namespace definition
├── app-configmap.yaml          # Application configuration
├── mongodb-deployment.yaml     # MongoDB database
├── mongodb-service.yaml        # MongoDB service
├── server-deployment.yaml      # Backend deployment
├── server-service.yaml         # Backend service (NodePort)
├── client-deployment.yaml      # Frontend deployment
└── client-service.yaml         # Frontend service (NodePort)
```

### 3.2 Apply Kubernetes Manifests

```bash
# Navigate to manifests directory
cd k8s-manifests

# Apply all manifests in order
kubectl apply -f app-configmap.yaml
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f mongodb-service.yaml
kubectl apply -f server-deployment.yaml
kubectl apply -f server-service.yaml
kubectl apply -f client-deployment.yaml
kubectl apply -f client-service.yaml

# Or apply all at once
kubectl apply -f .
```

### 3.3 Verify Deployment

```bash
# Check all resources
kubectl get all -n inventory-system

# Check pods status
kubectl get pods -n inventory-system
# All pods should be in "Running" state

# Check services
kubectl get svc -n inventory-system
# Output shows NodePort services on ports 30001 and 30002

# Check deployments
kubectl get deployments -n inventory-system

# Check configmaps
kubectl get configmap -n inventory-system
```

### 3.4 Check Pod Logs

```bash
# Backend logs
kubectl logs -n inventory-system -l app=inventory-server --tail=50

# Frontend logs
kubectl logs -n inventory-system -l app=inventory-client --tail=50

# MongoDB logs
kubectl logs -n inventory-system -l app=mongodb --tail=50

# Follow logs in real-time
kubectl logs -n inventory-system -l app=inventory-server -f
```

---

## 📦 Step 4: Deploy with Helm Charts

### 4.1 Helm Chart Structure

```
helm/
└── inventory-system/
    ├── Chart.yaml                      # Chart metadata
    ├── values.yaml                     # Default values
    ├── values-dev.yaml                 # Development environment
    ├── values-prod.yaml                # Production environment
    └── templates/
        ├── namespace.yaml              # Namespace
        ├── backend-deployment.yaml     # Backend deployment
        ├── backend-service.yaml        # Backend service
        ├── frontend-deployment.yaml    # Frontend deployment
        ├── frontend-service.yaml       # Frontend service
        ├── mongodb-deployment.yaml     # MongoDB deployment
        ├── mongodb-service.yaml        # MongoDB service
        └── mongodb-pvc.yaml            # Persistent volume claim
```

### 4.2 Install with Helm

```bash
# Navigate to project root
cd /path/to/Inventory-Management-System-MERN-CRUD-App

# Install Helm chart (development)
helm install inventory-system ./helm/inventory-system \
  -f ./helm/values-dev.yaml \
  --namespace inventory-system \
  --create-namespace

# Install for production
helm install inventory-system ./helm/inventory-system \
  -f ./helm/values-prod.yaml \
  --namespace inventory-system \
  --create-namespace
```

### 4.3 Helm Management Commands

```bash
# List installed releases
helm list -n inventory-system

# Get release status
helm status inventory-system -n inventory-system

# Upgrade release
helm upgrade inventory-system ./helm/inventory-system \
  -f ./helm/values-dev.yaml \
  --namespace inventory-system

# Rollback to previous version
helm rollback inventory-system -n inventory-system

# Uninstall release
helm uninstall inventory-system -n inventory-system

# View rendered templates (dry-run)
helm template inventory-system ./helm/inventory-system \
  -f ./helm/values-dev.yaml
```

---

## 🔄 Step 5: GitOps with ArgoCD

### 5.1 Install ArgoCD

```bash
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Verify installation
kubectl get pods -n argocd
```

### 5.2 Access ArgoCD UI

```bash
# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo

# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8088:443

# Access ArgoCD UI
# URL: https://localhost:8088
# Username: admin
# Password: <password from above>
```

### 5.3 Configure ArgoCD CLI Login

```bash
# Login to ArgoCD
argocd login localhost:8088 --insecure

# Update admin password (recommended)
argocd account update-password
```

### 5.4 Create ArgoCD Application

#### Option A: Using ArgoCD UI

1. Click **+ NEW APP**
2. Fill in details:
   - **Application Name**: `inventory-system`
   - **Project**: `default`
   - **Sync Policy**: `Automatic`
   - **Repository URL**: `https://github.com/amineouhiba26/Inventory.git`
   - **Revision**: `devops`
   - **Path**: `k8s-manifests`
   - **Cluster**: `https://kubernetes.default.svc`
   - **Namespace**: `inventory-system`
3. Click **CREATE**

#### Option B: Using ArgoCD CLI

```bash
# Create application from CLI
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

#### Option C: Using Kubernetes Manifests

```bash
# Apply ArgoCD application manifest
kubectl apply -f argocd/application.yaml
```

### 5.5 ArgoCD Management Commands

```bash
# List applications
argocd app list

# Get application details
argocd app get inventory-system

# Sync application manually
argocd app sync inventory-system

# View sync status
argocd app wait inventory-system --health

# View application logs
argocd app logs inventory-system

# Delete application
argocd app delete inventory-system
```

### 5.6 Enable Auto-Sync

```bash
# Enable auto-sync for the application
argocd app set inventory-system --sync-policy automated

# Enable auto-prune (delete resources removed from Git)
argocd app set inventory-system --auto-prune

# Enable self-heal (auto-sync when cluster state differs)
argocd app set inventory-system --self-heal
```

---

## 🌐 Access Your Application

### Method 1: NodePort Access (Docker Desktop)

```bash
# Frontend: http://localhost:30002
# Backend API: http://localhost:30001

# Open in browser
open http://localhost:30002
```

### Method 2: Port Forwarding

```bash
# Port forward frontend
kubectl port-forward -n inventory-system svc/client-service 3000:3000

# Port forward backend
kubectl port-forward -n inventory-system svc/server-service 3001:3001

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Method 3: Get Service URLs

```bash
# Get service information
kubectl get svc -n inventory-system

# Output:
# NAME              TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
# client-service    NodePort    10.111.103.115   <none>        3000:30002/TCP   30m
# server-service    NodePort    10.104.165.207   <none>        3001:30001/TCP   30m
# mongodb-service   ClusterIP   10.101.212.13    <none>        27017/TCP        30m
```

---

## 🧪 Testing the Deployment

### Test Backend API

```bash
# Health check
curl http://localhost:30001/health

# Get all products
curl http://localhost:30001/products

# Create a product
curl -X POST http://localhost:30001/insertproduct \
  -H "Content-Type: application/json" \
  -d '{
    "ProductName": "Test Product",
    "ProductPrice": "99.99",
    "ProductBarcode": "123456789"
  }'
```

### Test Frontend

```bash
# Open in browser
open http://localhost:30002

# Or use curl
curl http://localhost:30002
```

---

## 📊 Monitoring and Debugging

### Check Application Health

```bash
# Get pod status
kubectl get pods -n inventory-system -w

# Describe pod for details
kubectl describe pod <pod-name> -n inventory-system

# Get pod logs
kubectl logs <pod-name> -n inventory-system

# Execute commands in pod
kubectl exec -it <pod-name> -n inventory-system -- /bin/sh
```

### Check ArgoCD Sync Status

```bash
# Via CLI
argocd app get inventory-system

# Via UI
# https://localhost:8088/applications/inventory-system
```

### Common Kubectl Commands

```bash
# Get all resources
kubectl get all -n inventory-system

# Watch pod status
kubectl get pods -n inventory-system -w

# Get events
kubectl get events -n inventory-system --sort-by='.lastTimestamp'

# Get resource usage
kubectl top pods -n inventory-system
kubectl top nodes

# Scale deployment
kubectl scale deployment/server-deployment --replicas=5 -n inventory-system

# Restart deployment
kubectl rollout restart deployment/server-deployment -n inventory-system

# Check rollout status
kubectl rollout status deployment/server-deployment -n inventory-system

# View rollout history
kubectl rollout history deployment/server-deployment -n inventory-system
```

---

## 🔄 Update and Redeploy

### Update Application Code

```bash
# 1. Make code changes
# 2. Rebuild Docker image
cd Backend
docker build -t amineouhiba/inventory-backend:v2.0 .
docker push amineouhiba/inventory-backend:v2.0

# 3. Update deployment manifest or values.yaml
# Change image tag to v2.0

# 4. Commit and push changes
git add .
git commit -m "Update backend to v2.0"
git push origin devops

# 5. ArgoCD will automatically sync (if auto-sync enabled)
# Or manually sync:
argocd app sync inventory-system
```

### Rolling Update

```bash
# Update image via kubectl
kubectl set image deployment/server-deployment \
  inventory-server=amineouhiba/inventory-backend:v2.0 \
  -n inventory-system

# Monitor rollout
kubectl rollout status deployment/server-deployment -n inventory-system
```

---

## 🧹 Cleanup

### Remove Application (Keep ArgoCD)

```bash
# Delete via ArgoCD
argocd app delete inventory-system

# Or delete via kubectl
kubectl delete -f k8s-manifests/

# Or uninstall Helm release
helm uninstall inventory-system -n inventory-system
```

### Remove Everything (Including ArgoCD)

```bash
# Delete ArgoCD
kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl delete namespace argocd

# Delete application namespace
kubectl delete namespace inventory-system

# Stop port forwarding
pkill -f "port-forward"
```

---

## 🐛 Troubleshooting

### Issue 1: Pods Not Starting

```bash
# Check pod status
kubectl get pods -n inventory-system

# Describe pod for events
kubectl describe pod <pod-name> -n inventory-system

# Check logs
kubectl logs <pod-name> -n inventory-system

# Common causes:
# - Image pull errors: Check image name and Docker Hub credentials
# - Resource limits: Check if enough CPU/memory available
# - ConfigMap issues: Verify ConfigMap exists and has correct data
```

### Issue 2: CORS Errors

```bash
# Problem: Frontend can't connect to backend due to CORS

# Solution 1: Update backend CORS configuration
# Edit Backend/index.js to allow frontend origin

# Solution 2: Use port-forwarding instead of NodePort
kubectl port-forward -n inventory-system svc/server-service 3001:3001
kubectl port-forward -n inventory-system svc/client-service 3000:3000

# Access at http://localhost:3000
```

### Issue 3: ArgoCD Out of Sync

```bash
# Check sync status
argocd app get inventory-system

# Manual sync
argocd app sync inventory-system

# Hard refresh
argocd app sync inventory-system --force

# Check for drift
argocd app diff inventory-system
```

### Issue 4: Database Connection Issues

```bash
# Check MongoDB pod
kubectl get pods -n inventory-system -l app=mongodb

# Check MongoDB logs
kubectl logs -n inventory-system -l app=mongodb

# Verify MongoDB service
kubectl get svc mongodb-service -n inventory-system

# Test connection from backend pod
kubectl exec -it <backend-pod> -n inventory-system -- sh
wget -O- http://mongodb-service:27017
```

### Issue 5: NodePort Not Accessible

```bash
# Verify service type
kubectl get svc -n inventory-system

# Check if port is in valid range (30000-32767)
kubectl describe svc client-service -n inventory-system

# For Docker Desktop, use localhost
# Frontend: http://localhost:30002
# Backend: http://localhost:30001
```

---

## 📚 Additional Resources

### Documentation

- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [Docker Desktop Kubernetes](https://docs.docker.com/desktop/kubernetes/)
- [Helm Documentation](https://helm.sh/docs/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)

### Useful Commands Cheat Sheet

```bash
# Kubernetes
kubectl get pods -A                          # All pods in all namespaces
kubectl get all -n <namespace>               # All resources in namespace
kubectl describe <resource> <name>           # Resource details
kubectl logs <pod> -f                        # Follow logs
kubectl exec -it <pod> -- /bin/sh           # Shell into pod
kubectl port-forward svc/<service> 8080:80  # Port forward
kubectl apply -f <file>                      # Apply manifest
kubectl delete -f <file>                     # Delete resources

# Helm
helm list -A                                 # List all releases
helm install <name> <chart>                  # Install chart
helm upgrade <name> <chart>                  # Upgrade release
helm rollback <name>                         # Rollback release
helm uninstall <name>                        # Uninstall release

# ArgoCD
argocd app list                              # List applications
argocd app get <name>                        # Get app details
argocd app sync <name>                       # Sync application
argocd app delete <name>                     # Delete application
```

---

## ✅ Summary

You have successfully deployed the MERN Stack Inventory Management System with:

1. ✅ **Kubernetes on Docker Desktop** - Local cluster setup
2. ✅ **Docker Images** - Backend and Frontend containerized
3. ✅ **Kubernetes Manifests** - Deployments, Services, ConfigMaps
4. ✅ **Helm Charts** - Package management with values for dev/prod
5. ✅ **ArgoCD** - GitOps continuous deployment with auto-sync

### Quick Start Commands

```bash
# Start everything
kubectl apply -f k8s-manifests/

# Or with Helm
helm install inventory-system ./helm/inventory-system -n inventory-system --create-namespace

# Access application
open http://localhost:30002

# View in ArgoCD
open https://localhost:8088
```

---

**Last Updated**: January 4, 2026  
**Author**: Amine Ouhiba  
**Repository**: https://github.com/amineouhiba26/Inventory
