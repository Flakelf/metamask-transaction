import { InjectedConnector } from "@web3-react/injected-connector";

export const injected = new InjectedConnector({
  // Rinkeby only chain id
  supportedChainIds: [4],
});
