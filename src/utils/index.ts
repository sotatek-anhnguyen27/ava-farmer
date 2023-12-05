import { blockClient } from '@/store/modules/kurve/client';
import { GET_BLOCK, GET_BLOCKS } from '@/store/modules/kurve/queries';
import dayjs from 'dayjs';
import Numeral from 'numeral';

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED
}

export const toK = (num: string) => {
  return Numeral(num).format('0.[00]a');
};

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number, digits: number) => {
  const formatter = new Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  return formatter.format(num);
};

export function formattedNum(
  number: string,
  usd = false
  // acceptNegatives = false
) {
  if (number === '' || number === undefined) {
    return usd ? '$0' : 0;
  }

  const num = parseFloat(number);

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0));
  }

  if (num === 0) {
    if (usd) {
      return '$0';
    }
    return 0;
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001';
  }

  if (num > 1000) {
    return usd
      ? formatDollarAmount(num, 0)
      : Number(num.toFixed(0)).toLocaleString();
  }

  if (usd) {
    if (num < 0.1) {
      return formatDollarAmount(num, 4);
    } else {
      return formatDollarAmount(num, 2);
    }
  }

  return Number(num.toFixed(5)).toLocaleString();
}

export async function splitQuery(
  query: any,
  localClient: any,
  vars: any,
  list: any,
  skipCount = 100
): Promise<any> {
  let fetchedData = {};
  let allFound = false;
  let skip = 0;

  while (!allFound) {
    let end = list.length;
    if (skip + skipCount < list.length) {
      end = skip + skipCount;
    }
    const sliced = list.slice(skip, end);
    const result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'cache-first'
    });
    fetchedData = {
      ...fetchedData,
      ...result.data
    };
    if (
      Object.keys(result.data).length < skipCount ||
      skip + skipCount > list.length
    ) {
      allFound = true;
    } else {
      skip += skipCount;
    }
  }

  return fetchedData;
}

export function getTimestampsForChanges(): [number, number, number] {
  const utcCurrentTime = dayjs();
  const t1 = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix() - (5 * 86400);
  const t2 = utcCurrentTime
    .subtract(2, 'day')
    .startOf('minute')
    .unix() - (5 * 86400);
  const tWeek = utcCurrentTime
    .subtract(1, 'week')
    .startOf('minute')
    .unix() - (5 * 86400);
  return [t1, t2, tWeek];
}

/**
 * @notice Fetches first block after a given timestamp
 * @dev Query speed is optimized by limiting to a 600-second period
 * @param {Int} timestamp in seconds
 */
export async function getBlockFromTimestamp(timestamp: number) {
  const result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp - (5 * 86400),
      timestampTo: timestamp + 600 - (5 * 86400)
    },
    fetchPolicy: 'cache-first'
  });

  return result?.data?.blocks?.[0]?.number;
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(
  timestamps: number[],
  skipCount = 500
) {
  if (timestamps?.length === 0) {
    return [];
  }

  const fetchedData = await splitQuery(
    GET_BLOCKS,
    blockClient,
    [],
    timestamps,
    skipCount
  );

  const blocks: any[] = [];
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number']
        });
      }
    }
  }
  return blocks;
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow: string, value24HoursAgo: string) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) /
      parseFloat(value24HoursAgo)) *
    100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }

  return adjustedPercentChange;
};

/**
 * gets the amoutn difference plus the % change in change itself (second order change)
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 * @param {*} value48HoursAgo
 */
export const get2DayPercentChange = (
  valueNow: any,
  value24HoursAgo: any,
  value48HoursAgo: any
) => {
  // get volume info for both 24 hour periods
  const currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo);
  const previousChange =
    parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo);

  const adjustedPercentChange =
    (currentChange - previousChange / previousChange) * 100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export default function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString);
}

export function formattedPercent(percent, useBrackets = false) {
  percent = parseFloat(percent);
  if (!percent || percent === 0) {
    return '0%';
  }

  if (percent < 0.0001 && percent > 0) {
    return '< 0.0001%';
  }

  if (percent < 0 && percent > -0.0001) {
    return '< 0.0001%';
  }

  const fixedPercent = percent.toFixed(2);
  if (fixedPercent === '0.00') {
    return '0%';
  }
  if (fixedPercent > 0) {
    if (fixedPercent > 100) {
      return `+${percent?.toFixed(0).toLocaleString()}%`;
    } else {
      return `+${fixedPercent}%`;
    }
  } else {
    return `${fixedPercent}%`;
  }
}
