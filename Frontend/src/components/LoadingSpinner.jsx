import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner = () => (
  <div className={styles.loadingContainer}>
    <Loader2 className={styles.icon} />
  </div>
);