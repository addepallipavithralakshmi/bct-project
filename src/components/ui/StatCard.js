import React from 'react';
import styles from './StatCard.module.css';

export default function StatCard({ title, value, icon, color = 'primary', description }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.iconWrap}>
        <span className={styles.icon} aria-hidden="true">{icon}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value ?? '—'}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  );
}
