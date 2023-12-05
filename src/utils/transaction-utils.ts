import store from '@/store';

export async function handlePendingTx(pendingTx, title, confirmation = 2) {
  await store.dispatch('transactions/handleTransaction', {
    transaction: pendingTx,
    titleKey: title,
    titleParams: {},
    confirmation
  });
}

export async function handleErrorTx(error) {
  return await store.dispatch('transactions/handleTransactionError', error);
}
