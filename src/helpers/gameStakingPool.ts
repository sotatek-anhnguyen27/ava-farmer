import provider from '@/helpers/provider';
import { multicall } from '@/_balancer/utils';
import abi from '@/helpers/abi';
import config from '@/config';
import BigNumber from 'bignumber.js';
import axios from 'axios';
import _ from 'lodash';
import {
  elementNumberToName,
  getTrainerImageFromFactory,
  getTrainerNameFromFactory,
  trainerFromContract
} from "@/utils/trainer-utils";
import { getBunicornImageFromFactory, getBunicornName, bunicornFromContract } from "@/utils/bunicorn-utils";

export async function getCommonInfo(contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'rewardRate',
      params: []
    },
    {
      address: contractAddr,
      name: 'minHashrate',
      params: []
    },
    {
      address: contractAddr,
      name: 'totalHashrate',
      params: []
    },
    {
      address: contractAddr,
      name: 'totalSupply',
      params: []
    },
    {
      address: contractAddr,
      name: 'canUnstake',
      params: []
    },
    {
      address: contractAddr,
      name: 'periodFinish',
      params: []
    }
  ];
  const rawInfo = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);
  return {
    rewardRate: new BigNumber(_.get(rawInfo, '0.0')._hex)
      .div('1e18')
      .toNumber(),
    minHashRate: new BigNumber(_.get(rawInfo, '1.0')._hex)
      .div('1e18')
      .toNumber(),
    totalHashRate: new BigNumber(_.get(rawInfo, '2.0')._hex)
      .div('1e18')
      .toNumber(),
    totalStakedNFT: new BigNumber(_.get(rawInfo, '3.0')._hex).toNumber(),
    canUnstake: !!_.get(rawInfo, '4.0'),
    periodFinish: new BigNumber(_.get(rawInfo, '5.0')._hex)
      .toNumber()
  };
}

export async function getUserCommonInfo(account, contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'earned',
      params: [account]
    },
    {
      address: contractAddr,
      name: 'userHashrate',
      params: [account]
    }
  ];
  const rawUserInfo = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);
  return {
    buniEarned: new BigNumber(_.get(rawUserInfo, '0.0')._hex)
      .div('1e18')
      .toNumber(),
    userHashRate: new BigNumber(_.get(rawUserInfo, '1.0')._hex)
      .div('1e18')
      .toNumber()
  };
}
export async function getBuniEarned(account, contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'earned',
      params: [account]
    }
  ];

  const rawBuniEarned = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);
  const parsedBuniEarned = rawBuniEarned.map(buniEarned => {
    return new BigNumber(buniEarned).toJSON();
  });
  return new BigNumber(parsedBuniEarned[0] || 0).div('1e18').toNumber();
}
export async function getRewardRate(contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'rewardRate',
      params: []
    }
  ];

  const rawRewardRate = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);
  const parsedRewardRate = rawRewardRate.map(rewardRate => {
    return new BigNumber(rewardRate).toJSON();
  });
  return new BigNumber(parsedRewardRate[0] || 0).div('1e18').toNumber();
}
export async function getMinimumHashRate(contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'minHashrate',
      params: []
    }
  ];

  const rawMinHashRate = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);
  const parsedMinHashRate = _.get(rawMinHashRate, '0.0');
  return new BigNumber(parsedMinHashRate._hex).div('1e18').toJSON();
}
export async function getUserStakedNFTNumber(account, contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'balanceOf',
      params: [account]
    }
  ];

  const rawUserStakedNFT = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);
  const parsedUserStakedNFT = rawUserStakedNFT.map(stakedNFT => {
    return new BigNumber(stakedNFT).toJSON();
  });
  return new BigNumber(parsedUserStakedNFT[0] || 0).toNumber();
}
export async function getTotalHashRate(contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'totalHashrate',
      params: []
    }
  ];

  const rawTotalHashrate = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);
  const parsedTotalHashRate = rawTotalHashrate.map(totalHashRate => {
    return new BigNumber(totalHashRate).toJSON();
  });
  return new BigNumber(parsedTotalHashRate[0] || 0).div('1e18').toNumber();
}
export async function getUserHashRate(myAddress, contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'userHashrate',
      params: [myAddress]
    }
  ];

  const rawHashrate = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);
  const parsedHashRate = rawHashrate.map(hashRate => {
    return new BigNumber(hashRate).toJSON();
  });
  return new BigNumber(parsedHashRate[0] || 0).div('1e18').toNumber();
}
export async function getTotalStakedNFT(contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'totalSupply',
      params: []
    }
  ];

  const rawTotalStakedNFT = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);
  const parsedrawTotalStakedNFT = rawTotalStakedNFT.map(totalStakedNFT => {
    return new BigNumber(totalStakedNFT).toJSON();
  });
  return new BigNumber(parsedrawTotalStakedNFT[0] || 0).toNumber();
}
export async function fetchUserBountyNFTCount(myAddress, nftContractArr) {
  const calls = [
    {
      address: nftContractArr,
      name: 'balanceOf',
      params: [myAddress]
    }
  ];

  const rawTokenBalances = await multicall(provider, abi['TrainersV2'], calls);
  const parsedTokenBalances = rawTokenBalances.map(tokenBalance => {
    return new BigNumber(tokenBalance).toJSON();
  });
  return new BigNumber(parsedTokenBalances[0] || 0).toNumber();
}
export async function fetchUserStakedNFT(myAddress, contractAddr) {
  const calls = [
    {
      address: contractAddr,
      name: 'getUserTokens',
      params: [myAddress]
    }
  ];

  const rawStakedNFT = await multicall(provider, abi['GameNFTStakingRewardsUpgradeable'], calls);

  return (_.get(rawStakedNFT, '0.0') || []).map(stakedNFTId =>
    new BigNumber(stakedNFTId._hex).toNumber()
  );
}

