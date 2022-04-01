import { decodeToken } from 'jsontokens';
import type { SignaturePayload } from '@stacks/connect';

export function getPayloadFromToken(requestToken: string) {
  const token = decodeToken(requestToken);
  return token.payload as unknown as SignaturePayload;
}
