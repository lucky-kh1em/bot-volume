const { ethers, getDefaultProvider } = require("ethers");
const Web3 = require("web3");
const config = require("../config");
const Trade = require("../models/Trade");
const { popularPathsBuy, popularPathsSell } = require("../config/constant");
const { getRouterContract, privateKeyToPublic } = require("../utils/contract");
const { decodeSwapData } = require("../utils/eventLog");

const web3 = new Web3();
const SWAP_TOPIC =
  "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";

const getAmountOut = async (amountIn, path) => {
  const routerContract = getRouterContract();
  const amountsOut = await routerContract.getAmountsOut(amountIn, path);

  return amountsOut[amountsOut.length - 1];
};

const getAmountOutMin = (amountOut) => {
  return amountOut.mul(990).div(1000);
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

const sendTradeTx = async (
  amountIn,
  amountOutMin,
  paths,
  routerContract,
  account
) => {
  const amountsOut = await Promise.all(
    paths.map((path) => getAmountOut(amountIn, path))
  );
  const indexMax = getIndexMax(amountsOut);
  const accountPad64 = web3.utils.padLeft(account, 64);
  const maxAmountOut = amountsOut[indexMax];
  if (!amountOutMin) {
    amountOutMin = maxAmountOut.mul(90).div(100);
  }
  const pathReturnMax = paths[indexMax];

  const deadline = Math.floor(new Date().getTime() / 1000) + 300;

  let isSwapSuccess = false;
  let amountOutExactly;
  let transactionHash;

  while (!isSwapSuccess) {
    try {
      console.log("try swap");
      console.log("path : ", pathReturnMax);
      console.log("amountIn : ", parseInt(ethers.utils.formatEther(amountIn)));
      console.log(
        "amountOutMin : ",
        parseInt(ethers.utils.formatEther(amountOutMin))
      );
      console.log("account : ", account);
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
      console.error("swap error : ", error);
      await sleep(5000);
    }
  }

  return {
    amountOutExactly,
    transactionHash,
  };
};

const completeTrade = async (routerContract, tradeUndone) => {
  console.log("========COMPLETE TRADE=======");
  const { amountOutDpt, account, amountInBusd } = tradeUndone;

  const amountOutMinBusd = getAmountOutMin(
    ethers.utils.parseEther(amountInBusd.toString())
  );

  const { amountOutExactly, transactionHash } = await sendTradeTx(
    ethers.utils.parseEther(amountOutDpt.toString()),
    amountOutMinBusd,
    popularPathsSell,
    routerContract,
    account
  );

  tradeUndone.txHashSell = transactionHash;
  tradeUndone.amountOutBusd = parseFloat(
    ethers.utils.formatEther(amountOutExactly)
  );

  await tradeUndone.save();
};

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

    const amountIn = ethers.utils.parseEther(getRandomInt(25, 55).toString());

    const {
      amountOutExactly: amountOutDptExactly,
      transactionHash: txHashBuy,
    } = await sendTradeTx(
      amountIn,
      null,
      popularPathsBuy,
      routerContract,
      publicKey
    );

    console.log("txHashBuy : ", txHashBuy);

    await sleep(5000);

    const trade = await Trade.create({
      account: publicKey,
      amountInBusd: parseFloat(ethers.utils.formatEther(amountIn)),
      amountOutDpt: parseFloat(ethers.utils.formatEther(amountOutDptExactly)),
      amountOutBusd: 0,
      txHashBuy,
    });

    const {
      amountOutExactly: amountOutBusdExactly,
      transactionHash: txHashSell,
    } = await sendTradeTx(
      amountOutDptExactly,
      getAmountOutMin(amountIn),
      popularPathsSell,
      routerContract,
      publicKey
    );

    console.log("txHashSell : ", txHashSell);

    trade.amountOutBusd = parseFloat(
      ethers.utils.formatEther(amountOutBusdExactly)
    );
    trade.txHashSell = txHashSell;

    await trade.save();
  } catch (error) {
    console.log("error sell and buy back : ", error);
  }
};

sellAndBuyBack(config.privateKeyBot);

setInterval(() => {
  sellAndBuyBack(config.privateKeyBot);
}, 1800000);
