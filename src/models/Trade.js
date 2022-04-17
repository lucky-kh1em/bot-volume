const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const tradeSchema = mongoose.Schema(
	{
		account: String,
		amountInBusd: Number,
		amountOutDpt: Number,
		amountOutBusd: Number,
		txHashBuy: String,
		txHashSell: String,
		nonce: Number,
	},
	{
		timestamp: true,
	}
);

// add plugin that converts mongoose to json
tradeSchema.plugin(toJSON);
tradeSchema.plugin(paginate);

const Trade = mongoose.model('trade', tradeSchema);

module.exports = Trade;
