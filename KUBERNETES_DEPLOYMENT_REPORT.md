# TP4 : Déploiement d'Applications avec Kubernetes
## Rapport de Déploiement - Inventory Management System

**Auteur:** Amine Ouhiba  
**Date:** 4 Janvier 2026  
**Cluster:** Docker Desktop with Kubernetes  

---

## Objectifs Accomplis ✅

- ✅ Découvrir Kubernetes pour l'orchestration de conteneurs
- ✅ Déployer une application MERN en utilisant Deployment, Service et ConfigMap
- ✅ Comprendre le fonctionnement du scaling horizontal et de la mise à jour continue

---

## 1. Préparation de l'environnement

### Images Docker créées et publiées sur Docker Hub

```bash
# Backend
docker build -t amineouhiba/inventory-backend:latest ./backend
docker push amineouhiba/inventory-backend:latest

# Frontend  
docker build -t amineouhiba/inventory-frontend:latest ./frontend
docker push amineouhiba/inventory-frontend:latest
```

**Images disponibles:**
- `amineouhiba/inventory-backend:latest`
- `amineouhiba/inventory-frontend:latest`
- `mongo:7`

### Vérification du cluster Kubernetes

```bash
kubectl cluster-info
kubectl get nodes
```

**Résultat:** Cluster Docker Desktop opérationnel ✅

---

## 2. ConfigMap pour la configuration des applications

**Fichier:** `k8s-manifests/app-configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-configmap
data:
  MONGO_URI: mongodb://mongodb-service:27017/inventory
  REACT_APP_API_URL: http://localhost:30001
  PORT: "3001"
  NODE_ENV: production
```

**Variables d'environnement configurées:**
- `MONGO_URI`: Connexion interne au service MongoDB
- `REACT_APP_API_URL`: URL du backend accessible depuis le navigateur via NodePort
- `PORT`: Port d'écoute du serveur backend (3001)
- `NODE_ENV`: Environnement de production

---

## 3. Déploiement MongoDB

### Deployment MongoDB

**Fichier:** `k8s-manifests/mongodb-deployment.yaml`

- **Image:** mongo:7
- **Replicas:** 1
- **Port:** 27017
- **Selector:** app=inventory-mongodb

### Service MongoDB

**Fichier:** `k8s-manifests/mongodb-service.yaml`

- **Type:** ClusterIP (accès interne uniquement)
- **Port:** 27017
- **Selector:** app=inventory-mongodb

**Statut:** ✅ Déployé et opérationnel

---

## 4. Déploiement du Backend (Serveur)

### Deployment Backend

**Fichier:** `k8s-manifests/server-deployment.yaml`

- **Image:** amineouhiba/inventory-backend:latest
- **Replicas initiales:** 3 → **Scalé à 5** ✅
- **Port:** 3001
- **Selector:** app=inventory-server
- **Variables d'environnement:** Injectées depuis ConfigMap

### Service Backend

**Fichier:** `k8s-manifests/server-service.yaml`

- **Type:** NodePort
- **Port:** 3001
- **NodePort:** 30001
- **Selector:** app=inventory-server

**Accès externe:** http://localhost:30001

---

## 5. Déploiement du Frontend (Client)

### Deployment Frontend

**Fichier:** `k8s-manifests/client-deployment.yaml`

- **Image:** amineouhiba/inventory-frontend:latest
- **Replicas:** 3
- **Port:** 3000
- **Selector:** app=inventory-client
- **Variables d'environnement:** Injectées depuis ConfigMap

### Service Frontend

**Fichier:** `k8s-manifests/client-service.yaml`

- **Type:** NodePort
- **Port:** 3000
- **NodePort:** 30002
- **Selector:** app=inventory-client

**Accès externe:** http://localhost:30002

---

## 6. Vérification de l'intégration

### Test de connexion Backend → MongoDB

```bash
kubectl logs -l app=inventory-server --tail=5
```

