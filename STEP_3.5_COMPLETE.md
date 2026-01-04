# ✅ Step 3.5 Complete: Monitoring & Observability

## 🎯 What Was Implemented

### ✅ Prometheus Deployment
- **Purpose**: Metrics collection and storage
- **Access**: http://localhost:30090
- **Features**:
  - Kubernetes cluster metrics
  - Application metrics
  - Service discovery
  - 15-day data retention
  - PromQL query interface

### ✅ Grafana Deployment
- **Purpose**: Visualization and dashboards
- **Access**: http://localhost:30300
- **Credentials**:
  - Username: `admin`
  - Password: `admin123`
- **Features**:
  - Pre-configured Prometheus datasource
  - Custom Inventory Management dashboard
  - Real-time metrics visualization
  - Extensible with community dashboards

### ✅ Kube-State-Metrics
- **Purpose**: Kubernetes cluster state metrics
- **Features**:
  - Pod status and health
  - Deployment replicas
  - Resource quotas
  - Node conditions

---

## 📊 Current Status

```
┌──────────────────────────────────────────────┐
│         MONITORING STACK STATUS              │
├──────────────────────────────────────────────┤
│ Namespace:     monitoring                    │
│ Pods:          3/3 Running                   │
│   - Prometheus                               │
│   - Grafana                                  │
│   - Kube-State-Metrics                       │
│                                              │
│ Services:      3                             │
│   - prometheus    (NodePort: 30090)         │
│   - grafana       (NodePort: 30300)         │
│   - kube-state-metrics (ClusterIP)          │
│                                              │
│ Status:        ✅ Healthy & Running          │
└──────────────────────────────────────────────┘
```

---

## 🚀 Quick Access

### Prometheus UI
```bash
# URL
http://localhost:30090

# Health Check
curl http://localhost:30090/-/healthy

# Query metrics
http://localhost:30090/graph

# View targets
http://localhost:30090/targets
```

### Grafana UI
```bash
# URL
http://localhost:30300

# Login
Username: admin
Password: admin123

# Access dashboard
http://localhost:30300/d/inventory-dashboard
```

---

## 📈 Metrics Being Collected

### Kubernetes Cluster Metrics
- Node CPU, Memory, Disk, Network
- Pod resource usage
- Container resource limits/requests
- Deployment status and replicas
- Service endpoints

### Application Metrics (Available)
- Inventory Backend pods
- Inventory Frontend pods
- MongoDB database

### Custom Metrics (If Implemented)
- HTTP request rate
- HTTP request duration
- Error rates
- Business metrics

---

## 🎨 Available Dashboards

### 1. Inventory Management System Dashboard
- **Location**: Grafana → Dashboards → Inventory Management System
- **Panels**:
  - Pod CPU Usage
  - Pod Memory Usage
  - Network I/O
  - Pod Status

### 2. Import Additional Dashboards
Popular community dashboards you can import:

```
Dashboard ID: 7249  - Kubernetes Cluster Monitoring (Official)
Dashboard ID: 8588  - Kubernetes Deployment Metrics
Dashboard ID: 1860  - Node Exporter Full
Dashboard ID: 6417  - Kubernetes Cluster (Prometheus)
```

