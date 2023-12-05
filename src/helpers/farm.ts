import abi from '@/helpers/abi';
import BigNumber from 'bignumber.js';
import Pool from '@/_balancer/pool';
import { formatPool } from '@/helpers/utils';
import provider from '@/helpers/provider';
import config from '../config';
import { multicall } from '@/_balancer/utils';
import store from '@/store';
import { getBuniPrice, getBurPrice } from '@/helpers/price';
import axios from 'axios';
const farmsConfig = config.farms;
const syrupFarmConfig = config.syrupFarms;
export const getMasterChefAddress = pid => {
  if (config.kryptoMonsterFarm.includes(Number(pid))) {
    return config.addresses.masterChef2;
  }
  return config.addresses.masterChef;
};

export function getBalanceNumber(balance, decimals = 18) {
  const displayBalance = new BigNumber(balance).dividedBy(
    new BigNumber(10).pow(decimals)
  );
  return displayBalance.toNumber();
}

export async function fetchFarmUserAllowances(account) {
  const calls = farmsConfig.map(farm => {
    const masterChefAdress = getMasterChefAddress(farm.pid);
    const lpContractAddress = farm.lpAddresses;
    return {
      address: lpContractAddress,
      name: 'allowance',
      params: [account, masterChefAdress]
    };
  });

  const rawLpAllowances = await multicall(provider, abi['ERC20'], calls);
  const parsedLpAllowances = rawLpAllowances.map(lpBalance => {
    return new BigNumber(lpBalance).toJSON();
  });
  return parsedLpAllowances;
}
export async function fetchSyrupFarmUserAllowances(account) {
  const calls = syrupFarmConfig.map(farm => {
    return {
      address: farm.lpAddresses,
      name: 'allowance',
      params: [account, farm.poolAddress]
    };
  });

  const rawLpAllowances = await multicall(provider, abi['ERC20'], calls);
  const parsedLpAllowances = rawLpAllowances.map(lpBalance => {
    return new BigNumber(lpBalance).toJSON();
  });
  console.log(
    'parsedLpAllowances',
    parsedLpAllowances,
    account,
    syrupFarmConfig
  );
  return parsedLpAllowances;
}
export async function fetchFarmUserVestingCount(account) {
  const calls = [
    {
      address: config.addresses.vbuni,
      name: 'balanceOf',
      params: [account]
    }
  ];

  const rawTokenBalances = await multicall(provider, abi['VBuni'], calls);
  const parsedTokenBalances = rawTokenBalances.map(tokenBalance => {
    return new BigNumber(tokenBalance).toJSON();
  });
  return parsedTokenBalances;
}

async function getNftImages(tokenIds) {
  try {
    const imagesUrls: any = await Promise.all(
      tokenIds.map((tokenId, index) => {
        try {
          return axios.get(`${config.nftMetadataDebugUrl}/tokens/${tokenId}`);
        } catch (e) {
          return {};
        }
      })
    );
    return imagesUrls.map(imageUrl => imageUrl.data.medium_image);
  } catch (e) {
    console.error(e);
    return tokenIds.map(tokenId => '');
  }
}

export async function fetchFarmUserVesting(account, numberOfToken) {
  const calls: any = [];
  const calls2: any = [];
  const calls3: any = [];

  for (let index = 0; index < numberOfToken; index++) {
    calls.push({
      address: config.addresses.vbuni,
      name: 'getTokenInfoOfOwnerByIndex',
      params: [account, index]
    });
  }

  for (let index = 0; index < numberOfToken; index++) {
    calls2.push({
      address: config.addresses.vbuni,
      name: 'tokenOfOwnerByIndex',
      params: [account, index]
    });
  }

  const tokenInfos = await multicall(provider, abi['VBuni'], calls);
  let tokenIds = await multicall(provider, abi['VBuni'], calls2);
  tokenIds = tokenIds.map(tokenId => {
    return new BigNumber(tokenId).toString();
  });

  tokenIds.forEach(tokenId => {
    calls3.push({
      address: config.addresses.vbuni,
      name: 'getTokenInfo',
      params: [tokenId]
    });
  });
  const _tokenInfos = await multicall(provider, abi['VBuni'], calls3);

  // Fetch status open box
  const addressMysteryBox = config.addresses.mysteryBox;
  const callGetOpenBoxes: {
    address: string | undefined;
    name: string;
    params: any[];
  }[] = [];
  tokenIds.forEach((nftId: any) => {
    callGetOpenBoxes.push({
      address: addressMysteryBox,
      name: 'getBoxStatus',
      params: [nftId]
    });
  });

  const listStatus = await multicall(
    provider,
    abi['MysteryBox'],
    callGetOpenBoxes
  );
  const openedBoxIds = tokenIds.filter(
    (item: string, index: number) => listStatus[index][0]
  );
  const imagesUrls = await getNftImages(tokenIds);

  const parsedTokenBalances = tokenInfos.map((tokenInfo, index) => {
    const [poolId, amout, vestedAt] = tokenInfo;
    const isOpen = openedBoxIds.includes(`${tokenIds[index]}`);

    let imageUrl = 'https://static.nft.bunicorn.exchange/farms/logo.png';
    if (!isOpen) {
      imageUrl =
        imagesUrls[index] ||
        'https://static.nft.bunicorn.exchange/farms/logo.png';
    }
    return {
      tokenId: tokenIds[index],
      imageUrl:
        imageUrl || 'https://static.nft.bunicorn.exchange/farms/logo.png',
      smallImageUrl:
        imageUrl || 'https://static.nft.bunicorn.exchange/farms/logo.png',
      isOpen: isOpen,
      poolId: new BigNumber(poolId._hex).toJSON(),
      amout: new BigNumber(amout._hex).div('1e18').toJSON(),
      vestedAt: new BigNumber(vestedAt._hex).toJSON(),
      harvestAt: new BigNumber(_tokenInfos[index][3]._hex).toJSON()
    };
  });
  return parsedTokenBalances;
}

