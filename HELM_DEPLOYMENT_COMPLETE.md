# Helm Charts Deployment - Complete ✅

**Date:** 4 Janvier 2026  
**Cluster:** Docker Desktop with Kubernetes  
**Helm Chart:** inventory-system v1.0.0

---

## ✅ Helm Deployment Status

### Helm Release Information

```bash
helm list
```

| NAME | NAMESPACE | REVISION | STATUS | CHART | APP VERSION |
|------|-----------|----------|--------|-------|-------------|
| inventory-app | default | 3 | deployed | inventory-system-1.0.0 | 1.0.0 |

**Revisions:**
- Rev 1: Initial deployment
- Rev 2: Fixed MONGODB_URI environment variable
- Rev 3: Increased frontend memory limits

---

## 📦 Helm Chart Structure

```
helm/inventory-system/
├── Chart.yaml                    # Chart metadata
├── values.yaml                   # Default configuration values
└── templates/
    ├── namespace.yaml            # Namespace creation
    ├── mongodb-deployment.yaml   # MongoDB deployment
    ├── mongodb-service.yaml      # MongoDB service (ClusterIP)
    ├── mongodb-pvc.yaml          # PersistentVolumeClaim (optional)
    ├── backend-deployment.yaml   # Backend API deployment
    ├── backend-service.yaml      # Backend service (NodePort)
    ├── frontend-deployment.yaml  # Frontend React app deployment
    └── frontend-service.yaml     # Frontend service (NodePort)
```

---

## ⚙️ Configuration (values.yaml)

### Namespace
```yaml
namespace: inventory-system
```

### MongoDB Configuration
```yaml
mongodb:
  enabled: true
  replicaCount: 1
  image:
    repository: mongo
    tag: "7"
  service:
    type: ClusterIP
    port: 27017
  persistence:
    enabled: false  # Using emptyDir for simplicity
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
```

### Backend Configuration
```yaml
backend:
  enabled: true
  replicaCount: 3
  image:
    repository: amineouhiba/inventory-backend
    tag: "latest"
  service:
    type: NodePort
    port: 3001
    nodePort: 30001
  env:
    PORT: "3001"
    MONGODB_URI: "mongodb://mongodb-service:27017/inventory"
    NODE_ENV: "production"
  healthCheck:
    enabled: true
    path: /health
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
```

### Frontend Configuration
```yaml
frontend:
  enabled: true
  replicaCount: 3
  image:
    repository: amineouhiba/inventory-frontend
    tag: "latest"
  service:
    type: NodePort
    port: 3000
    nodePort: 30002
  env:
    REACT_APP_API_URL: "http://localhost:30001"
  resources:
    requests:
      memory: "512Mi"  # Increased for dev server
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"
```

---

## 🚀 Deployment Commands

### Install the Chart
```bash
helm install inventory-app ./helm/inventory-system
```

### Upgrade the Chart
```bash
helm upgrade inventory-app ./helm/inventory-system
```

### Uninstall the Chart
```bash
helm uninstall inventory-app
```

### Check Status
```bash
helm status inventory-app
helm list
```

### View History
```bash
helm history inventory-app
```

### Rollback to Previous Version
```bash
helm rollback inventory-app 2
```

---

## 🔍 Verification

### Check All Resources
```bash
kubectl get all -n inventory-system
```

**Result:**
- ✅ 3 Frontend pods running
- ✅ 3 Backend pods running  
- ✅ 1 MongoDB pod running
- ✅ 3 Services (client, server, mongodb)
- ✅ 3 Deployments

### Test Backend Health
```bash
curl http://localhost:30001/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-04T14:28:42.228Z",
  "service": "Inventory Management Backend"
}
```

### Test Frontend
```bash
curl http://localhost:30002
```

✅ Returns React HTML

---

## 📊 Deployed Resources

### Pods (7 total)
```
NAME                                  READY   STATUS
client-deployment-f67dd9567-jxqnz     1/1     Running
client-deployment-f67dd9567-qkqzw     1/1     Running
client-deployment-f67dd9567-tc4vc     1/1     Running
mongodb-deployment-76465ffb4d-cs2fp   1/1     Running
server-deployment-5cf65c9657-8rf2h    1/1     Running
server-deployment-5cf65c9657-rwjs2    1/1     Running
server-deployment-5cf65c9657-zmtf6    1/1     Running
```

### Services
```
NAME              TYPE        PORT(S)          
client-service    NodePort    3000:30002/TCP   
server-service    NodePort    3001:30001/TCP   
mongodb-service   ClusterIP   27017/TCP        
```

