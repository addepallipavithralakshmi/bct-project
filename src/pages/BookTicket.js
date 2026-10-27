import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3Context } from '../components/layout/AppLayout';
import TransactionStatus from '../components/ui/TransactionStatus';
import styles from './BookTicket.module.css';

function generateTicketId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function BookTicket() {
  const { eventId } = useParams();
  const navigate    = useNavigate();
  const { account, isConnected, isCorrectNetwork, connectWallet, getEventsContract, getTicketsContract } = useWeb3Context();

  const [eventInfo, setEventInfo]     = useState(null);
  const [eventTickets, setEventTickets] = useState(null);
  const [availableSeats, setAvailableSeats] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState('');

  const [ticketId, setTicketId]       = useState(generateTicketId);
  const [identifier, setIdentifier]   = useState('');
  const [level, setLevel]             = useState('Normal');
  const [validationErrors, setValidationErrors] = useState([]);

  const [txStatus, setTxStatus]       = useState('idle'); // idle | pending | success | error
  const [txHash, setTxHash]           = useState('');
  const [txError, setTxError]         = useState('');

  // Load event details
  useEffect(() => {
    if (!eventId) return;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const evContract  = getEventsContract();
        const tkContract  = getTicketsContract();

        const [ev1, ev2] = await Promise.all([
          evContract.methods.getEvent1Locked(eventId).call(),
          evContract.methods.getEvent2Locked(eventId).call(),
        ]);

        setEventInfo(ev1);
        setEventTickets(ev2);

        // Try to get available seats from Tickets contract
        try {
          const seats = await tkContract.methods.getAvailableSeats(eventId).call();
          setAvailableSeats(Number(seats));
        } catch {
          // Event may not be registered in Tickets contract — compute from Events data
          const total = Number(ev2.vipTickets) + Number(ev2.normalTickets);
          setAvailableSeats(total);
        }
      } catch (err) {
        setLoadError(`Could not load event "${eventId}". It may not exist on the current network.`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId, getEventsContract, getTicketsContract]);

  // Price in Wei for selected level
  const priceWei = eventTickets
    ? level === 'VIP'
      ? BigInt(eventTickets.vipPrice || 0)
      : BigInt(eventTickets.normalPrice || 0)
    : BigInt(0);

  const priceEth = Number(priceWei) / 1e18;

  // Validation
  const validate = () => {
    const errs = [];
    if (!ticketId.trim())   errs.push('Ticket ID is required.');
    if (!identifier.trim()) errs.push('Ticket identifier is required.');
    if (!isConnected)       errs.push('You must connect your wallet first.');
    if (!isCorrectNetwork)  errs.push('Please switch to the Ganache network (Chain ID 1337).');
    if (availableSeats !== null && availableSeats <= 0) errs.push('No seats available for this event.');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setValidationErrors(errs);
    if (errs.length > 0) return;

    setTxStatus('pending');
    setTxHash('');
    setTxError('');

    try {
      const contract = getTicketsContract();
      const receipt  = await contract.methods
        .createTicketLocked(ticketId.trim(), identifier.trim(), eventId, level)
        .send({
          from:  account,
          value: priceWei.toString(),
          gas:   500000,
        });

      setTxHash(receipt.transactionHash);
      setTxStatus('success');
      setAvailableSeats(prev => prev !== null ? Math.max(0, prev - 1) : null);
    } catch (err) {
      const msg = err.message || 'Transaction failed.';
      if (msg.includes('denied') || msg.includes('rejected') || err.code === 4001) {
        setTxError('Transaction was rejected in your wallet.');
      } else if (msg.includes('Seats Full') || msg.includes('Seat')) {
        setTxError('No seats are available for this event.');
      } else if (msg.includes('Ticket exists')) {
        setTxError('A ticket with this ID already exists. Please use a different Ticket ID.');
      } else if (msg.includes('Not enough ETH')) {
        setTxError('Insufficient ETH sent. The exact price must be sent.');
      } else {
        setTxError(msg.length > 200 ? msg.slice(0, 200) + '…' : msg);
      }
      setTxStatus('error');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} aria-label="Loading event details" />
        <p>Loading event details…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.errorPage} role="alert">
        <span>⚠️</span>
        <div>
          <strong>Event not found</strong>
          <p>{loadError}</p>
          <button className={styles.backBtn} onClick={() => navigate('/events')}>← Back to Events</button>
        </div>
      </div>
    );
  }

  const dateStr = eventInfo?.eventDate
    ? new Date(Number(eventInfo.eventDate) * 1000).toLocaleDateString('en-US', { dateStyle: 'long' })
    : 'Date TBD';

  return (
    <div className={styles.page}>
      {/* Back */}
      <button className={styles.backLink} onClick={() => navigate('/events')}>
        ← Back to Events
      </button>

      <div className={styles.layout}>
        {/* Event info panel */}
        <aside className={styles.eventPanel}>
          <div className={styles.eventCard}>
            <div className={styles.eventIcon}>{
              eventInfo?.eventType === 'Stadium'       ? '🏟️' :
              eventInfo?.eventType === 'Concert Hall'  ? '🎵' :
              eventInfo?.eventType === 'Theater'       ? '🎭' : '🎪'
            }</div>
            <h2 className={styles.eventName}>{eventInfo?.eventName || eventId}</h2>
            {eventInfo?.eventType && (
              <span className={styles.typeBadge}>{eventInfo.eventType}</span>
            )}
            <div className={styles.eventMeta}>
              <div className={styles.metaRow}>
                <span>📅</span><span>{dateStr}</span>
              </div>
              {eventInfo?.venueId && (
                <div className={styles.metaRow}>
                  <span>📍</span><span>Venue: {eventInfo.venueId}</span>
                </div>
              )}
              {availableSeats !== null && (
                <div className={styles.metaRow}>
                  <span>🪑</span>
                  <span className={availableSeats === 0 ? styles.noSeats : ''}>
                    {availableSeats === 0 ? '❌ Sold out' : `${availableSeats} seats available`}
                  </span>
                </div>
              )}
            </div>

            {eventTickets && (
              <div className={styles.pricingBox}>
                <p className={styles.pricingTitle}>Ticket Pricing</p>
                {Number(eventTickets.normalPrice) > 0 && (
                  <div className={styles.priceRow}>
                    <span>Normal</span>
                    <strong>{(Number(eventTickets.normalPrice) / 1e18).toFixed(6)} ETH</strong>
                  </div>
                )}
                {Number(eventTickets.vipPrice) > 0 && (
                  <div className={`${styles.priceRow} ${styles.vipRow}`}>
                    <span>⭐ VIP</span>
                    <strong>{(Number(eventTickets.vipPrice) / 1e18).toFixed(6)} ETH</strong>
                  </div>
                )}
              </div>
            )}

            {eventInfo?.description && (
              <p className={styles.description}>{eventInfo.description}</p>
            )}
          </div>
        </aside>

        {/* Booking form */}
        <main className={styles.formPanel}>
          <h1 className={styles.formTitle}>Book Your Ticket</h1>
          <p className={styles.formSub}>All fields are required. Your ticket will be recorded on the blockchain.</p>

          {/* Wallet required */}
          {!isConnected && (
            <div className={styles.walletWarning}>
              <strong>⚠️ Wallet Required</strong>
              <p>Connect your MetaMask wallet to book tickets.</p>
              <button className={styles.connectBtn} onClick={connectWallet}>Connect Wallet</button>
            </div>
          )}

          {availableSeats === 0 && (
            <div className={styles.soldOutBanner} role="alert">
              🚫 This event is sold out. No seats are available.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ticketId">
                Ticket ID
                <span className={styles.hint}> — auto-generated, editable</span>
              </label>
              <div className={styles.inputRow}>
                <input
                  id="ticketId"
                  type="text"
                  className={styles.input}
                  value={ticketId}
                  onChange={e => setTicketId(e.target.value)}
                  placeholder="Unique ticket identifier"
                  aria-describedby="ticketIdHint"
                  required
                />
                <button
                  type="button"
                  className={styles.regenBtn}
                  onClick={() => setTicketId(generateTicketId())}
                  title="Generate new ID"
                >
                  🔄
                </button>
              </div>
              <p className={styles.fieldHint} id="ticketIdHint">
                Must be unique on the blockchain. Regenerate if booking fails with "Ticket exists".
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="identifier">
                Your Name or ID Number
                <span className={styles.hint}> — stored on-chain</span>
              </label>
              <input
                id="identifier"
                type="text"
                className={styles.input}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="e.g. John Doe or passport number"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ticket Level</label>
              <div className={styles.levelOptions} role="group" aria-label="Ticket level">
                {['Normal', 'VIP'].map(opt => (
                  <label
                    key={opt}
                    className={`${styles.levelOption} ${level === opt ? styles.selectedLevel : ''}`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={opt}
                      checked={level === opt}
                      onChange={() => setLevel(opt)}
                      className={styles.srOnly}
                    />
                    <span>{opt === 'VIP' ? '⭐ VIP' : '🪑 Normal'}</span>
                    {eventTickets && (
                      <span className={styles.levelPrice}>
                        {opt === 'VIP'
                          ? `${(Number(eventTickets.vipPrice) / 1e18).toFixed(6)} ETH`
                          : `${(Number(eventTickets.normalPrice) / 1e18).toFixed(6)} ETH`
                        }
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Price summary */}
            <div className={styles.priceSummary}>
              <div className={styles.summaryRow}>
                <span>Ticket price ({level})</span>
                <strong>{priceEth.toFixed(6)} ETH</strong>
              </div>
              <p className={styles.priceWarning}>
                ⚠️ The exact amount ({priceEth.toFixed(6)} ETH) will be sent to the event admin.
                The current contract does not refund overpayment — send only the required amount.
              </p>
            </div>

            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className={styles.validationErrors} role="alert">
                <ul>
                  {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <TransactionStatus
              status={txStatus}
              txHash={txHash}
              error={txError}
              message={`Ticket "${ticketId}" booked successfully on the blockchain!`}
            />

            {txStatus === 'success' ? (
              <div className={styles.successActions}>
                <button type="button" className={styles.primaryBtn} onClick={() => navigate('/my-tickets')}>
                  View My Tickets →
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={() => navigate('/events')}>
                  Browse More Events
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!isConnected || !isCorrectNetwork || availableSeats === 0 || txStatus === 'pending'}
              >
                {txStatus === 'pending' ? 'Processing…' : `Confirm Booking — ${priceEth.toFixed(6)} ETH`}
              </button>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
