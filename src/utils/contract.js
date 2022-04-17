const ethers = require("ethers");
const RouterAbi = require("../abi/Router.json");
const FactoryAbi = require("../abi/Factory.json");
const PairAbi = require("../abi/Pair.json");

const addresses = require("./address");
const config = require("../config");
const rpcs = require("./rpcs");

const defaultProvider = new ethers.providers.JsonRpcProvider(
  rpcs[config.chainId]
);

// const signerBotTrade = new ethers.Wallet(config.privateKeyTestnet);

const privateKeyToPublic = (privateKey) => {
  const wallet = new ethers.Wallet(privateKey, defaultProvider);

  return wallet.address;
};

const getAddress = (name, chainId) => {
  if (chainId) {
    return addresses[name][chainId];
  }

  return addresses[name][config.chainId];
};

const getContract = (name, abi, chainId, privateKey) => {
  const address = getAddress(name, chainId);
  let provider = defaultProvider;
  if (chainId) {
    provider = new ethers.providers.JsonRpcProvider(rpcs[chainId]);
  }
  if (privateKey) {
    const signer = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(address, abi, signer);
  }
  return new ethers.Contract(address, abi, provider);
};

const getRouterContract = (chainId, privateKey) => {
  return getContract("router", RouterAbi, chainId, privateKey);
};

const getFactoryContract = (chainId, privateKey) => {
  return getContract("factory", FactoryAbi, chainId, privateKey);
};

const getPairContract = (address) => {
  return new ethers.Contract(address, PairAbi, defaultProvider);
};

module.exports = {
  privateKeyToPublic,
  getRouterContract,
  getFactoryContract,
  getPairContract,
};
