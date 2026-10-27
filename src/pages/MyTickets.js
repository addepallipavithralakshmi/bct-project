import React, { useState, useEffect } from 'react';
import { useWeb3Context } from '../components/layout/AppLayout';
import TicketCard from '../components/ui/TicketCard';
import EmptyState from '../components/ui/EmptyState';
import styles from './MyTickets.module.css';

const LS_KEY = 'eventchain_ticket_ids';

function loadSavedIds() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function MyTickets() {
  const { account, isConnected, getTicketsContract } = useWeb3Context();

  const [inputId, setInputId]     = useState('');
  const [savedIds, setSavedIds]   = useState(loadSavedIds);
  const [tickets, setTickets]     = useState({}); // id → { data, loading, error }

  // Persist saved IDs
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(savedIds));
  }, [savedIds]);

  // Fetch ticket when IDs change
  useEffect(() => {
    async function fetchAll() {
      const contract = getTicketsContract();
      for (const id of savedIds) {
        if (tickets[id]?.data || tickets[id]?.loading) continue;
        setTickets(prev => ({ ...prev, [id]: { loading: true, error: '', data: null } }));
        try {
          const result = await contract.methods.getTicketLocked(id).call();
          // If owner is zero address, ticket doesn't exist
          if (!result || result.owner === '0x0000000000000000000000000000000000000000') {
            setTickets(prev => ({ ...prev, [id]: { loading: false, error: 'Ticket not found on the blockchain.', data: null } }));
          } else {
            setTickets(prev => ({ ...prev, [id]: { loading: false, error: '', data: result } }));
          }
        } catch (err) {
          setTickets(prev => ({ ...prev, [id]: { loading: false, error: `Lookup failed: ${err.message?.slice(0, 100)}`, data: null } }));
        }
      }
    }
    if (savedIds.length > 0) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedIds, getTicketsContract]);

  const addId = () => {
    const id = inputId.trim();
    if (!id) return;
    if (savedIds.includes(id)) {
      alert('That ticket ID is already in your list.');
      return;
    }
    setSavedIds(prev => [id, ...prev]);
    setInputId('');
  };

  const removeId = (id) => {
    setSavedIds(prev => prev.filter(x => x !== id));
    setTickets(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clearAll = () => {
    if (window.confirm('Remove all ticket IDs from your list?')) {
      setSavedIds([]);
      setTickets({});
    }
  };

  const refreshTicket = async (id) => {
    setTickets(prev => ({ ...prev, [id]: { ...prev[id], loading: true, error: '' } }));
    try {
      const contract = getTicketsContract();
      const result   = await contract.methods.getTicketLocked(id).call();
      if (!result || result.owner === '0x0000000000000000000000000000000000000000') {
        setTickets(prev => ({ ...prev, [id]: { loading: false, error: 'Ticket not found.', data: null } }));
      } else {
        setTickets(prev => ({ ...prev, [id]: { loading: false, error: '', data: result } }));
      }
    } catch (err) {
      setTickets(prev => ({ ...prev, [id]: { loading: false, error: err.message?.slice(0, 100), data: null } }));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Tickets</h1>
          <p className={styles.sub}>
            Look up your tickets by entering their IDs below.
          </p>
        </div>
        {savedIds.length > 0 && (
          <button className={styles.clearBtn} onClick={clearAll}>
            Clear All
          </button>
        )}
      </div>

      {/* Info box */}
      <div className={styles.infoBox}>
        <span>ℹ️</span>
        <div>
          <strong>How ticket lookup works</strong>
          <p>
            The current smart contract does not store a list of tickets per wallet address.
            Enter the Ticket IDs you received when booking — they're saved in your browser for convenience.
            Your ticket IDs are stored locally and verified directly from the blockchain.
          </p>
        </div>
      </div>

      {/* Add ticket form */}
      <div className={styles.addSection}>
        <label className={styles.label} htmlFor="ticketIdInput">
          Enter a Ticket ID to look up
        </label>
        <div className={styles.inputRow}>
          <input
            id="ticketIdInput"
            type="text"
            className={styles.input}
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addId()}
            placeholder="e.g. AbCdEfGhIj"
            aria-label="Ticket ID"
          />
          <button className={styles.addBtn} onClick={addId} disabled={!inputId.trim()}>
            Look Up Ticket
          </button>
        </div>
      </div>

      {/* Ticket list */}
      {savedIds.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No tickets in your list"
          description="Enter a ticket ID above to look it up on the blockchain. IDs are saved in your browser."
        />
      ) : (
        <div className={styles.ticketList}>
          {savedIds.map(id => {
            const entry = tickets[id];
            return (
              <div key={id} className={styles.ticketEntry}>
                {entry?.loading ? (
                  <div className={styles.ticketLoading}>
                    <div className={styles.spinner} />
                    <span>Looking up ticket <code>{id}</code>…</span>
                  </div>
                ) : entry?.error ? (
                  <div className={styles.ticketError} role="alert">
                    <div className={styles.ticketErrorLeft}>
                      <span>❌</span>
                      <div>
                        <code className={styles.idLabel}>{id}</code>
                        <p>{entry.error}</p>
                      </div>
                    </div>
                    <div className={styles.ticketActions}>
                      <button className={styles.retryBtn} onClick={() => refreshTicket(id)}>Retry</button>
                      <button className={styles.removeBtn} onClick={() => removeId(id)}>Remove</button>
                    </div>
                  </div>
                ) : entry?.data ? (
                  <div>
                    <TicketCard ticket={entry.data} />
                    <div className={styles.cardActions}>
                      <button className={styles.refreshBtn} onClick={() => refreshTicket(id)}>🔄 Refresh</button>
                      <button className={styles.removeBtn} onClick={() => removeId(id)}>✕ Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.ticketLoading}>
                    <div className={styles.spinner} />
                    <span>Loading <code>{id}</code>…</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
