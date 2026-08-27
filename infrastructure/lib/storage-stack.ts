import * as cdk from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb, aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
  public readonly documentBucket: s3.Bucket;
  public readonly documentTable: dynamodb.Table;

  public constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.documentBucket = new s3.Bucket(this, 'DocumentBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [{ abortIncompleteMultipartUploadAfter: cdk.Duration.days(1) }],
    });

    this.documentTable = new dynamodb.Table(this, 'DocumentTable', {
      partitionKey: { name: 'documentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, 'DocumentBucketName', {
      value: this.documentBucket.bucketName,
      description: 'Private S3 bucket for uploaded documents',
    });
    new cdk.CfnOutput(this, 'DocumentTableName', {
      value: this.documentTable.tableName,
      description: 'DynamoDB table for document metadata and analysis results',
    });
  }
}
