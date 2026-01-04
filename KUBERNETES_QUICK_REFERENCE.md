# Kubernetes Quick Reference Guide
## Inventory Management System - TP4

### 📋 Déploiement Initial

```bash
# 1. Appliquer tous les manifestes
kubectl apply -f k8s-manifests/

# Ou individuellement:
kubectl apply -f k8s-manifests/app-configmap.yaml
kubectl apply -f k8s-manifests/mongodb-deployment.yaml
kubectl apply -f k8s-manifests/mongodb-service.yaml
kubectl apply -f k8s-manifests/server-deployment.yaml
kubectl apply -f k8s-manifests/server-service.yaml
kubectl apply -f k8s-manifests/client-deployment.yaml
kubectl apply -f k8s-manifests/client-service.yaml
```

### 🔍 Vérification du Déploiement

```bash
# Vérifier tous les objets
kubectl get all

# Vérifier les deployments
kubectl get deployments

# Vérifier les pods
kubectl get pods

# Vérifier les services
kubectl get services

# Vérifier les configmaps
kubectl get configmap

# Vérifier avec des détails
kubectl get pods -o wide
kubectl describe pod <pod-name>
```

### 📊 Monitoring et Logs

```bash
# Voir les logs d'un pod spécifique
kubectl logs <pod-name>

# Voir les logs de tous les pods avec un label
kubectl logs -l app=inventory-server
kubectl logs -l app=inventory-client

# Suivre les logs en temps réel
kubectl logs -f <pod-name>

# Voir les dernières lignes
kubectl logs --tail=10 <pod-name>
```

### ⚡ Scaling

```bash
# Scaler un deployment
kubectl scale deployment server-deployment --replicas=5
kubectl scale deployment client-deployment --replicas=3

# Vérifier le scaling
kubectl get deployments
kubectl get pods
```

### 🔄 Mises à Jour (Rolling Update)

```bash
# Méthode 1: Modifier le fichier YAML et réappliquer
# 1. Modifier l'image dans le fichier
# 2. Appliquer les changements
kubectl apply -f k8s-manifests/client-deployment.yaml

# Méthode 2: Mise à jour directe de l'image
kubectl set image deployment/client-deployment \
  mern-client=amineouhiba/inventory-frontend:v2

# Surveiller le rollout
kubectl rollout status deployment/client-deployment

# Historique des rollouts
kubectl rollout history deployment/client-deployment

# Annuler un rollout (rollback)
kubectl rollout undo deployment/client-deployment

# Rollback vers une version spécifique
kubectl rollout undo deployment/client-deployment --to-revision=2
```

### 🧪 Tests de l'Application

```bash
# Health check backend
curl http://localhost:30001/health

# Test API products
curl http://localhost:30001/products

# Test frontend
curl http://localhost:30002

# Créer un produit (POST)
curl -X POST http://localhost:30001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 99.99,
    "quantity": 10
  }'

# Lister les produits (GET)
curl http://localhost:30001/products | jq .
```

### 🛠️ Debugging

```bash
# Accéder à un pod
kubectl exec -it <pod-name> -- /bin/sh

# Voir les événements
kubectl get events --sort-by=.metadata.creationTimestamp

# Décrire un objet pour voir les détails
kubectl describe deployment server-deployment
kubectl describe pod <pod-name>
kubectl describe service server-service

# Vérifier les variables d'environnement d'un pod
kubectl exec <pod-name> -- env

# Port-forward pour tester un pod spécifique
kubectl port-forward <pod-name> 8080:3001
```

### 🧹 Nettoyage

```bash
# Supprimer tous les objets créés
kubectl delete -f k8s-manifests/

# Ou individuellement:
kubectl delete deployment client-deployment
kubectl delete deployment server-deployment
kubectl delete deployment mongodb-deployment

kubectl delete service client-service
kubectl delete service server-service
kubectl delete service mongodb-service

kubectl delete configmap app-configmap

# Forcer la suppression si un pod est bloqué
kubectl delete pod <pod-name> --force --grace-period=0
```

### 📝 Configuration

```bash
# Éditer un ConfigMap
kubectl edit configmap app-configmap

# Voir le contenu d'un ConfigMap
kubectl get configmap app-configmap -o yaml

# Redémarrer un deployment après modification du ConfigMap
kubectl rollout restart deployment/server-deployment
kubectl rollout restart deployment/client-deployment
```

