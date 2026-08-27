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

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const googleEnabled = Boolean(googleClientId && googleClientSecret);
    let hostedDomain: cognito.UserPoolDomain | undefined;

    if (googleEnabled) {
      new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
        userPool,
        clientId: googleClientId!,
        clientSecretValue: cdk.SecretValue.unsafePlainText(googleClientSecret!),
        scopes: ['openid', 'email', 'profile'],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
          familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
        },
      });
      hostedDomain = userPool.addDomain('HostedDomain', {
        cognitoDomain: { domainPrefix: `ai-document-analyzer-${this.account}` },
      });
    }

    const userPoolClient = userPool.addClient('WebClient', {
      generateSecret: false,
      authFlows: { userSrp: true, userPassword: true },
      enableTokenRevocation: true,
      refreshTokenValidity: cdk.Duration.days(30),
      supportedIdentityProviders: googleEnabled
        ? [cognito.UserPoolClientIdentityProvider.COGNITO, cognito.UserPoolClientIdentityProvider.GOOGLE]
        : [cognito.UserPoolClientIdentityProvider.COGNITO],
      oAuth: googleEnabled
        ? {
            flows: { authorizationCodeGrant: true },
            scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
            callbackUrls: ['http://localhost:3000/'],
            logoutUrls: ['http://localhost:3000/'],
          }
        : undefined,
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
    if (hostedDomain) {
      new cdk.CfnOutput(this, 'CognitoDomain', { value: hostedDomain.domainName });
    }
  }
}
