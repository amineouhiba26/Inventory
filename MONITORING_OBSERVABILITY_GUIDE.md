# 📊 Monitoring & Observability - Step 3.5

## 🎯 Overview

This guide documents the deployment of **Prometheus** and **Grafana** for monitoring and observability of the Inventory Management System on Kubernetes.

### What's Included:
- ✅ **Prometheus** - Metrics collection and storage
- ✅ **Grafana** - Visualization and dashboards
- ✅ **Kube-State-Metrics** - Kubernetes cluster metrics
- ✅ **Pre-configured Dashboards** - Ready-to-use visualizations
- ✅ **Service Discovery** - Automatic pod/service discovery

---

## 📋 Table of Contents
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Access Monitoring Tools](#access-monitoring-tools)
- [Dashboard Overview](#dashboard-overview)
- [Metrics Collected](#metrics-collected)
- [Custom Alerts](#custom-alerts)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MONITORING STACK                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │   Prometheus     │────────▶│     Grafana      │        │
│  │   (Metrics)      │         │  (Visualization) │        │
│  │   Port: 9090     │         │   Port: 3000     │        │
│  │   NodePort:30090 │         │   NodePort:30300 │        │
│  └────────┬─────────┘         └──────────────────┘        │
│           │                                                 │
│           │ Scrapes metrics from:                          │
│           │                                                 │
│           ├──▶ Kubernetes API Server                       │
│           ├──▶ Kubernetes Nodes                            │
│           ├──▶ Kube-State-Metrics                          │
│           ├──▶ Inventory Backend (Express API)             │
│           ├──▶ Inventory Frontend (React)                  │
│           └──▶ MongoDB                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                     ┌──────────────┐
                     │   End Users  │
                     └──────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
          http://localhost:30090  http://localhost:30300
             (Prometheus UI)         (Grafana UI)
```

---

## 📦 Prerequisites

### 1. Kubernetes Cluster Running
```bash
# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

### 2. Inventory Application Deployed
```bash
# Verify inventory system is running
kubectl get pods -n inventory-system
```

---

## 🚀 Installation

### Step 1: Create Monitoring Namespace

```bash
# Create monitoring namespace
kubectl apply -f monitoring/namespace.yaml

# Verify namespace
kubectl get namespace monitoring
```

### Step 2: Deploy Prometheus

```bash
# Apply Prometheus RBAC (Service Account, Role, RoleBinding)
kubectl apply -f monitoring/prometheus-rbac.yaml

# Apply Prometheus ConfigMap
kubectl apply -f monitoring/prometheus-config.yaml

# Deploy Prometheus
kubectl apply -f monitoring/prometheus-deployment.yaml

# Expose Prometheus Service
kubectl apply -f monitoring/prometheus-service.yaml

# Verify Prometheus deployment
kubectl get pods -n monitoring -l app=prometheus
kubectl get svc -n monitoring prometheus
```

### Step 3: Deploy Kube-State-Metrics

```bash
# Deploy kube-state-metrics
kubectl apply -f monitoring/kube-state-metrics.yaml

# Verify deployment
kubectl get pods -n monitoring -l app=kube-state-metrics
```

### Step 4: Deploy Grafana

```bash
# Apply Grafana ConfigMaps (datasource + dashboards)
kubectl apply -f monitoring/grafana-config.yaml

# Deploy Grafana
kubectl apply -f monitoring/grafana-deployment.yaml

# Expose Grafana Service
kubectl apply -f monitoring/grafana-service.yaml

# Verify Grafana deployment
kubectl get pods -n monitoring -l app=grafana
kubectl get svc -n monitoring grafana
```

### Step 5: Verify All Components

```bash
# Check all monitoring components
kubectl get all -n monitoring

# Expected output:
# NAME                                      READY   STATUS    RESTARTS   AGE
# pod/grafana-xxxxx                         1/1     Running   0          2m
# pod/kube-state-metrics-xxxxx              1/1     Running   0          3m
# pod/prometheus-xxxxx                      1/1     Running   0          5m
#
# NAME                            TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)
# service/grafana                 NodePort   10.96.xxx.xxx   <none>        3000:30300/TCP
# service/kube-state-metrics      ClusterIP  10.96.xxx.xxx   <none>        8080/TCP,8081/TCP
# service/prometheus              NodePort   10.96.xxx.xxx   <none>        9090:30090/TCP
```

### Quick Install (All at Once)

```bash
# Deploy everything in monitoring namespace
kubectl apply -f monitoring/

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod --all -n monitoring --timeout=300s
```

---

## 🌐 Access Monitoring Tools

### Prometheus UI

```bash
# Access Prometheus at:
http://localhost:30090

# Or use port-forwarding:
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Then access: http://localhost:9090
```

**Prometheus UI Features:**
- Query metrics using PromQL
- View targets and service discovery
- Check alerting rules
- Explore time-series data

### Grafana Dashboards

```bash
# Access Grafana at:
http://localhost:30300

# Default credentials:
# Username: admin
# Password: admin123

# Or use port-forwarding:
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Then access: http://localhost:3000
```

**Grafana Features:**
- Pre-configured Prometheus datasource
- Custom Inventory Management dashboard
- Real-time metrics visualization
- Alert configuration

---

## 📊 Dashboard Overview

### Pre-Configured Dashboards

#### 1. **Inventory Management System Dashboard**

Accessible at: Grafana → Dashboards → Inventory Management System

**Panels Include:**
- **Pod CPU Usage** - CPU consumption per pod
- **Pod Memory Usage** - Memory consumption per pod
- **Pod Network I/O** - Network traffic
- **HTTP Request Rate** - API request metrics
- **Error Rate** - Application error tracking

### Importing Additional Dashboards

Grafana comes with community dashboards you can import:

```bash
# Popular Kubernetes Dashboards:
# - Kubernetes Cluster Monitoring (ID: 7249)
# - Kubernetes Deployment Metrics (ID: 8588)
# - Node Exporter Full (ID: 1860)
```

**To Import:**
1. Go to Grafana UI
2. Click **+** → **Import**
3. Enter Dashboard ID (e.g., 7249)
4. Click **Load**
5. Select **Prometheus** as data source
6. Click **Import**

---

## 📈 Metrics Collected

### Kubernetes Cluster Metrics

```promql
# Node CPU Usage
node_cpu_seconds_total

# Node Memory Usage
node_memory_MemTotal_bytes
node_memory_MemAvailable_bytes

# Pod CPU Usage
container_cpu_usage_seconds_total

# Pod Memory Usage
container_memory_usage_bytes
container_memory_working_set_bytes

# Pod Network I/O
container_network_receive_bytes_total
container_network_transmit_bytes_total
```

### Application Metrics (If Instrumented)

For the backend to expose metrics, you can add Prometheus client library:

```javascript
// Backend: npm install prom-client
const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Kube-State-Metrics

Provides cluster state metrics:

```promql
# Deployment replicas
kube_deployment_status_replicas_available
kube_deployment_status_replicas_unavailable

# Pod status
kube_pod_status_phase

# Node status
kube_node_status_condition

# Service info
kube_service_info
```

---

## 🔔 Custom Alerts (Optional)

### Creating Alert Rules

Create a file `monitoring/prometheus-alert-rules.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-alert-rules
  namespace: monitoring
data:
  alerts.yml: |
    groups:
      - name: inventory_alerts
        interval: 30s
        rules:
          - alert: HighPodCPU
            expr: sum(rate(container_cpu_usage_seconds_total{namespace="inventory-system"}[5m])) by (pod) > 0.8
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High CPU usage on pod {{ $labels.pod }}"
              description: "Pod {{ $labels.pod }} CPU usage is above 80%"
          
          - alert: HighPodMemory
            expr: sum(container_memory_usage_bytes{namespace="inventory-system"}) by (pod) > 500000000
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High memory usage on pod {{ $labels.pod }}"
              description: "Pod {{ $labels.pod }} memory usage is above 500MB"
          
          - alert: PodDown
            expr: kube_pod_status_phase{namespace="inventory-system",phase="Running"} == 0
            for: 2m
            labels:
              severity: critical
            annotations:
              summary: "Pod {{ $labels.pod }} is down"
              description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is not running"
          
          - alert: HighErrorRate
            expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High error rate detected"
              description: "Error rate is above 5% for the last 5 minutes"
```

Apply the alert rules:

```bash
kubectl apply -f monitoring/prometheus-alert-rules.yaml

# Update Prometheus ConfigMap to include alert rules
# Then restart Prometheus:
kubectl rollout restart deployment/prometheus -n monitoring
```

---

## 🔍 Useful Queries

### Prometheus Queries (PromQL)

```promql
# CPU Usage by Pod
sum(rate(container_cpu_usage_seconds_total{namespace="inventory-system"}[5m])) by (pod)

# Memory Usage by Pod
sum(container_memory_usage_bytes{namespace="inventory-system"}) by (pod)

# Network Received Bytes
sum(rate(container_network_receive_bytes_total{namespace="inventory-system"}[5m])) by (pod)

# Network Transmitted Bytes
sum(rate(container_network_transmit_bytes_total{namespace="inventory-system"}[5m])) by (pod)

# Pod Restart Count
kube_pod_container_status_restarts_total{namespace="inventory-system"}

# Available Replicas
kube_deployment_status_replicas_available{namespace="inventory-system"}

# Pod Status
kube_pod_status_phase{namespace="inventory-system"}

# Container States
kube_pod_container_status_running{namespace="inventory-system"}
```

---

## 🧪 Testing Monitoring

### Generate Load

```bash
# Generate traffic to backend
for i in {1..100}; do
  curl http://localhost:30001/products
  sleep 1
done

# Check metrics in Prometheus
# Query: rate(http_requests_total[1m])
```

### View Metrics

```bash
# View Prometheus targets
http://localhost:30090/targets

# View specific metric
http://localhost:30090/graph?g0.expr=up

# View Grafana dashboard
http://localhost:30300/d/inventory-dashboard
```

---

## 🐛 Troubleshooting

### Issue 1: Prometheus Not Scraping Targets

```bash
# Check Prometheus logs
kubectl logs -n monitoring -l app=prometheus

# Check targets in Prometheus UI
http://localhost:30090/targets

# Verify service discovery
kubectl get endpoints -n inventory-system

# Check RBAC permissions
kubectl get clusterrolebinding prometheus
```

### Issue 2: Grafana Can't Connect to Prometheus

```bash
# Check Grafana logs
kubectl logs -n monitoring -l app=grafana

# Verify Prometheus service
kubectl get svc -n monitoring prometheus

# Test connectivity from Grafana pod
kubectl exec -it -n monitoring <grafana-pod> -- wget -O- http://prometheus:9090/api/v1/status/config
```

### Issue 3: No Metrics Showing

```bash
# Verify kube-state-metrics is running
kubectl get pods -n monitoring -l app=kube-state-metrics

# Check if Prometheus can reach kube-state-metrics
kubectl exec -it -n monitoring <prometheus-pod> -- wget -O- http://kube-state-metrics:8080/metrics

# Verify application pods are annotated for scraping
kubectl get pods -n inventory-system -o yaml | grep prometheus.io
```

### Issue 4: Dashboard Not Loading

```bash
# Check Grafana datasource configuration
kubectl get configmap -n monitoring grafana-datasources -o yaml

# Verify dashboard configmap
kubectl get configmap -n monitoring grafana-dashboard-inventory -o yaml

# Restart Grafana
kubectl rollout restart deployment/grafana -n monitoring
```

---

## 📊 Monitoring Best Practices

### 1. Resource Limits

```yaml
# Set appropriate resource limits for monitoring stack
resources:
  requests:
    cpu: 200m
    memory: 512Mi
  limits:
    cpu: 500m
    memory: 1Gi
```

### 2. Data Retention

```bash
# Prometheus retention (currently 15 days)
--storage.tsdb.retention.time=15d

# For production, use persistent volumes:
```yaml
volumes:
  - name: prometheus-storage
    persistentVolumeClaim:
      claimName: prometheus-pvc
```

### 3. High Availability

For production, consider:
- Multiple Prometheus replicas
- Prometheus federation
- Remote storage (e.g., Thanos, Cortex)
- Grafana clustering

### 4. Security

```bash
# Change Grafana admin password
kubectl exec -it -n monitoring <grafana-pod> -- grafana-cli admin reset-admin-password <new-password>

# Use Kubernetes Secrets for sensitive data
# Enable authentication for Prometheus
# Configure HTTPS/TLS
```

---

## 🔄 Update and Maintenance

### Update Prometheus Configuration

```bash
# Edit prometheus-config.yaml
# Apply changes
kubectl apply -f monitoring/prometheus-config.yaml

# Reload Prometheus configuration
kubectl exec -n monitoring <prometheus-pod> -- killall -HUP prometheus
# Or restart:
kubectl rollout restart deployment/prometheus -n monitoring
```

### Update Grafana Dashboards

```bash
# Edit grafana-config.yaml
# Apply changes
kubectl apply -f monitoring/grafana-config.yaml

# Restart Grafana
kubectl rollout restart deployment/grafana -n monitoring
```

### Backup Grafana Dashboards

```bash
# Export dashboard from Grafana UI
# Dashboard → Settings → JSON Model → Copy

# Or backup via API
curl -H "Authorization: Bearer <api-key>" \
  http://localhost:30300/api/dashboards/uid/inventory-dashboard
```

---

## 🧹 Cleanup

### Remove Monitoring Stack

```bash
# Delete all monitoring resources
kubectl delete -f monitoring/

# Or delete namespace (removes everything)
kubectl delete namespace monitoring
```

---

## 📚 Additional Resources

### Documentation

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Kube-State-Metrics](https://github.com/kubernetes/kube-state-metrics)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)

### Useful Dashboards

- **Kubernetes Cluster Monitoring**: https://grafana.com/grafana/dashboards/7249
- **Kubernetes Deployment Metrics**: https://grafana.com/grafana/dashboards/8588
- **Node Exporter Full**: https://grafana.com/grafana/dashboards/1860
- **Prometheus Stats**: https://grafana.com/grafana/dashboards/2

---

## ✅ Summary

You have successfully deployed monitoring and observability for the Inventory Management System:

1. ✅ **Prometheus** - Collecting metrics from Kubernetes and applications
2. ✅ **Grafana** - Visualizing metrics with dashboards
3. ✅ **Kube-State-Metrics** - Providing cluster state metrics
4. ✅ **Service Discovery** - Automatic target discovery
5. ✅ **Pre-configured Dashboards** - Ready-to-use visualizations

### Quick Access

```bash
# Prometheus UI
http://localhost:30090

# Grafana UI
http://localhost:30300
# Username: admin
# Password: admin123
```

### Next Steps

- [ ] Add custom metrics to application code
- [ ] Configure alert rules
- [ ] Set up alerting notifications (email, Slack)
- [ ] Create custom Grafana dashboards
- [ ] Implement persistent storage for metrics
- [ ] Set up log aggregation (ELK/Loki)

---

**Last Updated**: January 4, 2026  
**Author**: Amine Ouhiba  
**Repository**: https://github.com/amineouhiba26/Inventory
