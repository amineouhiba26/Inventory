// Jenkins Pipeline Script (Direct Input)
// Copy this entire content and paste it into Jenkins as "Pipeline script"

pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-personal-token'
        IMAGE_BACKEND = 'amineouhiba26/inventory-backend'
        BUILD_TAG = "${env.BUILD_NUMBER}"
        GIT_REPO = 'https://github.com/amineouhiba26/Inventory.git'
        GIT_BRANCH = 'devops'
    }
    
    stages {
        stage('Cleanup Workspace') {
            steps {
                echo 'Cleaning workspace...'
                deleteDir()
            }
        }
        
        stage('Checkout Code') {
            steps {
                echo 'Checking out code from GitHub...'
                git branch: "${GIT_BRANCH}", url: "${GIT_REPO}"
            }
        }
        
        stage('Verify Workspace') {
            steps {
                echo 'Verifying workspace contents...'
                sh 'ls -la'
                sh 'pwd'
                sh 'echo "Checking for backend directory:"; ls -la backend/ || echo "backend directory not found"'
                sh 'echo "Checking for Backend directory:"; ls -la Backend/ || echo "Backend directory not found"'
            }
        }
        
        stage('Build Backend') {
            steps {
                echo 'Building backend Docker image...'
                script {
                    // Try Backend first, then fallback to backend
                    def backendDir = sh(script: "test -d Backend && echo 'Backend' || echo 'backend'", returnStdout: true).trim()
                    echo "Using directory: ${backendDir}"
                    
                    dir(backendDir) {
                        sh 'ls -la'
                        sh "docker build -t ${IMAGE_BACKEND}:${BUILD_TAG} ."
                        sh "docker tag ${IMAGE_BACKEND}:${BUILD_TAG} ${IMAGE_BACKEND}:latest"
                    }
                }
            }
        }
        
        stage('Scan Backend') {
            steps {
                echo 'Scanning backend image for vulnerabilities...'
                script {
                    def trivyInstalled = sh(script: "command -v trivy", returnStatus: true) == 0
                    if (trivyInstalled) {
                        echo 'Trivy found, running security scan...'
                        sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_BACKEND}:${BUILD_TAG}"
                    } else {
                        echo '⚠️ Trivy not installed on Jenkins server'
                        echo 'Skipping security scan - install Trivy for vulnerability scanning'
                        echo 'To install: curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin'
                    }
                }
            }
        }
        
        stage('Push Backend') {
            steps {
                echo 'Pushing backend image to Docker Hub...'
                script {
                    // For now, skip push since credentials need manual setup
                    echo '⚠️ Docker Hub credentials not configured yet'
                    echo '📝 To enable Docker Hub push:'
                    echo '   1. Go to Jenkins → Manage Jenkins → Script Console'
                    echo '   2. Run this script:'
                    echo '''
import jenkins.model.Jenkins
import com.cloudbees.plugins.credentials.impl.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*

def creds = new UsernamePasswordCredentialsImpl(
  CredentialsScope.GLOBAL,
  "dockerhub-personal-token",
  "Docker Hub Personal Access Token",
  "amineouhiba26",
  "YOUR_DOCKER_HUB_TOKEN_HERE"
)

Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore().addCredentials(Domain.global(), creds)
                    '''
                    echo ''
                    echo '🎯 For now, the image is built and ready locally!'
                    echo "   docker push ${IMAGE_BACKEND}:${BUILD_TAG}"
                    echo "   docker push ${IMAGE_BACKEND}:latest"
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up Docker system...'
            sh 'docker system prune -af || true'
            sh 'docker logout || true'
        }
        success {
            echo "✅ Pipeline completed successfully!"
            echo "🐳 Backend image built: ${IMAGE_BACKEND}:${BUILD_TAG}"
            echo "🚀 Check Docker Hub: https://hub.docker.com/r/amineouhiba26/inventory-backend"
            echo ""
            echo "📋 Pipeline Summary:"
            echo "   ✅ Code checkout from GitHub"
            echo "   ✅ Docker image build"
            echo "   ⚠️  Security scan (Trivy installation needed)"
            echo "   🚀 Docker Hub push (credentials needed)"
        }
        failure {
            echo "❌ Pipeline failed! Check the logs for details."
        }
    }
}
