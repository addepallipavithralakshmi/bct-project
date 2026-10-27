import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EventCard.module.css';

/**
 * Displays an event as a card.
 * @param {Object} eventInfo   - EventLocked struct from Events.getAllEvents1Locked()
 * @param {Object} eventTickets - EventTicketsDetail from Events.getAllEvents2Locked()
 */
export default function EventCard({ eventInfo, eventTickets }) {
  const navigate = useNavigate();

  if (!eventInfo) return null;

  const dateMs    = eventInfo.eventDate ? Number(eventInfo.eventDate) * 1000 : null;
  const dateStr   = dateMs
    ? new Date(dateMs).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Date TBD';

  const normalPriceWei = eventTickets?.normalPrice ? Number(eventTickets.normalPrice) : 0;
  const vipPriceWei    = eventTickets?.vipPrice    ? Number(eventTickets.vipPrice)    : 0;
  const normalPriceEth = (normalPriceWei / 1e18).toFixed(4);
  const vipPriceEth    = (vipPriceWei    / 1e18).toFixed(4);

  const status = eventInfo.status || 'Unavailable';
  const statusClass = status.toLowerCase() === 'available'
    ? styles.statusAvailable
    : status.toLowerCase() === 'unavailable'
      ? styles.statusUnavailable
      : styles.statusOther;

  return (
    <article className={styles.card}>
      {/* Image placeholder */}
      <div className={styles.imagePlaceholder} aria-hidden="true">
        <span className={styles.imagePlaceholderIcon}>
          {eventInfo.eventType === 'Stadium'        ? '🏟️'
          : eventInfo.eventType === 'Concert Hall'  ? '🎵'
          : eventInfo.eventType === 'Theater'       ? '🎭'
          : eventInfo.eventType === 'Hotel'         ? '🏨'
          : eventInfo.eventType === 'Outdoor Venue' ? '🌳'
          : '🎪'}
        </span>
        <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.typeBadge}>{eventInfo.eventType || 'Event'}</div>
        <h3 className={styles.name}>{eventInfo.eventName || 'Unnamed Event'}</h3>

        <div className={styles.meta}>
          <span className={styles.metaItem}>📅 {dateStr}</span>
          {eventInfo.venueId && (
            <span className={styles.metaItem}>📍 Venue {eventInfo.venueId}</span>
          )}
        </div>

        {(normalPriceWei > 0 || vipPriceWei > 0) && (
          <div className={styles.prices}>
            {normalPriceWei > 0 && (
              <span className={styles.priceTag}>Normal: {normalPriceEth} ETH</span>
            )}
            {vipPriceWei > 0 && (
              <span className={`${styles.priceTag} ${styles.vip}`}>VIP: {vipPriceEth} ETH</span>
            )}
          </div>
        )}

        <div className={styles.footer}>
          {eventTickets && (
            <span className={styles.seats}>
              {Number(eventTickets.normalTickets) + Number(eventTickets.vipTickets)} seats
            </span>
          )}
          <button
            className={styles.bookBtn}
            onClick={() => navigate(`/book/${eventInfo.eventId}`)}
            aria-label={`Book ticket for ${eventInfo.eventName}`}
          >
            Book Ticket →
          </button>
        </div>
      </div>
    </article>
  );
}
