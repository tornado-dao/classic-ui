# Tornado Cash Classic UI

> Self-hostable Tornado Cash UI software for interacting with the protocol

## Building locally

- Install [Node.js](https://nodejs.org) version 16
  - If you are using [nvm](https://github.com/creationix/nvm#installation) (recommended) running `nvm use` will automatically choose the right node version for you.
- Install [Yarn](https://yarnpkg.com/en/docs/install)
- Install dependencies: `yarn`
- Copy the `.env.example` file to `.env`
  - Replace environment variables with your own personal.
- Build the project to the `./dist/` folder with `yarn generate`.

## Development builds

To start a development build (e.g. with logging and file watching) run `yarn dev`.

## Usage with Mainnet

A few things to know when running this UI against Ethereum Mainnet:

### Node version

Use Node 16. Node 14 (the version pinned in `.nvmrc`) won't compile from source on Apple Silicon, and Node 18+ breaks the `esm` package that Nuxt 2.14 depends on. Node 16 has prebuilt arm64 binaries and runs cleanly:

```bash
nvm install 16
nvm use 16
```

### Build before starting

`yarn start` (which runs `nuxt start`) requires a prior build. If `.nuxt/` and `dist/` don't exist yet, run:

```bash
yarn build
yarn generate
yarn start
```

For iterative development, `yarn dev` is simpler since it builds and serves in one step with hot reload.

### RPC endpoints

The default mainnet RPC list in [`networkConfig.js`](./networkConfig.js) leads with `https://rpc.flashbots.net`. Flashbots is a **MEV-protection transaction relay**, not a general-purpose RPC — it accepts `eth_chainId` (so it passes the basic health check) but rejects `eth_call`, which is what contract reads like `nextIndex()` need. The same applies to other "MEV protection" endpoints like Kyber.

Symptoms of hitting an MEV relay as your read RPC:

- Console errors like `Returned error: rpc method is not whitelisted`
- The **anonymity set** values never load (stuck on skeleton loaders)
- Token prices fall back to defaults
- Errors from `getLastDepositIndex`

To fix, edit `networkConfig.js` and reorder `netId1.rpcUrls` so a general-purpose RPC comes first (e.g. `lavaRPC` at `https://eth1.lava.build` or `blockscoutRPC` at `https://eth.blockscout.com/api/eth-rpc`).

### Clear localStorage after changing RPC config

The Vuex store (including the selected RPC) is persisted to localStorage under the key `tornadoClassicV2` via `vuex-persistedstate`. After changing `networkConfig.js`, the browser will keep using the previously cached RPC selection until you clear it:

```js
// In the browser DevTools console:
localStorage.removeItem('tornadoClassicV2')
```

Then refresh the page — the settings store will re-initialize from the updated config.

### CHAINNODES_KEY

The `CHAINNODES_KEY` in `.env` configures the `nuxt-web3-provider` module (see `nuxt.config.js`). This is a **separate** RPC path from `networkConfig.js`: it bootstraps the initial `this.$provider` Web3 instance used for early page-load calls and wallet interactions. Once a wallet connects, `this.$provider.initWeb3(url)` switches to whichever RPC the settings store selected. Chainnodes is a regular general-purpose Ethereum RPC (not a relay), so the key works fine for its bootstrap role — but it does not influence which RPC handles contract reads like the anonymity set.

## Deploy on IPFS

- Make sure you set `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` environment variables in `.env`
- To deploy a production build run `yarn deploy-ipfs`.

## Architecture

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).

## Audit

[TornadoCash_Classic_dApp_audit_Decurity.pdf](https://ipfs.io/ipfs/QmXzmwfsb4GwzmPD7W9VDNHh7ttyYKgXCY74973QMZqBDA)

## Update cached files

- To update deposit and withdrawal events use `yarn update:events {chainId} {optional: tokenOrEvent} {optional: tokenOrEvent}`
- To update encrypted notes use `yarn update:encrypted {chainId}`
- To update merkle tree use `yarn update:tree {chainId}`

#### NOTE!

After updating cached files do not forget to use `yarn update:zip`.

### Example for Ethereum Mainnet:

You may set in [`networkConfig.js`](./networkConfig.js) the `blockSyncInterval` (def: 10_000) to the maximum value allowed by your RPC provider. Command usage follows below.

```bash
# Updating events with just the required chain id parameter
yarn update:events 1
# Updating events for only one token across all instances on that network
yarn update:events 1 dai
# Updating events for only one event on only some network
yarn update:events 1 deposit
# Both
yarn update:events 1 dai deposit
# Updating encrypted notes for some chain id
yarn update:encrypted 1
# Updating trees for some chain id
yarn update:tree 1
# Finally zips must be updated
yarn update:zip
```

### Example for Binance Smart Chain:

```bash
yarn update:events 56
yarn update:events 56 bnb
yarn update:events 56 bnb deposit
yarn update:encrypted 56
yarn update:tree 56
yarn update:zip
```
