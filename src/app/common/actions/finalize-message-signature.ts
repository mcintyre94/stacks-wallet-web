import { ExternalMethods, MESSAGE_SOURCE, SignatureResponseMessage } from '@shared/message-types';
import { deleteTabForRequest, StorageKey } from '@shared/utils/storage';
import { logger } from '@shared/logger';
import { SignatureData } from '@shared/crypto/sign-message';

export const finalizeMessageSignature = (
  requestPayload: string,
  tabId: number,
  data: SignatureData | string
) => {
  try {
    const responseMessage: SignatureResponseMessage = {
      source: MESSAGE_SOURCE,
      method: ExternalMethods.signatureResponse,
      payload: {
        signatureRequest: requestPayload,
        signatureResponse: data,
      },
    };
    chrome.tabs.sendMessage(tabId, responseMessage);
    deleteTabForRequest(StorageKey.signatureRequests, requestPayload);
    // If this is a string, then the transaction has been canceled
    // and the user has closed the window
    window.close();
  } catch (error) {
    logger.debug('Failed to get Tab ID for message signature request:', requestPayload);
    throw new Error(
      'Your message was signed, but we lost communication with the app you started with.'
    );
  }
};
