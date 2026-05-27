import { useEffect, useState } from 'react';
import { ref, onValue, off, push, set, serverTimestamp, query, limitToLast, orderByChild } from 'firebase/database';
import { database } from '../firebase/config';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export function useLiveChat(chatRoomId: string = 'global') {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Listen to messages
    const messagesRef = query(ref(database, `messages/${chatRoomId}`), limitToLast(50));
    
    const messagesUnsub = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        setMessages(parsed);
      } else {
        setMessages([]);
      }
    });

    // Listen to typing indicators
    const typingRef = ref(database, `chats/${chatRoomId}/typing`);
    const typingUnsub = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        setTyping(snapshot.val());
      } else {
        setTyping({});
      }
    });

    return () => {
      off(messagesRef, 'value', messagesUnsub);
      off(typingRef, 'value', typingUnsub);
    };
  }, [chatRoomId]);

  const sendMessage = async (senderId: string, text: string) => {
    const msgRef = push(ref(database, `messages/${chatRoomId}`));
    await set(msgRef, {
      senderId,
      text,
      timestamp: serverTimestamp()
    });
  };

  const setTypingStatus = async (userId: string, isTyping: boolean) => {
    const typingRef = ref(database, `chats/${chatRoomId}/typing/${userId}`);
    await set(typingRef, isTyping ? true : null);
  };

  return { messages, typing, sendMessage, setTypingStatus };
}
