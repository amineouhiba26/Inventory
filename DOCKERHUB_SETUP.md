# Configuration Docker Hub pour Jenkins

## 📋 Prérequis

1. Un compte Docker Hub : https://hub.docker.com
2. Jenkins en cours d'exécution
3. Plugin "Docker Pipeline" installé dans Jenkins

## 🔑 Étape 1 : Créer un Access Token Docker Hub

1. Connectez-vous à Docker Hub : https://hub.docker.com
2. Allez dans **Account Settings** → **Security** → **Access Tokens**
3. Cliquez sur **New Access Token**
4. Nom : `jenkins-ci-token`
5. Permissions : **Read, Write, Delete**
6. Copiez le token généré (vous ne pourrez plus le voir après)

## 🔐 Étape 2 : Ajouter les credentials dans Jenkins

### Méthode 1 : Via l'interface graphique (Recommandé)

1. Ouvrez Jenkins : http://localhost:8080
2. Allez dans **Manage Jenkins** → **Credentials**
3. Cliquez sur **(global)** sous "Stores scoped to Jenkins"
4. Cliquez sur **Add Credentials**
5. Remplissez le formulaire :
   - **Kind** : Username with password
   - **Scope** : Global
   - **Username** : `amineouhiba26`
   - **Password** : `<Collez votre Docker Hub Access Token>`
   - **ID** : `dockerhub-personal-token`
   - **Description** : `Docker Hub Personal Access Token`
6. Cliquez sur **Create**

### Méthode 2 : Via Script Console (Alternative)

1. Allez dans **Manage Jenkins** → **Script Console**
2. Collez ce script (remplacez `YOUR_TOKEN_HERE`) :

```groovy
import jenkins.model.Jenkins
import com.cloudbees.plugins.credentials.impl.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*

def creds = new UsernamePasswordCredentialsImpl(
  CredentialsScope.GLOBAL,
  "dockerhub-personal-token",
  "Docker Hub Personal Access Token",
  "amineouhiba26",
  "YOUR_TOKEN_HERE"  // ← Remplacez par votre token
)

Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore().addCredentials(Domain.global(), creds)

println "✅ Credentials added successfully!"
```

3. Cliquez sur **Run**

## ✅ Étape 3 : Vérifier la configuration

1. Retournez dans **Manage Jenkins** → **Credentials**
2. Vous devriez voir : `dockerhub-personal-token` (amineouhiba26/******)

## 🚀 Étape 4 : Tester le pipeline

1. Allez dans votre job Jenkins : **Inventory-Fullstack-Pipeline**
2. Cliquez sur **Build Now**
3. Vérifiez les logs dans **Console Output**

Vous devriez voir :
```
✅ Docker Hub credentials found - pushing images...
Login Succeeded
The push refers to repository [docker.io/amineouhiba26/inventory-backend]
...
✅ Backend image pushed successfully!
```

## 🔍 Vérification sur Docker Hub

1. Ouvrez : https://hub.docker.com/u/amineouhiba26
2. Vous devriez voir vos repositories :
   - `amineouhiba26/inventory-backend`
   - `amineouhiba26/inventory-frontend`

## 📝 Structure du Pipeline

Le Jenkinsfile contient maintenant :

1. **Build** : Construction des images Docker (Backend + Frontend)
2. **Scan** : Analyse de sécurité avec Trivy
3. **Push** : Publication sur Docker Hub (si credentials configurés)

## 🛡️ Installation de Trivy (Optionnel)

Si Trivy n'est pas installé, le pipeline l'installera automatiquement.

Pour une installation manuelle dans le container Jenkins :

```bash
docker exec -it -u root jenkins bash
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
trivy --version
exit
```

## 🎯 Résumé du Pipeline

| Étape | Description | Status |
|-------|-------------|--------|
| Cleanup | Nettoyage du workspace | ✅ |
| Checkout | Clone du repository GitHub | ✅ |
| Verify | Vérification des fichiers | ✅ |
| Build Backend | Construction image Docker backend | ✅ |
| Build Frontend | Construction image Docker frontend | ✅ |
| Scan Backend | Analyse sécurité backend (Trivy) | ✅ |
| Scan Frontend | Analyse sécurité frontend (Trivy) | ✅ |
| Push Backend | Publication sur Docker Hub | 🔑 (nécessite credentials) |
| Push Frontend | Publication sur Docker Hub | 🔑 (nécessite credentials) |

## 🔧 Troubleshooting

### Erreur : "credentials not found"
→ Vérifiez que l'ID est exactement `dockerhub-personal-token`

### Erreur : "denied: requested access to the resource is denied"
→ Vérifiez que votre token Docker Hub a les permissions **Write**

### Erreur : "trivy: command not found"
→ Le pipeline installera Trivy automatiquement, ou installez-le manuellement

## 📚 Ressources

- [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
- [Docker Hub Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
