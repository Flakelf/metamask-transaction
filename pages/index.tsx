import React, { useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "@ethersproject/units";

import type { NextPage } from "next";

import { toast } from "react-toastify";

import { injected } from "../wallet/connectors";
import {
  createTestTaskContract,
  createUSDTContract,
} from "../wallet/contracts";

import { Input, Button, Block } from "../components";

import styles from "../styles/App.module.css";

const Home: NextPage = () => {
  const { activate, account, deactivate } = useWeb3React<Web3Provider>();

  const [state, setState] = useState({
    provideAmount: "",
    withdrawAmount: "",
  });
  const [balances, setBalances] = useState({
    provideBalance: "",
    withdrawBalance: "",
  });
  const [logs, setLogs] = useState([]);
  const [isLogged, setLogged] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isProvideLoading, setProvideLoading] = useState(false);
  const [isWithdrawLoading, setWithdrawLoading] = useState(false);

  const prevAccountRef = useRef<null | string>(null);

  let timeout: NodeJS.Timer;

  const handleLogin = async () => {
    setLoading(true);

    try {
      await activate(injected, (error) => {
        throw error;
      });
    } catch (e) {
      toast.error((e as Error).message);
      setLoading(false);
    }
  };

  const handleProvideTokens = async () => {
    setProvideLoading(true);

    const TestContractInstance = createTestTaskContract();
    const USDTContractInstance = createUSDTContract();

    try {
      if (account) {
        const approvedContract = await USDTContractInstance.approve(
          TestContractInstance.address,
          parseUnits(state.provideAmount, 18)
        );

        await approvedContract.wait();

        const allowance = await USDTContractInstance.allowance(
          account,
          TestContractInstance.address
        );

        const availableProvideBalance = await USDTContractInstance.balanceOf(
          account
        );

        const isEnoughtTokens =
          Number(formatUnits(allowance, 18)) >
          Number(formatUnits(availableProvideBalance, 18));

        if (isEnoughtTokens) {
          throw new Error("You don't have enough tokens");
        }

        await TestContractInstance.provide(parseUnits(state.provideAmount, 18));

        // If we don't await three confirmations, we will be fetch old balance
        // Don't know how to solve this problem more elegant
        await approvedContract.wait(3);

        toast.success("USDT successfully provided");

        await fetchLogsAndBalance();
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setProvideLoading(false);
    }
  };

  const handleWithdrawTokens = async () => {
    setWithdrawLoading(true);

    const TestContractInstance = createTestTaskContract();

    try {
      if (account) {
        const withdrawnContract = await TestContractInstance.withdraw(
          parseUnits(state.withdrawAmount, 18)
        );

        // If we don't await three confirmations, we will be fetch old balance
        // Don't know how to solve this problem more elegant
        await withdrawnContract.wait(3);

        toast.success("USDT successfully withdrawn");

        await fetchLogsAndBalance();
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleChange = ({
    currentTarget,
  }: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      [currentTarget.name]: currentTarget.value,
    }));
  };

  const handleClickDisconnect = async () => {
    try {
      deactivate();
      toast.success(`Disconnected ${account}`);
      setLogged(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const fetchLogsAndBalance = async () => {
    if (account) {
      const TestContractInstance = createTestTaskContract();
      const USDTContractInstance = createUSDTContract();

      // Tried yo use TestContractInstance.filters.Provide() but it returns
      // only Provide topics, but we need Provide and Withdraw
      // Don't know how did it more elegant, maybe this code will be have low performance
      // at huge amount of data, but not sure :)
      const transactionsList = await TestContractInstance.queryFilter({
        address: TestContractInstance.address,
      });

      const last10Transactions = transactionsList
        .filter((transaction) =>
          ["Provide", "Withdraw"].includes(transaction?.event as string)
        )
        .slice(Math.max(transactionsList.length - 10, 1));

      const last10TransactionsBlocks = await Promise.all(
        last10Transactions.map((transaction) => transaction.getBlock())
      );

      const logsDataToRender: any = [];

      last10Transactions.forEach((transaction) => {
        logsDataToRender.push({
          blockHash: transaction.blockHash,
          address: transaction.address,
          spender: transaction.args[0],
          blockNumber: transaction.blockNumber,
          event: transaction.event,
          amount: formatUnits(transaction.args[1], 18),
          timestamp: last10TransactionsBlocks.find(
            (transactionBlock) =>
              transactionBlock.number === transaction.blockNumber
          )?.timestamp,
        });
      });

      setLogs(logsDataToRender);

      const provideBalance = await USDTContractInstance.balanceOf(account);
      const withdrawBalance = await TestContractInstance.balance(account);

      setBalances({
        withdrawBalance: formatUnits(withdrawBalance, 18),
        provideBalance: formatUnits(provideBalance, 18),
      });
    }
  };

  useEffect(() => {
    const exec = async () => {
      if (prevAccountRef.current !== account) {
        setLoading(true);
      }

      if (account) {
        prevAccountRef.current = account;
      }

      await fetchLogsAndBalance();
      setLogged(true);
      setLoading(false);
    };

    if (account) {
      exec();
    }
  }, [account]);

  useEffect(() => {
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={styles.container}>
      {isLogged ? (
        <div className={styles.tokens_form}>
          <Button
            className={styles.disconnect_button}
            onClick={handleClickDisconnect}
          >
            Disconnect
          </Button>

          <div className={styles.inputs}>
            <form
              className={styles.input_form}
              onSubmit={(e) => e.preventDefault()}
            >
              <h2>Provide Tokens</h2>
              <Input
                placeholder="Amount"
                name="provideAmount"
                onChange={handleChange}
                disabled={isProvideLoading || isLoading}
                hint={`Your balance: ${balances.provideBalance} USDT`}
              />
              <Button
                onClick={handleProvideTokens}
                isLoading={isProvideLoading || isLoading}
                className={styles.form_button}
              >
                Provide
              </Button>
            </form>
            <div className={styles.input_form}>
              <h2>Withdraw Tokens</h2>
              <Input
                placeholder="Amount"
                name="withdrawAmount"
                onChange={handleChange}
                disabled={isWithdrawLoading || isLoading}
                hint={`Available: ${balances.withdrawBalance} USDT`}
              />
              <Button
                onClick={handleWithdrawTokens}
                isLoading={isWithdrawLoading || isLoading}
                className={styles.form_button}
              >
                Withdraw
              </Button>
            </div>
          </div>

          <h5>Account id is {account}</h5>

          <h3 className={styles.past_transactions}>10 past transactions</h3>

          {logs.length > 0 &&
            logs.map((logElement: any) => (
              <Block key={logElement.blockHash} {...logElement} />
            ))}
        </div>
      ) : (
        <div className={styles.auth_form}>
          <h2>Click button below to login</h2>

          <Button
            onClick={handleLogin}
            isLoading={isLoading}
            className={styles.auth_form_button}
          >
            Connect to account
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
