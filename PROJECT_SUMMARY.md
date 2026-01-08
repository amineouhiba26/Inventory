# 📋 Résumé du Projet - Inventory Management System

## Vue d'ensemble du projet
Application MERN (MongoDB, Express.js, React, Node.js) déployée avec une infrastructure DevOps complète incluant Docker, Kubernetes, Jenkins, ArgoCD, Prometheus et Grafana.

**Repository**: https://github.com/amineouhiba26/Inventory  
**Branche**: devops

---

## 3.2. Conteneurisation ✅

### Ce qui a été fait

#### 1. **Dockerfiles créés**
- ✅ **Backend Dockerfile** (`backend/Dockerfile`)
  - Image de base: Node.js
  - Installation des dépendances npm
  - Exposition du port 5000
  - Configuration pour Express.js + MongoDB

- ✅ **Frontend Dockerfile** (`frontend/Dockerfile`)
  - Build multi-stage avec Node.js
  - Build de production React
  - Serveur Nginx pour servir l'application
  - Configuration nginx personnalisée
  - Exposition du port 80

#### 2. **Docker Compose** (`docker-compose.yml`)
- ✅ 3 services orchestrés:
  - `mongodb`: Base de données (port 27017)
  - `server`: Backend API (port 5000)
  - `client`: Frontend React (port 3000)
- ✅ Réseau Docker partagé
- ✅ Variables d'environnement configurées
- ✅ Dépendances entre services gérées

#### 3. **Images Docker Hub**
- ✅ Images publiées:
  - `amineouhiba/inventory-backend:latest`
  - `amineouhiba/inventory-frontend:latest`

#### 4. **Correction CORS**
- ✅ Configuration CORS dans `backend/index.js`
- ✅ Origine autorisée: `http://localhost:30002`
- ✅ Credentials activés pour les cookies/sessions

### Commandes utilisées
```bash
# Build des images
docker build -t amineouhiba/inventory-backend:latest ./backend
docker build -t amineouhiba/inventory-frontend:latest ./frontend

# Push vers Docker Hub
docker push amineouhiba/inventory-backend:latest
docker push amineouhiba/inventory-frontend:latest

# Test local avec Docker Compose
docker-compose up -d
docker-compose ps
docker-compose logs -f
```

---

## 3.3. Intégration Continue avec Jenkins ✅

### Ce qui a été fait

#### 1. **Jenkinsfile créé**
Pipeline automatisé avec 6 étapes:

1. ✅ **Checkout**: Clone du repository Git
2. ✅ **Build Backend**: Construction de l'image backend
3. ✅ **Build Frontend**: Construction de l'image frontend
4. ✅ **Scan Backend (Trivy)**: Analyse de vulnérabilités de sécurité
5. ✅ **Scan Frontend (Trivy)**: Analyse de vulnérabilités de sécurité
6. ✅ **Push Docker Hub**: Publication des images si validation réussie

#### 2. **Plugins Jenkins installés**
- ✅ Docker Pipeline
- ✅ Kubernetes CLI
- ✅ Aqua Security Scanner (Trivy)

#### 3. **Credentials configurés**
- ✅ Docker Hub credentials (ID: `docker-hub-credentials`)
- ✅ Accès sécurisé au registry

#### 4. **Configuration Pipeline**
- ✅ Pipeline depuis SCM (Git)
- ✅ Repository: github.com/amineouhiba26/Inventory
- ✅ Branche: devops
- ✅ Script: Jenkinsfile

### Sécurité implémentée
- ✅ Scan automatique des vulnérabilités avec **Trivy**
- ✅ Validation avant publication sur Docker Hub
- ✅ Gestion sécurisée des credentials

### Résultat
Pipeline fonctionnel qui construit, scanne et publie automatiquement les images Docker à chaque commit.

---

## 3.4. Kubernetes Local (Docker Desktop) ✅

### Ce qui a été fait

#### 1. **Configuration du cluster**
- ✅ Kubernetes activé sur Docker Desktop
- ✅ Contexte: `docker-desktop`
- ✅ Cluster local opérationnel

#### 2. **Manifestes Kubernetes créés** (`k8s-manifests/`)

**ConfigMap**:
- ✅ `app-configmap.yaml`: Configuration de l'URL MongoDB

**Deployments**:
- ✅ `client-deployment.yaml`: 3 réplicas du frontend
- ✅ `server-deployment.yaml`: 3 réplicas du backend
- ✅ `mongodb-deployment.yaml`: 1 réplica de la base de données

**Services**:
- ✅ `client-service.yaml`: NodePort 30002 (accès externe)
- ✅ `server-service.yaml`: NodePort 30001 (accès API)
- ✅ `mongodb-service.yaml`: ClusterIP (accès interne uniquement)

**Namespace**:
- ✅ `inventory-system`: Isolation des ressources

#### 3. **Helm Charts créés** (`helm/inventory-system/`)