### Deployments
```
NAME                 READY   UP-TO-DATE   AVAILABLE
client-deployment    3/3     3            3
server-deployment    3/3     3            3
mongodb-deployment   1/1     1            1
```

---

## 🎯 Helm Chart Features

### 1. Templating
- Dynamic resource names based on chart values
- Conditional rendering (`{{- if .Values.enabled }}`)
- Resource limits and requests from values
- Environment variables from values

### 2. Versioning
- Chart version: 1.0.0
- App version: 1.0.0
- Revision tracking (currently at revision 3)

### 3. Configuration Management
- Centralized `values.yaml`
- Easy environment-specific overrides
- Support for multiple environments (dev, prod)

### 4. Health Checks
- Liveness probes for backend
- Readiness probes for backend
- Automatic pod restart on failure

### 5. Resource Management
- CPU and memory requests
- CPU and memory limits
- Prevents resource exhaustion

---

## 🌐 Access URLs

- **Frontend:** http://localhost:30002
- **Backend API:** http://localhost:30001
- **Health Check:** http://localhost:30001/health

---

## 🔧 Customization

### Override Values on Install
```bash
helm install inventory-app ./helm/inventory-system \
  --set backend.replicaCount=5 \
  --set frontend.replicaCount=2
```

### Use Different Values File
```bash
helm install inventory-app ./helm/inventory-system \
  -f helm/values-prod.yaml
```

### Dry Run (Preview)
```bash
helm install inventory-app ./helm/inventory-system --dry-run --debug
```

---

## 📝 Troubleshooting Issues Resolved

### Issue 1: Backend CrashLoopBackOff
**Problem:** Backend pods were crashing with MongoDB URI error  
**Cause:** Environment variable mismatch (MONGO_URI vs MONGODB_URI)  
**Solution:** Updated values.yaml and template to use MONGODB_URI  
**Resolution:** Revision 2

### Issue 2: Frontend CrashLoopBackOff
**Problem:** Frontend pods running out of memory  
**Cause:** Development server (`npm start`) requires more resources  
**Solution:** Increased memory limits from 256Mi to 1Gi  
**Resolution:** Revision 3

---

## ✅ Benefits of Using Helm

1. **Package Management:** Single command to install entire application
2. **Versioning:** Track changes and rollback easily
3. **Reusability:** Deploy to multiple environments with different values
4. **Templating:** DRY principle - don't repeat YAML
5. **Upgrade Management:** Rolling updates with revision history
6. **Dependency Management:** Can manage chart dependencies
7. **Hooks:** Pre/post install/upgrade hooks for complex operations

---

## 🎓 Lessons Learned

1. **Environment Variables:** Always verify env var names match application code
2. **Resource Limits:** Dev servers need more resources than production builds
3. **Helm Revisions:** Easy rollback with `helm rollback`
4. **Health Checks:** Liveness/readiness probes ensure pod health
5. **Dry Run:** Always test with `--dry-run` before deploying

---

## 🚀 Next Steps

1. ✅ **Helm Charts** - COMPLETE
2. 🔜 **ArgoCD GitOps** - Configure automatic deployment from Git
3. 🔜 **Production Build** - Optimize frontend Dockerfile for production
4. 🔜 **Persistent Storage** - Enable MongoDB persistence
5. 🔜 **Ingress** - Replace NodePort with Ingress for better routing

---

## 📚 Useful Helm Commands

```bash
# List all releases
helm list --all-namespaces

# Get release values
helm get values inventory-app

# Get release manifest
helm get manifest inventory-app

# Lint chart before deploying
helm lint ./helm/inventory-system

# Package chart
helm package ./helm/inventory-system

# Search chart repository
helm search repo inventory

# Show chart information
helm show chart ./helm/inventory-system
helm show values ./helm/inventory-system

# Template chart (render templates locally)
helm template inventory-app ./helm/inventory-system

# Delete release and keep history
helm uninstall inventory-app --keep-history

# Test chart
helm test inventory-app
```

---

## ✅ Deployment Complete!

The Inventory Management System is now successfully deployed using **Helm Charts**! 🎉

**Current State:**
- ✅ Helm release: inventory-app (revision 3)
- ✅ Namespace: inventory-system
- ✅ All 7 pods running
- ✅ All services accessible
- ✅ Backend health check passing
- ✅ Frontend accessible

Ready for ArgoCD setup! 🚀
