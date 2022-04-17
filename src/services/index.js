const { ethers, getDefaultProvider } = require('ethers');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const Trade = require('../models/Trade');
const { popularPathsBuy, popularPathsSell } = require('../config/constant');
const { getRouterContract, privateKeyToPublic } = require('../utils/contract');
const { decodeSwapData } = require('../utils/eventLog');

const web3 = new Web3();
const SWAP_TOPIC = '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822';

const getAmountOut = async (amountIn, path) => {
	const routerContract = getRouterContract();
	return (await routerContract.getAmountsOut(amountIn, path)).at(-1);
};

const getIndexMax = (arr) => {
	let max = arr[0];
	let index = 0;

	for (let i = 1; i < arr.length; i++) {
		if (arr[i].gt(max)) {
			max = arr[i];
			index = i;
		}
	}

	return [index];
};

const sendTradeTx = async (amountIn, amountOutMin, paths, routerContract, account) => {
	const amountsOut = await Promise.all(paths.map((path) => getAmountOut(amountIn, path)));
	const indexMax = getIndexMax(amountsOut);
	const accountPad64 = web3.utils.padLeft(account, 64);
	const maxAmountOut = amountsOut[indexMax];
	if (!amountOutMin) {
		amountOutMin = maxAmountOut.mul(90).div(100);
	}
	const pathReturnMax = paths[indexMax];

	const deadline = Math.floor(new Date().getTime() / 1000) + 300;

	console.log('path : ', pathReturnMax);
	console.log('amountIn : ', parseInt(ethers.utils.formatEther(amountIn)));
	console.log('amountOutMin : ', parseInt(ethers.utils.formatEther(amountOutMin)));
	console.log('account : ', account);

	let isSwapSuccess = false;
	let amountOutExactly;
	let transactionHash;

	while (!isSwapSuccess) {
		try {
			const tx = await routerContract.swapExactTokensForTokens(
				amountIn,
				amountOutMin,
				pathReturnMax,
				account,
				deadline
			);

			const wait = await tx.wait();

			const { logs } = wait;
			const logSwap = logs.find((log) => {
				if (
					log.topics[0] === SWAP_TOPIC &&
					log.topics[log.topics.length - 1] === accountPad64.toLowerCase()
				) {
					return true;
				}
				return false;
			});

			const { amount1Out } = decodeSwapData(logSwap.data);
			amountOutExactly = amount1Out;
			transactionHash = wait.transactionHash;

			isSwapSuccess = true;
		} catch (error) {
			console.log('swap error : ', error);
		}
	}

	return {
		amountOutExactly,
		transactionHash,
	};
};

const completeTrade = async (routerContract, tradeUndone) => {
	console.log('========COMPLETE TRADE=======');
	const { amountOutDpt, account, amountInBusd } = tradeUndone;
	const amountOutMinBusd = amountInBusd.mul(95).div(100);

	const { amountOutExactly, transactionHash } = await sendTradeTx(
		amountOutDpt,
		amountOutMinBusd,
		popularPathsSell,
		routerContract,
		account
	);

	tradeUndone.txHashSell = transactionHash;
	tradeUndone.amountOutBusd = amountOutExactly;

	await tradeUndone.save();
};

const sleep = async (ms) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
};

const sellAndBuyBack = async (privateKey) => {
	try {
		const publicKey = privateKeyToPublic(privateKey);
		const routerContract = getRouterContract(config.chainId, privateKey);

		const tradeUndone = await Trade.findOne({
			account: publicKey,
			amountOutBusd: 0,
			amountInBusd: { $gt: 0 },
		});

		if (tradeUndone) {
			await completeTrade(routerContract, tradeUndone);
			await sleep(5000);
		}

		const amountIn = ethers.utils.parseEther('1.5');

		const { amountOutExactly: amountOutDptExactly, transactionHash: txHashBuy } = await sendTradeTx(
			amountIn,
			null,
			popularPathsBuy,
			routerContract,
			publicKey
		);

		console.log('txHashBuy : ', txHashBuy);

		await sleep(5000);

		const trade = await Trade.create({
			account: publicKey,
			amountInBusd: amountIn,
			amountOutDpt: amountOutDptExactly,
			amountOutBusd: 0,
			txHashBuy,
		});

		const { amountOutExactly: amountOutBusdExactly, transactionHash: txHashSell } =
			await sendTradeTx(
				amountOutDptExactly,
				amountIn.mul(95).div(100),
				popularPathsSell,
				routerContract,
				publicKey
			);

		console.log('txHashSell : ', txHashSell);

		trade.amountOutBusd = amountOutBusdExactly;
		trade.txHashSell = txHashSell;

		await trade.save();
	} catch (error) {
		console.log('error sell and buy back : ', error);
	}
};

setInterval(() => {
	sellAndBuyBack(config.privateKeyBot);
}, 300000);