export async function isApprovedVBuniForAll(account) {
  const result = await multicall(provider, abi['VBuni'], [
    {
      address: config.addresses.vbuni,
      name: 'isApprovedForAll',
      params: [account, config.addresses.masterChef]
    }
  ]);

  return result[0][0];
}

export async function fetchFarmUserTokenBalances(account) {
  const calls = farmsConfig.map(farm => {
    const lpContractAddress = farm.lpAddresses;
    return {
      address: lpContractAddress,
      name: 'balanceOf',
      params: [account]
    };
  });

  const rawTokenBalances = await multicall(provider, abi['ERC20'], calls);
  const parsedTokenBalances = rawTokenBalances.map(tokenBalance => {
    return new BigNumber(tokenBalance).toJSON();
  });
  console.log(
    `[API] Fetched farm lp's user [${account}] balances:` +
      JSON.stringify(parsedTokenBalances)
  );
  return parsedTokenBalances;
}
export async function fetchFarmUserStakedBalances(account) {
  const calls = farmsConfig.map(farm => {
    const masterChefAdress = getMasterChefAddress(farm.pid);
    return {
      address: masterChefAdress,
      name: 'userInfo',
      params: [farm.pid, account]
    };
  });

  const rawStakedBalances = await multicall(provider, abi['MasterChef'], calls);
  const parsedStakedBalances = rawStakedBalances.map(stakedBalance => {
    return new BigNumber(stakedBalance[0]._hex).toJSON();
  });
  console.log(
    `[API] Fetched farm user [${account}] staked:` +
      JSON.stringify(parsedStakedBalances)
  );
  return parsedStakedBalances;
}
export async function fetchFarmUserEarnings(account) {
  const calls = farmsConfig.map(farm => {
    const masterChefAdress = getMasterChefAddress(farm.pid);
    return {
      address: masterChefAdress,
      name: 'pendingBuni',
      params: [farm.pid, account]
    };
  });

  const rawEarnings = await multicall(provider, abi['MasterChef'], calls);
  const parsedEarnings = rawEarnings.map(earnings => {
    return new BigNumber(earnings).toJSON();
  });
  console.log(
    `[API] Fetched farm user [${account}] earned:` +
      JSON.stringify(parsedEarnings)
  );
  return parsedEarnings;
}

export async function fetchFarmUserDataAsync(account) {
  console.time(`[API] Fetched user farm data success`);
  const userFarmTokenBalances = await fetchFarmUserTokenBalances(account);
  const userStakedBalances = await fetchFarmUserStakedBalances(account);
  const userFarmEarnings = await fetchFarmUserEarnings(account);

  const arrayOfUserDataObjects = userFarmTokenBalances.map(
    (farmAllowance, index) => {
      return {
        index,
        tokenBalance: userFarmTokenBalances[index],
        stakedBalance: userStakedBalances[index],
        earnings: userFarmEarnings[index]
      };
    }
  );
  console.timeEnd(`[API] Fetched user farm data success`);
  return { arrayOfUserDataObjects };
}

export async function getPoolMetadata(poolId) {
  const bPool = new Pool(poolId);

  const metadata = await bPool.getMetadata();
  return formatPool(metadata);
}

