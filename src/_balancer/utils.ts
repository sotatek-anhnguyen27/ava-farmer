import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import config from '../config';
import { BNB_KEY } from '@/utils/helpers';
import { abi as multicallAbi } from '../helpers/abi/Multicall.json';

const MULTICALL = config.addresses.multicall;

export async function multicall(provider, abi, calls) {
  try {
    const multi = new Contract(MULTICALL, multicallAbi, provider);
    const itf = new Interface(abi);
    const calldata = calls.map(call => {
      return [
        call.address.toLowerCase(),
        itf.encodeFunctionData(call.name, call.params)
      ];
    });
    const { returnData } = await multi.aggregate(calldata);
    const res = returnData.map((call, i) =>
      itf.decodeFunctionResult(calls[i].name, call)
    );

    return res;
  } catch (e) {
    console.error('[multicall]', e.message);
  }
}

export async function subgraphRequest(url, query) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: jsonToGraphQLQuery({ query }) })
  });
  const { data } = await res.json();
  return data || {};
}

export function getTokenLogoUrl(address: string): string | null {
  if (address === BNB_KEY) {
    address = config.addresses.weth;
  }
  let metadata = config.tokens[address];
  if (metadata) {
    return metadata.logoURI;
  }
  address = getAddress(address);
  metadata = config.tokens[address];
  if (!metadata) {
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  }
  return metadata.logoURI;
}
