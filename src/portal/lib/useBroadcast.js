// ---------------------------------------------------------------------
// Subscribe to a Supabase Realtime Broadcast channel.
//
//   useBroadcast('booking-SM-XXXX', {
//     status: (payload) => { ... },
//   }, enabled)
//
// Handlers are read from a ref so re-renders don't tear down the channel.
// Returns a `connected` flag the UI can use to fall back to polling.
// ---------------------------------------------------------------------
import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';

export function useBroadcast(channelName, events, enabled = true) {
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !supabase || !channelName) {
      setConnected(false);
      return undefined;
    }
    const channel = supabase.channel(channelName, { config: { broadcast: { self: true } } });

    Object.keys(eventsRef.current || {}).forEach((event) => {
      channel.on('broadcast', { event }, ({ payload }) => {
        const fn = eventsRef.current[event];
        if (typeof fn === 'function') fn(payload);
      });
    });

    channel.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED');
    });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [channelName, enabled]);

  return connected;
}
