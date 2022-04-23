import { useFormikContext } from 'formik';
import { Stack } from '@stacks/ui';

import { useDrawers } from '@app/common/hooks/use-drawers';
import { BaseDrawer, BaseDrawerProps } from '@app/components/drawer';

import { SpaceBetween } from '@app/components/space-between';
import { Caption } from '@app/components/typography';
import { TransactionFee } from '@app/components/fee-row/components/transaction-fee';
import { useSendFormUnsignedTxState } from '@app/store/transactions/transaction.hooks';

import { SendTokensConfirmActions } from './send-tokens-confirm-actions';
import { useEffect } from 'react';
import { SendTokensConfirmDetails } from './send-tokens-confirm-details';
import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { TransactionFormValues } from '@app/common/transactions/transaction-utils';
import { StacksTransaction } from '@stacks/transactions';

interface SendTokensConfirmDrawerProps extends BaseDrawerProps {
  onUserSelectBroadcastTransaction(tx: StacksTransaction | undefined): void;
}
export function SendTokensConfirmDrawer(props: SendTokensConfirmDrawerProps) {
  const { isShowing, onClose, onUserSelectBroadcastTransaction } = props;
  const { values } = useFormikContext<TransactionFormValues>();
  const transaction = useSendFormUnsignedTxState(values);
  const analytics = useAnalytics();
  const { showEditNonce } = useDrawers();

  useEffect(() => {
    if (!isShowing) return;
    void analytics.track('view_transaction_signing');
  }, [isShowing, analytics]);

  if (!isShowing || !transaction || !values) return null;

  return (
    <BaseDrawer
      title="Confirm transfer"
      isShowing={isShowing}
      onClose={onClose}
      pauseOnClickOutside={showEditNonce}
    >
      <Stack pb="extra-loose" px="loose" spacing="loose">
        <SendTokensConfirmDetails
          amount={values.amount}
          recipient={values.recipient}
          nonce={Number(transaction?.auth.spendingCondition?.nonce)}
        />
        <SpaceBetween>
          <Caption>Fees</Caption>
          <Caption>
            <TransactionFee fee={values.fee} />
          </Caption>
        </SpaceBetween>
        <SendTokensConfirmActions
          transaction={transaction}
          onUserConfirmBroadcast={() => onUserSelectBroadcastTransaction(transaction)}
        />
      </Stack>
    </BaseDrawer>
  );
}
