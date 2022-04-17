const config = require("./index");
const addresses = require("../utils/address");

const popularPathsBuy = [
  [
    addresses["busd"][config.chainId],
    addresses["wbnb"][config.chainId],
    addresses["dpt"][config.chainId],
  ],
  [
    addresses["busd"][config.chainId],
    addresses["cake"][config.chainId],
    addresses["dpt"][config.chainId],
  ],
  [addresses["busd"][config.chainId], addresses["dpt"][config.chainId]],
];

const popularPathsSell = [
  [
    addresses["dpt"][config.chainId],
    addresses["wbnb"][config.chainId],
    addresses["busd"][config.chainId],
  ],
  [
    addresses["dpt"][config.chainId],
    addresses["cake"][config.chainId],
    addresses["busd"][config.chainId],
  ],
  [addresses["dpt"][config.chainId], addresses["busd"][config.chainId]],
];

module.exports = {
  popularPathsBuy,
  popularPathsSell,
};
