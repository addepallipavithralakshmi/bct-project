import React from 'react';
import { shortenAddress } from '../../config/contracts';
import styles from './TicketCard.module.css';

/**
 * Displays a single ticket as a card.
 * @param {Object} ticket - TicketLocked struct from Tickets.getTicketLocked()
 */
export default function TicketCard({ ticket }) {
  if (!ticket || !ticket.ticketId) return null;

  const dateMs  = ticket.dateCreated ? Number(ticket.dateCreated) * 1000 : null;
  const dateStr = dateMs
    ? new Date(dateMs).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Unknown';

  const isVip     = ticket.ticketLevel?.toLowerCase() === 'vip';
  const isScanned = Boolean(ticket.isScanned);

  return (
    <article className={`${styles.card} ${isVip ? styles.vip : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.icon} aria-hidden="true">🎟️</span>
          <div>
            <p className={styles.label}>Ticket ID</p>
            <p className={styles.ticketId} title={ticket.ticketId}>
              {ticket.ticketId.length > 16
                ? `${ticket.ticketId.slice(0, 8)}…${ticket.ticketId.slice(-8)}`
                : ticket.ticketId}
            </p>
          </div>
        </div>
        <div className={styles.badges}>
          <span className={`${styles.levelBadge} ${isVip ? styles.vipBadge : styles.normalBadge}`}>
            {isVip ? '⭐ VIP' : '🪑 Normal'}
          </span>
          <span className={`${styles.scanBadge} ${isScanned ? styles.scanned : styles.valid}`}>
            {isScanned ? '✅ Used' : '🟢 Valid'}
          </span>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Event ID</span>
          <span className={styles.detailValue}>{ticket.eventId || '—'}</span>
        </div>
        {ticket.ticketIdentifier && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Identifier</span>
            <span className={styles.detailValue}>{ticket.ticketIdentifier}</span>
          </div>
        )}
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Owner</span>
          <span className={styles.detailValue}>
            <code className={styles.address}>{shortenAddress(ticket.owner)}</code>
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Booked</span>
          <span className={styles.detailValue}>{dateStr}</span>
        </div>
      </div>

      {isScanned && (
        <div className={styles.usedBanner} role="status">
          This ticket has been used. Entry was verified.
        </div>
      )}
    </article>
  );
}
