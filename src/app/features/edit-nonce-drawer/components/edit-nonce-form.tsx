import { Suspense, useEffect, useState } from 'react';
import { Formik, useFormikContext } from 'formik';
import * as yup from 'yup';
import { Button, Stack } from '@stacks/ui';

import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { nonceSchema } from '@app/common/validation/nonce-schema';
import { useCustomNonce } from '@app/store/transactions/nonce.hooks';
import { useUnsignedTransaction } from '@app/store/transactions/transaction.hooks';
import { TransactionFormValues } from '@app/common/transactions/transaction-utils';

import { EditNonceFormInner } from './edit-nonce-form-inner';
import { EditNonceField } from './edit-nonce-field';

// Not sure what this is doing?
const SuspenseOnMount = ({ onMountCallback, isEnabled }: any) => {
  const { values } = useFormikContext<TransactionFormValues>();
  const tx = useUnsignedTransaction(values);

  useEffect(() => {
    if (tx && isEnabled) {
      onMountCallback();
    }
  }, [onMountCallback, isEnabled, tx]);

  return null;
};

interface FormProps {
  onClose: () => void;
}
export function EditNonceForm(props: FormProps): JSX.Element {
  const { onClose } = props;
  const [, setCustomNonce] = useCustomNonce();
  const [isEnabled, setIsEnabled] = useState(false);
  const { setIsLoading } = useLoading(LoadingKeys.EDIT_NONCE_DRAWER);

  return (
    <Formik
      initialValues={{ nonce: 0 }}
      onSubmit={values => {
        setCustomNonce(values.nonce);
        setIsLoading();
        setTimeout(() => setIsEnabled(true), 10);
      }}
      validateOnChange={false}
      validateOnBlur={false}
      validateOnMount={false}
      validationSchema={yup.object({
        nonce: nonceSchema,
      })}
    >
      {() => (
        <>
          {isEnabled && (
            <Suspense fallback={<></>}>
              <SuspenseOnMount isEnabled={isEnabled} onMountCallback={onClose} />
            </Suspense>
          )}
          <Suspense
            fallback={
              <>
                <Stack>
                  <EditNonceField />
                </Stack>
                <Stack isInline>
                  <Button flexGrow={1} borderRadius="10px" mode="tertiary">
                    Cancel
                  </Button>
                  <Button type="submit" flexGrow={1} isLoading borderRadius="10px">
                    Apply
                  </Button>
                </Stack>
              </>
            }
          >
            <EditNonceFormInner />
          </Suspense>
        </>
      )}
    </Formik>
  );
}
