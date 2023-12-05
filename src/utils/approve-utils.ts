import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from 'bignumber.js';
import { Web3Provider } from '@ethersproject/providers';

export async function handleApproveToken(
  provider: Web3Provider,
  contract,
  tokenContract,
  from,
  feeIn
) {
  const allowance = await tokenContract.allowance(from, contract.address || contract);
  if (new BigNumber(feeIn || 0).lte(allowance.toString())) {
    return null;
  }

  let approveRes:any = null;
  try {
    approveRes = await tokenContract.approve(
      contract.address || contract,
      MaxUint256.toString()
    );
  } catch (e) {
    console.error('handleApprove error:', e);
    console.error(
      'handleApprove error code:',
      e.code,
      feeIn.toString(),
      tokenContract.address,
      MaxUint256.toString()
    );
    if (e.code && e.code === 4001) {
      throw e;
    }
    approveRes = await tokenContract.approve(contract.address || contract, feeIn.toString());
  }
  if (approveRes && approveRes.hash) {
    await provider.waitForTransaction(approveRes.hash, 2);
  }
}
