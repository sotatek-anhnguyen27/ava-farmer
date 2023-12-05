import config from '@/config';
import { get2DayPercentChange, getPercentChange } from '@/utils';

export interface SubgraphPoolData {
  id: string;
  reserveUSD: string;
  volumeUSD: string;
  feeUSD: string;
  oneDayVolumeUSD: string;
  oneDayVolumeUntracked: string;
  oneDayFeeUSD: string;
  oneDayFeeUntracked: string;
}

export function parseData(
  data: any,
  oneDayData: any,
  twoDayData: any,
  oneWeekData: any,
  ethPrice: any,
  oneDayBlock: any
): SubgraphPoolData {
  // get volume changes
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0
  );

  const [oneDayFeeUSD, feeChangeUSD] = get2DayPercentChange(
    data?.feeUSD,
    oneDayData?.feeUSD ? oneDayData.feeUSD : 0,
    twoDayData?.feeUSD ? twoDayData.feeUSD : 0
  );
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD
      ? parseFloat(oneDayData?.untrackedVolumeUSD)
      : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0
  );
  const [oneDayFeeUntracked, feeChangeUntracked] = get2DayPercentChange(
    data?.untrackedFeeUSD,
    oneDayData?.untrackedFeeUSD ? parseFloat(oneDayData?.untrackedFeeUSD) : 0,
    twoDayData?.untrackedFeeUSD ? twoDayData?.untrackedFeeUSD : 0
  );
  const oneWeekVolumeUSD = parseFloat(
    oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD
  );

  // set volume properties
  data.oneDayVolumeUSD = oneDayVolumeUSD;
  data.oneWeekVolumeUSD = oneWeekVolumeUSD;
  data.oneDayFeeUSD = oneDayFeeUSD;
  data.oneDayFeeUntracked = oneDayFeeUntracked;
  data.volumeChangeUSD = volumeChangeUSD;
  data.oneDayVolumeUntracked = oneDayVolumeUntracked;
  data.volumeChangeUntracked = volumeChangeUntracked;

  // set liquiditry properties
  data.trackedReserveUSD = data.trackedReserveETH * ethPrice;
  data.liquidityChangeUSD = getPercentChange(
    data.reserveUSD,
    oneDayData?.reserveUSD
  );

  // format if pool hasnt existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (!oneWeekData && data) {
    data.oneWeekVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (data?.token0?.id === config.addresses.weth.toLowerCase()) {
    data.token0.name =
      config.chainId === 56 ? 'BNB (Wrapped)' : 'ETH (Wrapped)';
    data.token0.symbol = config.chainId === 56 ? 'BNB' : 'ETH';
  }
  if (data?.token1?.id === config.addresses.weth.toLowerCase()) {
    data.token1.name =
      config.chainId === 56 ? 'BNB (Wrapped)' : 'ETH (Wrapped)';
    data.token1.symbol = config.chainId === 56 ? 'BNB' : 'ETH';
  }

  return data;
}
