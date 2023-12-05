import provider from '@/helpers/provider';
import { multicall } from '@/_balancer/utils';
import abi from '@/helpers/abi';
import config from '@/config';
import BigNumber from 'bignumber.js';
import axios from 'axios';
import _ from 'lodash';

export async function getCommonInfo() {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'rewardRate',
      params: []
    },
    {
      address: config.addresses.buniBountyFarm,
      name: 'minHashrate',
      params: []
    },
    {
      address: config.addresses.buniBountyFarm,
      name: 'totalHashrate',
      params: []
    },
    {
      address: config.addresses.buniBountyFarm,
      name: 'totalSupply',
      params: []
    }
  ];
  const rawInfo = await multicall(provider, abi['BuniBounty'], calls);
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
    totalStakedNFT: new BigNumber(_.get(rawInfo, '3.0')._hex).toNumber()
  };
}
export async function getUserCommonInfo(account) {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'earned',
      params: [account]
    },
    {
      address: config.addresses.buniBountyFarm,
      name: 'userHashrate',
      params: [account]
    }
  ];
  const rawUserInfo = await multicall(provider, abi['BuniBounty'], calls);
  return {
    buniEarned: new BigNumber(_.get(rawUserInfo, '0.0')._hex)
      .div('1e18')
      .toNumber(),
    userHashRate: new BigNumber(_.get(rawUserInfo, '1.0')._hex)
      .div('1e18')
      .toNumber()
  };
}
export async function getBuniEarned(account) {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'earned',
      params: [account]
    }
  ];

  const rawBuniEarned = await multicall(provider, abi['BuniBounty'], calls);
  const parsedBuniEarned = rawBuniEarned.map(buniEarned => {
    return new BigNumber(buniEarned).toJSON();
  });
  return new BigNumber(parsedBuniEarned[0] || 0).div('1e18').toNumber();
}
export async function getRewardRate() {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'rewardRate',
      params: []
    }
  ];

  const rawRewardRate = await multicall(provider, abi['BuniBounty'], calls);
  const parsedRewardRate = rawRewardRate.map(rewardRate => {
    return new BigNumber(rewardRate).toJSON();
  });
  return new BigNumber(parsedRewardRate[0] || 0).div('1e18').toNumber();
}
export async function getMinimumHashRate() {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'minHashrate',
      params: []
    }
  ];

  const rawMinHashRate = await multicall(provider, abi['BuniBounty'], calls);
  const parsedMinHashRate = _.get(rawMinHashRate, '0.0');
  return new BigNumber(parsedMinHashRate._hex).div('1e18').toJSON();
}
export async function getUserStakedNFTNumber(account) {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'balanceOf',
      params: [account]
    }
  ];

  const rawUserStakedNFT = await multicall(provider, abi['BuniBounty'], calls);
  const parsedUserStakedNFT = rawUserStakedNFT.map(stakedNFT => {
    return new BigNumber(stakedNFT).toJSON();
  });
  return new BigNumber(parsedUserStakedNFT[0] || 0).toNumber();
}
export async function getTotalHashRate() {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'totalHashrate',
      params: []
    }
  ];

  const rawTotalHashrate = await multicall(provider, abi['BuniBounty'], calls);
  const parsedTotalHashRate = rawTotalHashrate.map(totalHashRate => {
    return new BigNumber(totalHashRate).toJSON();
  });
  return new BigNumber(parsedTotalHashRate[0] || 0).div('1e18').toNumber();
}
export async function getUserHashRate(myAddress) {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'userHashrate',
      params: [myAddress]
    }
  ];

  const rawHashrate = await multicall(provider, abi['BuniBounty'], calls);
  const parsedHashRate = rawHashrate.map(hashRate => {
    return new BigNumber(hashRate).toJSON();
  });
  return new BigNumber(parsedHashRate[0] || 0).div('1e18').toNumber();
}
export async function getTotalStakedNFT() {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'totalSupply',
      params: []
    }
  ];

  const rawTotalStakedNFT = await multicall(provider, abi['BuniBounty'], calls);
  const parsedrawTotalStakedNFT = rawTotalStakedNFT.map(totalStakedNFT => {
    return new BigNumber(totalStakedNFT).toJSON();
  });
  return new BigNumber(parsedrawTotalStakedNFT[0] || 0).toNumber();
}
export async function fetchUserBountyNFTCount(myAddress) {
  const calls = [
    {
      address: config.addresses.bounty_nft,
      name: 'balanceOf',
      params: [myAddress]
    }
  ];

  const rawTokenBalances = await multicall(provider, abi['BountyNFT'], calls);
  const parsedTokenBalances = rawTokenBalances.map(tokenBalance => {
    return new BigNumber(tokenBalance).toJSON();
  });
  return new BigNumber(parsedTokenBalances[0] || 0).toNumber();
}
export async function fetchUserStakedNFT(myAddress) {
  const calls = [
    {
      address: config.addresses.buniBountyFarm,
      name: 'getUserTokens',
      params: [myAddress]
    }
  ];

  const rawStakedNFT = await multicall(provider, abi['BuniBounty'], calls);

  return (_.get(rawStakedNFT, '0.0') || []).map(stakedNFTId =>
    new BigNumber(stakedNFTId._hex).toNumber()
  );
}
export async function getNftInfos(tokenIds) {
  try {
    const res = await Promise.all(
      tokenIds.map((tokenId, index) => {
        try {
          return axios.get(
            `${config.nftMetadataDebugUrl}/bounty-nft/${tokenId}`
          );
        } catch (e) {
          return {};
        }
      })
    );
    return res.map((item: any) => item.data);
  } catch {
    return tokenIds.map(tokenId => '');
  }
}
export async function fetchListNFTOf(account, numberOfToken) {
  const calls: any = [];
  const calls2: any = [];
  const calls3: any = [];

  for (let index = 0; index < numberOfToken; index++) {
    calls.push({
      address: config.addresses.bounty_nft,
      name: 'getTokenInfoOfOwnerByIndex',
      params: [account, index]
    });
  }

  for (let index = 0; index < numberOfToken; index++) {
    calls2.push({
      address: config.addresses.bounty_nft,
      name: 'tokenOfOwnerByIndex',
      params: [account, index]
    });
  }

  const tokenInfos = await multicall(provider, abi['BountyNFT'], calls);
  let tokenIds = await multicall(provider, abi['BountyNFT'], calls2);
  tokenIds = tokenIds.map(tokenId => {
    return new BigNumber(tokenId).toString();
  });

  tokenIds.forEach(tokenId => {
    calls3.push({
      address: config.addresses.bounty_nft,
      name: 'getTokenInfo',
      params: [tokenId]
    });
  });

  const nftInfos = await getNftInfos(tokenIds);
  const parsedTokenBalances = tokenInfos.map((tokenInfo, index) => {
    const [hashRate, createdAt] = tokenInfo;
    return {
      tokenId: tokenIds[index],
      name: nftInfos[index].name,
      imageUrl:
        nftInfos[index].medium_image ||
        'https://static.nft.bunicorn.exchange/farms/logo.png',
      smallImageUrl:
        nftInfos[index].medium_image ||
        'https://static.nft.bunicorn.exchange/farms/logo.png',
      hashRate: new BigNumber(hashRate._hex).div('1e18').toJSON(),
      createdAt
    };
  });
  return parsedTokenBalances;
}
