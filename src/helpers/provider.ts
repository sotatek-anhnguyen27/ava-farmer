import {
  FallbackProvider,
  InfuraProvider,
  StaticJsonRpcProvider
} from '@ethersproject-bsc/providers';
import config from '@/config';
import _ from 'lodash';
import { JsonRpcProvider } from '@ethersproject/providers';

console.log('config.network', config.network);

function getKovanProviders() {
  const infuraKeys = _.shuffle(config.infuraKey);
  const providers: any = [];
  infuraKeys.forEach((infuraKey, index) => {
    const provider = new InfuraProvider(config.network, infuraKey);
    const priority = index + 1;
    providers.push({
      provider,
      priority,
      stallTimeout: 1500 + 500 * priority
    });
  });
  return providers;
}

function getBscProviders() {
  const rpcUrls = _.shuffle(config.rpcUrl);

  console.log('shuffle', rpcUrls);

  const providers: any = [];
  rpcUrls.forEach((rpcUrl, index) => {
    const provider = new StaticJsonRpcProvider(rpcUrl, 'homestead');
    const priority = index + 1;
    providers.push({
      provider,
      priority,
      stallTimeout: 1500 + 100 * priority
    });
  });
  return providers;
}

let providers = getBscProviders();
if (config.network === 'Avalanche') {
  providers = [
    new JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc')
  ];
}

const provider = new FallbackProvider(providers, 1);

export default provider;
