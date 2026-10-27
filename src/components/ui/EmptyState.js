import React from 'react';
import styles from './EmptyState.module.css';

/**
 * Generic empty state component.
 * @param {string} icon        - Emoji or icon string
 * @param {string} title       - Heading text
 * @param {string} description - Subtext
 * @param {string} actionLabel - Button label (optional)
 * @param {Function} onAction  - Button click handler (optional)
 */
export default function EmptyState({ icon = '📭', title, description, actionLabel, onAction }) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      {title       && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <button className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
