import type { APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (): Promise<APIGatewayProxyResult> => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'ok',
    service: 'ai-document-analyzer',
  }),
});
