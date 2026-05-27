import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';

export interface Presence {
  status: 'online' | 'offline';
  last_seen: number;
}

export function usePresence(userId: string | undefined) {
  const [presence, setPresence] = useState<Presence | null>(null);

  useEffect(() => {
    if (!userId) return;

    const presenceRef = ref(database, `/presence/${userId}`);
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        setPresence(snapshot.val());
      } else {
        setPresence(null);
      }
    });

    return () => {
      off(presenceRef, 'value', unsubscribe);
    };
  }, [userId]);

  return presence;
}
