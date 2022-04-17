const { ethers } = require("ethers");
const config = require("../config");
const Trade = require("../models/Trade");
const { popularPathsBuy } = require("../config/constant");
const { getRouterContract, privateKeyToPublic } = require("../utils/contract");

const getAmountOut = async (amountIn, path) => {
  const routerContract = getRouterContract();
  return await routerContract.getAmountsOut(amountIn, path).at(-1);
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

const busdToDpt = async () => {
  try {
    const { chainId, privateKeyBot } = config;
    const publicKey = privateKeyToPublic(config.privateKeyBot);
    const routerContract = getRouterContract(chainId, privateKeyBot);

    const amountIn = ethers.utils.parseEther("0.5");

    const amountsOut = await Promise.all(
      popularPathsBuy.map((path) => getAmountOut(amountIn, path))
    );

    const indexMax = getIndexMax(amountsOut);
    const maxAmountOut = amountsOut[indexMax];
    console.log("maxAmountOut : ", maxAmountOut);
    const pathReturnMax = popularPathsBuy[indexMax];

    const deadline = Math.floor(new Date().getTime() / 1000) + 300;

    // await Trade.create({
    //   account: publicKey,
    //   amountInBusd: amountIn,
    //   amountOutDpt: 0,
    //   amountOutBusd: 0,
    //   txHashBuy: "",
    //   txHashSell: "",
    //   path: 0,
    // });

    // console.log("amount out min : ", ethers.BigNumber.from(maxAmountOut));
    // const tx = await routerContract.swapExactTokensForTokens(
    //   amountIn,
    //   ethers.BigNumber.from(maxAmountOut).mul(ethers.BigNumber.from("0.95")),
    //   pathReturnMax,
    //   publicKey,
    //   deadline
    // );

    // const wait = await tx.wait();

    // console.log("tx hash : ", wait.transactionHash);
    // console.log("event : ", wait.logs);
  } catch (error) {
    console.log("Error : ", error);
  }
};

busdToDpt();
