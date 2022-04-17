const { ethers } = require("ethers");
const { getMulticallContract } = require("./contract");

const multicall = async (
  abi,
  calls,
  chainId,
  options = { requireSuccess: false }
) => {
  const { requireSuccess } = options;
  const multi = getMulticallContract(chainId);
  const itf = new ethers.utils.Interface(abi);

  const calldata = calls.map((call) => [
    call.address.toLowerCase(),
    itf.encodeFunctionData(call.name, call.params),
  ]);
  const returnData = await multi.tryAggregate(requireSuccess, calldata);
  const res = returnData.map((call, i) => {
    const [result, data] = call;

    return result ? itf.decodeFunctionResult(calls[i].name, data) : null;
  });

  return res;
};

module.exports = multicall;
