import config from '@/config';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

export const client = new ApolloClient({
  link: createHttpLink({
    uri: config.kurve.subgraphUrl
  }),
  cache: new InMemoryCache()
});

export const blockClient = new ApolloClient({
  link: createHttpLink({
    uri: config.kurve.blockSubGraphUrl
  }),
  cache: new InMemoryCache()
});
