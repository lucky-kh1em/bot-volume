const Web3 = require('web3');
const web3 = new Web3();
const typesSwap = [
	{ type: 'uint256', name: 'amount0In' },
	{ type: 'uint256', name: 'amount1In' },
	{ type: 'uint256', name: 'amount0Out' },
	{ type: 'uint256', name: 'amount1Out' },
];

const decodeSwapData = (data) => {
	return web3.eth.abi.decodeParameters(typesSwap, data);
};

module.exports = {
	decodeSwapData,
};
