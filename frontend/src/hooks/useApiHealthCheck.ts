import { useEffect, useRef } from 'react';
import { healthApi } from '@/services/api';
import { useConnectionStore } from '@/stores/connectionStore';

const HEALTH_CHECK_INTERVAL = 5000; // 5 seconds
const HEALTH_CHECK_TIMEOUT = 3000; // 3 seconds

export function useApiHealthCheck() {
  const setApiOnline = useConnectionStore((state) => state.setApiOnline);
  const intervalRef = useRef<NodeJS.Timeout>();
  const isOnlineRef = useRef(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Health check timeout')), HEALTH_CHECK_TIMEOUT);
        });

        await Promise.race([
          healthApi.check(),
          timeoutPromise
        ]);

        if (!isOnlineRef.current) {
          isOnlineRef.current = true;
          setApiOnline(true);
        }
      } catch (error) {
        if (isOnlineRef.current) {
          isOnlineRef.current = false;
          setApiOnline(false);
        }
      }
    };

    checkHealth();

    intervalRef.current = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setApiOnline]);
}