pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-creds'   
        BACKEND_IMAGE = 'amineouhiba26/inventory-backend'
        FRONTEND_IMAGE = 'amineouhiba26/inventory-frontend'
        BUILD_TAG = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out code from repository...'
                checkout scm
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                echo 'Building backend Docker image...'
                script {
                    dir('backend') {
                        sh "docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} ."
                        sh "docker tag ${BACKEND_IMAGE}:${BUILD_TAG} ${BACKEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                echo 'Building frontend Docker image...'
                script {
                    dir('frontend') {
                        sh "docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} ."
                        sh "docker tag ${FRONTEND_IMAGE}:${BUILD_TAG} ${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Scan Backend Image') {
            steps {
                echo 'Scanning backend image for vulnerabilities...'
                script {
                    sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${BACKEND_IMAGE}:${BUILD_TAG}"
                }
            }
        }

        stage('Scan Frontend Image') {
            steps {
                echo 'Scanning frontend image for vulnerabilities...'
                script {
                    sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${FRONTEND_IMAGE}:${BUILD_TAG}"
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo 'Pushing backend and frontend images to Docker Hub...'
                script {
                    withCredentials([usernamePassword(
                        credentialsId: DOCKERHUB_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        // Docker login
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"

                        // Push backend
                        sh "docker push ${BACKEND_IMAGE}:${BUILD_TAG}"
                        sh "docker push ${BACKEND_IMAGE}:latest"

                        // Push frontend
                        sh "docker push ${FRONTEND_IMAGE}:${BUILD_TAG}"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up local Docker images...'
            script {
                sh "docker rmi ${BACKEND_IMAGE}:${BUILD_TAG} || true"
                sh "docker rmi ${BACKEND_IMAGE}:latest || true"
                sh "docker rmi ${FRONTEND_IMAGE}:${BUILD_TAG} || true"
                sh "docker rmi ${FRONTEND_IMAGE}:latest || true"
                sh "docker logout || true"
            }
        }
        success {
            echo 'Pipeline completed successfully!'
            echo "Backend image: ${BACKEND_IMAGE}:${BUILD_TAG}"
            echo "Frontend image: ${FRONTEND_IMAGE}:${BUILD_TAG}"
        }
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
    }
}
