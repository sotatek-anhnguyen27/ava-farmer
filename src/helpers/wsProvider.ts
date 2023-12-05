import {
  WebSocketProvider,
} from '@ethersproject/providers';
import config from '@/config';
import _ from 'lodash';

function getWebsocketProvider() {
  // const wsUrls = _.shuffle(config.wsUrl);
  const wsUrls = config.wsUrl;

  return new WebSocketProvider(wsUrls[0], config.chainId);
}

const provider = getWebsocketProvider();

export default provider;
