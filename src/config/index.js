require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  mongodbUrl: process.env.MONGODB_URL,
  chainId: process.env.CHAIN_ID,
  privateKeyBot: process.env.PRIVATE_KEY_BOT_TRADE,
};
