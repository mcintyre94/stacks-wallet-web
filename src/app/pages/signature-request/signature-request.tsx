import { memo } from 'react';
import { Box, color, Stack } from '@stacks/ui';

import { useRouteHeader } from '@app/common/hooks/use-route-header';

import { useIsSignatureRequestValid } from '@app/store/signatures/requests.hooks';
import { PageTop } from './components/page-top';
import { MessageBox } from './components/message-box';
import { NetworkRow } from './components/network-row';
import { SignAction } from './components/sign-action';
import { StacksMainnet, StacksNetwork } from '@stacks/network';
import { FiAlertTriangle } from 'react-icons/fi';
import { Caption } from '@app/components/typography';
import { PopupHeader } from '@app/features/current-account/popup-header';
import { requestTokenPayloadState } from '@app/common/signature/requests';

function SignatureRequestBase(): JSX.Element | null {
  const signatureRequest = requestTokenPayloadState();
  const validSignatureRequest = useIsSignatureRequestValid();

  useRouteHeader(<PopupHeader />);

  if (!signatureRequest) return null;
  const { message, network } = signatureRequest;

  return (
    <Stack px={['loose', 'unset']} spacing="loose" width="100%">
      <PageTop />
      {!validSignatureRequest ? (
        <ErrorMessage errorMessage={'Invalid signature request'} />
      ) : (
        <SignatureRequestContent message={message} network={network || new StacksMainnet()} />
      )}
    </Stack>
  );
}

interface SignatureRequestContentProps {
  network: StacksNetwork;
  message: string;
}

function SignatureRequestContent(props: SignatureRequestContentProps) {
  const { message, network } = props;
  return (
    <>
      <MessageBox message={message} />
      <NetworkRow network={network} />
      <SignAction message={message} />
    </>
  );
}

export const SignatureRequest = memo(SignatureRequestBase);

interface ErrorMessageProps {
  errorMessage: string;
}

function ErrorMessage(props: ErrorMessageProps): JSX.Element | null {
  const { errorMessage } = props;
  if (!errorMessage) return null;

  return (
    <Stack alignItems="center" bg="#FCEEED" p="base" borderRadius="12px" isInline>
      <Box color={color('feedback-error')} strokeWidth={2} as={FiAlertTriangle} />
      <Caption color={color('feedback-error')}>{errorMessage}</Caption>
    </Stack>
  );
}
