import React, { useEffect, useState, useRef } from "react";

import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatEther, parseEther, parseUnits } from "@ethersproject/units";

import type { NextPage } from "next";

import { injected } from "../wallet/connectors";
import {
  createTestTaskContract,
  createUSDTContract,
} from "../wallet/contracts";
import { Input, Button } from "../components";

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

    console.log(
      "parseUnits(state.provideAmount)",
      parseUnits(state.provideAmount)
    );

    try {
      if (account) {
        const allowance = await TestContractInstance.provide(
          parseUnits(state.provideAmount)
        );

        console.log(allowance);
      }
    } catch (e: any) {
      alert(e.message);
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
          {/* <button onClick={handeClick}>Do something</button> */}

          <div className={styles.inputs}>
            <form className={styles.input_form}>
              <h2>Provide Tokens</h2>
              <Input
                placeholder="Amount"
                type="number"
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
                type="number"
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
