import { formatEther } from "@ethersproject/units";
import { format } from "date-fns";

import type { BigNumberish } from "ethers";

import styles from "./Block.module.css";

interface BlockProps {
  address: string;
  amount: BigNumberish;
  event: string;
  spender: string;
  timestamp: number;
  blockNumber: number;
}

const Block: React.FC<BlockProps> = ({
  amount,
  event,
  spender,
  timestamp,
  blockNumber,
}) => (
  <div className={styles.block}>
    <div>{blockNumber}</div>
    <div>{event}</div>
    <div>{format(new Date(timestamp * 1000), "MM/dd/yyy h:mm:s aa")}</div>
    <div>{formatEther(amount)} ETH</div>
    <div>Spender: {spender}</div>
  </div>
);

export { Block };
