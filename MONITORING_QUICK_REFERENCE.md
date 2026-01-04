# 🚀 Monitoring Quick Reference - Step 3.5

## Quick Installation

```bash
# Deploy entire monitoring stack
kubectl apply -f monitoring/

# Verify deployment
kubectl get all -n monitoring

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod --all -n monitoring --timeout=300s
```

## Access URLs

```bash
# Prometheus
http://localhost:30090

# Grafana
http://localhost:30300
Username: admin
Password: admin123
```

## Essential Commands

### Check Status
```bash
# View all monitoring resources
kubectl get all -n monitoring

# Check Prometheus
kubectl get pods -n monitoring -l app=prometheus
kubectl logs -n monitoring -l app=prometheus --tail=50

# Check Grafana
kubectl get pods -n monitoring -l app=grafana
kubectl logs -n monitoring -l app=grafana --tail=50

# Check kube-state-metrics
kubectl get pods -n monitoring -l app=kube-state-metrics
```

### Port Forwarding
```bash
# Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
```

### Restart Services
```bash
# Restart Prometheus
kubectl rollout restart deployment/prometheus -n monitoring

# Restart Grafana
kubectl rollout restart deployment/grafana -n monitoring

# Restart kube-state-metrics
kubectl rollout restart deployment/kube-state-metrics -n monitoring
```

## Useful PromQL Queries

### Pod Metrics
```promql
# CPU Usage by Pod
sum(rate(container_cpu_usage_seconds_total{namespace="inventory-system"}[5m])) by (pod)

# Memory Usage by Pod
sum(container_memory_usage_bytes{namespace="inventory-system"}) by (pod)

# Pod Restart Count
kube_pod_container_status_restarts_total{namespace="inventory-system"}
```

### Cluster Metrics
```promql
# Node CPU Usage
sum(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)

# Available Replicas
kube_deployment_status_replicas_available{namespace="inventory-system"}

# Pod Status
kube_pod_status_phase{namespace="inventory-system"}
```

## Grafana Dashboard Import

```bash
# Popular Kubernetes Dashboards IDs:
# - 7249: Kubernetes Cluster Monitoring
# - 8588: Kubernetes Deployment Metrics  
# - 1860: Node Exporter Full

# To import:
# 1. Go to Grafana UI
# 2. Click "+" → "Import"
# 3. Enter Dashboard ID
# 4. Select Prometheus datasource
# 5. Click "Import"
```

## Troubleshooting

### Prometheus Not Scraping
```bash
# Check targets
http://localhost:30090/targets

# Check service discovery
http://localhost:30090/service-discovery

# Verify RBAC
kubectl get clusterrolebinding prometheus
kubectl describe clusterrolebinding prometheus
```

### Grafana Connection Issues
```bash
# Test Prometheus connectivity from Grafana pod
kubectl exec -it -n monitoring $(kubectl get pod -n monitoring -l app=grafana -o jsonpath='{.items[0].metadata.name}') -- wget -O- http://prometheus:9090/-/healthy

# Check datasource
kubectl get configmap -n monitoring grafana-datasources -o yaml
```

### No Metrics Showing
```bash
# Verify kube-state-metrics
kubectl get svc -n monitoring kube-state-metrics
kubectl logs -n monitoring -l app=kube-state-metrics

# Check Prometheus config
kubectl get configmap -n monitoring prometheus-config -o yaml
```

## Update Configuration

### Prometheus
```bash
# Edit config
kubectl edit configmap -n monitoring prometheus-config

# Reload (hot reload)
kubectl exec -n monitoring $(kubectl get pod -n monitoring -l app=prometheus -o jsonpath='{.items[0].metadata.name}') -- killall -HUP prometheus
```

### Grafana
```bash
# Edit datasource
kubectl edit configmap -n monitoring grafana-datasources

# Edit dashboards
kubectl edit configmap -n monitoring grafana-dashboard-inventory

# Restart to apply
kubectl rollout restart deployment/grafana -n monitoring
```

## Cleanup

```bash
# Remove monitoring stack
kubectl delete -f monitoring/

# Or delete namespace
kubectl delete namespace monitoring
```

## Testing

### Generate Load
```bash
# Create load on backend
for i in {1..100}; do curl http://localhost:30001/products; sleep 1; done

# Watch metrics in Prometheus
# Query: rate(http_requests_total[1m])
```

### View Metrics
```bash
# Prometheus metrics endpoint
http://localhost:30090/metrics

# Grafana dashboard
http://localhost:30300/d/inventory-dashboard
```

---

**Complete Guide**: See `MONITORING_OBSERVABILITY_GUIDE.md`
