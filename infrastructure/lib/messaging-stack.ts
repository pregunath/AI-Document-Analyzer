import * as cdk from 'aws-cdk-lib';
import { aws_sqs as sqs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MessagingStack extends cdk.Stack {
  public readonly processingQueue: sqs.Queue;
  public readonly processingDlq: sqs.Queue;

  public constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.processingDlq = new sqs.Queue(this, 'DocumentProcessingDLQ', {
      queueName: 'DocumentProcessingDLQ',
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      retentionPeriod: cdk.Duration.days(14),
    });

    this.processingQueue = new sqs.Queue(this, 'DocumentProcessingQueue', {
      queueName: 'DocumentProcessingQueue',
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      visibilityTimeout: cdk.Duration.minutes(5),
      retentionPeriod: cdk.Duration.days(4),
      deadLetterQueue: {
        queue: this.processingDlq,
        maxReceiveCount: 3,
      },
    });

    new cdk.CfnOutput(this, 'ProcessingQueueUrl', {
      value: this.processingQueue.queueUrl,
      description: 'SQS queue for asynchronous document processing',
    });
    new cdk.CfnOutput(this, 'ProcessingDLQUrl', {
      value: this.processingDlq.queueUrl,
      description: 'Dead-letter queue for failed document processing messages',
    });
  }
}
