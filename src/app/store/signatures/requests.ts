// import { logger } from '@shared/logger';
// import { getRequestOrigin, StorageKey } from '@shared/utils/storage';
// import { getPayloadFromToken } from '@app/store/signatures/utils';

// export const requestTokenState = () => {
//   const searchParams = new URLSearchParams(window.location.hash.slice(2));
//   const result = searchParams.get('signature?request');
//   return result;
// };

// export const requestTokenPayloadState = () => {
//   const token = requestTokenState();
//   if (!token) return null;
//   return getPayloadFromToken(token);
// };

// export const requestTokenOriginState = () => {
//   const token = requestTokenState();
//   if (!token) return;
//   try {
//     return getRequestOrigin(StorageKey.signatureRequests, token);
//   } catch (e) {
//     logger.error(e);
//     return false;
//   }
// };
