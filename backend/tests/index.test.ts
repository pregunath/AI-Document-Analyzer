import { serviceName } from '../src';

describe('backend foundation', () => {
  it('exposes the service name', () => {
    expect(serviceName).toBe('ai-document-analyzer-backend');
  });
});