### 🌐 Accès aux Services

```bash
# Docker Desktop
Frontend: http://localhost:30002
Backend:  http://localhost:30001

# Minikube (si utilisé)
minikube service client-service --url
minikube service server-service --url
```

### 📦 Images Docker

```bash
# Build images
docker build -t amineouhiba/inventory-backend:latest ./backend
docker build -t amineouhiba/inventory-frontend:latest ./frontend

# Push to Docker Hub
docker push amineouhiba/inventory-backend:latest
docker push amineouhiba/inventory-frontend:latest

# Tag pour nouvelle version
docker tag amineouhiba/inventory-frontend:latest amineouhiba/inventory-frontend:v2
docker push amineouhiba/inventory-frontend:v2
```

### 🔐 Labels et Sélecteurs

```bash
# Lister les pods avec des labels
kubectl get pods --show-labels

# Filtrer par label
kubectl get pods -l app=inventory-server
kubectl get pods -l app=inventory-client
kubectl get pods -l app=inventory-mongodb

# Ajouter un label
kubectl label pod <pod-name> environment=production

# Supprimer un label
kubectl label pod <pod-name> environment-
```

### 📊 Ressources et Performance

```bash
# Voir l'utilisation des ressources
kubectl top nodes
kubectl top pods

# Définir des limites de ressources (dans le YAML)
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "128Mi"
    cpu: "500m"
```

### 🚀 Auto-scaling (HPA - Horizontal Pod Autoscaler)

```bash
# Créer un autoscaler
kubectl autoscale deployment server-deployment \
  --cpu-percent=50 \
  --min=3 \
  --max=10

# Voir les autoscalers
kubectl get hpa

# Supprimer un autoscaler
kubectl delete hpa server-deployment
```

### 📖 Documentation et Aide

```bash
# Aide sur une commande
kubectl --help
kubectl get --help
kubectl scale --help

# Documentation d'une ressource
kubectl explain pod
kubectl explain deployment
kubectl explain service

# Version de Kubectl et du cluster
kubectl version
```

### ✅ Checklist de Déploiement

- [ ] Cluster Kubernetes opérationnel (`kubectl cluster-info`)
- [ ] Images Docker construites et poussées
- [ ] ConfigMap appliqué
- [ ] MongoDB déployé
- [ ] Backend déployé
- [ ] Frontend déployé
- [ ] Services créés
- [ ] Pods en état Running
- [ ] Health check backend OK
- [ ] Frontend accessible
- [ ] Tests fonctionnels effectués

### 🎯 Commandes Essentielles du TP

```bash
# 1. Vérifier le cluster
kubectl cluster-info
kubectl get nodes

# 2. Déployer
kubectl apply -f k8s-manifests/

# 3. Vérifier
kubectl get all
kubectl get pods
kubectl logs -l app=inventory-server

# 4. Tester
curl http://localhost:30001/health
curl http://localhost:30002

# 5. Scaler
kubectl scale deployment server-deployment --replicas=5

# 6. Mettre à jour
kubectl apply -f k8s-manifests/client-deployment.yaml

# 7. Observer
kubectl get deployments
kubectl get pods
kubectl rollout status deployment/client-deployment

# 8. Nettoyer
kubectl delete -f k8s-manifests/
```

### 💡 Tips et Best Practices

1. **Toujours vérifier l'état avant de déployer:**
   ```bash
   kubectl get all
   ```

2. **Utiliser des labels cohérents:**
   - app: nom de l'application
   - tier: frontend/backend/database
   - environment: dev/staging/production

3. **Versionner vos images Docker:**
   - Éviter `:latest` en production
   - Utiliser des tags sémantiques (v1.0.0, v1.1.0, etc.)

4. **Surveiller les logs régulièrement:**
   ```bash
   kubectl logs -f -l app=inventory-server
   ```

5. **Utiliser des health checks:**
   - livenessProbe: Vérifier si le container est vivant
   - readinessProbe: Vérifier si le container est prêt

6. **Définir des resource limits:**
   - Éviter qu'un pod consomme toutes les ressources du node

7. **Utiliser des namespaces pour organiser:**
   ```bash
   kubectl create namespace inventory-dev
   kubectl create namespace inventory-prod
   ```

8. **Backup de la configuration:**
   ```bash
   kubectl get all -o yaml > backup.yaml
   ```
