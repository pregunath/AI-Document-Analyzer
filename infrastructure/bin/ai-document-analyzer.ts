#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { ComputeStack } from '../lib/compute-stack';
import { MessagingStack } from '../lib/messaging-stack';
import { StorageStack } from '../lib/storage-stack';

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? process.env.AWS_REGION,
};

const storage = new StorageStack(app, 'AiDocumentAnalyzerStorageStack', { env });
const messaging = new MessagingStack(app, 'AiDocumentAnalyzerMessagingStack', { env });
const compute = new ComputeStack(app, 'AiDocumentAnalyzerComputeStack', storage, messaging, {
  env,
});
const api = new ApiStack(app, 'AiDocumentAnalyzerApiStack', compute.apiFunction, { env });

compute.addStackDependency(storage);
compute.addStackDependency(messaging);
api.addStackDependency(compute);
