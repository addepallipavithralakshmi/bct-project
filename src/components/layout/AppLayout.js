import React, { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { useWeb3 } from '../../hooks/useWeb3';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './AppLayout.module.css';

// Context so child pages can access web3 state without prop drilling
export const Web3Context = createContext(null);

export function useWeb3Context() {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    throw new Error('useWeb3Context must be used inside AppLayout');
  }
  return ctx;
}

export default function AppLayout() {
  const web3State = useWeb3();

  return (
    <Web3Context.Provider value={web3State}>
      <div className={styles.shell}>
        <Sidebar account={web3State.account} />
        <div className={styles.body}>
          <Topbar
            account={web3State.account}
            isConnected={web3State.isConnected}
            isConnecting={web3State.isConnecting}
            isCorrectNetwork={web3State.isCorrectNetwork}
            rpcAvailable={web3State.rpcAvailable}
            chainId={web3State.chainId}
            connectWallet={web3State.connectWallet}
            connectionError={web3State.connectionError}
          />
          <main className={styles.main}>
            <div className={styles.content}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </Web3Context.Provider>
  );
}
