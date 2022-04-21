import { StacksProvider } from '@stacks/connect';
import {
  AuthenticationRequestEventDetails,
  DomEventName,
  TransactionRequestEventDetails,
} from '@shared/inpage-types';
import {
  AuthenticationResponseMessage,
  ExternalMethods,
  LegacyMessageToContentScript,
  MESSAGE_SOURCE,
  RpcMethodNames,
  RpcRequestArgs,
  RpcResponseArgs,
  TransactionResponseMessage,
} from '@shared/message-types';
import { logger } from '@shared/logger';

declare global {
  interface Crypto {
    randomUUID: () => string;
  }
}

type CallableMethods = keyof typeof ExternalMethods;

interface ExtensionResponse {
  source: 'blockstack-extension';
  method: CallableMethods;
  [key: string]: any;
}

const callAndReceive = async (
  methodName: CallableMethods | 'getURL',
  opts: any = {}
): Promise<ExtensionResponse> => {
  return new Promise((resolve, reject) => {
    logger.info(`BlockstackApp.${methodName}:`, opts);
    const timeout = setTimeout(() => {
      reject('Unable to get response from Blockstack extension');
    }, 1000);
    const waitForResponse = (event: MessageEvent) => {
      if (
        event.data.source === 'blockstack-extension' &&
        event.data.method === `${methodName}Response`
      ) {
        clearTimeout(timeout);
        window.removeEventListener('message', waitForResponse);
        resolve(event.data);
      }
    };
    window.addEventListener('message', waitForResponse);
    window.postMessage(
      {
        method: methodName,
        source: 'blockstack-app',
        ...opts,
      },
      window.location.origin
    );
  });
};

const isValidEvent = (event: MessageEvent, method: LegacyMessageToContentScript['method']) => {
  const { data } = event;
  const correctSource = data.source === MESSAGE_SOURCE;
  const correctMethod = data.method === method;
  return correctSource && correctMethod && !!data.payload;
};

const provider: StacksProvider = {
  async getURL() {
    const { url } = await callAndReceive('getURL');
    return url;
  },
  authenticationRequest: async authenticationRequest => {
    const event = new CustomEvent<AuthenticationRequestEventDetails>(
      DomEventName.authenticationRequest,
      {
        detail: { authenticationRequest },
      }
    );
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent<AuthenticationResponseMessage>) => {
        if (!isValidEvent(event, ExternalMethods.authenticationResponse)) return;
        if (event.data.payload?.authenticationRequest !== authenticationRequest) return;
        window.removeEventListener('message', handleMessage);
        if (event.data.payload.authenticationResponse === 'cancel') {
          reject(event.data.payload.authenticationResponse);
          return;
        }
        resolve(event.data.payload.authenticationResponse);
      };
      window.addEventListener('message', handleMessage);
    });
  },
  transactionRequest: async transactionRequest => {
    const event = new CustomEvent<TransactionRequestEventDetails>(DomEventName.transactionRequest, {
      detail: { transactionRequest },
    });
    document.dispatchEvent(event);
    return new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent<TransactionResponseMessage>) => {
        if (!isValidEvent(event, ExternalMethods.transactionResponse)) return;
        if (event.data.payload?.transactionRequest !== transactionRequest) return;
        window.removeEventListener('message', handleMessage);
        if (event.data.payload.transactionResponse === 'cancel') {
          reject(event.data.payload.transactionResponse);
          return;
        }
        if (typeof event.data.payload.transactionResponse !== 'string') {
          resolve(event.data.payload.transactionResponse);
        }
      };
      window.addEventListener('message', handleMessage);
    });
  },

  async request(method: RpcMethodNames, params?: any[]): Promise<RpcResponseArgs> {
    return new Promise((resolve, _reject) => {
      const id = crypto.randomUUID();
      const event = new CustomEvent<RpcRequestArgs>(DomEventName.rpcRequest, {
        detail: { jsonrpc: '2.0', id, method, params },
      });
      document.dispatchEvent(event);
      const handleMessage = (event: MessageEvent<any>) => {
        if (event.data.id !== id) return;
        window.removeEventListener('message', handleMessage);
        resolve(event.data);
      };
      window.addEventListener('message', handleMessage);
    });
  },

  getProductInfo() {
    return {
      version: VERSION,
      name: 'Hiro Wallet for Web',
      meta: {
        tag: BRANCH,
        commit: COMMIT_SHA,
      },
    };
  },
} as StacksProvider & { request(): Promise<RpcResponseArgs> };

window.StacksProvider = provider;