const raito = pair => {
  const percentToken0 =
    pair && pair
      ? new BigNumber(pair.reserve0)
          .dividedBy(pair.vReserve0)
          .multipliedBy('100')
          .dividedBy(
            new BigNumber(pair.reserve0)
              .dividedBy(pair.vReserve0)
              .plus(new BigNumber(pair.reserve1).dividedBy(pair.vReserve1))
          )
          .decimalPlaces(2)
          .toString()
      : '50';
  const percentToken1 = pair
    ? new BigNumber(100)
        .minus(percentToken0)
        .decimalPlaces(2)
        .toString()
    : '50';
  return {
    reserve0: pair.reserve0,
    reserve1: pair.reserve1,
    percentToken0,
    percentToken1
  };
};

const getTokenInfo = pair => {
  const assets = store.getters['assets/metadata'];
  return [pair.token0, pair.token1].map(token => {
    const assetToken = Object.keys(assets).find(
      address => assets[address].symbol === token.symbol
    );
    return {
      address: assetToken && assets[assetToken].address,
      checksum: assetToken && assets[assetToken].address,
      symbol: assetToken && assets[assetToken].symbol,
      denormWeight:
        token.id === pair.token0.id
          ? raito(pair).reserve0
          : raito(pair).reserve1,
      color: token.id === pair.token0.id ? '#9BE52A' : '#2AC2E5',
      weightPercent:
        token.id === pair.token0.id
          ? raito(pair).percentToken0
          : raito(pair).percentToken1
    };
  });
};

async function getLpTokenPriceUsd(farmConfig) {
  if (farmConfig.poolType !== 'tokens') {
    throw new Error(
      'farmConfig.poolType diff tokens:' + farmConfig.poolAddress
    );
  }
  const poolMetadata = await getPoolMetadata(farmConfig.poolAddress);
  const lpPriceUsd = new BigNumber(poolMetadata.liquidity).div(
    poolMetadata.totalShares
  );
  const poolTokens = poolMetadata.tokens;
  const lpSymbol = poolTokens.reduce(
    (symbol, pool) => symbol + '-' + pool.symbol,
    ''
  );

  return { lpSymbol, lpPriceUsd, poolTokens };
}

async function getLpStableCoinPriceUsd(farmConfig) {
  if (farmConfig.poolType !== 'stablecoins') {
    throw new Error(
      'farmConfig.poolType diff stablecoins:' + farmConfig.poolAddress
    );
  }
  // const provider = await store.getters['account/provider'];
  // const ethPrice = await store.dispatch('getEthPriceForKurve');
  // const pairs = await store.dispatch('getKurveBulkPoolsData', {
  //   provider,
  //   poolAddress: farmConfig.poolAddress,
  //   ethPrice
  // });
  // const poolMetadata = pairs.length > 0 ? pairs[0] : [];
  // const lpPriceUsd = new BigNumber(poolMetadata.reserveUSD).div(
  //   poolMetadata.totalSupply
  // );
  const lpPriceUsd = 2;
  let lpSymbol = '';
  let poolTokens;
  if (
    farmConfig.poolAddress.toLowerCase() ===
    '0x42612b419e31f6a74b81ba627c7d8d5e325d6758'
  ) {
    lpSymbol = '-USDT-BUSD';
    poolTokens = [
      {
        color: '#fafafa',
        decimals: 18,
        denormWeight: '50',
        symbol: 'USDT',
        weightPercent: 50
      },
      {
        color: '#433455',
        decimals: 18,
        denormWeight: '50',
        symbol: 'BUSD',
        weightPercent: 50
      }
    ];
  }
  if (
    farmConfig.poolAddress.toLowerCase() ===
    '0x4a9f3f821590fc22bd682e829656596c29749328'
  ) {
    lpSymbol = '-USDC-BUSD';
    poolTokens = [
      {
        color: '#fafafa',
        decimals: 18,
        denormWeight: '50',
        symbol: 'USDC',
        weightPercent: 50
      },
      {
        color: '#433455',
        decimals: 18,
        denormWeight: '50',
        symbol: 'BUSD',
        weightPercent: 50
      }
    ];
  }
  if (
    farmConfig.poolAddress.toLowerCase() ===
    '0xb05697b07e87e57d96ff9802869a410ad6162777'
  ) {
    lpSymbol = '-USDT-USDC';
    poolTokens = [
      {
        color: '#fafafa',
        decimals: 18,
        denormWeight: '50',
        symbol: 'USDT',
        weightPercent: 50
      },
      {
        color: '#433455',
        decimals: 18,
        denormWeight: '50',
        symbol: 'USDC',
        weightPercent: 50
      }
    ];
  }
  // const poolTokens = getTokenInfo(poolMetadata);
  // const lpSymbol = poolTokens.reduce(
  //   (symbol, pool) => symbol + '-' + pool.symbol,
  //   ''
  // );
  return { lpSymbol, lpPriceUsd, poolTokens };
}

