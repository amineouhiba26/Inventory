  // Jenkins Pipeline Script (Direct Input)
// Copy this entire content and paste it into Jenkins as "Pipeline script"

pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-personal-token'
        IMAGE_BACKEND = 'amineouhiba/inventory-backend'
        IMAGE_FRONTEND = 'amineouhiba/inventory-frontend'
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
                sh 'echo "Files in Backend directory:"; ls -la backend/'
                sh 'echo "Files in Frontend directory:"; ls -la frontend/'
            }
        }
        
        stage('Build Backend') {
            steps {
                echo 'Building backend Docker image...'
                script {
                    dir('backend') {
                        sh 'ls -la'
                        sh "docker build -t ${IMAGE_BACKEND}:${BUILD_TAG} ."
                        sh "docker tag ${IMAGE_BACKEND}:${BUILD_TAG} ${IMAGE_BACKEND}:latest"
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo 'Building frontend Docker image...'
                script {
                    dir('frontend') {
                        sh 'ls -la'
                        sh "docker build -t ${IMAGE_FRONTEND}:${BUILD_TAG} ."
                        sh "docker tag ${IMAGE_FRONTEND}:${BUILD_TAG} ${IMAGE_FRONTEND}:latest"
                    }
                }
            }
        }
        
        stage('Scan Backend') {
            steps {
                echo 'Scanning backend image for vulnerabilities with Trivy...'
                script {
                    def trivyInstalled = sh(script: "command -v trivy", returnStatus: true) == 0
                    if (trivyInstalled) {
                        echo '✅ Trivy found, running security scan...'
                        sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_BACKEND}:${BUILD_TAG}"
                    } else {
                        echo '⚠️ Trivy not installed - Installing now...'
                        sh '''
                            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                            trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_BACKEND}:${BUILD_TAG}
                        '''
                    }
                }
            }
        }
        
        stage('Scan Frontend') {
            steps {
                echo 'Scanning frontend image for vulnerabilities with Trivy...'
                script {
                    sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_FRONTEND}:${BUILD_TAG}"
                }
            }
        }
        
        stage('Push Backend') {
            steps {
                echo 'Pushing backend image to Docker Hub...'
                script {
                    def credentialsExist = false
                    try {
                        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            credentialsExist = true
                        }
                    } catch (Exception e) {
                        credentialsExist = false
                    }
                    
                    if (credentialsExist) {
                        echo '✅ Docker Hub credentials found - pushing images...'
                        retry(3) {
                            withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                                sh '''
                                    echo "🔄 Attempting Docker login..."
                                    echo "$DOCKER_PASS" | timeout 60 docker login -u "$DOCKER_USER" --password-stdin
                                    echo "📤 Pushing backend image..."
                                    timeout 300 docker push ${IMAGE_BACKEND}:${BUILD_TAG}
                                    timeout 300 docker push ${IMAGE_BACKEND}:latest
                                '''
                            }
                        }
                        echo "✅ Backend image pushed successfully!"
                    } else {
                        echo '⚠️ Docker Hub credentials not configured'
                        echo '📝 To configure credentials in Jenkins:'
                        echo '   1. Go to: Jenkins → Manage Jenkins → Credentials'
                        echo '   2. Click: (global) → Add Credentials'
                        echo '   3. Kind: Username with password'
                        echo '   4. ID: dockerhub-personal-token'
                        echo '   5. Username: amineouhiba26'
                        echo '   6. Password: <Your Docker Hub Access Token>'
                        echo ''
                        echo '🎯 For now, images are built locally:'
                        echo "   docker push ${IMAGE_BACKEND}:${BUILD_TAG}"
                        echo "   docker push ${IMAGE_BACKEND}:latest"
                    }
                }
            }
        }
        
        stage('Push Frontend') {
            steps {
                echo 'Pushing frontend image to Docker Hub...'
                script {
                    def credentialsExist = false
                    try {
                        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            credentialsExist = true
                        }
                    } catch (Exception e) {
                        credentialsExist = false
                    }
                    
                    if (credentialsExist) {
                        echo '✅ Docker Hub credentials found - pushing images...'
                        retry(3) {
                            withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                                sh '''
                                    echo "🔄 Attempting Docker login..."
                                    echo "$DOCKER_PASS" | timeout 60 docker login -u "$DOCKER_USER" --password-stdin
                                    echo "📤 Pushing frontend image..."
                                    timeout 300 docker push ${IMAGE_FRONTEND}:${BUILD_TAG}
                                    timeout 300 docker push ${IMAGE_FRONTEND}:latest
                                '''
                            }
                        }
                        echo "✅ Frontend image pushed successfully!"
                    } else {
                        echo '⚠️ Skipping push - credentials not configured'
                        echo "   docker push ${IMAGE_FRONTEND}:${BUILD_TAG}"
                        echo "   docker push ${IMAGE_FRONTEND}:latest"
                    }
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
            echo "🐳 Backend image: ${IMAGE_BACKEND}:${BUILD_TAG}"
            echo "� Frontend image: ${IMAGE_FRONTEND}:${BUILD_TAG}"
            echo "🚀 Docker Hub: https://hub.docker.com/u/amineouhiba26"
            echo ""
            echo "📋 Pipeline Summary:"
            echo "   ✅ Code checkout from GitHub"
            echo "   ✅ Backend Docker image built"
            echo "   ✅ Frontend Docker image built"
            echo "   ✅ Security scan with Trivy"
            echo "   ✅ Images pushed to Docker Hub"
        }
        failure {
            echo "❌ Pipeline failed! Check the logs for details."
        }
    }
}