Structure Helm complète:
- ✅ `Chart.yaml`: Métadonnées du chart
- ✅ `values.yaml`: Configuration par défaut
- ✅ `values-dev.yaml`: Configuration développement
- ✅ `values-prod.yaml`: Configuration production
- ✅ `templates/`: Tous les manifestes templatisés
  - Deployments (backend, frontend, mongodb)
  - Services (backend, frontend, mongodb)
  - PersistentVolumeClaim pour MongoDB
  - Namespace

#### 4. **ArgoCD GitOps implémenté** ✅

**Installation**:
- ✅ Namespace `argocd` créé
- ✅ ArgoCD installé (version stable)
- ✅ Interface web accessible (port 8080)

**Configuration GitOps**:
- ✅ `argocd/project.yaml`: Projet ArgoCD
- ✅ `argocd/application.yaml`: Application inventory-app

**Fonctionnalités activées**:
- ✅ **Auto-Sync**: Synchronisation automatique depuis Git
- ✅ **Self-Healing**: Récupération automatique des erreurs
- ✅ **Prune**: Suppression des ressources obsolètes
- ✅ Source: github.com/amineouhiba26/Inventory (branche devops)
- ✅ Destination: namespace `inventory-system`

**État actuel**:
- ✅ Application: **Healthy** et **Synced**
- ✅ Tous les pods: **Running** (7/7)
  - 3 pods client
  - 3 pods server
  - 1 pod mongodb

### Architecture déployée
```
Frontend (3 réplicas) → NodePort 30002
Backend (3 réplicas)  → NodePort 30001
MongoDB (1 réplica)   → ClusterIP 27017
```

### Commandes de déploiement utilisées
```bash
# Méthode 1: Manifestes directs
kubectl create namespace inventory-system
kubectl apply -f k8s-manifests/

# Méthode 2: Helm
helm install inventory-app ./helm/inventory-system -n inventory-system --create-namespace

# Méthode 3: ArgoCD (GitOps) - UTILISÉE
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/application.yaml
argocd app sync inventory-app
```

---

## 3.5. Monitoring et Observabilité ✅

### Ce qui a été fait

#### 1. **Prometheus déployé** ✅

**Composants créés** (`monitoring/`):
- ✅ `namespace.yaml`: Namespace monitoring isolé
- ✅ `prometheus-rbac.yaml`: ServiceAccount, ClusterRole, ClusterRoleBinding
- ✅ `prometheus-config.yaml`: ConfigMap avec scrape configs
- ✅ `prometheus-deployment.yaml`: Deployment Prometheus
- ✅ `prometheus-service.yaml`: NodePort 30090

**Configuration Prometheus**:
- ✅ Rétention: 15 jours
- ✅ Scrape interval: 15 secondes
- ✅ Jobs configurés:
  - `prometheus`: Auto-scraping
  - `kubernetes-apiservers`: Métriques API Kubernetes
  - `kubernetes-nodes`: Métriques des nœuds
  - `kubernetes-cadvisor`: Métriques des conteneurs
  - `kubernetes-service-endpoints`: Métriques des services
  - `kubernetes-pods`: Métriques des pods

**Accès Prometheus**:
- ✅ URL: http://localhost:30090
- ✅ Targets: http://localhost:30090/targets
- ✅ État: **Healthy** ✅

#### 2. **Grafana déployé** ✅

**Composants créés**:
- ✅ `grafana-config.yaml`: ConfigMap avec datasources + dashboards
- ✅ `grafana-deployment.yaml`: Deployment Grafana v12.3.1
- ✅ `grafana-service.yaml`: NodePort 30300

**Configuration Grafana**:
- ✅ Datasource Prometheus: Pré-configurée automatiquement
- ✅ URL datasource: `http://prometheus:9090`
- ✅ Credentials: admin / admin123
- ✅ Dashboards recommandés:
  - Kubernetes Cluster Monitoring (ID: 315)
  - Kubernetes Pods (ID: 747)
  - Node Exporter Full (ID: 1860)

**Accès Grafana**:
- ✅ URL: http://localhost:30300
- ✅ Login: admin
- ✅ Password: admin123
- ✅ État: **Running** ✅

#### 3. **Kube-State-Metrics déployé** ✅

**Composant créé**:
- ✅ `kube-state-metrics.yaml`: Deployment + Service + RBAC complet

**Fonction**:
- ✅ Expose les métriques des ressources Kubernetes
- ✅ Infos sur deployments, pods, services, nodes, etc.
- ✅ Service ClusterIP sur port 8080
- ✅ État: **Running** ✅

#### 4. **Métriques collectées** ✅

**Application**:
- CPU des pods
- Mémoire des pods
- Nombre de restarts
- État des conteneurs

**Cluster Kubernetes**:
- Utilisation CPU des nœuds
- Utilisation mémoire des nœuds
- Nombre de pods par namespace
- État des deployments
- Réplicas disponibles vs désirés

