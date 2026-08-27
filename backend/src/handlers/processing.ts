import type { SQSHandler } from 'aws-lambda';

type ProcessingMessage = {
  documentId?: string;
  s3Key?: string;
};

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body) as ProcessingMessage;
    console.info('Document processing started', {
      documentId: message.documentId,
      s3Key: message.s3Key,
    });
    console.info('Document processing completed', {
      documentId: message.documentId,
      s3Key: message.s3Key,
    });
  }
};