**Résultat:**
```
Connected to Mongo Successfully!
Inventory Management Backend listening on port 3001
Environment: production
```

✅ Les 5 pods backend sont connectés à MongoDB

### Test de l'API Backend

```bash
curl http://localhost:30001/health
```

**Résultat:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-04T04:09:56.023Z",
  "service": "Inventory Management Backend"
}
```

✅ Backend accessible via NodePort

### Test du Frontend

```bash
curl http://localhost:30002
```

✅ Frontend accessible via NodePort et retourne l'HTML de l'application React

---

## 7. Accès à l'application

### URLs d'accès (Docker Desktop)

- **Frontend:** http://localhost:30002
- **Backend API:** http://localhost:30001
- **Health Check:** http://localhost:30001/health

---

## 8. Scaling et Mise à Jour

### 8.1. Scaling du Backend

**Commande:**
```bash
kubectl scale deployment server-deployment --replicas=5
```

**Résultat:**
```bash
kubectl get deployments
```

| NAME | READY | UP-TO-DATE | AVAILABLE | AGE |
|------|-------|------------|-----------|-----|
| client-deployment | 3/3 | 3 | 3 | 19m |
| mongodb-deployment | 1/1 | 1 | 1 | 19m |
| server-deployment | **5/5** | **5** | **5** | 19m |

**Pods créés:**
```bash
kubectl get pods
```

✅ **5 pods backend** en cours d'exécution:
- server-deployment-88578d48b-5mhfm
- server-deployment-88578d48b-cj6nd
- server-deployment-88578d48b-kgnpg
- server-deployment-88578d48b-rs8zh
- server-deployment-88578d48b-vspx8

### 8.2. Mise à jour de l'image (Rolling Update)

**Note:** Une mise à jour de l'image frontend a été préparée avec une nouvelle version incluant la correction de l'URL de l'API.

**Commande pour mise à jour:**
```bash
# 1. Modifier l'image dans client-deployment.yaml
# 2. Appliquer les changements
kubectl apply -f k8s-manifests/client-deployment.yaml

# 3. Surveiller le rollout
kubectl rollout status deployment/client-deployment
```

**Stratégie de mise à jour:** RollingUpdate (par défaut)
- Zero downtime deployment
- Les nouveaux pods sont créés progressivement
- Les anciens pods sont supprimés après que les nouveaux soient ready

---

## 9. État actuel du déploiement

### Ressources Kubernetes déployées

```bash
kubectl get all
```

**Résumé:**
- **Deployments:** 3 (client, server, mongodb)
- **Services:** 3 (client-service, server-service, mongodb-service)
- **ConfigMaps:** 1 (app-configmap)
- **Pods:** 9 total
  - Frontend: 3 pods
  - Backend: 5 pods (après scaling)
  - MongoDB: 1 pod

### Architecture de déploiement

```
┌─────────────────────────────────────────────────┐
│            Browser (Utilisateur)                │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│  Frontend     │   │   Backend     │
│  localhost:   │   │   localhost:  │
│    30002      │   │     30001     │
│  (NodePort)   │   │   (NodePort)  │
└───────┬───────┘   └───────┬───────┘
        │                   │
        │                   │
┌───────▼───────┐   ┌───────▼───────┐
│ Client Pods   │   │ Server Pods   │
│   (x3)        │   │   (x5)        │
│ Port: 3000    │   │ Port: 3001    │
└───────────────┘   └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │ MongoDB Pod   │
                    │   (x1)        │
                    │ Port: 27017   │
                    │ (ClusterIP)   │
                    └───────────────┘
