const { ethers } = require("ethers");

const getSortedTokens = (tokenAddresses) => {
  return tokenAddresses.sort(
    (addressA, addressB) => addressA.toLowerCase() < addressB.toLowerCase()
  );
};

const computePoolAddress = ({
  factoryAddress,
  tokenAddressA,
  tokenAddressB,
  initCodeHash,
}) => {
  const [token0, token1] = getSortedTokens([tokenAddressA, tokenAddressB]);

  return ethers.utils.getCreate2Address(
    factoryAddress,
    ethers.utils.keccak256(
      ["bytes"],
      [
        defaultAbiCoder.encode(
          ["address", "address", "uint24"],
          [token0.address, token1.address, fee]
        ),
      ]
    ),
    initCodeHash
  );
};

module.exports = {
  getSortedTokens,
  computePoolAddress,
};
