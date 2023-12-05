import abi from '@/helpers/abi';
import BigNumber from 'bignumber.js';
import provider from '@/helpers/provider';
import config from '../config';
import { multicall } from '@/_balancer/utils';
import { getLpPriceUsd } from '@/helpers/farm';
import Vue from 'vue';
const prestakings = config.prestaking;

export async function fetchUserEarnings(account) {
  const calls = prestakings.map(prestaking => {
    return {
      address: prestaking.preStakingAddress,
      name: 'earned',
      params: [account]
    };
  });

  const rawEarnings = await multicall(provider, abi['StakingReward'], calls);
  const parsedEarnings = rawEarnings.map(earnings => {
    return new BigNumber(earnings).toJSON();
  });
  return parsedEarnings;
}

export async function fetchUserClaimable(account) {
  const calls = prestakings.map(prestaking => {
    return {
      address: prestaking.preStakingAddress,
      name: 'availableReward',
      params: [account]
    };
  });

  const rawEarnings = await multicall(provider, abi['StakingReward'], calls);
  const parsedEarnings = rawEarnings.map(earnings => {
    return new BigNumber(earnings).toJSON();
  });
  return parsedEarnings;
}

export async function fetchUserAllowances(account) {
  const calls = prestakings.map(prestaking => {
    const lpContractAddress = prestaking.lpAddress;
    return {
      address: lpContractAddress,
      name: 'allowance',
      params: [account, prestaking.preStakingAddress]
    };
  });

  const rawLpAllowances = await multicall(provider, abi['ERC20'], calls);
  const parsedLpAllowances = rawLpAllowances.map(lpBalance => {
    return new BigNumber(lpBalance).toJSON();
  });
  return parsedLpAllowances;
}

export async function fetchUserTokenBalances(account) {
  const calls = prestakings.map(prestaking => {
    const lpContractAddress = prestaking.lpAddress;
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
  return parsedTokenBalances;
}

export async function fetchUserStakedBalances(account) {
  const calls = prestakings.map(prestaking => {
    return {
      address: prestaking.preStakingAddress,
      name: 'balanceOf',
      params: [account]
    };
  });
  const rawStakedBalances = await multicall(
    provider,
    abi['StakingReward'],
    calls
  );
  const parsedStakedBalances = rawStakedBalances.map(stakedBalance => {
    return new BigNumber(stakedBalance[0]._hex).toJSON();
  });
  return parsedStakedBalances;
}

export async function fetchPreStakingUserData(account) {
  try {
    const userFarmTokenBalances = await fetchUserTokenBalances(account);
    const userStakedBalances = await fetchUserStakedBalances(account);
    const userFarmEarnings = await fetchUserEarnings(account);
    const userClaimable = await fetchUserClaimable(account);

    const arrayOfUserDataObjects = prestakings.map((prestaking, index) => {
      return {
        index,
        tokenBalance: userFarmTokenBalances[index],
        stakedBalance: userStakedBalances[index],
        earnings: userFarmEarnings[index],
        claimable: userClaimable[index]
      };
    });
    return { arrayOfUserDataObjects };
  } catch (e) {
    console.error('fetchPreStakingUserData error', e);
    // Vue.prototype.$mixpanel.track('fetchPreStakingUserData', {
    //   message: 'fetchPreStakingUserData error',
    //   exception: JSON.stringify(e)
    // });
  }
}

export async function fetchPreStakingData() {
  try {
    const data = await Promise.all(
      prestakings.map(async prestaking => {
        const preStakingAddress = prestaking.preStakingAddress;
        const lpAddress = prestaking.lpAddress;

        const [lpTokenBalanceMC] = await multicall(provider, abi['LPErc20'], [
          {
            address: lpAddress,
            name: 'balanceOf',
            params: [preStakingAddress]
          }
        ]);

        // eslint-disable-next-line prefer-const
        let [rewardAmount, rewardsDuration, periodFinish] = await multicall(
          provider,
          abi['StakingReward'],
          [
            {
              address: preStakingAddress,
              name: 'getRewardForDuration',
              params: []
            },
            {
              address: preStakingAddress,
              name: 'rewardDuration',
              params: []
            },
            {
              address: preStakingAddress,
              name: 'periodFinish',
              params: []
            }
          ]
        );

        // eslint-disable-next-line prefer-const
        rewardAmount = new BigNumber(rewardAmount[0]._hex).toString();

        if (new BigNumber(rewardAmount).isZero()) {
          const [info] = await multicall(
            provider,
            abi['StakingRewardFactory'],
            [
              {
                address: config.addresses.preStakingFactory,
                name: 'stakingRewardInfosByStakingToken',
                params: [prestaking.lpAddress]
              }
            ]
          );
          let [
            // eslint-disable-next-line prefer-const
            _stakingRewards,
            _rewardAmount,
            // eslint-disable-next-line prefer-const
            _rewardsDuration,
            // eslint-disable-next-line prefer-const
            _vestingPeriod,
            // eslint-disable-next-line prefer-const
            _claimable
          ] = info;

          _rewardAmount = new BigNumber(_rewardAmount._hex).toJSON();
          rewardAmount = _rewardAmount;
        }
        rewardsDuration = new BigNumber(rewardsDuration[0]._hex).toString();

        const { lpSymbol, lpPriceUsd, poolTokens } = await getLpPriceUsd({
          lpAddresses: prestaking.preStakingAddress,
          poolAddress: prestaking.lpAddress,
          poolType: prestaking.poolType
        });
        return {
          ...prestaking,
          lpSymbol,
          preStaking: {
            rewardAmount,
            rewardsDuration,
            periodFinish
          },
          lpPriceUsd: new BigNumber(lpPriceUsd).toFixed(5),
          poolTokens,
          myStake: new BigNumber(lpPriceUsd)
            .multipliedBy(lpTokenBalanceMC)
            .toFixed(0)
        };
      })
    );
    return data;
  } catch (e) {
    console.error('fetchPreStakingData error', e);
    // Vue.prototype.$mixpanel.track('fetchPreStakingData', {
    //   message: 'fetchPreStakingUserData error',
    //   exception: JSON.stringify(e)
    // });
  }
}