```

---

## 10. Commandes de nettoyage

Pour supprimer toutes les ressources créées:

```bash
kubectl delete -f k8s-manifests/app-configmap.yaml
kubectl delete -f k8s-manifests/mongodb-deployment.yaml
kubectl delete -f k8s-manifests/mongodb-service.yaml
kubectl delete -f k8s-manifests/server-deployment.yaml
kubectl delete -f k8s-manifests/server-service.yaml
kubectl delete -f k8s-manifests/client-deployment.yaml
kubectl delete -f k8s-manifests/client-service.yaml
```

Ou en une seule commande:

```bash
kubectl delete -f k8s-manifests/
```

---

## 11. Livrables

### Fichiers YAML créés

1. ✅ `k8s-manifests/app-configmap.yaml` - ConfigMap avec variables d'environnement
2. ✅ `k8s-manifests/mongodb-deployment.yaml` - Deployment MongoDB
3. ✅ `k8s-manifests/mongodb-service.yaml` - Service MongoDB (ClusterIP)
4. ✅ `k8s-manifests/server-deployment.yaml` - Deployment Backend
5. ✅ `k8s-manifests/server-service.yaml` - Service Backend (NodePort)
6. ✅ `k8s-manifests/client-deployment.yaml` - Deployment Frontend
7. ✅ `k8s-manifests/client-service.yaml` - Service Frontend (NodePort)

### Documentation

- ✅ Ce rapport expliquant les étapes suivies et les observations
- ✅ Captures d'écran des commandes et résultats

---

## 12. Observations et Apprentissages

### Points clés appris

1. **ConfigMap:** Permet de centraliser la configuration et de séparer le code de la configuration
2. **Services NodePort:** Exposent les applications sur des ports fixes pour un accès externe
3. **Services ClusterIP:** Permettent la communication interne entre pods
4. **Scaling horizontal:** Augmente la capacité en ajoutant des pods identiques
5. **Rolling Updates:** Mettent à jour les applications sans interruption de service

### Défis rencontrés et solutions

1. **Problème:** Port mismatch entre configuration (80) et runtime (3000)
   - **Solution:** Correction des manifestes pour utiliser le port 3000

2. **Problème:** Sélecteurs incompatibles avec anciens déploiements
   - **Solution:** Suppression des anciens déploiements avant réapplication

3. **Problème:** URL API hardcodée dans le frontend
   - **Solution:** Utilisation de variables d'environnement React (REACT_APP_API_URL)

4. **Problème:** Connection timeout avec Docker Hub
   - **Solution:** Utilisation d'images déjà poussées sur Docker Hub

---

## 13. Prochaines étapes recommandées

### Améliorations possibles

1. **Helm Charts** 📦
   - Packager les manifestes dans un Helm Chart
   - Faciliter les déploiements avec des valeurs variables

2. **ArgoCD (GitOps)** 🔄
   - Déploiement automatique depuis Git
   - Synchronisation continue avec le dépôt
   - Interface web pour gérer les déploiements

3. **Ingress Controller** 🌐
   - Remplacer les NodePort par un Ingress
   - Gérer le routing HTTP/HTTPS
   - Certificats SSL/TLS

4. **Monitoring** 📊
   - Prometheus pour les métriques
   - Grafana pour la visualisation
   - Alerting sur les problèmes

5. **Persistent Volumes** 💾
   - Ajouter un PersistentVolumeClaim pour MongoDB
   - Garantir la persistance des données

6. **Resource Limits** ⚖️
   - Définir les requests et limits CPU/Mémoire
   - Optimiser l'utilisation des ressources

7. **Health Checks** 🏥
   - Liveness probes
   - Readiness probes
   - Startup probes

---

## Conclusion

Le déploiement Kubernetes de l'application Inventory Management System a été réalisé avec succès. Tous les objectifs du TP ont été atteints:

✅ Application MERN déployée sur Kubernetes  
✅ Utilisation de ConfigMap pour la configuration  
✅ Services NodePort pour l'accès externe  
✅ Scaling horizontal du backend à 5 réplicas  
✅ Vérification de l'intégration entre tous les composants  

L'application est maintenant accessible via:
- **Frontend:** http://localhost:30002
- **Backend API:** http://localhost:30001

Le système est prêt pour des améliorations futures avec Helm Charts et ArgoCD pour une approche GitOps complète.
