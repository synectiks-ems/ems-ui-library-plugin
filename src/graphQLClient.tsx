import { ApolloClient, createNetworkInterface } from 'react-apollo';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:9097/graphql'
  // uri: 'http://100.81.3.26:9097/graphql'

});
export const gQLClient = new ApolloClient({
  networkInterface: networkInterface
});

