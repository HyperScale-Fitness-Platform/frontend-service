pipeline {
    agent any

    environment {
        // Shared workspace mappings
        ECR_REPO_NAME  = "frontend-service"
        KUBERNETES_DIR = "${WORKSPACE}/k8s"
        NAMESPACE      = "gym-dev"
        AWS_REGION     = "us-east-1"
        CLUSTER_NAME   = "gym-cluster"

        // Safe evaluation fallback for Git SHA
        IMAGE_TAG      = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"

        // Jenkins Credentials Store bindings (Available globally across all stages & post block)
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        AWS_ACCOUNT_ID        = credentials('aws-account-id')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('ECR Authentication') {
            steps {
                echo '🔐 Authenticating Docker daemon with AWS ECR...'
                sh "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"
            }
        }

        stage('Build Container Image') {
            steps {
                echo "🏭 Building Docker image tagged as: ${env.IMAGE_TAG}..."
                sh "docker build --build-arg VITE_API_GETWAY_URL= -t ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.ECR_REPO_NAME}:${env.IMAGE_TAG} ."
                sh "docker tag ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.ECR_REPO_NAME}:${env.IMAGE_TAG} ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.ECR_REPO_NAME}:latest"
            }
        }

        stage('Push Image to AWS ECR') {
            steps {
                echo "🚀 Pushing image artifact [${env.IMAGE_TAG}] to AWS ECR..."
                sh "docker push ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.ECR_REPO_NAME}:${env.IMAGE_TAG}"
                sh "docker push ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.ECR_REPO_NAME}:latest"
            }
        }

        stage('Authenticate to EKS') {
            steps {
                echo '🛡️ Updating cluster context connection...'
                sh "aws eks update-kubeconfig --region ${env.AWS_REGION} --name ${env.CLUSTER_NAME}"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo '🚀 Deploying Frontend Service...'
                script {
                    temp_deployment = sh(
                        script: "mktemp",
                        returnStdout: true
                    ).trim()
                    sh """
                        sed -e "s|<account-id>|${env.AWS_ACCOUNT_ID}|g" \
                            -e "s|<region>|${env.AWS_REGION}|g" \
                            -e "s|:latest|:${env.IMAGE_TAG}|g" \
                            ${env.KUBERNETES_DIR}/deployment.yaml > ${temp_deployment}
                    """
                    sh "kubectl apply -f ${temp_deployment}"
                    sh "rm -f ${temp_deployment}"
                }
                sh "kubectl apply -f ${env.KUBERNETES_DIR}/service.yaml"

                echo '🔄 Restarting deployment to consume updated configuration...'
                sh "kubectl rollout restart deployment/frontend-service -n ${env.NAMESPACE}"
                sh "kubectl rollout status deployment/frontend-service -n ${env.NAMESPACE} --timeout=120s"
            }
        }

        stage('Smoke Test') {
            steps {
                echo '🧪 Verifying the SPA is being served...'
                sh "kubectl run smoke-frontend --rm -i --restart=Never -n ${env.NAMESPACE} --image=curlimages/curl -- curl -sf http://frontend-service/"
            }
        }
    }

    post {
        success {
            echo "✅ frontend-service:${env.IMAGE_TAG} successfully deployed and healthy!"
        }
        failure {
            echo "❌ Deployment failed! Check the step diagnostics above."
        }
        always {
            sh "rm -f /tmp/frontend-deployment-resolved.yaml || true"
        }
    }
}
