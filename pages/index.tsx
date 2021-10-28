import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatEther, parseEther, parseUnits } from "@ethersproject/units";

import type { NextPage } from "next";

import { injected } from "../wallet/connectors";
import {
  createTestTaskContract,
  createUSDTContract,
} from "../wallet/contracts";

import { Input, Button, Block } from "../components";

import styles from "../styles/App.module.css";

const Home: NextPage = () => {
  const { activate, account } = useWeb3React<Web3Provider>();

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

  let timeout: NodeJS.Timer;

  const handleLogin = async () => {
    setLoading((prevState) => !prevState);

    try {
      await activate(injected);

      timeout = setTimeout(() => {
        setLogged((prevState) => !prevState);
        setLoading((prevState) => !prevState);
        clearTimeout(timeout);
      }, 2000);
    } catch (e: any) {
      alert(e.message);
      setLoading((prevState) => !prevState);
    }
  };

  const handleProvideTokens = async () => {
    setLoading((prevState) => !prevState);

    const TestContractInstance = createTestTaskContract();
    const USDTContractInstance = createUSDTContract();

    try {
      if (account) {
        const approvedContract = await USDTContractInstance.approve(
          account,
          parseUnits(state.provideAmount)
        );

        await approvedContract.wait();

        console.log(approvedContract);

        // const allowance = await USDTContractInstance.allowance(
        //   account,
        //   TestContractInstance.address
        // );

        // console.log(allowance);

        // const provideVar = await TestContractInstance.provide(
        //   parseUnits(state.provideAmount)
        // );

        // console.log(provideVar);
      }
    } catch (e: any) {
      console.log(e.message);
    } finally {
      setLoading((prevState) => !prevState);
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

  useEffect(() => {
    const exec = async () => {
      if (account) {
        const TestContractInstance = createTestTaskContract();
        const USDTContractInstance = createUSDTContract();

        const provideBalance = await USDTContractInstance.balanceOf(account);
        const withdrawBalance = await TestContractInstance.balance(account);

        const transactionsList = await USDTContractInstance.queryFilter({
          address: TestContractInstance.address,
        });

        const last10Transactions = transactionsList.slice(
          Math.max(transactionsList.length - 10, 1)
        );

        const last10TransactionsBlocks = await Promise.all(
          last10Transactions.map((transaction) => transaction.getBlock())
        );

        const logsDataToRender: any = [];

        last10Transactions.forEach((transaction) => {
          logsDataToRender.push({
            address: transaction.address,
            // @ts-ignore
            spender: transaction.args.spender,
            blockNumber: transaction.blockNumber,
            event: transaction.event,
            amount: transaction.args[2],
            timestamp: last10TransactionsBlocks.find(
              (transactionBlock) =>
                transactionBlock.number === transaction.blockNumber
            )?.timestamp,
          });
        });

        setLogs(logsDataToRender);
        setBalances({
          withdrawBalance: formatEther(withdrawBalance),
          provideBalance: formatEther(provideBalance),
        });
      }
    };

    exec();
  }, [account]);

  useEffect(() => {
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={styles.container}>
      {isLogged ? (
        <div className={styles.tokens_form}>
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
                disabled={isLoading}
                hint={`Your balance: ${balances.provideBalance} USDT`}
              />
              <Button
                onClick={handleProvideTokens}
                isLoading={isLoading}
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
                disabled={isLoading}
                hint={`Available: ${balances.withdrawBalance} USDT`}
              />
              <Button
                onClick={() => null}
                isLoading={isLoading}
                className={styles.form_button}
              >
                Withdraw
              </Button>
            </div>
          </div>

          <h5>Account id is {account}</h5>

          {logs.length > 0 &&
            logs.map((logElement: any) => (
              <Block key={logElement.blockNumber} {...logElement} />
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
