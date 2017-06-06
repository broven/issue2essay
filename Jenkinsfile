pipeline {
  agent {
    docker {
      image 'node'
    }
    
  }
  stages {
    stage('') {
      steps {
        sh '''npm install
npm run test'''
        echo 'testing'
      }
    }
  }
}