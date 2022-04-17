module.exports = {
	apps: [
		{
			name: 'bot-volume',
			script: './src/index.js',
			env: {
				NODE_ENV: 'development',
			},
			env_production: {
				PRIVATE_KEY_BOT_TRADE: 'a04708d1a523541ffbc8a450a2379ddee2be8343cadb4054956ab4a3e23d341c',
				NODE_ENV: 'production',
				MONGODB_URL:
					'mongodb+srv://duloc2708:Duvanloc%40123@cluster0.2bjta.mongodb.net/diviner-trade',
				CHAIN_ID: 56,
			},
		},
	],
};
