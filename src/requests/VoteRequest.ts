import config from '@/config';
import BaseRequest from './BaseRequest';

export default class VoteRequest extends BaseRequest {
  getUrlPrefix() {
    return config.api.voteApi;
  }
  getCategories() {
    const url = '/public/category';
    return this.get(url, {});
  }

  getProposals(params) {
    console.log('PARAMS', params);
    const url = '/public/proposals';
    return this.get(url, params);
  }
  createProposal(params) {
    const url = '/my/proposals';
    return this.post(url, params);
  }
  getProposalById(proposalId) {
    const url = '/public/proposals/' + proposalId;
    return this.get(url, {});
  }
  getProposalVotersById(proposalId) {
    const url = '/public/proposals/' + proposalId + '/voters?limit=1000';
    return this.get(url, { proposalId });
  }
  getRelatedProposal(params) {
    const url = '/public/proposals/related';
    return this.get(url, params);
  }
  getProposalsStatus(params) {
    const url = '/my/proposals/' + params + '/existed';
    return this.get(url, params);
  }
}
