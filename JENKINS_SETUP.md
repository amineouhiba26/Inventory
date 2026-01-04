# Jenkins CI Pipeline Setup

## Overview
This Jenkins pipeline automates the process of:
1. Checking out code from your Git repository
2. Building Docker images
3. Scanning images for security vulnerabilities using Trivy
4. Pushing images to Docker Hub

## Prerequisites

### 1. Jenkins Installation
Install Jenkins on your local machine or server:
- **macOS**: `brew install jenkins-lts`
- **Docker**: `docker run -p 8080:8080 -p 50000:50000 jenkins/jenkins:lts`
- **Manual**: Download from [jenkins.io](https://www.jenkins.io/download/)

### 2. Required Jenkins Plugins
Install these plugins in Jenkins (Manage Jenkins > Manage Plugins):
- Docker Pipeline Plugin
- Git Plugin
- Credentials Plugin
- Pipeline Plugin

### 3. Docker and Trivy Installation
Ensure these tools are available on the Jenkins agent:

**Docker:**
```bash
# macOS
brew install docker

# Start Docker Desktop or Docker daemon
```

**Trivy:**
```bash
# macOS
brew install trivy

# Linux
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

## Jenkins Configuration

### 1. Create Docker Hub Credentials
1. Go to Jenkins Dashboard → Manage Jenkins → Manage Credentials
2. Click on "Global" domain
3. Click "Add Credentials"
4. Select "Username with password"
5. Enter:
   - **ID**: `dockerhub-creds`
   - **Username**: Your Docker Hub username
   - **Password**: Your Docker Hub access token (not password)
   - **Description**: Docker Hub Credentials

### 2. Create Jenkins Pipeline Job
1. Click "New Item" in Jenkins Dashboard
2. Enter job name: `inventory-app-pipeline`
3. Select "Pipeline" project type
4. Click "OK"

### 3. Configure Pipeline
In the pipeline configuration:

**Pipeline Definition:**
- Select "Pipeline script from SCM"
- **SCM**: Git
- **Repository URL**: `https://github.com/amineouhiba26/Inventory.git`
- **Branch**: `*/devops` (or your main branch)
- **Script Path**: `Jenkinsfile`

**Build Triggers (Optional):**
- Check "GitHub hook trigger for GITScm polling" for automatic builds on push

## Pipeline Files

### Jenkinsfile (Full Version)
- Builds both backend and frontend images
- Scans both images with Trivy
- Pushes to Docker Hub with build number tags

### Jenkinsfile.simple (Minimal Version)
- Builds only backend image (recommended for learning)
- Single image workflow
- Easier to debug and understand

## Running the Pipeline

### Manual Execution
1. Go to your pipeline job in Jenkins
2. Click "Build Now"
3. Monitor the progress in the build console

### Automatic Execution
Configure webhook in your Git repository to trigger builds on push:
1. Go to your GitHub repository settings
2. Add webhook: `http://your-jenkins-url:8080/github-webhook/`

## Pipeline Stages Explained

### 1. Checkout Stage
```groovy
stage('Checkout') {
    steps {
        echo 'Checking out code from repository...'
        checkout scm
    }
}
```
- Downloads the latest code from your Git repository
- `checkout scm` uses the configured repository URL

### 2. Build Docker Image Stage
```groovy
stage('Build Docker Image') {
    steps {
        script {
            dir('backend') {
                sh "docker build -t ${IMAGE_NAME}:${BUILD_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:latest"
            }
        }
    }
}
```
- Builds Docker image from the backend Dockerfile
- Tags image with build number and 'latest'
- Uses Jenkins BUILD_NUMBER for unique versioning

### 3. Scan Image Stage
```groovy
stage('Scan Image') {
    steps {
        script {
            sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_NAME}:${BUILD_TAG}"
        }
    }
}
```
- Scans the Docker image for security vulnerabilities
- Reports HIGH and CRITICAL severity issues
- `--exit-code 0` prevents pipeline failure on vulnerabilities (for learning)

### 4. Push to Docker Hub Stage
```groovy
stage('Push to Docker Hub') {
    steps {
        script {
            withCredentials([usernamePassword(...)]) {
                sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                sh "docker push ${IMAGE_NAME}:${BUILD_TAG}"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }
    }
}
```
- Securely logs into Docker Hub using stored credentials
- Pushes both tagged and latest versions of the image

## Environment Variables

The pipeline uses these environment variables:
- `DOCKERHUB_CREDENTIALS_ID`: Jenkins credential ID for Docker Hub
- `IMAGE_NAME`: Docker image name (format: username/repository)
- `BUILD_TAG`: Uses Jenkins BUILD_NUMBER for versioning

## Troubleshooting

### Common Issues

**Docker not found:**
- Ensure Docker is installed and running on Jenkins agent
- Check Jenkins agent has access to Docker daemon

**Trivy not found:**
- Install Trivy on Jenkins agent
- Add Trivy to system PATH

**Docker Hub authentication failed:**
- Verify Docker Hub credentials in Jenkins
- Use access token instead of password
- Check credential ID matches pipeline configuration

**Permission denied:**
- Ensure Jenkins user has Docker permissions
- Add Jenkins user to docker group: `sudo usermod -aG docker jenkins`

### Viewing Build Results
1. Click on build number in Jenkins job
2. Select "Console Output" to see detailed logs
3. Check "Workspace" to see checked out files

## Next Steps
After successful CI pipeline setup:
1. Test the pipeline with code changes
2. Configure automatic triggers
3. Move to Phase 5: Kubernetes deployment
4. Use the built Docker images in Kubernetes manifests

## Security Best Practices
- Use Docker Hub access tokens instead of passwords
- Store all credentials in Jenkins credential store
- Regularly update base images to patch vulnerabilities
- Review Trivy scan results and address critical issues
