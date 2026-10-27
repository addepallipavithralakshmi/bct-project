import React from 'react';
import styles from './TransactionStatus.module.css';

/**
 * Displays the state of a blockchain transaction.
 * @param {'idle'|'pending'|'success'|'error'} status
 * @param {string} txHash   - Transaction hash (for pending/success)
 * @param {string} error    - Error message (for error state)
 * @param {string} message  - Optional success message override
 */
export default function TransactionStatus({ status, txHash, error, message }) {
  if (status === 'idle') return null;

  const explorerBase = 'http://127.0.0.1:8545'; // Ganache has no block explorer, show hash only

  if (status === 'pending') {
    return (
      <div className={`${styles.box} ${styles.pending}`} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <div className={styles.content}>
          <p className={styles.heading}>Transaction Pending…</p>
          <p className={styles.sub}>Waiting for confirmation on the Ganache network.</p>
          {txHash && (
            <p className={styles.hash}>
              <code>{txHash.slice(0, 10)}…{txHash.slice(-8)}</code>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={`${styles.box} ${styles.success}`} role="status" aria-live="polite">
        <span className={styles.icon} aria-hidden="true">✅</span>
        <div className={styles.content}>
          <p className={styles.heading}>Transaction Confirmed</p>
          <p className={styles.sub}>{message || 'The transaction was successfully included in the block.'}</p>
          {txHash && (
            <p className={styles.hash}>
              Tx: <code>{txHash.slice(0, 16)}…{txHash.slice(-8)}</code>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`${styles.box} ${styles.error}`} role="alert">
        <span className={styles.icon} aria-hidden="true">❌</span>
        <div className={styles.content}>
          <p className={styles.heading}>Transaction Failed</p>
          <p className={styles.sub}>
            {error || 'The transaction was rejected or failed. No funds were transferred.'}
          </p>
          {error?.includes('rejected') && (
            <p className={styles.hint}>You rejected the transaction in your wallet.</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