export async function getLpPriceUsd(farmConfig) {
  if (farmConfig.lpAddresses === config.addresses.buniFarm) {
    // TODO price buni
    return {
      lpSymbol: 'buni',
      lpPriceUsd: await getBuniPrice(),
      poolTokens: ['buni']
    };
  }
  if (farmConfig.lpAddresses === config.addresses.burFarm) {
    // TODO price buni
    return {
      lpSymbol: 'bur',
      lpPriceUsd: await getBurPrice(),
      poolTokens: ['bur']
    };
  }
  if (farmConfig.poolType === 'stablecoins') {
    return await getLpStableCoinPriceUsd(farmConfig);
  }
  if (farmConfig.poolType === 'tokens') {
    return await getLpTokenPriceUsd(farmConfig);
  }
  throw new Error('poolType not support:' + farmConfig.poolType);
}

export async function fetchFarmData() {
  console.time(`[API] Fetched farm data success`);
  const data = await Promise.all(
    farmsConfig.map(async farmConfig => {
      const lpAddress = farmConfig.lpAddresses;
      const calls = [
        {
          address: lpAddress,
          name: 'balanceOf',
          params: [getMasterChefAddress(farmConfig.pid)]
        }
      ];
      console.time(`[API] Fetched farm ${lpAddress} lpTokenBalanceMC success`);
      const [lpTokenBalanceMC] = await multicall(
        provider,
        abi['LPErc20'],
        calls
      );

      console.timeEnd(
        `[API] Fetched farm ${lpAddress} lpTokenBalanceMC success`
      );
      console.time(`[API] Fetched farm ${lpAddress} totalAllocPoint success`);
      const [info, totalAllocPoint] = await multicall(
        provider,
        abi['MasterChef'],
        [
          {
            address: getMasterChefAddress(farmConfig.pid),
            name: 'poolInfo',
            params: [farmConfig.pid]
          },
          {
            address: getMasterChefAddress(farmConfig.pid),
            name: 'totalAllocPoint'
          }
        ]
      );
      console.timeEnd(
        `[API] Fetched farm ${lpAddress} totalAllocPoint success`
      );
      const { lpSymbol, lpPriceUsd, poolTokens } = await getLpPriceUsd(
        farmConfig
      );
      const allocPoint = new BigNumber(info.allocPoint._hex);
      const poolWeight = allocPoint.div(new BigNumber(totalAllocPoint));
      return {
        ...farmConfig,
        lpSymbol,
        lpPriceUsd: new BigNumber(lpPriceUsd).toFixed(5),
        poolTokens,
        poolWeight: poolWeight.toJSON(),
        multiplier: `${allocPoint.div(100).toString()}X`,
        myStake: new BigNumber(lpPriceUsd)
          .multipliedBy(lpTokenBalanceMC)
          .toFixed(0)
      };
    })
  );
  console.timeEnd(`[API] Fetched farm data success`);
  return data;
}

export async function getBonusMultiplier() {
  const masterChefAdress = config.addresses.masterChef;

  const calls = [
    {
      address: masterChefAdress,
      name: 'BONUS_MULTIPLIER',
      params: []
    }
  ];

  let bonusMultipliers = await multicall(provider, abi['MasterChef'], calls);
  bonusMultipliers = bonusMultipliers.map(bonusMultiplier => {
    return new BigNumber(bonusMultiplier).toJSON();
  });
  return bonusMultipliers[0];
}

export async function getMaxMint() {
  const masterChefAdress = config.addresses.masterChef;

  const calls = [
    {
      address: masterChefAdress,
      name: 'MAX_MINT',
      params: []
    }
  ];

  let maxMints = await multicall(provider, abi['MasterChef'], calls);
  maxMints = maxMints.map(maxMint => {
    return new BigNumber(maxMint).toJSON();
  });
  return maxMints[0];
}

export async function getTotalMint() {
  const masterChefAdress = config.addresses.masterChef;

  const calls = [
    {
      address: masterChefAdress,
      name: 'totalMint',
      params: []
    }
  ];

  let totalMints = await multicall(provider, abi['MasterChef'], calls);
  totalMints = totalMints.map(totalMint => {
    return new BigNumber(totalMint).toJSON();
  });
  return totalMints[0];
}

export async function getThresholdEpic(userAddress) {
  const res = await axios.get(
    `${config.nftMetadataDebugUrl}/threshold-epic/${userAddress}`
  );

  console.log('threshold epic', res.data && res.data.thresholdAmount);

  return res.data && res.data.thresholdAmount;
}