**How to Import**:
1. Go to Grafana UI (http://localhost:30300)
2. Click **+** → **Import**
3. Enter Dashboard ID
4. Select **Prometheus** as datasource
5. Click **Import**

---

## 🔍 Useful Queries

### Check Pods in Prometheus

```promql
# All pods in inventory-system
up{namespace="inventory-system"}

# CPU usage by pod
sum(rate(container_cpu_usage_seconds_total{namespace="inventory-system"}[5m])) by (pod)

# Memory usage by pod
sum(container_memory_usage_bytes{namespace="inventory-system"}) by (pod)

# Pod restart count
kube_pod_container_status_restarts_total{namespace="inventory-system"}

# Available replicas
kube_deployment_status_replicas_available{namespace="inventory-system"}
```

---

## 🧪 Testing

### Generate Load
```bash
# Create some traffic to backend
for i in {1..50}; do
  curl -s http://localhost:30001/products > /dev/null
  sleep 1
done
```

### View Metrics
```bash
# Check Prometheus targets
http://localhost:30090/targets

# Query in Prometheus
http://localhost:30090/graph?g0.expr=up

# View in Grafana
http://localhost:30300/d/inventory-dashboard
```

---

## 📝 Verification Checklist

- [x] Prometheus deployed and running
- [x] Grafana deployed and running
- [x] Kube-State-Metrics deployed and running
- [x] Prometheus accessible at http://localhost:30090
- [x] Grafana accessible at http://localhost:30300
- [x] Prometheus scraping Kubernetes metrics
- [x] Prometheus scraping application pods
- [x] Grafana connected to Prometheus datasource
- [x] Dashboard pre-configured and accessible

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────┐
│                 MONITORING FLOW                     │
└─────────────────────────────────────────────────────┘

Kubernetes API ─┐
Nodes          ─┤
Pods           ─┤
Services       ─┼─▶ Prometheus ──▶ Grafana ──▶ User
cAdvisor       ─┤    (Scrape)       (Query)
Kube-State     ─┤
Metrics        ─┘

Prometheus collects metrics every 15s
Stores data for 15 days
Grafana queries Prometheus for visualization
```

---

## 🔧 Management Commands

### View Resources
```bash
# All monitoring resources
kubectl get all -n monitoring

# Pods only
kubectl get pods -n monitoring

# Services
kubectl get svc -n monitoring

# ConfigMaps
kubectl get configmap -n monitoring
```

### View Logs
```bash
# Prometheus logs
kubectl logs -n monitoring -l app=prometheus --tail=50 -f

# Grafana logs
kubectl logs -n monitoring -l app=grafana --tail=50 -f

# Kube-State-Metrics logs
kubectl logs -n monitoring -l app=kube-state-metrics --tail=50
```

### Restart Services
```bash
# Restart Prometheus
kubectl rollout restart deployment/prometheus -n monitoring

# Restart Grafana
kubectl rollout restart deployment/grafana -n monitoring

# Restart Kube-State-Metrics
kubectl rollout restart deployment/kube-state-metrics -n monitoring
```

---

## 🔄 Update Configuration

### Update Prometheus Config
```bash
# Edit prometheus config
kubectl edit configmap prometheus-config -n monitoring

# Reload Prometheus (hot reload)
kubectl exec -n monitoring $(kubectl get pod -n monitoring -l app=prometheus -o jsonpath='{.items[0].metadata.name}') -- killall -HUP prometheus

# Or restart
kubectl rollout restart deployment/prometheus -n monitoring
```

### Update Grafana Dashboards
```bash
# Edit dashboard config
kubectl edit configmap grafana-dashboard-inventory -n monitoring

# Restart Grafana
kubectl rollout restart deployment/grafana -n monitoring
```

---

## 🎓 Next Steps (Optional Enhancements)

### 1. Add Application Metrics
Instrument your backend with Prometheus client:

```javascript
// Backend: npm install prom-client
const promClient = require('prom-client');
const register = new promClient.Registry();

// Collect default metrics
promClient.collectDefaultMetrics({ register });

// Custom counter
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 2. Configure Alerts
Create alert rules for critical conditions:
- High CPU/Memory usage
- Pod restarts
- Service downtime
- Error rate spikes

### 3. Add Persistent Storage
For production, use PersistentVolumes:

```yaml
volumes:
  - name: prometheus-storage
    persistentVolumeClaim:
      claimName: prometheus-pvc
```

### 4. Set Up Notifications
Integrate with:
- Slack
- Email
- PagerDuty
- Microsoft Teams

### 5. Add More Exporters
- MongoDB Exporter for database metrics
- Node Exporter for detailed node metrics
- Nginx Exporter for ingress metrics

---

## 📚 Documentation

- **Complete Guide**: `MONITORING_OBSERVABILITY_GUIDE.md`
- **Quick Reference**: `MONITORING_QUICK_REFERENCE.md`
- **Manifests**: `monitoring/` directory

---

## 🧹 Cleanup (If Needed)

```bash
# Remove monitoring stack
kubectl delete -f monitoring/

# Or delete namespace
kubectl delete namespace monitoring
```

---

## ✅ Summary

**Step 3.5 Requirements Met:**

✅ **Prometheus Deployment**
- Metrics collection from cluster and applications
- Service discovery configured
- 15-day retention
- RBAC configured

✅ **Grafana Integration**
- Connected to Prometheus
- Pre-configured dashboards
- Visualization ready
- Simple alerts available

**Access Points:**
- Prometheus: http://localhost:30090
- Grafana: http://localhost:30300 (admin/admin123)

**Status**: 🟢 All systems operational

---

**Deployed**: January 4, 2026  
**Author**: Amine Ouhiba  
**Repository**: https://github.com/amineouhiba26/Inventory  
**Branch**: devops
