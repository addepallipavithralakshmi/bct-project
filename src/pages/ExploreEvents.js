import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3Context } from '../components/layout/AppLayout';
import EventCard from '../components/ui/EventCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import styles from './ExploreEvents.module.css';

const EVENT_TYPES = ['All', 'Stadium', 'Concert Hall', 'Theater', 'Hotel', 'Outdoor Venue', 'Confrence Center'];

export default function ExploreEvents() {
  const navigate = useNavigate();
  const { getEventsContract } = useWeb3Context();

  const [events, setEvents]           = useState([]);
  const [eventTickets, setEventTickets] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [activeType, setActiveType]   = useState('All');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const contract = getEventsContract();
        const [ev1, ev2] = await Promise.all([
          contract.methods.getAllEvents1Locked().call(),
          contract.methods.getAllEvents2Locked().call(),
        ]);
        setEvents(ev1);
        setEventTickets(ev2);
      } catch (err) {
        setError('Failed to load events. Ensure Ganache is running and contracts are deployed.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getEventsContract]);

  // Client-side filtering
  const filtered = events.filter((ev, i) => {
    const matchType   = activeType === 'All' || ev.eventType === activeType;
    const matchSearch = !search
      || ev.eventName?.toLowerCase().includes(search.toLowerCase())
      || ev.eventType?.toLowerCase().includes(search.toLowerCase())
      || ev.eventId?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Explore Events</h1>
          <p className={styles.sub}>Discover events registered on the blockchain</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by event name, type, or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search events"
          />
        </div>
        <div className={styles.typeFilters} role="group" aria-label="Filter by event type">
          {EVENT_TYPES.map(type => (
            <button
              key={type}
              className={`${styles.typeBtn} ${activeType === type ? styles.activeType : ''}`}
              onClick={() => setActiveType(type)}
              aria-pressed={activeType === type}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className={styles.resultCount}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
          {search || activeType !== 'All' ? ` (filtered from ${events.length} total)` : ''}
        </p>
      )}

      {/* Content */}
      {error ? (
        <div className={styles.errorBox} role="alert">
          <span>⚠️</span>
          <div>
            <strong>Could not load events</strong>
            <p>{error}</p>
          </div>
        </div>
      ) : loading ? (
        <LoadingSkeleton count={6} type="card" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={events.length === 0 ? '📭' : '🔎'}
          title={events.length === 0 ? 'No events registered yet' : 'No events match your search'}
          description={
            events.length === 0
              ? 'Use the Manage Events page to create the first event on the blockchain.'
              : 'Try a different search term or category filter.'
          }
          actionLabel={events.length === 0 ? 'Create Event' : 'Clear Filters'}
          onAction={() => {
            if (events.length === 0) navigate('/manage-events');
            else { setSearch(''); setActiveType('All'); }
          }}
        />
      ) : (
        <div className={styles.grid}>
          {filtered.map((ev, i) => {
            // find matching ticket detail by eventId
            const tickets = eventTickets.find(t => t.eventId === ev.eventId) || eventTickets[i];
            return (
              <EventCard
                key={ev.eventId || i}
                eventInfo={ev}
                eventTickets={tickets}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
