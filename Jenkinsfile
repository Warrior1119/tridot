def FAILED_STAGE
pipeline{
    agent any
    environment{        
        APP_DEPLOYMENT_S3_BUCKET=credentials('APP_DEPLOYMENT_S3_BUCKET')
        AWS_ACCESS_KEY_ID=credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY=credentials('AWS_SECRET_ACCESS_KEY')
        AWS_DEFAULT_REGION=credentials('AWS_DEFAULT_REGION')          
        NPM_TOKEN = credentials('NPM_TOKEN') 
    }
    stages{
        stage('Init'){
            steps{
                script{
                    FAILED_STAGE = env.STAGE_NAME                    
                    sh 'echo init stage'
                    sh "npm config set //npm.pkg.github.com/:_authToken=${NPM_TOKEN}"
                    sh 'npm install'        
                    sh("echo Init Step completed successfully.")                          
                }
            }
        }

        stage('Build'){
            steps{  
                script{
                    FAILED_STAGE = env.STAGE_NAME              
                    sh 'npm run buildstage'
                    sh("echo Build Step completed successfully.")                    
                }
            }

        }
        stage('Test'){
            steps{
                script{
                    FAILED_STAGE = env.STAGE_NAME
                    sh 'echo test stage'                    
                }
            }

        }
        stage('Deploy'){
            when {
                 expression {env.GIT_BRANCH == 'origin/development'}
            }
            steps{
                script{
                    FAILED_STAGE = env.STAGE_NAME
                    sh 'echo deploy stage'                    
                    sh("npm run deploystage");
                    sh("echo Deployment Step completed successfully.")                    
                }
            }
        }
        stage('e2e run'){
            steps{
                script{
                    FAILED_STAGE = env.STAGE_NAME                                        
                    sh "npm run webdriver-update-ci"
                    sh 'npm run e2e'        
                }
            }
        }
    }
    post{
        failure{
            slackSend baseUrl: 'https://hooks.slack.com/services/', 
                                channel: '#ui-pipeline-failures', 
                                color: 'warning', 
                                message: "Build Failed: tridot-angular-pipeline \n Failed Stage: ${FAILED_STAGE} \n Build url : ${env.BUILD_URL}", 
                                teamDomain: 'tridot-dev', 
                                tokenCredentialId: 'slack-notification-token'
        }
        cleanup{
            cleanWs()
            sh "echo Workspace clean up successful"
        }
    }
}
