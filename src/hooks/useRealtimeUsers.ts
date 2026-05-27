import { useEffect, useState } from 'react';
import { ref, onValue, off, query, limitToLast } from 'firebase/database';
import { database } from '../firebase/config';

export interface UserNode {
  email: string;
  displayName: string;
  createdAt: number;
  photoURL?: string;
  role?: string;
  suspended?: boolean;
}

export function useRealtimeUsers() {
  const [users, setUsers] = useState<Record<string, UserNode>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = query(ref(database, 'users'), limitToLast(50));
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsers(snapshot.val());
      } else {
        setUsers({});
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => {
      off(usersRef, 'value', unsubscribe);
    };
  }, []);

  return { users, loading };
}
