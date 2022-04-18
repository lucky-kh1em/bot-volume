module.exports = {
	apps: [
		{
			name: 'bot-volume',
			script: './src/index.js',
			env: {
				NODE_ENV: 'development',
			},
			env_production: {
				PRIVATE_KEY_BOT_TRADE_1: 'a04708d1a523541ffbc8a450a2379ddee2be8343cadb4054956ab4a3e23d341c',
				PRIVATE_KEY_BOT_TRADE_2: 'd9d74126ac1ca3377fb859829f476c93ca056f09bedbe4ad494ecdcf684a3f1d',
				PRIVATE_KEY_BOT_TRADE_3: 'a1babeeb447d61f8da10ae9baee70f68dbfd0adbb6de647f57ceb04468aefa2d',
				PRIVATE_KEY_BOT_TRADE_4: '1aff1228fb7126dfeb1ad9ccffabc21e6637ddd190f7cee3dc2f26b8d7d10fa6',
				PRIVATE_KEY_BOT_TRADE_5: '42c72c7a422c417100f53e30cea575a5645fa5a9ad9a4725ee1d42af0554e1fa',
				NODE_ENV: 'production',
				MONGODB_URL:
					'mongodb+srv://duloc2708:Duvanloc%40123@cluster0.2bjta.mongodb.net/diviner-trade',
				CHAIN_ID: 56,
			},
		},
	],
};
