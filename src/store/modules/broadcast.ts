import config from '@/config';
import {
  bnum,
  denormalizeBalance,
  MAX_UINT,
  toWei,
  shortenAddress
} from '@/helpers/utils';
import BigNumber from '@/helpers/bignumber';
import BlockchainHelper from '@/helpers/BlockchainHelper';
import { setGoal } from '@/helpers/fathom';

const mutations = {
  CREATE_PROXY_REQUEST() {
    console.debug('CREATE_PROXY_REQUEST');
  },
  CREATE_PROXY_SUCCESS() {
    console.debug('CREATE_PROXY_SUCCESS');
  },
  CREATE_PROXY_FAILURE(_state, payload) {
    console.debug('CREATE_PROXY_FAILURE', payload);
  },
  CREATE_POOL_REQUEST() {
    console.debug('CREATE_POOL_REQUEST');
  },
  CREATE_POOL_SUCCESS() {
    console.debug('CREATE_POOL_SUCCESS');
  },
  CREATE_POOL_FAILURE(_state, payload) {
    console.debug('CREATE_POOL_FAILURE', payload);
  },
  CREATE_SMART_POOL_REQUEST() {
    console.debug('CREATE_SMART_POOL_REQUEST');
  },
  CREATE_SMART_POOL_SUCCESS() {
    console.debug('CREATE_SMART_POOL_SUCCESS');
  },
  CREATE_SMART_POOL_FAILURE(_state, payload) {
    console.debug('CREATE_SMART_POOL_FAILURE', payload);
  },
  JOIN_POOL_REQUEST() {
    console.debug('JOIN_POOL_REQUEST');
  },
  JOIN_POOL_SUCCESS() {
    console.debug('JOIN_POOL_SUCCESS');
  },
  JOIN_POOL_FAILURE(_state, payload) {
    console.debug('JOIN_POOL_FAILURE', payload);
  },
  JOINSWAP_EXTERN_AMOUNT_REQUEST() {
    console.debug('JOINSWAP_EXTERN_AMOUNT_REQUEST');
  },
  JOINSWAP_EXTERN_AMOUNT_SUCCESS() {
    console.debug('JOINSWAP_EXTERN_AMOUNT_SUCCESS');
  },
  JOINSWAP_EXTERN_AMOUNT_FAILURE(_state, payload) {
    console.debug('JOINSWAP_EXTERN_AMOUNT_FAILURE', payload);
  },
  EXIT_POOL_REQUEST() {
    console.debug('EXIT_POOL_REQUEST');
  },
  EXIT_POOL_SUCCESS() {
    console.debug('EXIT_POOL_SUCCESS');
  },
  EXIT_POOL_FAILURE(_state, payload) {
    console.debug('EXIT_POOL_FAILURE', payload);
  },
  EXITSWAP_POOL_AMOUNT_IN_REQUEST() {
    console.debug('EXITSWAP_POOL_AMOUNT_IN_REQUEST');
  },
  EXITSWAP_POOL_AMOUNT_IN_SUCCESS() {
    console.debug('EXITSWAP_POOL_AMOUNT_IN_SUCCESS');
  },
  EXITSWAP_POOL_AMOUNT_IN_FAILURE(_state, payload) {
    console.debug('EXITSWAP_POOL_AMOUNT_IN_FAILURE', payload);
  },
  SET_PUBLIC_SWAP_REQUEST() {
    console.debug('SET_PUBLIC_SWAP_REQUEST');
  },
  SET_PUBLIC_SWAP_SUCCESS() {
    console.debug('SET_PUBLIC_SWAP_SUCCESS');
  },
  SET_PUBLIC_SWAP_FAILURE(_state, payload) {
    console.debug('SET_PUBLIC_SWAP_FAILURE', payload);
  },
  SET_SWAP_FEE_REQUEST() {
    console.debug('SET_SWAP_FEE_REQUEST');
  },
  SET_SWAP_FEE_SUCCESS() {
    console.debug('SET_SWAP_FEE_SUCCESS');
  },
  SET_SWAP_FEE_FAILURE(_state, payload) {
    console.debug('SET_SWAP_FEE_FAILURE', payload);
  },
  POKE_WEIGHTS_REQUEST() {
    console.debug('POKE_WEIGHTS_REQUEST');
  },
  POKE_WEIGHTS_SUCCESS() {
    console.debug('POKE_WEIGHTS_SUCCESS');
  },
  POKE_WEIGHTS_FAILURE(_state, payload) {
    console.debug('POKE_WEIGHTS_FAILURE', payload);
  },
  SET_CONTROLLER_REQUEST() {
    console.debug('SET_CONTROLLER_REQUEST');
  },
  SET_CONTROLLER_SUCCESS() {
    console.debug('SET_CONTROLLER_SUCCESS');
  },
  SET_CONTROLLER_FAILURE(_state, payload) {
    console.debug('SET_CONTROLLER_FAILURE', payload);
  },
  INCREASE_WEIGHT_REQUEST() {
    console.debug('INCREASE_WEIGHT_REQUEST');
  },
  INCREASE_WEIGHT_SUCCESS() {
    console.debug('INCREASE_WEIGHT_SUCCESS');
  },
  INCREASE_WEIGHT_FAILURE(_state, payload) {
    console.debug('INCREASE_WEIGHT_FAILURE', payload);
  },
  DECREASE_WEIGHT_REQUEST() {
    console.debug('DECREASE_WEIGHT_REQUEST');
  },
  DECREASE_WEIGHT_SUCCESS() {
    console.debug('DECREASE_WEIGHT_SUCCESS');
  },
  DECREASE_WEIGHT_FAILURE(_state, payload) {
    console.debug('DECREASE_WEIGHT_FAILURE', payload);
  },
  UPDATE_WEIGHTS_GRADUALLY_REQUEST() {
    console.debug('UPDATE_WEIGHTS_GRADUALLY_REQUEST');
  },
  UPDATE_WEIGHTS_GRADUALLY_SUCCESS() {
    console.debug('UPDATE_WEIGHTS_GRADUALLY_SUCCESS');
  },
  UPDATE_WEIGHTS_GRADUALLY_FAILURE(_state, payload) {
    console.debug('UPDATE_WEIGHTS_GRADUALLY_FAILURE', payload);
  },
  SET_CAP_REQUEST() {
    console.debug('SET_CAP_REQUEST');
  },
  SET_CAP_SUCCESS() {
    console.debug('SET_CAP_SUCCESS');
  },
  SET_CAP_FAILURE(_state, payload) {
    console.debug('SET_CAP_FAILURE', payload);
  },
  COMMIT_ADD_TOKEN_REQUEST() {
    console.debug('COMMIT_ADD_TOKEN_REQUEST');
  },
  COMMIT_ADD_TOKEN_SUCCESS() {
    console.debug('COMMIT_ADD_TOKEN_SUCCESS');
  },
  COMMIT_ADD_TOKEN_FAILURE(_state, payload) {
    console.debug('COMMIT_ADD_TOKEN_FAILURE', payload);
  },
  APPLY_ADD_TOKEN_REQUEST() {
    console.debug('APPLY_ADD_TOKEN_REQUEST');
  },
  APPLY_ADD_TOKEN_SUCCESS() {
    console.debug('APPLY_ADD_TOKEN_SUCCESS');
  },
  APPLY_ADD_TOKEN_FAILURE(_state, payload) {
    console.debug('APPLY_ADD_TOKEN_FAILURE', payload);
  },
  REMOVE_TOKEN_REQUEST() {
    console.debug('REMOVE_TOKEN_REQUEST');
  },
  REMOVE_TOKEN_SUCCESS() {
    console.debug('REMOVE_TOKEN_SUCCESS');
  },
  REMOVE_TOKEN_FAILURE(_state, payload) {
    console.debug('REMOVE_TOKEN_FAILURE', payload);
  },
  WHITELIST_LP_REQUEST() {
    console.debug('WHITELIST_LP_REQUEST');
  },
  WHITELIST_LP_SUCCESS() {
    console.debug('WHITELIST_LP_SUCCESS');
  },
  WHITELIST_LP_FAILURE(_state, payload) {
    console.debug('WHITELIST_LP_FAILURE', payload);
  },
  REMOVE_WHITELISTED_LP_REQUEST() {
    console.debug('REMOVE_WHITELISTED_LP_REQUEST');
  },
  REMOVE_WHITELISTED_LP_SUCCESS() {
    console.debug('REMOVE_WHITELISTED_LP_SUCCESS');
  },
  REMOVE_WHITELISTED_LP_FAILURE(_state, payload) {
    console.debug('REMOVE_WHITELISTED_LP_FAILURE', payload);
  },
  APPROVE_REQUEST() {
    console.debug('APPROVE_REQUEST');
  },
  APPROVE_SUCCESS() {
    console.debug('APPROVE_SUCCESS');
  },
  APPROVE_FAILURE(_state, payload) {
    console.debug('APPROVE_FAILURE', payload);
  },
  WRAP_ETH_REQUEST() {
    console.debug('WRAP_ETH_REQUEST');
  },
  WRAP_ETH_SUCCESS() {
    console.debug('WRAP_ETH_SUCCESS');
  },
  WRAP_ETH_FAILURE(_state, payload) {
    console.debug('WRAP_ETH_FAILURE', payload);
  },
  UNWRAP_ETH_REQUEST() {
    console.debug('UNWRAP_ETH_REQUEST');
  },
  UNWRAP_ETH_SUCCESS() {
    console.debug('UNWRAP_ETH_SUCCESS');
  },
  UNWRAP_ETH_FAILURE(_state, payload) {
    console.debug('UNWRAP_ETH_FAILURE', payload);
  }
};

