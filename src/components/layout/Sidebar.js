import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { shortenAddress } from '../../config/contracts';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { path: '/',               label: 'Overview',           icon: '🏠', end: true },
  { path: '/events',         label: 'Explore Events',     icon: '🔍' },
  { path: '/my-tickets',     label: 'My Tickets',         icon: '🎟️' },
  { path: '/verify',         label: 'Verify Ticket',      icon: '✅' },
  { path: '/manage-events',  label: 'Manage Events',      icon: '📋' },
  { path: '/manage-venues',  label: 'Manage Venues',      icon: '🏛️' },
  { path: '/resale',         label: 'Resale Marketplace', icon: '🔄' },
  { path: '/settings',       label: 'Settings',           icon: '⚙️' },
];

export default function Sidebar({ account }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        ☰
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🎫</span>
          <span className={styles.brandName}>EventChain</span>
          <button
            className={styles.closeBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_ITEMS.map(({ path, label, icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon} aria-hidden="true">{icon}</span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          {account ? (
            <div className={styles.accountBadge}>
              <span className={styles.accountDot} />
              <span className={styles.accountAddress}>{shortenAddress(account)}</span>
            </div>
          ) : (
            <div className={styles.notConnected}>Wallet not connected</div>
          )}
          <p className={styles.network}>Ganache · Chain 1337</p>
        </div>
      </aside>
    </>
  );
}
