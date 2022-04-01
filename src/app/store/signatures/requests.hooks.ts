// import { useAtomValue } from 'jotai/utils';
import {
  requestTokenOriginState,
  requestTokenState,
  verifySignatureRequest,
} from '@app/common/signature/requests';
import { useAsync } from 'react-async-hook';
import { useAccounts } from '../accounts/account.hooks';

export function useIsSignatureRequestValid() {
  const accounts = useAccounts();
  const requestToken = requestTokenState();
  const origin = requestTokenOriginState();

  return useAsync(async () => {
    if (typeof accounts === 'undefined') return;
    if (!origin || !accounts || !requestToken) return;
    try {
      const valid = await verifySignatureRequest({
        requestToken,
        accounts,
        appDomain: origin,
      });
      return !!valid;
    } catch (e) {
      return false;
    }
  }, [accounts, requestToken, origin]).result;
}
