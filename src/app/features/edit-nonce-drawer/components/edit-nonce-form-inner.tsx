import { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Button, Stack } from '@stacks/ui';

import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { useDrawers } from '@app/common/hooks/use-drawers';
import { useUnsignedTransaction } from '@app/store/transactions/transaction.hooks';

import { EditNonceField } from './edit-nonce-field';
import { TransactionFormValues } from '@app/common/transactions/transaction-utils';

export function EditNonceFormInner(): JSX.Element {
  const { setFieldValue, handleSubmit, values } = useFormikContext<TransactionFormValues>();
  const { isLoading } = useLoading(LoadingKeys.EDIT_NONCE_DRAWER);
  const transaction = useUnsignedTransaction(values);
  const nonce = Number(transaction?.auth.spendingCondition?.nonce);
  const { setShowEditNonce } = useDrawers();

  useEffect(() => {
    setFieldValue('nonce', nonce);
  }, [setFieldValue, nonce]);

  return (
    <>
      <Stack>
        <EditNonceField />
      </Stack>
      <Stack isInline>
        <Button
          onClick={() => setShowEditNonce(false)}
          flexGrow={1}
          borderRadius="10px"
          mode="tertiary"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          flexGrow={1}
          onClick={handleSubmit}
          isLoading={isLoading}
          borderRadius="10px"
        >
          Apply
        </Button>
      </Stack>
    </>
  );
}
