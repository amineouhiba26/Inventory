# ArgoCD GitOps Setup Guide

This guide explains how to set up ArgoCD for GitOps-based deployment of the Inventory Management System.

---

## 📋 Prerequisites

- Kubernetes cluster running (Docker Desktop)
- kubectl configured
- Helm installed
- Git repository with the project code

---

## 🚀 ArgoCD Installation

### 1. Create ArgoCD Namespace
```bash
kubectl create namespace argocd
```

### 2. Install ArgoCD
```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. Wait for ArgoCD Pods to be Ready
```bash
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
```

### 4. Check ArgoCD Installation
```bash
kubectl get pods -n argocd
```

**Expected Output:**
```
NAME                                                READY   STATUS
argocd-application-controller-0                     1/1     Running
argocd-applicationset-controller-xxx                1/1     Running
argocd-dex-server-xxx                               1/1     Running
argocd-notifications-controller-xxx                 1/1     Running
argocd-redis-xxx                                    1/1     Running
argocd-repo-server-xxx                              1/1     Running
argocd-server-xxx                                   1/1     Running
```

---

## 🔐 Access ArgoCD UI

### Method 1: Port Forward
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then access: https://localhost:8080

### Method 2: NodePort (for Docker Desktop)
```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```

Get the NodePort:
```bash
kubectl get svc argocd-server -n argocd
```

### Get Initial Admin Password
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

**Login Credentials:**
- Username: `admin`
- Password: (output from above command)

---

## 📦 Deploy Application with ArgoCD

### 1. Apply ArgoCD Application Manifest
```bash
kubectl apply -f argocd/application.yaml
```

### 2. Check Application Status
```bash
kubectl get application -n argocd
```

### 3. Sync Application (if not auto-synced)
```bash
# Using kubectl
kubectl patch application inventory-system -n argocd --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{}}}'

# Using ArgoCD CLI
argocd app sync inventory-system
```

---

## 🎯 ArgoCD Application Configuration

### Application Manifest (argocd/application.yaml)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: inventory-system
  namespace: argocd
spec:
  project: default
  
  source:
    repoURL: https://github.com/amineouhiba26/Inventory.git
    targetRevision: devops
    path: helm/inventory-system
    helm:
      valueFiles:
        - values.yaml
  
  destination:
    server: https://kubernetes.default.svc
    namespace: inventory-system
  
  syncPolicy:
    automated:
      prune: true       # Auto-delete resources
      selfHeal: true    # Auto-sync on drift
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
```

**Key Features:**
- **Automated Sync:** Automatically deploys changes from Git
- **Self-Heal:** Reverts manual changes to match Git state
- **Prune:** Deletes resources removed from Git
- **Create Namespace:** Auto-creates namespace if missing

---

## 🔄 GitOps Workflow

### How It Works

```
1. Developer pushes code to Git
   ↓
2. ArgoCD detects changes (polls every 3 minutes)
   ↓
3. ArgoCD compares Git state vs Cluster state
   ↓
4. ArgoCD syncs differences
   ↓
5. Kubernetes resources updated
```

### Manual Sync
```bash
# Via kubectl
kubectl patch application inventory-system -n argocd --type merge -p '{"spec":{"syncPolicy":{"syncOptions":["CreateNamespace=true"]}}}'

# Via ArgoCD CLI
argocd app sync inventory-system --force
```

### Refresh Application
```bash
argocd app get inventory-system --refresh
```

---

## 📊 Monitoring with ArgoCD

### Check Application Health
```bash
argocd app get inventory-system
```

### View Sync History
```bash
argocd app history inventory-system
```

### View Application Resources
```bash
argocd app resources inventory-system
```

### View Application Logs
```bash
argocd app logs inventory-system
```

---

## 🔧 ArgoCD CLI Installation

### macOS
```bash
brew install argocd
```

### Linux
```bash
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
```

### Windows
```bash
choco install argocd-cli
```

