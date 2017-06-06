pipeline {
  agent {
    docker {
      image 'node'
    }
    
  }
  stages {
    stage('test') {
      steps {
        sh 'echo test'
      }
    }
    stage('build') {
      steps {
        echo 'build'
      }
    }
  }
}