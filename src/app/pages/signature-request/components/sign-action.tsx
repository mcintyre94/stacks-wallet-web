import { finalizeMessageSignature } from '@app/common/actions/finalize-message-signature';
import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { requestTokenState } from '@app/common/signature/requests';
import { delay } from '@app/common/utils';
import { useCurrentAccount } from '@app/store/accounts/account.hooks';
import { signMessage } from '@shared/crypto/sign-message';
import { logger } from '@shared/logger';
import { createStacksPrivateKey } from '@stacks/transactions';
import { Button, Stack } from '@stacks/ui';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function useSignMessageSoftwareWallet() {
  const account = useCurrentAccount();
  return useCallback(
    (message: string) => {
      if (!account) return null;
      const privateKey = createStacksPrivateKey(account.stxPrivateKey);
      return signMessage(message, privateKey);
    },
    [account]
  );
}

function useTabIdSearchParams() {
  const [searchParams] = useSearchParams();

  return useMemo(
    () => ({
      tabId: searchParams.get('tabId'),
    }),
    [searchParams]
  );
}

interface SignActionProps {
  message: string;
}
export function SignAction(props: SignActionProps): JSX.Element {
  const { message } = props;
  const signSoftwareWalletMessage = useSignMessageSoftwareWallet();
  const { tabId } = useTabIdSearchParams();
  const requestToken = requestTokenState();
  const [isLoading, setIsLoading] = useState(false);
  const analytics = useAnalytics();

  if (!requestToken || !tabId) return <div>Error</div>; // TODO improve this
  const tabIdInt = parseInt(tabId);

  const sign = async () => {
    setIsLoading(true);
    void analytics.track('request_signature_sign');
    const messageSignature = signSoftwareWalletMessage(message);
    if (!messageSignature) {
      logger.error('Cannot sign message, no account in state');
      void analytics.track('request_signature_cannot_sign_message_no_account');
      return;
    }
    // Since the signature is really fast, we add a delay to improve the UX
    setIsLoading(false);
    finalizeMessageSignature(requestToken, tabIdInt, messageSignature);
    await delay(1000);
  };

  const cancel = () => {
    void analytics.track('request_signature_cancel');
    finalizeMessageSignature(requestToken, tabIdInt, 'cancel');
  };

  return (
    <Stack isInline>
      <Button onClick={cancel} flexGrow={1} borderRadius="10px" mode="tertiary">
        Cancel
      </Button>
      <Button type="submit" flexGrow={1} borderRadius="10px" onClick={sign} isLoading={isLoading}>
        Sign
      </Button>
    </Stack>
  );
}
