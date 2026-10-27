import React from 'react';
import { useLocation } from 'react-router-dom';
import { shortenAddress, NETWORK_CONFIG } from '../../config/contracts';
import styles from './Topbar.module.css';

const PAGE_TITLES = {
  '/':               'Overview',
  '/events':         'Explore Events',
  '/my-tickets':     'My Tickets',
  '/verify':         'Verify Ticket',
  '/manage-events':  'Manage Events',
  '/manage-venues':  'Manage Venues',
  '/resale':         'Resale Marketplace',
  '/settings':       'Settings',
};

function getPageTitle(pathname) {
  // Handle dynamic segments like /book/:eventId
  if (pathname.startsWith('/book/')) return 'Book Ticket';
  return PAGE_TITLES[pathname] || 'EventChain';
}

export default function Topbar({
  account,
  isConnected,
  isConnecting,
  isCorrectNetwork,
  rpcAvailable,
  chainId,
  connectWallet,
  connectionError,
}) {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  // ── Network badge ─────────────────────────────────────────────────────────
  let networkBadge;
  if (rpcAvailable === false) {
    networkBadge = (
      <span className={`${styles.networkBadge} ${styles.error}`}>
        ⚠ RPC Unavailable
      </span>
    );
  } else if (!window.ethereum) {
    networkBadge = (
      <span className={`${styles.networkBadge} ${styles.error}`}>
        No Wallet
      </span>
    );
  } else if (isConnected && !isCorrectNetwork) {
    networkBadge = (
      <span className={`${styles.networkBadge} ${styles.warning}`}>
        ⚠ Wrong Network (Chain {chainId})
      </span>
    );
  } else if (isConnected && isCorrectNetwork) {
    networkBadge = (
      <span className={`${styles.networkBadge} ${styles.success}`}>
        ● {NETWORK_CONFIG.networkName}
      </span>
    );
  } else {
    networkBadge = (
      <span className={`${styles.networkBadge} ${styles.idle}`}>
        Not Connected
      </span>
    );
  }

  // ── Wallet button ─────────────────────────────────────────────────────────
  let walletArea;
  if (isConnected) {
    walletArea = (
      <div className={styles.walletConnected}>
        <span className={styles.connectedDot} aria-hidden="true" />
        <span className={styles.address} title={account}>
          {shortenAddress(account)}
        </span>
      </div>
    );
  } else if (isConnecting) {
    walletArea = (
      <button className={styles.connectBtn} disabled aria-busy="true">
        <span className={styles.spinner} aria-hidden="true" />
        Connecting…
      </button>
    );
  } else {
    walletArea = (
      <button className={styles.connectBtn} onClick={connectWallet}>
        Connect Wallet
      </button>
    );
  }

  return (
    <header className={styles.topbar} role="banner">
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>
      <div className={styles.right}>
        {networkBadge}
        {walletArea}
      </div>
      {connectionError && (
        <div className={styles.errorBanner} role="alert">
          {connectionError}
        </div>
      )}
    </header>
  );
}
