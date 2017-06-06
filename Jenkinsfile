pipeline {
  agent {
    docker {
      image 'node'
    }
    
  }
  stages {
    stage('test') {
      steps {
        sh '''npm install&&npm run test'''
        echo 'testing'
      }
    }
  }
}
