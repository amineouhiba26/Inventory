pipeline {
    agent any
    
    triggers { 
        pollSCM('H/5 * * * *')  // Poll every 5 minutes for changes
    }
    
    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-creds'
        IMAGE_BACKEND = 'amineouhiba26/inventory-backend'
        IMAGE_FRONTEND = 'amineouhiba26/inventory-frontend'
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
                sh 'echo "Files in backend directory:"; ls -la backend/ || echo "backend directory not found"'
                sh 'echo "Files in frontend directory:"; ls -la frontend/ || echo "frontend directory not found"'
            }
        }
        
        stage('Build + Push BACKEND') {
            when { 
                anyOf {
                    changeset 'backend/**'
                    changeset 'Jenkinsfile'
                    expression { return env.BUILD_NUMBER == '1' }  // Always build on first run
                }
            }
            steps {
                echo 'Building and pushing backend Docker image...'
                withCredentials([usernamePassword(
                    credentialsId: DOCKERHUB_CREDENTIALS_ID,
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                        docker build -t ${IMAGE_BACKEND}:${BUILD_TAG} backend/
                        docker tag ${IMAGE_BACKEND}:${BUILD_TAG} ${IMAGE_BACKEND}:latest
                        docker push ${IMAGE_BACKEND}:${BUILD_TAG}
                        docker push ${IMAGE_BACKEND}:latest
                    '''
                }
            }
        }
        
        stage('Build + Push FRONTEND') {
            when { 
                anyOf {
                    changeset 'frontend/**'
                    changeset 'Jenkinsfile'
                    expression { return env.BUILD_NUMBER == '1' }  // Always build on first run
                }
            }
            steps {
                echo 'Building and pushing frontend Docker image...'
                withCredentials([usernamePassword(
                    credentialsId: DOCKERHUB_CREDENTIALS_ID,
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                        docker build -t ${IMAGE_FRONTEND}:${BUILD_TAG} frontend/
                        docker tag ${IMAGE_FRONTEND}:${BUILD_TAG} ${IMAGE_FRONTEND}:latest
                        docker push ${IMAGE_FRONTEND}:${BUILD_TAG}
                        docker push ${IMAGE_FRONTEND}:latest
                    '''
                }
            }
        }
        
        stage('Scan Images') {
            parallel {
                stage('Scan Backend') {
                    when { 
                        anyOf {
                            changeset 'backend/**'
                            changeset 'Jenkinsfile'
                            expression { return env.BUILD_NUMBER == '1' }
                        }
                    }
                    steps {
                        echo 'Scanning backend image for vulnerabilities...'
                        sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_BACKEND}:${BUILD_TAG}"
                    }
                }
                stage('Scan Frontend') {
                    when { 
                        anyOf {
                            changeset 'frontend/**'
                            changeset 'Jenkinsfile'
                            expression { return env.BUILD_NUMBER == '1' }
                        }
                    }
                    steps {
                        echo 'Scanning frontend image for vulnerabilities...'
                        sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_FRONTEND}:${BUILD_TAG}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up Docker system...'
            sh 'docker system prune -af || true'  // Clean everything like in class example
            sh 'docker logout || true'
        }
        success {
            echo "Pipeline completed successfully!"
            script {
                if (env.CHANGE_TARGET) {
                    echo "Backend image: ${IMAGE_BACKEND}:${BUILD_TAG}"
                    echo "Frontend image: ${IMAGE_FRONTEND}:${BUILD_TAG}"
                } else {
                    echo "No changes detected - skipped builds"
                }
            }
        }
        failure {
            echo "Pipeline failed! Check the logs for details."
        }
    }
}
