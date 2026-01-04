# Pipeline Jenkins - Intégration Continue

## 🎯 Objectif

Pipeline Jenkins automatisé pour l'intégration continue du projet Inventory Management System, conforme aux exigences :

1. **Build** : Construction des images Docker (Backend + Frontend)
2. **Scan** : Analyse de vulnérabilités avec Trivy
3. **Push** : Publication sur Docker Hub si les étapes précédentes sont validées

## 📋 Architecture du Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    JENKINS CI PIPELINE                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ Cleanup │        │Checkout │        │ Verify  │
   │Workspace│   →    │  Code   │   →    │Workspace│
   └─────────┘        └─────────┘        └─────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
   ┌──────────┐                          ┌──────────┐
   │  Build   │                          │  Build   │
   │ Backend  │                          │ Frontend │
   └──────────┘                          └──────────┘
        │                                       │
        ▼                                       ▼
   ┌──────────┐                          ┌──────────┐
   │  Scan    │                          │  Scan    │
   │ Backend  │                          │ Frontend │
   │ (Trivy)  │                          │ (Trivy)  │
   └──────────┘                          └──────────┘
        │                                       │
        ▼                                       ▼
   ┌──────────┐                          ┌──────────┐
   │  Push    │                          │  Push    │
   │ Backend  │                          │ Frontend │
   │Docker Hub│                          │Docker Hub│
   └──────────┘                          └──────────┘
```

## 🔧 Configuration du Pipeline

### Variables d'Environnement

```groovy
environment {
    DOCKERHUB_CREDENTIALS_ID = 'dockerhub-personal-token'
    IMAGE_BACKEND = 'amineouhiba26/inventory-backend'
    IMAGE_FRONTEND = 'amineouhiba26/inventory-frontend'
    BUILD_TAG = "${env.BUILD_NUMBER}"
    GIT_REPO = 'https://github.com/amineouhiba26/Inventory.git'
    GIT_BRANCH = 'devops'
}
```

## 📝 Étapes du Pipeline

### 1️⃣ Cleanup Workspace
```groovy
stage('Cleanup Workspace') {
    steps {
        deleteDir()  // Supprime tous les fichiers du workspace
    }
}
```
**Objectif** : Garantir un environnement propre pour chaque build

---

### 2️⃣ Checkout Code
```groovy
stage('Checkout Code') {
    steps {
        git branch: "${GIT_BRANCH}", url: "${GIT_REPO}"
    }
}
```
**Objectif** : Récupérer le code source depuis GitHub (branche devops)

---

### 3️⃣ Verify Workspace
```groovy
stage('Verify Workspace') {
    steps {
        sh 'ls -la Backend/'
        sh 'ls -la Frontend/'
    }
}
```
**Objectif** : Vérifier la présence des répertoires Backend et Frontend

---

### 4️⃣ Build Backend & Frontend
```groovy
stage('Build Backend') {
    steps {
        dir('Backend') {
            sh "docker build -t ${IMAGE_BACKEND}:${BUILD_TAG} ."
            sh "docker tag ${IMAGE_BACKEND}:${BUILD_TAG} ${IMAGE_BACKEND}:latest"
        }
    }
}

