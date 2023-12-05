import provider from '@/helpers/provider';
import { multicall } from '@/_balancer/utils';
import abi from '@/helpers/abi';
import config from '@/config';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
export async function getCommonInfo() {
  const calls = [
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'rewardRate',
      params: []
    },
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'totalBacked',
      params: []
    },
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'totalSupply',
      params: []
    },
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'minVestedDoneTime',
      params: []
    },
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'totalHashrate',
      params: []
    }
  ];
  const rawInfo = await multicall(provider, abi['VBuniNFTFarmNew'], calls);
  console.log('RAW INFOS', rawInfo);
  return {
    rewardRate: new BigNumber(_.get(rawInfo, '0.0')._hex)
      .div('1e18')
      .toNumber(),
    totalBacked: new BigNumber(_.get(rawInfo, '1.0')._hex)
      .div('1e18')
      .toNumber(),
    totalStakedNFT: new BigNumber(_.get(rawInfo, '2.0')._hex).toNumber(),
    minVestedDoneTime: new BigNumber(_.get(rawInfo, '3.0')._hex).toNumber(),
    totalHashrate: new BigNumber(_.get(rawInfo, '4.0')._hex)
      .div('1e18')
      .toNumber()
  };
}
export async function getUserCommonInfo(account) {
  const calls = [
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'earned',
      params: [account]
    },
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'userBacked',
      params: [account]
    },
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'userHashrate',
      params: [account]
    }
  ];
  const rawUserInfo = await multicall(provider, abi['VBuniNFTFarmNew'], calls);
  return {
    buniEarned: new BigNumber(_.get(rawUserInfo, '0.0')._hex)
      .div('1e18')
      .toNumber(),
    userBacked: new BigNumber(_.get(rawUserInfo, '1.0')._hex)
      .div('1e18')
      .toNumber(),
    userHashrate: new BigNumber(_.get(rawUserInfo, '2.0')._hex)
      .div('1e18')
      .toNumber()
  };
}
export async function getBuniEarned(account) {
  const calls = [
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'earned',
      params: [account]
    }
  ];

  const rawBuniEarned = await multicall(
    provider,
    abi['VBuniNFTFarmNew'],
    calls
  );
  const parsedBuniEarned = rawBuniEarned.map(buniEarned => {
    return new BigNumber(buniEarned).toJSON();
  });
  return new BigNumber(parsedBuniEarned[0] || 0).div('1e18').toNumber();
}
export async function getRewardRate() {
  const calls = [
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'rewardRate',
      params: []
    }
  ];

  const rawRewardRate = await multicall(
    provider,
    abi['VBuniNFTFarmNew'],
    calls
  );
  const parsedRewardRate = rawRewardRate.map(rewardRate => {
    return new BigNumber(rewardRate).toJSON();
  });
  return new BigNumber(parsedRewardRate[0] || 0).div('1e18').toNumber();
}
export async function getUserStakedNFTNumber(account) {
  const calls = [
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'balanceOf',
      params: [account]
    }
  ];

  const rawUserStakedNFT = await multicall(
    provider,
    abi['VBuniNFTFarmNew'],
    calls
  );
  const parsedUserStakedNFT = rawUserStakedNFT.map(stakedNFT => {
    return new BigNumber(stakedNFT).toJSON();
  });
  return new BigNumber(parsedUserStakedNFT[0] || 0).toNumber();
}
export async function getTotalHashRate() {
  const calls = [
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'totalBacked',
      params: []
    }
  ];

  const rawTotalHashrate = await multicall(
    provider,
    abi['VBuniNFTFarmNew'],
    calls
  );
  const parsedTotalHashRate = rawTotalHashrate.map(totalHashRate => {
    return new BigNumber(totalHashRate).toJSON();
  });
  return new BigNumber(parsedTotalHashRate[0] || 0).div('1e18').toNumber();
}
export async function getUserHashRate(myAddress) {
  const calls = [
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'userBacked',
      params: [myAddress]
    }
  ];

  const rawHashrate = await multicall(provider, abi['VBuniNFTFarmNew'], calls);
  const parsedHashRate = rawHashrate.map(hashRate => {
    return new BigNumber(hashRate).toJSON();
  });
  return new BigNumber(parsedHashRate[0] || 0).div('1e18').toNumber();
}
export async function getTotalStakedNFT() {
  const calls = [
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'totalSupply',
      params: []
    }
  ];

  const rawTotalStakedNFT = await multicall(
    provider,
    abi['VBuniNFTFarmNew'],
    calls
  );
  const parsedrawTotalStakedNFT = rawTotalStakedNFT.map(totalStakedNFT => {
    return new BigNumber(totalStakedNFT).toJSON();
  });
  return new BigNumber(parsedrawTotalStakedNFT[0] || 0).toNumber();
}

export async function fetchUserStakedNFT(myAddress) {
  const calls = [
    {
      address: config.addresses.vBuniNFTFarmNew,
      name: 'getUserTokens',
      params: [myAddress]
    }
  ];

  const rawStakedNFT = await multicall(provider, abi['VBuniNFTFarmNew'], calls);

  return (_.get(rawStakedNFT, '0.0') || []).map(stakedNFTId =>
    new BigNumber(stakedNFTId._hex).toNumber()
  );
}
