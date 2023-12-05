import { Contract } from '@ethersproject/contracts';
import abi from '@/helpers/abi';
import config from '@/config';
import { handleApproveToken } from '@/utils/approve-utils';
import BigNumber from 'bignumber.js';
import { estimateGas } from '@/utils/estimateGas-utils';
import { handlePendingTx } from '@/utils/transaction-utils';
import provider from '@/helpers/provider';
import store from '@/store';
import {
  createSignature,
  verifySign,
  verifyTypedData
} from '@/utils/sign-utils';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import rf from '@/requests/RequestFactory';

export async function generateToken() {
  try {
    const myAddress = store.getters['account/myAddress'];
    console.log('myAddress', myAddress);
    const signature = await createSignature(myAddress);
    console.log(
      'verify signature verifyTypedData',
      signature.signatureType,
      verifyTypedData(myAddress, signature.signature)
    );
    console.log(
      'verify signature verifySign',
      signature.signatureType,
      verifySign(signature.signature)
    );
    const date = new Date();
    const payload = {
      address: myAddress,
      signature: signature.signature,
      signType: signature.signatureType,
      iat: date.getTime() / 1000,
      exp: date.getTime() / 1000 + 3000 * 24 * 3600
    };
    const token = jwt.sign(payload, config.addresses.gameContract, {
      algorithm: 'HS256'
    });
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (e) {
    console.log('Sign error:', e.message);
    throw e;
  }
}

export async function submitProposeToOnChain(
  userProvider,
  proposeId,
  productId
) {
  const governanceContract = new Contract(
    config.addresses.governance,
    abi['Governance'],
    userProvider.getSigner()
  );
  const gasLimit = estimateGas(governanceContract, 'propose', [
    proposeId,
    productId
  ]);
  const overrides = {
    gasLimit
  };
  const tx = await governanceContract.propose(proposeId, productId, overrides);
  await handlePendingTx(tx, 'transactionTitles.createPropse', 4);
  return tx;
}

export async function createPropose(userProvider, userAddress, params) {
  await generateToken();
  const request = await rf.getRequest('VoteRequest').getProposalsStatus(1);
  if (request.existed === true) {
    throw new Error('Proposal pending');
  }
  const governanceContract = new Contract(
    config.addresses.governance,
    abi['Governance'],
    userProvider.getSigner()
  );
  const buniContract = new Contract(
    config.addresses.buni,
    abi['ERC20'],
    userProvider.getSigner()
  );
  await handleApproveToken(
    userProvider,
    governanceContract,
    buniContract,
    userAddress,
    1
  );
  const res = await rf.getRequest('VoteRequest').createProposal(params);
  console.log('CREATE PROPOSEEEEE', res);
  return await submitProposeToOnChain(
    userProvider,
    res.proposalId,
    res.categoryId
  );
}

export async function getVoteFee() {
  const governanceContract = new Contract(
    config.addresses.governance,
    abi['Governance'],
    provider
  );
  const voteFee = await governanceContract.createFee();
  return new BigNumber(voteFee.toString()).div('1e18').toString();
}

export async function canVotePropose(proposeId, userAddress) {
  const governanceContract = new Contract(
    config.addresses.governance,
    abi['Governance'],
    provider
  );
  console.log('before receipt', proposeId, userAddress);
  console.log('address', config.addresses.governance);
  console.log('config ', config);

  const receipt = await governanceContract.getReceipt(proposeId, userAddress);
  console.log('receipt', receipt);
  return !receipt.hasVoted;
}

export async function upVote(proposeId, productId) {
  const userProvider = await store.getters['account/provider'];
  const userAddress = await store.getters['account/myAddress'];
  const canVote = await canVotePropose(proposeId, userAddress);
  if (!canVote) {
    store.dispatch('notify', {
      text: 'You have already voted for this proposal',
      type: 'warning'
    });
    return null;
  }
  const governanceContract = new Contract(
    config.addresses.governance,
    abi['Governance'],
    userProvider.getSigner()
  );
  let tx;

  if (productId !== 2) {
    const gasLimit = estimateGas(governanceContract, 'vote', [proposeId, 1]);
    const overrides = {
      gasLimit
    };
    tx = await governanceContract.vote(proposeId, 1, overrides);
  } else {
    const res = await new Contract(
      config.addresses.gameContract,
      abi['BuniUniversalV2'],
      userProvider.getSigner()
    ).getMyTrainers();
    const trainerIds = res.map(trainerId =>
      new BigNumber(trainerId._hex).toNumber()
    );
    if (trainerIds && trainerIds.length === 0) {
      store.dispatch('notify', {
        text: 'You do not have trainer in game',
        type: 'warning'
      });
      return null;
    }
    console.log('trainerIds', trainerIds);
    const gasLimit = estimateGas(governanceContract, 'voteForBunicornGame', [
      proposeId,
      1,
      trainerIds.map(trainerId => trainerId.toString())
    ]);
    const overrides = {
      gasLimit
    };
    tx = await governanceContract.voteForBunicornGame(
      proposeId,
      1,
      trainerIds,
      overrides
    );
  }
  await userProvider.waitForTransaction(tx.hash, 8);
  await handlePendingTx(tx, 'transactionTitles.upVote', 10);
}

export async function downVote(proposeId, productId) {
  const userProvider = await store.getters['account/provider'];
  const userAddress = await store.getters['account/myAddress'];
  const canVote = await canVotePropose(proposeId, userAddress);
  if (!canVote) {
    store.dispatch('notify', {
      text: 'You have already voted for this proposal',
      type: 'warning'
    });
    return null;
  }
  let tx;
  const governanceContract = new Contract(
    config.addresses.governance,
    abi['Governance'],
    userProvider.getSigner()
  );
  if (productId !== 2) {
    const gasLimit = estimateGas(governanceContract, 'vote', [proposeId, 1]);
    const overrides = {
      gasLimit
    };
    tx = await governanceContract.vote(proposeId, 1, overrides);
  } else {
    const res = await new Contract(
      config.addresses.gameContract,
      abi['BuniUniversalV2'],
      userProvider.getSigner()
    ).getMyTrainers();
    const trainerIds = res.map(trainerId =>
      new BigNumber(trainerId._hex).toNumber()
    );
    if (trainerIds && trainerIds.length === 0) {
      store.dispatch('notify', {
        text: 'You do not have trainer in game',
        type: 'warning'
      });
      return null;
    }
    console.log('trainerIds', trainerIds);
    const gasLimit = estimateGas(governanceContract, 'voteForBunicornGame', [
      proposeId,
      0,
      trainerIds.map(trainerId => trainerId.toString())
    ]);
    const overrides = {
      gasLimit
    };
    tx = await governanceContract.voteForBunicornGame(
      proposeId,
      0,
      trainerIds,
      overrides
    );
  }
  await userProvider.waitForTransaction(tx.hash, 8);
  await handlePendingTx(tx, 'transactionTitles.downVote', 10);
}

export async function minBuniHoldToVote() {
  const governanceContract = new Contract(
    config.addresses.governance,
    abi['Governance'],
    provider
  );
  const amount = await governanceContract.amountToVote();
  return new BigNumber(amount.toString()).div('1e18').toString();
}

export async function minBuniHoldToPropose() {
  const governanceContract = new Contract(
    config.addresses.governance,
    abi['Governance'],
    provider
  );
  const amount = await governanceContract.amountToPropose();
  return new BigNumber(amount.toString()).div('1e18').toString();
}