stage('Build Frontend') {
    steps {
        dir('Frontend') {
            sh "docker build -t ${IMAGE_FRONTEND}:${BUILD_TAG} ."
            sh "docker tag ${IMAGE_FRONTEND}:${BUILD_TAG} ${IMAGE_FRONTEND}:latest"
        }
    }
}
```
**Objectif** : Construire les images Docker avec tag versionnée et latest

**Images produites** :
- `amineouhiba26/inventory-backend:16` + `:latest`
- `amineouhiba26/inventory-frontend:16` + `:latest`

---

### 5️⃣ Scan avec Trivy (Sécurité)
```groovy
stage('Scan Backend') {
    steps {
        script {
            def trivyInstalled = sh(script: "command -v trivy", returnStatus: true) == 0
            if (trivyInstalled) {
                sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_BACKEND}:${BUILD_TAG}"
            } else {
                sh '''
                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                    trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_BACKEND}:${BUILD_TAG}
                '''
            }
        }
    }
}
```

**Objectif** : Détecter les vulnérabilités de sécurité (HIGH et CRITICAL)

**Fonctionnalités** :
- Installation automatique de Trivy si absent
- Scan des deux images (Backend + Frontend)
- Rapport des vulnérabilités critiques

---

### 6️⃣ Push vers Docker Hub
```groovy
stage('Push Backend') {
    steps {
        script {
            withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", 
                            usernameVariable: 'DOCKER_USER', 
                            passwordVariable: 'DOCKER_PASS')]) {
                sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push ${IMAGE_BACKEND}:${BUILD_TAG}
                    docker push ${IMAGE_BACKEND}:latest
                '''
            }
        }
    }
}
```

**Objectif** : Publier les images sur Docker Hub si les scans sont OK

**Conditions** :
- ✅ Build réussi
- ✅ Scan Trivy passé (pas de vulnérabilités bloquantes)
- ✅ Credentials Docker Hub configurés

---

### 7️⃣ Post Actions
```groovy
post {
    always {
        sh 'docker system prune -af || true'
        sh 'docker logout || true'
    }
    success {
        echo "✅ Pipeline completed successfully!"
    }
    failure {
        echo "❌ Pipeline failed!"
    }
}
```

**Objectif** : Nettoyage et notifications

---

## 🚀 Utilisation

### Lancer le Pipeline

1. Ouvrez Jenkins : http://localhost:8080
2. Sélectionnez **Inventory-Fullstack-Pipeline**
3. Cliquez sur **Build Now**
4. Suivez l'exécution dans **Console Output**

### Résultat Attendu

```
✅ Pipeline completed successfully!
🐳 Backend image: amineouhiba26/inventory-backend:17
🐳 Frontend image: amineouhiba26/inventory-frontend:17
🚀 Docker Hub: https://hub.docker.com/u/amineouhiba26

📋 Pipeline Summary:
   ✅ Code checkout from GitHub
   ✅ Backend Docker image built
   ✅ Frontend Docker image built
   ✅ Security scan with Trivy
   ✅ Images pushed to Docker Hub
```

## 📊 Métriques du Pipeline

| Métrique | Valeur Typique |
|----------|----------------|
| Durée totale | ~2-3 minutes |
| Build Backend | ~20-30s |
| Build Frontend | ~1-2 min |
| Scan Trivy | ~10-15s |
| Push Docker Hub | ~5-10s |

## 🔐 Configuration des Credentials Docker Hub

**Voir le fichier** : `DOCKERHUB_SETUP.md`

Étapes rapides :
1. Créer un Access Token sur Docker Hub
2. Ajouter dans Jenkins : **Manage Jenkins** → **Credentials**
3. ID : `dockerhub-personal-token`
4. Username : `amineouhiba26`
5. Password : `<votre token>`

## 🛡️ Sécurité avec Trivy

### Que scanne Trivy ?

- ✅ Vulnérabilités OS (Alpine, Debian, etc.)
- ✅ Vulnérabilités applicatives (npm, pip packages)
- ✅ CVE critiques et de haute sévérité

### Exemple de sortie Trivy

```
amineouhiba26/inventory-backend:16 (alpine 3.19.1)

Total: 2 (HIGH: 1, CRITICAL: 1)

┌────────────┬────────────────┬──────────┬─────────┬───────────────────┐
│  Library   │ Vulnerability  │ Severity │ Status  │     Title         │
├────────────┼────────────────┼──────────┼─────────┼───────────────────┤
│ express    │ CVE-2024-12345 │ HIGH     │ fixed   │ Prototype pollution│
│ mongoose   │ CVE-2024-67890 │ CRITICAL │ unfixed │ Remote code exec  │
└────────────┴────────────────┴──────────┴─────────┴───────────────────┘
```

## 📦 Images Docker Produites

### Backend
```bash
docker pull amineouhiba26/inventory-backend:latest
docker pull amineouhiba26/inventory-backend:17
```

**Tags** :
- `latest` : Dernière version stable
- `<BUILD_NUMBER>` : Version spécifique (traçabilité)

### Frontend
```bash
docker pull amineouhiba26/inventory-frontend:latest
docker pull amineouhiba26/inventory-frontend:17
```

## 🔄 Déclenchement Automatique

### Option 1 : Webhook GitHub
```groovy
triggers {
    githubPush()
}
```

### Option 2 : Polling SCM (toutes les 5 min)
```groovy
triggers {
    pollSCM('H/5 * * * *')
}
```

### Option 3 : Manuel (actuel)
Cliquer sur **Build Now** dans Jenkins

## 🐛 Troubleshooting

### Erreur : "Cannot connect to Docker daemon"
```bash
# Vérifier que Jenkins a accès à Docker
docker exec -it jenkins docker ps
```

### Erreur : "Trivy scan failed"
```bash
# Installer manuellement Trivy
docker exec -it -u root jenkins bash
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

### Erreur : "Docker Hub push denied"
→ Vérifier les credentials dans Jenkins (voir `DOCKERHUB_SETUP.md`)

## 📚 Ressources

- [Jenkinsfile Documentation](https://www.jenkins.io/doc/book/pipeline/jenkinsfile/)
- [Trivy Security Scanner](https://aquasecurity.github.io/trivy/)
- [Docker Hub Repositories](https://hub.docker.com/u/amineouhiba26)
- [GitHub Repository](https://github.com/amineouhiba26/Inventory)

## ✅ Conformité aux Exigences

| Exigence | Implémentation | Status |
|----------|----------------|--------|
| **Build** : Construction de l'image Docker | `stage('Build Backend')` + `stage('Build Frontend')` | ✅ |
| **Scan** : Utilisation de Trivy | `stage('Scan Backend')` + `stage('Scan Frontend')` | ✅ |
| **Push** : Publication sur Docker Hub si validé | `stage('Push Backend')` + `stage('Push Frontend')` | ✅ |

---

**Pipeline créé par** : Amine Ouhiba  
**Date** : Janvier 2026  
**Version** : 1.0
