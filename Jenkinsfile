pipeline {
    environment {
    imagename = "avacuscc-events-mq"
    ecrurl = "http://10.123.31.221:5000/v2/"
    dockerImage = ''
    }
    agent any
    stages {
      
      stage('Cloning Git') {
        // when {branch 'develop'}
        steps {
          git branch: 'develop', credentialsId: 'github-develop', url: 'https://github.com/wakumo/avacuscc-events-mq.git'
        }
      }
      stage('Building image') {
        // when {branch 'develop'}
        steps{
          script {
            dockerImage = docker.build imagename
          }
        }
      }
      stage('Push Image') {
        // when {branch 'develop'}
        steps{
          script {
            // docker.withRegistry(ecrurl, ecrcredentials ) {
            docker.withRegistry(ecrurl) {
              dockerImage.push("$BUILD_NUMBER")
              dockerImage.push('latest')
            }
          }
        }
      }
      stage('Kubernetes') {
        // when {branch 'develop'}
        steps{
          script{
            withKubeConfig(credentialsId: 'wkm_local_credential_deploy', namespace: 'avacuscc', serverUrl: 'https://10.123.31.214:6443') {
              sh 'curl -LO "https://storage.googleapis.com/kubernetes-release/release/v1.20.5/bin/linux/amd64/kubectl"'  
              sh 'chmod u+x ./kubectl'  
              
              sh './kubectl apply -f .kube/development/events-mq-deployment.yml'
              sh './kubectl rollout restart deployment/events-mq-deployment'
            }
          }
        }
      }
    }
    post {
       // only triggered when blue or green sign
       success {
           slackSend channel: 'avacuscc-jenkins-notification-dev', message: "[ctn-api] git-commit {${GIT_COMMIT}} has been deployed!!!", color: '#1ddb46'
       }
       // triggered when red sign
       failure {
           slackSend channel: 'avacuscc-jenkins-notification-dev', message: "[ctn-api] something went wrong at git-commit {${GIT_COMMIT}}. please try again!!!", color: '#FE2E2E'
       }
       // trigger every-works
       always {
           sh "docker system prune -f"
       }
    }
  }