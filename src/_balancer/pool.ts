import merge from 'lodash/merge';
import pools from '../libs/buni_assets/data/pools.json';
import { getAddress, isAddress } from '@ethersproject/address';
import { multicall, subgraphRequest } from './utils';
import provider from '@/helpers/provider';
import abi from '@/helpers/abi';
import { poolRights, formatPool } from '@/helpers/utils';
import { formatUnits } from '@ethersproject/units';
import queries from '@/helpers/queries.json';
import config from '@/config';
import { getPoolLiquidity } from '@/helpers/price';
import store from '@/store';
import BigNumber from 'bignumber.js';
import i18n from '../i18n';
export default class Pool {
  public readonly address: string;
  public readonly checksum: string;
  public ready = false;
  public config: any;
  public metadata?: any;

  constructor(address: string) {
    this.address = address.toLowerCase();
    this.checksum = isAddress(address) ? getAddress(address) : '';
    this.config = this.isWhitelisted() ? pools[this.address] : {};
  }

  isWhitelisted() {
    return Object.keys(pools)
      .map(crp => crp.toLowerCase())
      .includes(this.address);
  }

  getTypeStr() {
    return this.metadata.finalized
      ? i18n.t('shared')
      : this.isCrp()
      ? i18n.t('smartPool')
      : i18n.t('private');
  }

  getBptPrice() {
    if (
      !this.metadata.liquidity ||
      !this.metadata.totalShares ||
      this.metadata.totalShares == 0 ||
      (!this.metadata.finalized && !this.isCrp())
    )
      return 0;

    return new BigNumber(this.metadata.liquidity)
      .dividedBy(this.metadata.totalShares)
      .toString();
  }

  isCrp() {
    if (this.isWhitelisted() && this.config.is_compatible) return true;
    return this.metadata.crp;
  }

  getBptAddress() {
    if (this.config.bptAddress) return this.config.bptAddress;
    return this.isCrp() ? this.metadata.controller : this.address;
  }

  async getMetadata() {
    try {
      this.metadata = await this.getSubgraphMetadata();
      const metadata = await this.getNodeMetadata();
      this.metadata = { ...this.metadata, ...metadata };
      // if (store?.getters?.prices) {
      //   this.metadata.liquidity = getPoolLiquidity(
      //     this.metadata,
      //     store.getters.prices
      //   );
      // }
      this.ready = true;
      return this.metadata;
    } catch (e) {
      return Promise.reject();
    }
  }

  async getNodeMetadata() {
    const address = this.getBptAddress();
    if (this.isCrp()) {
      const crpCalls = [
        'isPublicSwap',
        'name',
        'decimals',
        'symbol',
        'totalSupply',
        'rights',
        'bspCap',
        'getController',
        'minimumWeightChangeBlockPeriod',
        'addTokenTimeLockInBlocks',
        'gradualUpdate'
      ].map(name => {
        return { address, name, params: [] };
      });

      const [
        publicSwap,
        name,
        decimals,
        symbol,
        totalShares,
        rights,
        bspCap,
        crpController,
        minimumWeightChangeBlockPeriod,
        addTokenTimeLockInBlocks,
        { startBlock, endBlock }
      ] = await multicall(provider, abi['ConfigurableRightsPool'], crpCalls);
      return {
        publicSwap: publicSwap[0],
        name: name.toString(),
        symbol: symbol.toString(),
        totalShares: formatUnits(totalShares.toString(), decimals),
        rights: Object.fromEntries(
          Object.entries(poolRights).map((right, i) => [right[0], rights[i]])
        ),
        bspCap: formatUnits(bspCap.toString(), decimals),
        crpController: crpController[0],
        minimumWeightChangeBlockPeriod: minimumWeightChangeBlockPeriod.toString(),
        addTokenTimeLockInBlocks: addTokenTimeLockInBlocks.toString(),
        startBlock: startBlock.toString(),
        endBlock: endBlock.toString()
      };
    }
    const calls = [
      'isPublicSwap',
      'name',
      'decimals',
      'symbol',
      'getSwapFee',
      'totalSupply'
    ].map(name => {
      return { address, name, params: [] };
    });

    const [
      publicSwap,
      name,
      decimals,
      symbol,
      swapFee,
      totalShares
    ] = await multicall(provider, abi['BPool'], calls);

    return {
      publicSwap: publicSwap[0],
      name: name.toString(),
      symbol: symbol.toString(),
      swapFee: formatUnits(swapFee.toString(), decimals),
      totalShares: formatUnits(totalShares.toString(), decimals),
      rights: [],
      bspCap: 0,
      minimumWeightChangeBlockPeriod: 10,
      addTokenTimeLockInBlocks: 10,
      gradualUpdate: []
    };
  }

  async getSubgraphMetadata() {
    const swapTsStart = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    const query = {
      pool: {
        __args: {
          id: this.address
        },
        swaps: {
          __args: {
            where: {
              timestamp_lt: swapTsStart
            }
          }
        }
      }
    };
    try {
      const response = await subgraphRequest(
        config.kalancer.subgraphUrl,
        merge(queries['getPool'], query)
      );
      return formatPool(response.pool);
    } catch (e) {
      console.error(e);
    }
  }
}
