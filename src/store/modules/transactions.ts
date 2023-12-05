import Vue from 'vue';
import BlockchainHelper from '@/helpers/BlockchainHelper';
import provider from '@/helpers/provider';
import Storage from '@/utils/storage';
import i18n from '@/i18n';
import { ErrorCode } from '@ethersproject/logger';
import config from '@/config';
import { getEtherscanLink } from '@/utils/helpers';
import { isTxRejected } from '@/helpers/utils';
// import * as Sentry from '@sentry/vue';
import BigNumber from 'bignumber.js';

enum TransactionStatus {
  PENDING,
  OK,
  FAILED
}

export interface Transaction {
  title?: string;
  hash: string;
  status: TransactionStatus;
  timestamp: number;
  amount?: string | number;
  symbol?: string;
  symbolIn?: string;
  symbolOut?: string;
}

const state = {
  transactions: {},
  isHandlingTransaction: false
};

const mutations = {
  clearTransactions(_state, { account, chainId }) {
    Vue.set(_state, 'transactions', {});
    Storage.clearTransactions(account, chainId);
  },

  setTransactions(state, transactions) {
    state.transactions = transactions;
  },

  setTransaction(state, { updateTransaction, account, chainId }) {
    Vue.set(state.transactions, updateTransaction.hash, updateTransaction);
    Storage.saveTransaction(account, chainId, updateTransaction);
  },
  updateLoadingTransaction: (_state, status): void => {
    _state.isHandlingTransaction = status;
  }
};

const getters = {
  myPendingTransactions: state => {
    const expiresIn = 60 * 60 * 24;
    const now = Math.round(new Date().getTime() / 1000);

    return Object.values(state.transactions).filter(
      (tx: any) => !tx.status && tx.timestamp > now - expiresIn
    );
  }
};

const actions = {
  async processTransaction(
    { dispatch, rootGetters },
    { params, title, confirmation = 2, symbol = null }
  ) {
    console.log(
      'Send transaction',
      JSON.stringify({
        title,
        params,
        confirmation
    }));
    const accountProvider = await rootGetters['account/provider'];
    const tx = await BlockchainHelper.sendTransaction(accountProvider, params);

    tx.symbol = symbol;

    console.log('Watch transaction', tx);

    await dispatch('handleTransaction', {
      transaction: tx,
      titleKey: title,
      titleParams: {
        symbol
      },
      confirmation
    });

    return tx;
  },
  async checkPendingTransactions({ getters, dispatch }) {
    getters.myPendingTransactions.forEach(tx => {
      provider.waitForTransaction(tx.hash, 2).then(receipt => {
        console.log('waitForTransaction', receipt);
        dispatch('confirmTransaction', receipt);
      });
    });
    return;
  },

  clearTransactions({ commit, rootState }) {
    const account = rootState.account.address;
    const chainId = rootState.account.chainId;

    commit('clearTransactions', {
      account,
      chainId
    });
  },

  getTransactions({ commit, rootState }) {
    const account = rootState.account.address;
    const chainId = rootState.account.chainId;
    const transactions = Storage.getTransactions(account, chainId);
    commit('setTransactions', transactions);
  },

  saveTransaction({ commit, state, rootState }, transaction: Transaction) {
    const hash = transaction.hash;
    const account = rootState.account.address;
    const chainId = rootState.account.chainId;
    const currentTransaction = state.transactions[hash] || {};

    const updateTransaction = Object.assign({}, currentTransaction, {
      title: transaction.title,
      hash: hash,
      status: TransactionStatus.PENDING,
      timestamp: Date.now(),
      amount: transaction.amount,
      symbol: transaction.symbol,
      symbolIn: transaction.symbolIn,
      symbolOut: transaction.symbolOut
    });

    commit('setTransaction', {
      updateTransaction,
      account,
      chainId
    });
  },

  confirmTransaction({ commit, state, rootState }, receipt) {
    const hash = receipt.transactionHash;
    const account = rootState.account.address;
    const chainId = rootState.account.chainId;
    const currentTransaction = state.transactions[hash] || {};

    const updateTransaction = Object.assign({}, currentTransaction, {
      hash: hash,
      status:
        receipt.status === 1 ? TransactionStatus.OK : TransactionStatus.FAILED,
      timestamp: Date.now(),
      blockHash: receipt.blockHash,
      blockNumber: receipt.blockNumber,
      to: receipt.to
    });

    commit('setTransaction', {
      updateTransaction,
      account,
      chainId
    });
  },

  async handleTransaction(
    { commit, dispatch, rootState },
    { transaction, titleKey, titleParams = {}, confirmation = 2 }
  ) {
    if (!transaction) {
      return null;
    }

    const titleMessage = i18n.t(titleKey + '.title', titleParams);

    commit('updateLoadingTransaction', true);

    if (!transaction.hash) {
      const transactionCode = transaction.code || null;

      if (transactionCode === ErrorCode.UNPREDICTABLE_GAS_LIMIT) {
        dispatch('notify', {
          text: i18n.t('transactionMessages.transactionFail', {
            message: titleMessage
          }),
          type: 'warning',
          link: config.helpUrl
        });
      }
      console.error(
        `Action handle transaction has error code ${transactionCode}:`,
        JSON.stringify(transaction.message)
      );
      return;
    }

    dispatch('saveTransaction', {
      title: titleKey,
      ...transaction
    });
    // try {
    //   if (rootState.account.connector.id === 'ontowallet'
    //     && titleKey === 'transactionTitles.swap') {
    //     Vue.prototype.$mixpanel.track('ONTO_SWAP', {
    //       transactionTitle: titleKey,
    //       transaction: transaction,
    //       symbolIn: transaction.symbolIn,
    //       symbolOut: transaction.symbolOut,
    //       assetInAmount: new BigNumber(transaction.assetInAmount).toString(),
    //       assetOutAmount: new BigNumber(transaction.assetOutAmount).toString(),
    //       connectorId: rootState.account.connector.id
    //     });
    //   }
    // } catch (e) {
    //   console.error(e);
    // }

    const transactionReceipt = await provider.waitForTransaction(
      transaction.hash,
      confirmation
    );

    console.log('waitForTransaction', transactionReceipt);

    dispatch('confirmTransaction', transactionReceipt);

    const type = transactionReceipt.status === 1 ? 'success' : 'error';
    const link = getEtherscanLink(transactionReceipt.transactionHash);

    dispatch(
      'notify',
      {
        text: i18n.t(titleKey + '.' + type, titleParams),
        type,
        link
      },
      {
        root: true
      }
    );
    commit('updateLoadingTransaction', false);

    return transactionReceipt;
  },

  handleTransactionError({ dispatch }, transactionError) {
    let errorKey = 'failureOops';

    if (isTxRejected(transactionError)) {
      errorKey = 'transactionRejected';
      // Vue.prototype.$mixpanel.track('transactionError', {
      //   messageError: errorKey
      // });
    } else {
      console.error('transactionError', transactionError);
      // Sentry.captureMessage(transactionError.message || transactionError.code);
      // Vue.prototype.$mixpanel.track('transactionError', {
      //   messageError: transactionError.message,
      //   messageCode: transactionError.code
      // });
    }

    dispatch('notify', ['error', i18n.tc(errorKey)], {
      root: true
    });

    return transactionError;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
};
