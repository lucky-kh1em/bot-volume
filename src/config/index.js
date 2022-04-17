require('dotenv').config({
	path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
	env: process.env.NODE_ENV,
	mongodbUrl: process.env.MONGODB_URL,
	chainId: process.env.CHAIN_ID,
	privateKeyBot: process.env.PRIVATE_KEY_BOT_TRADE,
};
