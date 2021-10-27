import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import type { NextPage } from "next";

import { injected } from "../wallet/connectors";
import { createTestTaskContract, provider } from "../wallet/contracts";
import { Input, Button } from "../components";

import styles from "../styles/App.module.css";

const Home: NextPage = () => {
  const { activate, account } = useWeb3React<Web3Provider>();

  const [isLogged, setLogged] = useState(false);
  const [isLoading, setLoading] = useState(false);

  let timeout: NodeJS.Timer;

  const handleLogin = async () => {
    setLoading((prevState) => !prevState);

    try {
      await activate(injected);
    } catch (e) {
      console.log(e);
    } finally {
      timeout = setTimeout(() => {
        setLogged((prevState) => !prevState);
        clearTimeout(timeout);
      }, 2000);
    }
  };

  const handeClick = () => {
    if (window.ethereum) {
      const contractInstance = createTestTaskContract();

      if (account) {
        contractInstance.balance(account).then(console.log);
      }

      contractInstance.on("Withdraw", (to: any, amount: any) => {
        console.log("to", to);
        console.log("amount", amount);
      });

      contractInstance.on("Provide", (to: any, amount: any) => {
        console.log("to", to);
        console.log("amount", amount);
      });
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={styles.container}>
      {isLogged ? (
        <div className={styles.tokens_form}>
          <button onClick={handeClick}>Do something</button>

          <div className={styles.inputs}>
            <div className={styles.input_block}>
              <h3>Provide Tokens</h3>
              <Input placeholder="Amount" type="number" />
            </div>
            <div className={styles.input_block}>
              <h3>Withdraw Tokens</h3>
              <Input placeholder="Amount" type="number" />
            </div>
          </div>

          <h5>Account id is {account}</h5>
        </div>
      ) : (
        <div className={styles.auth_form}>
          <h3>Click button below to login</h3>

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