### Architecture de monitoring
```
┌─────────────────────────────────────┐
│         Grafana (30300)             │
│       Visualisation + Alertes       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│       Prometheus (30090)            │
│     Collecte + Stockage             │
└────────┬───────────────┬────────────┘
         │               │
         ▼               ▼
┌──────────────┐  ┌──────────────────┐
│ K8s Cluster  │  │ Kube-State-      │
│   (cAdvisor) │  │   Metrics        │
└──────────────┘  └──────────────────┘
```

### Vérification de l'état
```bash
# Tous les pods monitoring
kubectl get pods -n monitoring
# Résultat: 3/3 Running ✅

# Santé Prometheus
curl http://localhost:30090/-/healthy
# Résultat: Prometheus is Healthy ✅

# Version Grafana
curl -s http://localhost:30300/api/health
# Résultat: {"version":"12.3.1"} ✅
```

---

## 📊 Résultats Finaux

### Infrastructure déployée
- ✅ **7 pods applicatifs** (inventory-system namespace)
  - 3 × Frontend (React + Nginx)
  - 3 × Backend (Node.js + Express)
  - 1 × MongoDB (Persistent Storage)

- ✅ **3 pods monitoring** (monitoring namespace)
  - 1 × Prometheus
  - 1 × Grafana
  - 1 × Kube-State-Metrics

- ✅ **Services exposés**:
  - Frontend: http://localhost:30002
  - Backend API: http://localhost:30001
  - Prometheus: http://localhost:30090
  - Grafana: http://localhost:30300

### Pipeline CI/CD complet
```
Git Push → Jenkins Build → Trivy Scan → Docker Hub → ArgoCD Sync → K8s Deploy
```

### Observabilité complète
```
Application → Prometheus (métriques) → Grafana (visualisation)
```

---

## 🎯 Objectifs du cours atteints

| Exigence | État | Détails |
|----------|------|---------|
| **3.2 Conteneurisation** | ✅ | Dockerfiles + docker-compose.yml |
| **3.3 Jenkins CI** | ✅ | Pipeline complet + Trivy scan |
| **3.4 Kubernetes** | ✅ | Manifestes + Helm + ArgoCD GitOps |
| **3.5 Monitoring** | ✅ | Prometheus + Grafana déployés |

---

## 📁 Fichiers livrables

### Conteneurisation
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`

### CI/CD
- `Jenkinsfile`

### Kubernetes
- `k8s-manifests/` (7 fichiers YAML)
- `helm/inventory-system/` (Chart Helm complet)
- `argocd/project.yaml`
- `argocd/application.yaml`

### Monitoring
- `monitoring/` (11 fichiers YAML)
  - Prometheus (5 fichiers)
  - Grafana (3 fichiers)
  - Kube-State-Metrics (1 fichier)
  - Namespace (1 fichier)

### Documentation
- `README.md` (guide complet)
- `PROJECT_SUMMARY.md` (ce document)

---

## 🚀 Commandes pour reproduire le projet

### 1. Conteneurisation
```bash
docker build -t amineouhiba/inventory-backend:latest ./backend
docker build -t amineouhiba/inventory-frontend:latest ./frontend
docker-compose up -d
```

### 2. CI/CD Jenkins
```bash
# Installer Jenkins
brew install jenkins-lts
brew services start jenkins-lts

# Créer pipeline pointant vers Jenkinsfile
# Ajouter credentials Docker Hub
# Build Now
```

### 3. Kubernetes + ArgoCD
```bash
# Activer Kubernetes dans Docker Desktop
# Installer ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Déployer l'application
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/application.yaml
```

### 4. Monitoring
```bash
kubectl create namespace monitoring
kubectl apply -f monitoring/
```

### 5. Vérification
```bash
kubectl get all -n inventory-system
kubectl get all -n monitoring
```

---

## 🔧 Technologies utilisées

- **Conteneurisation**: Docker, Docker Compose
- **Orchestration**: Kubernetes (Docker Desktop)
- **GitOps**: ArgoCD
- **Package Manager**: Helm 3
- **CI/CD**: Jenkins
- **Sécurité**: Trivy
- **Monitoring**: Prometheus
- **Visualisation**: Grafana
- **Métriques**: kube-state-metrics, cAdvisor
- **Application**: MongoDB, Express.js, React, Node.js

---

## ✅ Validation finale

**Tous les objectifs du projet ont été atteints avec succès:**

1. ✅ Application conteneurisée et testée localement
2. ✅ Pipeline CI/CD fonctionnel avec scan de sécurité
3. ✅ Déploiement Kubernetes avec 3 méthodes (manifestes, Helm, GitOps)
4. ✅ Monitoring complet avec Prometheus et Grafana
5. ✅ Documentation complète et claire
6. ✅ Architecture hautement disponible (3 réplicas frontend/backend)
7. ✅ Approche GitOps avec ArgoCD (auto-sync + self-healing)

---

**Projet réalisé par**: Amine Ouhiba  
**Cours**: DevOps 2025-26  
**Enseignant**: Dr. Salah Gontara  
**Date**: Décembre 2024 - Janvier 2026
