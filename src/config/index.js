require('dotenv').config({
	path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
	env: process.env.NODE_ENV,
	mongodbUrl: process.env.MONGODB_URL,
	chainId: process.env.CHAIN_ID,
	privateKeyBots: [
		process.env.PRIVATE_KEY_BOT_TRADE_1,
		process.env.PRIVATE_KEY_BOT_TRADE_2,
		process.env.PRIVATE_KEY_BOT_TRADE_3,
		process.env.PRIVATE_KEY_BOT_TRADE_4,
		process.env.PRIVATE_KEY_BOT_TRADE_5,
	],
};
