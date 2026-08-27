export type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface DocumentRecord {
  documentId: string;
  userId: string;
  fileName: string;
  s3Key: string;
  fileType: string;
  fileSize: number;
  status: DocumentStatus;
  uploadedAt: string;
}
