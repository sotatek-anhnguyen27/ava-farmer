import { BigNumber } from 'bignumber.js';

const ESTIMATE_GAS_DEFAULT = 350000;

export async function estimateGas(
  contract,
  action: string,
  params: any[]
) {
  let gasLimitNumber = ESTIMATE_GAS_DEFAULT;
  try {
    const rawValue = await contract.estimateGas[action](...params);
    gasLimitNumber = rawValue.toNumber();
  } catch (e) {
    console.error('estimateGas ERROR:', e.message);
  }

  return new BigNumber(gasLimitNumber).times(1.4).integerValue().toFixed(BigNumber.ROUND_UP);
}
