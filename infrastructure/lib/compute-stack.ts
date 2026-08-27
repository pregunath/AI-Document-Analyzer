import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda, aws_lambda_event_sources as eventSources, aws_lambda_nodejs as nodejs } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StorageStack } from './storage-stack';
import { MessagingStack } from './messaging-stack';

export class ComputeStack extends cdk.Stack {
  public readonly apiFunction: nodejs.NodejsFunction;
  public readonly processingFunction: nodejs.NodejsFunction;

  public constructor(
    scope: Construct,
    id: string,
    storage: StorageStack,
    messaging: MessagingStack,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    const backendPath = path.resolve(__dirname, '../../backend/src/handlers');

    this.apiFunction = new nodejs.NodejsFunction(this, 'ApiFunction', {
      entry: path.join(backendPath, 'api.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      description: 'Initial API Gateway handler for AI Document Analyzer',
    });

    this.processingFunction = new nodejs.NodejsFunction(this, 'ProcessingFunction', {
      entry: path.join(backendPath, 'processing.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 512,
      timeout: cdk.Duration.minutes(5),
      description: 'Asynchronous document processing handler',
      environment: {
        DOCUMENTS_BUCKET_NAME: storage.documentBucket.bucketName,
        DOCUMENTS_TABLE_NAME: storage.documentTable.tableName,
      },
    });

    storage.documentBucket.grantRead(this.processingFunction);
    storage.documentTable.grantReadWriteData(this.processingFunction);
    messaging.processingQueue.grantConsumeMessages(this.processingFunction);
    this.processingFunction.addEventSource(
      new eventSources.SqsEventSource(messaging.processingQueue, {
        batchSize: 1,
        reportBatchItemFailures: true,
      }),
    );
  }
}
