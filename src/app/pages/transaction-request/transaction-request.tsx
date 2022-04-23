import { memo, useCallback, useEffect } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Stack } from '@stacks/ui';

import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { useFeeSchema } from '@app/common/validation/use-fee-schema';
import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { useNextTxNonce } from '@app/common/hooks/account/use-next-tx-nonce';
import { HighFeeDrawer } from '@app/features/high-fee-drawer/high-fee-drawer';
import { PopupHeader } from '@app/pages/transaction-request/components/popup-header';
import { PageTop } from '@app/pages/transaction-request/components/page-top';
import { ContractCallDetails } from '@app/pages/transaction-request/components/contract-call-details/contract-call-details';
import { ContractDeployDetails } from '@app/pages/transaction-request/components/contract-deploy-details/contract-deploy-details';
import { PostConditions } from '@app/pages/transaction-request/components/post-conditions/post-conditions';
import { StxTransferDetails } from '@app/pages/transaction-request/components/stx-transfer-details/stx-transfer-details';
import { PostConditionModeWarning } from '@app/pages/transaction-request/components/post-condition-mode-warning';
import { TransactionError } from '@app/pages/transaction-request/components/transaction-error/transaction-error';
import {
  useTransactionRequestState,
  useUpdateTransactionBroadcastError,
} from '@app/store/transactions/requests.hooks';
import { useTransactionBroadcast } from '@app/store/transactions/transaction.hooks';
import { useFeeEstimationsState } from '@app/store/transactions/fees.hooks';

import { FeeForm } from './components/fee-form';
import { SubmitAction } from './components/submit-action';
import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { Estimations } from '@shared/models/fees-types';

function TransactionRequestBase(): JSX.Element | null {
  useNextTxNonce();
  const transactionRequest = useTransactionRequestState();
  const { setIsLoading, setIsIdle } = useLoading(LoadingKeys.SUBMIT_TRANSACTION);
  const handleBroadcastTransaction = useTransactionBroadcast();
  const setBroadcastError = useUpdateTransactionBroadcastError();
  const [, setFeeEstimations] = useFeeEstimationsState();
  const feeSchema = useFeeSchema();
  const analytics = useAnalytics();

  useRouteHeader(<PopupHeader />);

  useEffect(() => void analytics.track('view_transaction_signing'), [analytics]);

  const onSubmit = useCallback(
    async values => {
      setIsLoading();
      await handleBroadcastTransaction(values);
      setIsIdle();
      setFeeEstimations([]);
      void analytics.track('submit_fee_for_transaction', {
        type: values.feeType,
        fee: values.fee,
      });
      return () => {
        setBroadcastError(null);
      };
    },
    [
      analytics,
      handleBroadcastTransaction,
      setBroadcastError,
      setFeeEstimations,
      setIsIdle,
      setIsLoading,
    ]
  );

  if (!transactionRequest) return null;

  const validationSchema = !transactionRequest.sponsored ? yup.object({ fee: feeSchema() }) : null;

  return (
    <Stack px={['loose', 'unset']} spacing="loose">
      <PageTop />
      <PostConditionModeWarning />
      <TransactionError />
      <PostConditions />
      {transactionRequest.txType === 'contract_call' && <ContractCallDetails />}
      {transactionRequest.txType === 'token_transfer' && <StxTransferDetails />}
      {transactionRequest.txType === 'smart_contract' && <ContractDeployDetails />}
      <Formik
        initialValues={{ fee: '', feeType: Estimations[Estimations.Middle] }}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        validateOnMount={false}
        validationSchema={validationSchema}
      >
        {() => (
          <>
            <FeeForm />
            <SubmitAction />
            <HighFeeDrawer />
          </>
        )}
      </Formik>
    </Stack>
  );
}

export const TransactionRequest = memo(TransactionRequestBase);
