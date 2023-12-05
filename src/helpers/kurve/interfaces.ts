import { SwapParameters, Token } from '@/../libs/buni-stable-coins-sdk/src';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';

export interface SwapCall {
  contract: Contract;
  parameters: SwapParameters;
}

export interface SuccessfulCall {
  call: SwapCall;
  gasEstimate: BigNumber;
}

export interface FailedCall {
  call: SwapCall;
  error: Error;
}

export interface BasicData {
  token0?: {
    id: string;
    name: string;
    symbol: string;
  };
  token1?: {
    id: string;
    name: string;
    symbol: string;
  };
}

export interface PairDayData {
  id?: string;
  date: number;
  dayString?: number;
  reserveUSD: string | number;
  dailyVolumeToken0?: string | number;
  dailyVolumeToken1?: string | number;
  dailyVolumeUSD: string | number;
}

export interface PairSwapData {
  address: string;
  token0: Token;
  reserve0: string;
  vReserve0: string;
  token1: Token;
  reserve1: string;
  vReserve1: string;
  amp: string;
  fee: string;
}

export interface BulkPoolPayload {
  provider: Web3Provider;
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  ethPrice: number;
  fetchAll: boolean;
}

export interface BulkPairPayload {
  pair: string;
  ethPrice: number;
}

export interface PoolDetailPayload {
  provider: Web3Provider;
  address: string;
  tokenA: string;
  tokenB: string;
  assets: any[];
}

export interface UserLiquidityPositionPayload {
  account: string;
  poolId?: string;
}

export interface PoolSwapTxnPayload {
  pairAddress: string;
  page: number;
}

export interface PairChartPayload {
  pairAddress: string;
}

export interface PairAddressPayload {
  address: string;
}

export interface TokenAddressesPayload {
  tokens: string[];
}

export type EstimatedSwapCall = SuccessfulCall | FailedCall;
