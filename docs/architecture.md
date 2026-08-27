# Architecture Notes

The application is split into independent frontend, backend, infrastructure, and shared-type packages.

## Phase 3 AWS Foundation

- `StorageStack` owns the private encrypted S3 document bucket and on-demand encrypted DynamoDB metadata table.
- `MessagingStack` owns the encrypted document-processing queue and its dead-letter queue.
- `ComputeStack` owns the API Lambda and SQS-triggered processing Lambda, with only the current S3, DynamoDB, and SQS permissions.
- `ApiStack` owns the regional API Gateway and `GET /api/health` route.

The S3 event notification to SQS is intentionally deferred until the document upload phase, when the upload and message contracts are implemented. S3 will not invoke the processing Lambda directly.

The processing Lambda currently logs document metadata and acknowledges messages. Textract, Bedrock, Cognito, and document APIs will be added in later phases.
