import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3Context } from '../components/layout/AppLayout';
import StatCard from '../components/ui/StatCard';
import EventCard from '../components/ui/EventCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isConnected, isCorrectNetwork, account, connectWallet, isConnecting, getEventsContract } = useWeb3Context();

  const [events, setEvents]           = useState([]);
  const [eventTickets, setEventTickets] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState('');

  // ── Fetch events ────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadEvents() {
      setLoadingEvents(true);
      setEventsError('');
      try {
        const contract = getEventsContract();
        const [ev1, ev2] = await Promise.all([
          contract.methods.getAllEvents1Locked().call(),
          contract.methods.getAllEvents2Locked().call(),
        ]);
        setEvents(ev1);
        setEventTickets(ev2);
      } catch (err) {
        console.error('Failed to load events:', err);
        setEventsError('Could not load events. Make sure Ganache is running and contracts are deployed.');
      } finally {
        setLoadingEvents(false);
      }
    }
    loadEvents();
  }, [getEventsContract]);

  // ── Stat cards ────────────────────────────────────────────────────────
  const statCards = [
    {
      title: 'Total Events',
      value: loadingEvents ? '…' : events.length,
      icon: '📅',
      color: 'primary',
      description: 'Events registered on-chain',
    },
    {
      title: 'Network',
      value: isCorrectNetwork ? 'Ganache' : isConnected ? 'Wrong Network' : 'Disconnected',
      icon: '🔗',
      color: isCorrectNetwork ? 'success' : 'error',
      description: `Chain ID 1337 · http://127.0.0.1:8545`,
    },
    {
      title: 'Wallet',
      value: isConnected ? 'Connected' : 'Not Connected',
      icon: '👛',
      color: isConnected ? 'success' : 'warning',
      description: isConnected ? `${account.slice(0, 10)}…` : 'Click "Connect Wallet" in the top bar',
    },
  ];

  // Featured events (first 6)
  const featured = events.slice(0, 6);
  const featuredTickets = eventTickets.slice(0, 6);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Welcome to <span className={styles.brand}>EventChain</span>
          </h1>
          <p className={styles.heroSub}>
            A blockchain-powered digital ticketing platform. Buy authentic tickets, verify entries on-chain, and prevent fraud — all secured by Ethereum smart contracts.
          </p>
          <div className={styles.heroActions}>
            <button
              className={styles.primaryBtn}
              onClick={() => navigate('/events')}
            >
              🔍 Explore Events
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate('/my-tickets')}
            >
              🎟️ My Tickets
            </button>
          </div>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <span className={styles.heroEmoji}>🎫</span>
        </div>
      </section>

      {/* Wallet notice if not connected */}
      {!isConnected && (
        <div className={styles.walletNotice} role="alert">
          <span>🔌</span>
          <div>
            <strong>Wallet not connected.</strong> Connect your MetaMask wallet configured for Ganache (Chain ID 1337, RPC: http://127.0.0.1:8545) to book tickets and manage your account.
          </div>
          <button
            className={styles.connectBtn}
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        </div>
      )}

      {/* Wrong network notice */}
      {isConnected && !isCorrectNetwork && (
        <div className={styles.networkNotice} role="alert">
          <span>⚠️</span>
          <div>
            <strong>Wrong network detected.</strong> Please switch your MetaMask to Ganache Local (Chain ID 1337). Current chain may not have the deployed contracts.
          </div>
        </div>
      )}

      {/* Stats */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Platform Overview</h2>
        <div className={styles.statsGrid}>
          {statCards.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Events</h2>
          {events.length > 0 && (
            <button className={styles.viewAllBtn} onClick={() => navigate('/events')}>
              View all →
            </button>
          )}
        </div>

        {eventsError ? (
          <div className={styles.errorBox} role="alert">
            <span>⚠️</span>
            <div>
              <strong>Could not load events.</strong>
              <p>{eventsError}</p>
              <p style={{ fontSize: 13 }}>
                Make sure Ganache is running at <code>http://127.0.0.1:8545</code> and contracts are deployed with <code>truffle migrate</code>.
              </p>
            </div>
          </div>
        ) : loadingEvents ? (
          <LoadingSkeleton count={6} type="card" />
        ) : featured.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No events yet"
            description="Events can be created using the Manage Events page. Once created, they'll appear here."
            actionLabel="Create an Event"
            onAction={() => navigate('/manage-events')}
          />
        ) : (
          <div className={styles.eventsGrid}>
            {featured.map((ev, i) => (
              <EventCard
                key={ev.eventId || i}
                eventInfo={ev}
                eventTickets={featuredTickets[i]}
              />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.howGrid}>
          {[
            { step: '1', title: 'Connect Wallet', desc: 'Link your MetaMask wallet configured for the local Ganache network.', icon: '👛' },
            { step: '2', title: 'Browse Events',  desc: 'Explore available events registered on the blockchain.', icon: '🔍' },
            { step: '3', title: 'Book a Ticket',  desc: 'Pay the exact ETH amount to mint an authenticated on-chain ticket.', icon: '🎟️' },
            { step: '4', title: 'Verify at Entry', desc: 'The verifier scans and confirms your ticket via the blockchain.', icon: '✅' },
          ].map(({ step, title, desc, icon }) => (
            <div key={step} className={styles.howCard}>
              <div className={styles.howStep}>{step}</div>
              <div className={styles.howIcon}>{icon}</div>
              <h3 className={styles.howTitle}>{title}</h3>
              <p className={styles.howDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
