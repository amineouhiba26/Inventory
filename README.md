# DevOps Mini-Project: Inventory Management System

This project contains a containerized MERN (MongoDB, Express, React, Node.js) application orchestrated with Kubernetes and monitored using Prometheus and Grafana.

## Prerequisites
- Docker & Docker Compose
- Kubernetes Cluster (Docker Desktop recommended)
- Helm
- Jenkins (for CI/CD pipeline)

## Getting Started

### 1. Run with Docker Compose (Local Development)
To start the application locally using Docker Compose:

```bash
docker-compose up -d --build
```
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **MongoDB**: localhost:27017

### 2. Run with Kubernetes (Manual Manifests)
Deploy the application to your local Kubernetes cluster:

```bash
kubectl apply -f k8s-manifests/
```
- **Frontend**: http://localhost:30002
- **Backend API**: http://localhost:30001
- **Prometheus/Grafana**: (Check monitoring usage below)

### 3. Run with Helm
Deploy using the custom Helm chart:

```bash
helm install inventory ./helm/inventory-system
```

### 4. CI/CD Pipeline
The `Jenkinsfile` defines the CI/CD pipeline:
1.  **Build**: Builds Docker images for Backend and Frontend.
2.  **Scan**: Scans images for vulnerabilities using Trivy.
3.  **Push**: Pushes valid images to Docker Hub.

### 5. Monitoring
To deploy the monitoring stack:

```bash
kubectl apply -f monitoring/
```
- **Prometheus**: Collects metrics from the cluster and the backend (`/metrics`).
- **Grafana**: Visualizes the metrics.

## Project Structure
- `backend/`: Node.js Express API
- `frontend/`: React Application
- `k8s-manifests/`: Raw Kubernetes YAML files
- `helm/`: Helm Charts
- `argocd/`: ArgoCD GitOps configurations
- `monitoring/`: Prometheus and Grafana configurations
- `Jenkinsfile`: Jenkins pipeline definition
