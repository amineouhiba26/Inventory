pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-creds'
        IMAGE_NAME = 'amineouhiba26/inventory-backend'
        BUILD_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from repository...'
                checkout scm
            }
        }
        
        stage('List Files') {
            steps {
                echo 'Listing workspace contents...'
                sh 'ls -la'
                sh 'pwd'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building backend Docker image...'
                script {
                    dir('backend') {
                        sh 'ls -la'
                        sh "docker build -t ${IMAGE_NAME}:${BUILD_TAG} ."
                        sh "docker tag ${IMAGE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:latest"
                    }
                }
            }
        }
        
        stage('Scan Image') {
            steps {
                echo 'Scanning Docker image for vulnerabilities...'
                script {
                    sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_NAME}:${BUILD_TAG}"
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing image to Docker Hub...'
                script {
                    withCredentials([usernamePassword(
                        credentialsId: DOCKERHUB_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                        sh "docker push ${IMAGE_NAME}:${BUILD_TAG}"
                        sh "docker push ${IMAGE_NAME}:latest"
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up Docker images...'
            script {
                sh "docker rmi ${IMAGE_NAME}:${BUILD_TAG} || true"
                sh "docker rmi ${IMAGE_NAME}:latest || true"
                sh "docker logout || true"
            }
        }
        success {
            echo "Pipeline completed successfully!"
            echo "Image pushed: ${IMAGE_NAME}:${BUILD_TAG}"
        }
        failure {
            echo "Pipeline failed! Check the logs for details."
        }
    }
}
