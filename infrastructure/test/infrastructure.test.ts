import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ApiStack } from '../lib/api-stack';
import { ComputeStack } from '../lib/compute-stack';
import { MessagingStack } from '../lib/messaging-stack';
import { StorageStack } from '../lib/storage-stack';

describe('AI Document Analyzer infrastructure', () => {
  const app = new cdk.App();
  const storage = new StorageStack(app, 'TestStorage');
  const messaging = new MessagingStack(app, 'TestMessaging');
  const compute = new ComputeStack(app, 'TestCompute', storage, messaging);
  const api = new ApiStack(app, 'TestApi', compute.apiFunction);

  it('creates a private encrypted document bucket', () => {
    Template.fromStack(storage).hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
        ],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  it('creates an on-demand document table', () => {
    Template.fromStack(storage).hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [{ AttributeName: 'documentId', KeyType: 'HASH' }],
    });
  });

  it('creates the processing queue and dead-letter queue', () => {
    const template = Template.fromStack(messaging);
    template.resourceCountIs('AWS::SQS::Queue', 2);
    template.hasResourceProperties('AWS::SQS::Queue', {
      RedrivePolicy: { maxReceiveCount: 3 },
      VisibilityTimeout: 300,
    });
  });

  it('creates both Lambda functions', () => {
    Template.fromStack(compute).resourceCountIs('AWS::Lambda::Function', 2);
  });

  it('creates the health route on API Gateway', () => {
    const template = Template.fromStack(api);
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.hasResourceProperties('AWS::ApiGateway::Resource', { PathPart: 'health' });
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
      AuthorizationType: 'COGNITO_USER_POOLS',
    });
  });

  it('creates a public Cognito web client', () => {
    const template = Template.fromStack(api);
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
      GenerateSecret: false,
      EnableTokenRevocation: true,
    });
  });
});
