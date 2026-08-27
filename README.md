# AI Document Analyzer

A portfolio-quality full-stack application for uploading documents, extracting text with Amazon Textract, and generating structured analysis with Amazon Bedrock.

## Phase 3 Status

The repository foundation, frontend shell, and initial AWS infrastructure are ready. AWS resources are defined with CDK and can be synthesized or deployed from the command line. Textract, Bedrock, Cognito, and document upload APIs are intentionally reserved for later phases.

## Architecture

```mermaid
flowchart TD
    User --> NextJS[Next.js Frontend]
    NextJS --> API[Amazon API Gateway]
    API --> Lambda[AWS Lambda]
    Lambda --> S3[Amazon S3]
    S3 -. "event wiring in upload phase" .-> SQS[Amazon SQS]
    SQS --> Processor[Processing Lambda]
    Processor --> Textract[Amazon Textract]
    Processor --> Bedrock[Amazon Bedrock]
    Processor --> DynamoDB[Amazon DynamoDB]
    DynamoDB --> API
    API --> NextJS
```

## Repository Layout

- `frontend/`: Next.js App Router application and user interface.
- `backend/`: TypeScript Lambda handlers, services, repositories, and tests.
- `infrastructure/`: AWS CDK application and infrastructure stacks.
- `shared/`: Types shared across application packages.
- `docs/`: Architecture and project documentation.

## Local Development

Prerequisites: Node.js 22.13+ and npm 10+.

```bash
npm install
npm run dev:frontend
```

Open http://localhost:3000 to view the frontend.

## CDK

Configure AWS credentials using your normal AWS CLI profile or environment. Verify the active identity:

```bash
aws sts get-caller-identity
```

If the account and region have not been prepared for CDK, bootstrap once:

```bash
npx cdk bootstrap
```

Build and inspect the infrastructure without deploying:

```bash
npm run typecheck
npm run cdk -- synth
npm run cdk -- diff
```

When ready, deploy all four stacks:

```bash
npm run cdk -- deploy --all
```

The stack creates a private encrypted S3 bucket, encrypted on-demand DynamoDB table, encrypted SQS processing queue and DLQ, two Lambda functions, and a regional API Gateway with `GET /api/health`. The S3-to-SQS event notification is deliberately deferred until the document upload phase, when its producer and message contract are implemented.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

Infrastructure tests use CDK assertions and do not require an AWS deployment.

## Environment Variables

Copy `.env.example` to `.env.local` for local frontend configuration and provide deployment values through your environment or a managed secret store. Never commit credentials or local environment files.

## Security Direction

Cognito will own user credentials. Protected API routes will verify Cognito JWT claims, S3 will remain private, and document access will be scoped by authenticated user identity.

## Next: Phase 4

Implement Cognito authentication: user pool configuration, sign-up/sign-in flows, JWT verification at API Gateway/Lambda boundaries, protected frontend routes, and the authenticated user identity contract needed by document uploads.

## Future Improvements

DOCX support, batch processing, document comparison, AI question answering, cross-document search, vector embeddings, Amazon OpenSearch, notifications, CloudFront, and GitHub Actions CI/CD with AWS OIDC.