### Login to ArgoCD
```bash
# Port-forward first
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Login
argocd login localhost:8080
```

---

## 🎨 ArgoCD UI Features

### Application View
- **Sync Status:** Shows if app is synced with Git
- **Health Status:** Shows if resources are healthy
- **Sync Policy:** Auto/manual sync configuration
- **Repository:** Git repo and branch
- **Last Sync:** Time of last sync

### Resource Tree
- Visual representation of all Kubernetes resources
- Click on any resource to see details
- Shows parent-child relationships

### Sync Options
- **Sync:** Manually sync application
- **Refresh:** Check for changes without syncing
- **Delete:** Remove application
- **Hard Refresh:** Force refresh

---

## 🔐 ArgoCD RBAC (Optional)

### Create Read-Only User
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.csv: |
    p, role:readonly, applications, get, */*, allow
    p, role:readonly, applications, list, */*, allow
    g, developer, role:readonly
```

---

## 🚨 Troubleshooting

### Application OutOfSync
```bash
# Check diff
argocd app diff inventory-system

# Force sync
argocd app sync inventory-system --force
```

### Application Degraded
```bash
# Check logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server

# Check application events
kubectl describe application inventory-system -n argocd
```

### Sync Failed
```bash
# View sync operation
argocd app get inventory-system --show-operation

# Retry sync
argocd app sync inventory-system --retry-limit 5
```

---

## ✅ Verification Checklist

- [ ] ArgoCD installed and running
- [ ] ArgoCD UI accessible
- [ ] ArgoCD Application created
- [ ] Application synced successfully
- [ ] All resources healthy
- [ ] Auto-sync enabled
- [ ] Self-heal enabled
- [ ] Git repository accessible

---

## 📝 Best Practices

1. **Use Branches:** Deploy dev from `dev` branch, prod from `main`
2. **Enable Auto-Sync:** For dev environments
3. **Disable Auto-Sync:** For production (manual approvals)
4. **Use Projects:** Organize applications by team/environment
5. **Set Resource Quotas:** Prevent resource exhaustion
6. **Monitor Sync Status:** Set up alerts for sync failures
7. **Use Webhooks:** Faster sync instead of polling
8. **Backup ArgoCD:** Backup ArgoCD configuration regularly

---

## 🔄 Updating Application

### Via Git (Recommended)
```bash
# 1. Update Helm values or manifests
vim helm/inventory-system/values.yaml

# 2. Commit and push
git add helm/inventory-system/values.yaml
git commit -m "Update backend replicas to 5"
git push

# 3. ArgoCD auto-syncs (if enabled)
# Or manually sync
argocd app sync inventory-system
```

### Via ArgoCD UI
1. Navigate to application
2. Click "APP DETAILS"
3. Click "PARAMETERS"
4. Modify parameters
5. Click "SYNC"

---

## 🎯 Next Steps

1. Set up GitHub webhook for instant sync
2. Configure ArgoCD notifications (Slack, email)
3. Set up multi-environment deployment (dev, staging, prod)
4. Implement ArgoCD ApplicationSet for multi-cluster
5. Add Prometheus metrics for ArgoCD
6. Set up ArgoCD Image Updater for automatic image updates

---

## 📚 Useful ArgoCD Commands

```bash
# List all applications
argocd app list

# Get application details
argocd app get inventory-system

# Sync application
argocd app sync inventory-system

# Delete application
argocd app delete inventory-system

# Rollback to previous version
argocd app rollback inventory-system 2

# Set auto-sync
argocd app set inventory-system --sync-policy automated

# Disable auto-sync
argocd app set inventory-system --sync-policy none

# Update application from Git
argocd app sync inventory-system --prune

# View application logs
argocd app logs inventory-system --follow

# View application events
argocd app get inventory-system --show-params

# Compare Git vs Cluster
argocd app diff inventory-system
```

---

## 🎓 Learning Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)
- [GitOps with ArgoCD](https://www.gitops.tech/)

---

Ready to deploy with GitOps! 🚀
