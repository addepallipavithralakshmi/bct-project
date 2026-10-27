import React from 'react';
import styles from './LoadingSkeleton.module.css';

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.shimmer} ${styles.image}`} />
      <div className={styles.cardBody}>
        <div className={`${styles.shimmer} ${styles.badge}`} />
        <div className={`${styles.shimmer} ${styles.title}`} />
        <div className={`${styles.shimmer} ${styles.line}`} />
        <div className={`${styles.shimmer} ${styles.line} ${styles.short}`} />
      </div>
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className={styles.stat}>
      <div className={`${styles.shimmer} ${styles.statIcon}`} />
      <div className={styles.statBody}>
        <div className={`${styles.shimmer} ${styles.statLabel}`} />
        <div className={`${styles.shimmer} ${styles.statValue}`} />
      </div>
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className={styles.listItem}>
      <div className={`${styles.shimmer} ${styles.listAvatar}`} />
      <div className={styles.listBody}>
        <div className={`${styles.shimmer} ${styles.line}`} />
        <div className={`${styles.shimmer} ${styles.line} ${styles.short}`} />
      </div>
    </div>
  );
}

/**
 * @param {number}  count - How many skeleton items to render
 * @param {'card'|'stat'|'list'} type
 */
export default function LoadingSkeleton({ count = 4, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className={styles.statsGrid}>
        {items.map((_, i) => <SkeletonStat key={i} />)}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={styles.list}>
        {items.map((_, i) => <SkeletonListItem key={i} />)}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {items.map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
