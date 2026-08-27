pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'prod'],
            description: 'Target environment overlay (informational; deploy is handled by GitOps)'
        )
    }

    environment {
        ECR_REPO_NAME = "frontend-service"
        AWS_REGION    = "us-east-1"

        // Safe evaluation fallback for Git SHA
        IMAGE_TAG     = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"

        // AWS Credentials from Jenkins Store
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        AWS_ACCOUNT_ID        = credentials('aws-account-id')

        PATH          = "${WORKSPACE}/.tools/bin:${env.PATH}"

        // Vite bakes these in at build time (there is no runtime config for a
        // static SPA). Empty gateway URL = same-origin: frontend and gateway
        // are served from the same ALB/domain in the cluster. The Stripe
        // publishable key is public by design (it ships in the browser
        // bundle) -- swap for the live key / a parameter for prod.
        VITE_API_GETWAY_URL         = ""
        VITE_STRIPE_PUBLISHABLE_KEY = "pk_test_51U8mZ4IWbk32ohvY2Md6rNfsZEC8SHj7adQgmDFdC39ehDwkTP3T8gsA43gfRSxzRPH2UPdtEmBk9Ck1TtMIDqYU00DJ0zFcqT"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Bootstrap CLI Tools') {
            steps {
                sh '''
                    set -e
                    TOOL_BIN="${WORKSPACE}/.tools/bin"
                    mkdir -p "${TOOL_BIN}"
                    export PATH="${TOOL_BIN}:${PATH}"

                    if ! command -v aws >/dev/null 2>&1; then
                        echo "Installing AWS CLI v2..."
                        curl --retry 3 --retry-delay 2 -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
                        unzip -q -o /tmp/awscliv2.zip -d /tmp/
                        /tmp/aws/install --install-dir "${WORKSPACE}/.tools/aws-cli" --bin-dir "${TOOL_BIN}" --update
                        rm -rf /tmp/aws /tmp/awscliv2.zip
                    fi

                    if ! command -v docker >/dev/null 2>&1; then
                        echo "Installing Docker CLI..."
                        DOCKER_VER="26.1.4"
                        curl --retry 3 --retry-delay 2 -fsSL "https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_VER}.tgz" -o /tmp/docker.tgz
                        tar -xzf /tmp/docker.tgz -C /tmp/
                        mv /tmp/docker/docker "${TOOL_BIN}/"
                        rm -rf /tmp/docker /tmp/docker.tgz
                    fi

                    echo "--- Tool Versions & Checks ---"
                    aws --version
                    docker --version || echo "Warning: Docker daemon socket may not be accessible"
                '''
            }
        }

        stage('ECR Authentication') {
            steps {
                echo '🔐 Authenticating Docker daemon with AWS ECR...'
                sh """
                    aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Build & Push Container Image') {
            steps {
                echo "🏭 Building and pushing ${env.ECR_REPO_NAME} (${env.IMAGE_TAG})..."
                sh """
                    IMAGE_URI="${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.ECR_REPO_NAME}"

                    docker build \
                      --build-arg VITE_API_GETWAY_URL="${env.VITE_API_GETWAY_URL}" \
                      --build-arg VITE_STRIPE_PUBLISHABLE_KEY="${env.VITE_STRIPE_PUBLISHABLE_KEY}" \
                      -t "\${IMAGE_URI}:${env.IMAGE_TAG}" -t "\${IMAGE_URI}:latest" .

                    docker push "\${IMAGE_URI}:${env.IMAGE_TAG}"
                    docker push "\${IMAGE_URI}:latest"
                """
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ ${env.ECR_REPO_NAME}:${env.IMAGE_TAG} build and push complete! GitOps (argocd-image-updater) will roll it out."
        }
        failure {
            echo "❌ Pipeline failed! Check the stage logs above."
        }
    }
}