const actions = {
  createProxy: async ({ commit, dispatch }) => {
    commit('CREATE_PROXY_REQUEST');
    try {
      const params = [
        'DSProxyRegistry',
        config.kalancer.addresses.dsProxyRegistry,
        'build',
        [],
        {}
      ];

      console.log('Create proxy', params);

      const tx = await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.createProxy'
      });
      setGoal('EV1XI0VM');
      dispatch('account/getProxy', null, { root: true });
      commit('CREATE_PROXY_SUCCESS');
      return tx;
    } catch (e) {
      commit('CREATE_PROXY_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  createPool: async (
    { commit, dispatch, rootState },
    { tokens, balances, weights, swapFee }
  ) => {
    commit('CREATE_POOL_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      balances = tokens.map(token => {
        const amountInput = balances[token];
        const amount = bnum(amountInput);
        const tokenMetadata = rootState.networkdata.tokenMetadata[token];
        const decimals = tokenMetadata ? tokenMetadata.decimals : null;
        return denormalizeBalance(amount, decimals)
          .integerValue(BigNumber.ROUND_DOWN)
          .toString();
      });
      swapFee = toWei(swapFee)
        .div(100)
        .toString();
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'create',
        [
          config.kalancer.addresses.bFactory,
          tokens,
          balances,
          weights,
          swapFee,
          true
        ],
        {}
      ];
      console.log(
        'Create shared pool',
        dsProxyAddress,
        JSON.stringify(underlyingParams)
      );
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );
      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.createPool'
      });
      await Promise.all([
        dispatch('account/getBalances'),
        dispatch('getUserPoolShares')
      ]);

      setGoal('MGYMGNXQ');
      commit('CREATE_POOL_SUCCESS');
    } catch (e) {
      commit('CREATE_POOL_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  createSmartPool: async (
    { commit, dispatch, rootState },
    { poolParams, crpParams, rights }
  ) => {
    commit('CREATE_SMART_POOL_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    const {
      poolTokenSymbol,
      poolTokenName,
      constituentTokens,
      tokenWeights
    } = poolParams;
    let { tokenBalances, swapFee } = poolParams;
    let { initialSupply } = crpParams;
    const {
      minimumWeightChangeBlockPeriod,
      addTokenTimeLockInBlocks
    } = crpParams;
    try {
      tokenBalances = constituentTokens.map(token => {
        const amountInput = tokenBalances[token];
        const amount = bnum(amountInput);
        const tokenMetadata = rootState.networkdata.tokenMetadata[token];
        const decimals = tokenMetadata ? tokenMetadata.decimals : null;
        return denormalizeBalance(amount, decimals)
          .integerValue(BigNumber.ROUND_DOWN)
          .toString();
      });
      swapFee = toWei(swapFee)
        .div(100)
        .toString();
      poolParams = {
        poolTokenSymbol,
        poolTokenName,
        constituentTokens,
        tokenBalances,
        tokenWeights,
        swapFee
      };
      initialSupply = toWei(initialSupply).toString();
      crpParams = {
        initialSupply,
        minimumWeightChangeBlockPeriod,
        addTokenTimeLockInBlocks
      };

      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'createSmartPool',
        [
          config.kalancer.addresses.crpFactory,
          config.kalancer.addresses.bFactory,
          poolParams,
          crpParams,
          rights
        ],
        {}
      ];
      console.log(
        'Create smart pool',
        dsProxyAddress,
        JSON.stringify(underlyingParams)
      );
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );
      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.createSmartPool',
        confirmation: 6
      });
      await Promise.all([
        dispatch('account/getBalances'),
        dispatch('getUserPoolShares')
      ]);

      setGoal('H854WJCE');
      commit('CREATE_SMART_POOL_SUCCESS');
    } catch (e) {
      commit('CREATE_SMART_POOL_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  joinPool: async (
    { commit, dispatch, rootState },
    { poolAddress, poolAmountOut, maxAmountsIn, isCrp = false }
  ) => {
    commit('JOIN_POOL_REQUEST');
    try {
      const dsProxyAddress = rootState.account.proxy;
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        isCrp ? 'joinSmartPool' : 'joinPool',
        [poolAddress, poolAmountOut, maxAmountsIn],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Join pool', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.addLiquidity'
      });
      await Promise.all([
        dispatch('account/getBalances'),
        dispatch('getUserPoolShares')
      ]);
      setGoal('OJGWYYDX');
      commit('JOIN_POOL_SUCCESS');
    } catch (e) {
      commit('JOIN_POOL_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  joinswapExternAmountIn: async (
    { commit, dispatch, rootState },
    { poolAddress, tokenInAddress, tokenAmountIn, minPoolAmountOut }
  ) => {
    commit('JOINSWAP_EXTERN_AMOUNT_REQUEST');
    try {
      const dsProxyAddress = rootState.account.proxy;
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'joinswapExternAmountIn',
        [poolAddress, tokenInAddress, tokenAmountIn, minPoolAmountOut],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Join swap extern amount in', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.addLiquidity'
      });
      await Promise.all([
        dispatch('account/getBalances'),
        dispatch('getUserPoolShares')
      ]);
      setGoal('VW5X6ROK');
      commit('JOINSWAP_EXTERN_AMOUNT_SUCCESS');
    } catch (e) {
      commit('JOINSWAP_EXTERN_AMOUNT_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  exitPool: async (
    { commit, dispatch },
    { poolAddress, poolAmountIn, minAmountsOut }
  ) => {
    commit('EXIT_POOL_REQUEST');
    try {
      const params = [
        'BPool',
        poolAddress,
        'exitPool',
        [toWei(poolAmountIn).toString(), minAmountsOut],
        {}
      ];

      console.log('Exit pool', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.removeLiquidity'
      });
      await Promise.all([
        dispatch('account/getBalances'),
        dispatch('getUserPoolShares')
      ]);
      setGoal('WL0NJSJZ');
      commit('EXIT_POOL_SUCCESS');
    } catch (e) {
      commit('EXIT_POOL_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  exitswapPoolAmountIn: async (
    { commit, dispatch },
    { poolAddress, tokenOutAddress, poolAmountIn, minTokenAmountOut }
  ) => {
    commit('EXITSWAP_POOL_AMOUNT_IN_REQUEST');
    try {
      const params = [
        'BPool',
        poolAddress,
        'exitswapPoolAmountIn',
        [tokenOutAddress, toWei(poolAmountIn).toString(), minTokenAmountOut],
        {}
      ];

      console.log('Exit swap pool amount in', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.removeLiquidity'
      });
      await Promise.all([
        dispatch('account/getBalances'),
        dispatch('getUserPoolShares')
      ]);
      setGoal('IFE3QZMO');
      commit('EXITSWAP_POOL_AMOUNT_IN_SUCCESS');
    } catch (e) {
      commit('EXITSWAP_POOL_AMOUNT_IN_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  setPublicSwap: async (
    { commit, dispatch, rootState },
    { poolAddress, publicSwap }
  ) => {
    commit('SET_PUBLIC_SWAP_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'setPublicSwap',
        [poolAddress, publicSwap],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Set public swap', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.editPublicSwap'
      });
      commit('SET_PUBLIC_SWAP_SUCCESS');
    } catch (e) {
      commit('SET_PUBLIC_SWAP_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  setSwapFee: async (
    { commit, dispatch, rootState },
    { poolAddress, newFee }
  ) => {
    commit('SET_SWAP_FEE_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      newFee = toWei(newFee)
        .div(100)
        .toString();
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'setSwapFee',
        [poolAddress, newFee],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Set swap fee', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.setSwapFee'
      });
      commit('SET_SWAP_FEE_SUCCESS');
    } catch (e) {
      commit('SET_SWAP_FEE_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  pokeWeights: async ({ commit, dispatch }, { poolAddress }) => {
    commit('POKE_WEIGHTS_REQUEST');
    try {
      const params = [
        'ConfigurableRightsPool',
        poolAddress,
        'pokeWeights',
        [],
        {}
      ];

      console.log('Poke weight', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.pokeWeight'
      });

      commit('POKE_WEIGHTS_SUCCESS');
    } catch (e) {
      commit('POKE_WEIGHTS_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  setController: async (
    { commit, dispatch, rootState },
    { poolAddress, newController }
  ) => {
    commit('SET_CONTROLLER_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'setController',
        [poolAddress, newController],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Set controller', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.setController'
      });
      commit('SET_CONTROLLER_SUCCESS');
    } catch (e) {
      commit('SET_CONTROLLER_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  increaseWeight: async (
    { commit, dispatch, rootState },
    { poolAddress, token, newWeight, tokenAmountIn }
  ) => {
    commit('INCREASE_WEIGHT_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      newWeight = toWei(newWeight).toString();
      const tokenMetadata = rootState.networkdata.tokenMetadata[token];
      const decimals = tokenMetadata ? tokenMetadata.decimals : null;
      tokenAmountIn = denormalizeBalance(tokenAmountIn, decimals)
        .integerValue(BigNumber.ROUND_DOWN)
        .toString();
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'increaseWeight',
        [poolAddress, token, newWeight, tokenAmountIn],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log(
        'Increase weight',
        JSON.stringify(params),
        'underlyingParams',
        JSON.stringify(underlyingParams)
      );

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.increaseWeight'
      });
      commit('INCREASE_WEIGHT_SUCCESS');
    } catch (e) {
      commit('INCREASE_WEIGHT_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  decreaseWeight: async (
    { commit, dispatch, rootState },
    { poolAddress, token, newWeight, poolWeiAmountIn }
  ) => {
    commit('DECREASE_WEIGHT_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      newWeight = toWei(newWeight).toString();
      const poolAmountIn = poolWeiAmountIn;
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'decreaseWeight',
        [poolAddress, token, newWeight, poolAmountIn.toString()],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log(
        'Decrease weight',
        JSON.stringify(params),
        'underlyingParams',
        JSON.stringify(underlyingParams)
      );

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.decreaseWeight'
      });
      commit('DECREASE_WEIGHT_SUCCESS');
    } catch (e) {
      commit('DECREASE_WEIGHT_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  updateWeightsGradually: async (
    { commit, dispatch, rootState },
    { poolAddress, tokens, newWeights, startBlock, endBlock }
  ) => {
    commit('UPDATE_WEIGHTS_GRADUALLY_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      newWeights = tokens.map(token => {
        return toWei(newWeights[token]).toString();
      });
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'updateWeightsGradually',
        [poolAddress, newWeights, startBlock, endBlock],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log(
        'Update gradual weights',
        JSON.stringify(params),
        'underlyingParams',
        JSON.stringify(underlyingParams)
      );

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.updateWeightsGradually'
      });
      commit('UPDATE_WEIGHTS_GRADUALLY_SUCCESS');
    } catch (e) {
      commit('UPDATE_WEIGHTS_GRADUALLY_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  setCap: async ({ commit, dispatch, rootState }, { poolAddress, newCap }) => {
    commit('SET_CAP_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      newCap = toWei(newCap).toString();
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'setCap',
        [poolAddress, newCap],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Set cap', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.setCap'
      });
      commit('SET_CAP_SUCCESS');
    } catch (e) {
      commit('SET_CAP_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  commitAddToken: async (
    { commit, dispatch, rootState },
    { poolAddress, token, balance, denormalizedWeight }
  ) => {
    commit('COMMIT_ADD_TOKEN_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      const tokenMetadata = rootState.networkdata.tokenMetadata[token];
      const decimals = tokenMetadata ? tokenMetadata.decimals : null;
      balance = denormalizeBalance(balance, decimals)
        .integerValue(BigNumber.ROUND_DOWN)
        .toString();
      denormalizedWeight = toWei(denormalizedWeight).toString();
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'commitAddToken',
        [poolAddress, token, balance, denormalizedWeight],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Commit adding token', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.commitAddToken'
      });
      commit('COMMIT_ADD_TOKEN_SUCCESS');
    } catch (e) {
      commit('COMMIT_ADD_TOKEN_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  applyAddToken: async (
    { commit, dispatch, rootState },
    { poolAddress, token, tokenAmountIn }
  ) => {
    commit('APPLY_ADD_TOKEN_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'applyAddToken',
        [poolAddress, token, tokenAmountIn],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Applying adding token', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.applyAddToken'
      });
      commit('APPLY_ADD_TOKEN_SUCCESS');
    } catch (e) {
      commit('APPLY_ADD_TOKEN_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  removeToken: async (
    { commit, dispatch, rootState },
    { poolAddress, token, poolAmountIn }
  ) => {
    commit('REMOVE_TOKEN_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    console.log(`poolAddress = ${poolAddress}`);
    console.log(`token = ${token}`);
    console.log(`poolAmountIn = ${poolAmountIn}`);

    try {
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'removeToken',
        [poolAddress, token, poolAmountIn.toString()],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Remove token', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.removeTokens'
      });
      commit('REMOVE_TOKEN_SUCCESS');
    } catch (e) {
      commit('REMOVE_TOKEN_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  whitelistLiquidityProvider: async (
    { commit, dispatch, rootState },
    { poolAddress, provider }
  ) => {
    commit('WHITELIST_LP_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'whitelistLiquidityProvider',
        [poolAddress, provider],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Whitelist liquidity provider', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.whitelistLiquidity'
      });
      commit('WHITELIST_LP_SUCCESS');
    } catch (e) {
      commit('WHITELIST_LP_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  removeWhitelistedLiquidityProvider: async (
    { commit, dispatch, rootState },
    { poolAddress, provider }
  ) => {
    commit('REMOVE_WHITELISTED_LP_REQUEST');
    const dsProxyAddress = rootState.account.proxy;
    try {
      const underlyingParams = [
        'BActions',
        config.kalancer.addresses.bActions,
        'removeWhitelistedLiquidityProvider',
        [poolAddress, provider],
        {}
      ];
      const params = BlockchainHelper.makeProxyTransaction(
        dsProxyAddress,
        underlyingParams
      );

      console.log('Remove whitelisted liquidity provider', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.removeWhitelistLiquidity'
      });
      commit('REMOVE_WHITELISTED_LP_SUCCESS');
    } catch (e) {
      commit('REMOVE_WHITELISTED_LP_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  approve: async ({ commit, dispatch, rootState }, payload) => {
    commit('APPROVE_REQUEST');
    const spender = payload.spender || rootState.account.proxy;
    const tokenMetadata = rootState.networkdata.tokenMetadata[payload.token];
    const symbol = tokenMetadata
      ? tokenMetadata.symbol
      : shortenAddress(payload.token);
    try {
      const params = [
        'TestToken',
        payload.token,
        'approve',
        [spender, MAX_UINT.toString()],
        {}
      ];

      console.log('Approve', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.approve',
        confirmation: 4,
        symbol: symbol
      });
      dispatch('account/getPoolAllowances', [payload.token]);
      setGoal('R4TD1ELX');
      commit('APPROVE_SUCCESS');
    } catch (e) {
      console.log('e', e);
      commit('APPROVE_FAILURE', e);
      throw dispatch('transactions/handleTransactionError', e);
    }
  },
  wrap: async ({ commit, dispatch }, amount) => {
    commit('WRAP_ETH_REQUEST');
    try {
      const params = [
        'Weth',
        config.addresses.weth,
        'deposit',
        [],
        { value: toWei(amount).toString() }
      ];

      console.log('Wrap token', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.wrap',
        confirmation: 2,
        symbol: config.systemCoin.symbol
      });
      await dispatch('account/getBalances');
      setGoal('KFAFBADQ');
      commit('WRAP_ETH_SUCCESS');
    } catch (e) {
      commit('WRAP_ETH_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  },
  unwrap: async ({ commit, dispatch }, amount) => {
    commit('UNWRAP_ETH_REQUEST');
    try {
      const params = [
        'Weth',
        config.addresses.weth,
        'withdraw',
        [toWei(amount).toString()],
        {}
      ];

      console.log('Unwrap token', params);

      await dispatch('transactions/processTransaction', {
        params,
        title: 'transactionTitles.unwrap',
        confirmation: 2,
        symbol: config.systemCoin.wrap
      });
      await dispatch('account/getBalances');
      setGoal('XSBEFNTT');
      commit('UNWRAP_ETH_SUCCESS');
    } catch (e) {
      commit('UNWRAP_ETH_FAILURE', e);
      return dispatch('transactions/handleTransactionError', e);
    }
  }
};

export default {
  mutations,
  actions
};
