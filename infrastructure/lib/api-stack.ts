import * as cdk from 'aws-cdk-lib';
import {
  aws_apigateway as apigateway,
  aws_cognito as cognito,
  aws_lambda as lambda,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ApiStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, apiFunction: lambda.IFunction, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'ai-document-analyzer-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = userPool.addClient('WebClient', {
      generateSecret: false,
      authFlows: { userSrp: true, userPassword: true },
      enableTokenRevocation: true,
      refreshTokenValidity: cdk.Duration.days(30),
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ApiAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const api = new apigateway.RestApi(this, 'DocumentAnalyzerApi', {
      restApiName: 'AI Document Analyzer API',
      description: 'REST API for the AI Document Analyzer',
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      deployOptions: {
        stageName: 'dev',
        tracingEnabled: true,
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: false,
      },
    });

    const apiRoot = api.root.addResource('api');
    apiRoot.addResource('health').addMethod('GET', new apigateway.LambdaIntegration(apiFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.urlForPath('/api/health'),
      description: 'Base URL for the AI Document Analyzer API',
    });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'CognitoRegion', { value: this.region });
  }
}