async function parseTrainerData(tokenInfos, tokenIds, hashRateInfos, lockTransfers) {
  console.log('lockTransfers', JSON.stringify(lockTransfers))
  const parsedTokenBalances = tokenInfos.map((tokenInfo, index) => {
    console.log('tokenInfo', tokenInfo);
    const trainerName = getTrainerNameFromFactory(tokenIds[index], elementNumberToName(+tokenInfo[2]));
    const trainer = trainerFromContract(tokenIds[index], tokenInfo);
    trainer.nameAsText = `[Trainer] ${trainerName} (Level: ${tokenInfo[1] + 1} - Element: ${trainer.elementName})`;
    trainer.name = trainerName;
    trainer.hashRate = new BigNumber(hashRateInfos[index]).div(1e18).toString();
    trainer.tokenId = tokenIds[index];
    trainer.level = tokenInfo[1] + 1;
    trainer.image = getTrainerImageFromFactory(trainer);
    // @ts-ignore
    trainer.isLockTransfer = Number(lockTransfers[index].toString()) > 0;
    return trainer;
  });
  return parsedTokenBalances;
}
async function parseBunicornData(tokenInfos, tokenIds, hashRateInfos, lockTransfers) {
  const parsedTokenBalances = tokenInfos.map((tokenInfo, index) => {
    const bunicorn = bunicornFromContract(tokenIds[index], tokenInfo, '1', '1');
    // @ts-ignore
    bunicorn.image = getBunicornImageFromFactory(bunicorn);
    // @ts-ignore
    bunicorn.name = getBunicornName(bunicorn.element, bunicorn.stars, tokenIds[index], bunicorn);
    // @ts-ignore
    bunicorn.stars = bunicorn.stars + 1;
    bunicorn.nameAsText = `[Bunicorn] ${bunicorn.name} (Stars: ${bunicorn.stars} - Element: ${bunicorn.element})`;
    bunicorn.tokenId = bunicorn.id;
    bunicorn.hashRate = new BigNumber(hashRateInfos[index])
      .div(1e18)
      .toString();
    console.log('lockTransfers[index].toString()', lockTransfers[index].toString());
    bunicorn.isLockTransfer = Number(lockTransfers[index].toString()) > 0;
    return bunicorn;
  });
  return parsedTokenBalances;
}

export async function getTrainerNftInfos(tokenIds) {
  const calls2: any = [];
  const calls3: any = [];
  const calls4: any = [];
  try {
    for (let index = 0; index < tokenIds.length; index++) {
      calls2.push({
        address: config.addresses.trainerContract,
        name: 'get',
        params: [tokenIds[index]]
      });
      calls3.push({
        address: config.addresses.trainerContract,
        name: 'getStakingHashrate',
        params: [tokenIds[index]]
      });
      calls4.push({
        address: config.addresses.trainerContract,
        name: 'transferCooldownLeft',
        params: [tokenIds[index]]
      });
    }
    const tokenInfos = await multicall(provider, abi['TrainersV2'], calls2);
    const hashRateInfos = await multicall(provider, abi['TrainersV2'], calls3);
    const lockTransfers = await multicall(provider, abi['TrainersV2'], calls4);
    console.log('lockTransfers', lockTransfers);
    return parseTrainerData(tokenInfos, tokenIds, hashRateInfos, lockTransfers);
  } catch {
    return tokenIds.map(tokenId => '');
  }
}
export async function getBunicornNftInfos(tokenIds) {
  const calls2: any = [];
  const calls3: any = [];
  const calls4: any = [];
  try {
    for (let index = 0; index < tokenIds.length; index++) {
      calls2.push({
        address: config.addresses.bunicornContract,
        name: 'get',
        params: [tokenIds[index]]
      });
      calls3.push({
        address: config.addresses.bunicornContract,
        name: 'getStakingHashrate',
        params: [tokenIds[index]]
      });
      calls4.push({
        address: config.addresses.bunicornContract,
        name: 'transferCooldownLeft',
        params: [tokenIds[index]]
      });
    }
    const tokenInfos = await multicall(provider, abi['BunicornsV2'], calls2);
    const hashRateInfos = await multicall(provider, abi['BunicornsV2'], calls3);
    const lockTransfers = await multicall(provider, abi['BunicornsV2'], calls4);
    return parseBunicornData(tokenInfos, tokenIds, hashRateInfos, lockTransfers);
  } catch {
    return tokenIds.map(tokenId => '');
  }
}

export async function fetchListNFTOf(account, numberOfToken, nftContractAddr) {
  const calls: any = [];
  for (let index = 0; index < numberOfToken; index++) {
    calls.push({
      address: nftContractAddr,
      name: 'tokenOfOwnerByIndex',
      params: [account, index]
    });
  }
  let tokenIds = await multicall(provider, abi['TrainersV2'], calls);
  tokenIds = tokenIds.map(tokenId => {
    return new BigNumber(tokenId).toString();
  });
  if (nftContractAddr === config.addresses.trainerContract) {
    return getTrainerNftInfos(tokenIds);
  }
  if (nftContractAddr === config.addresses.bunicornContract) {
    return getBunicornNftInfos(tokenIds);
  }
}


