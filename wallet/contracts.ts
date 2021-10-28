import { ethers } from "ethers";

import type { Web3Provider } from "@ethersproject/providers";
import type { Signer } from "ethers";
import type {
  TestTask as TestTaskContractInterface,
  Usdt as USDTContractInterface,
} from "../contractTypes";

import TEST_TASK_CONTRACT_JSON from "../ABI/testTask.json";
import USDT_CONTRACT_JSON from "../ABI/usdt.json";

export const TEST_TASK_CONTRACT = "testTask";
export const USDT_CONTRACT = "usdt";

export let provider: Web3Provider;
export let signer: Signer;

if (typeof window !== "undefined") {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
}

const contractHashByName = {
  [TEST_TASK_CONTRACT]: "0x02cB34d293e74D3328321c0E32898e42D8594895",
  [USDT_CONTRACT]: "0x18696aE68855e95674765d4Dbbc54dF6F8a66290",
};

export const createTestTaskContract = () => {
  return new ethers.Contract(
    contractHashByName[TEST_TASK_CONTRACT],
    TEST_TASK_CONTRACT_JSON,
    signer
  ) as TestTaskContractInterface;
};

export const createUSDTContract = () => {
  return new ethers.Contract(
    contractHashByName[USDT_CONTRACT],
    USDT_CONTRACT_JSON,
    signer
  ) as USDTContractInterface;
};
