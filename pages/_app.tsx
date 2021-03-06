import Head from "next/head";
import React from "react";

import type { AppProps } from "next/app";
import type { ExternalProvider } from "@ethersproject/providers";

import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  function getLibrary(provider: ExternalProvider): Web3Provider {
    return new Web3Provider(provider);
  }

  return (
    <React.Fragment>
      <Head>
        <title>Simple MetaMask transaction form</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Web3ReactProvider getLibrary={getLibrary}>
        <ToastContainer />
        <Component {...pageProps} />
      </Web3ReactProvider>
    </React.Fragment>
  );
}

export default MyApp;
