import { useState, useEffect, useMemo } from 'react';
import type { CountdownTime } from '@/types';

export function useCountdown(
  targetYear: number = new Date().getFullYear() + 1
): CountdownTime {
  const targetDate = useMemo(() => {
    return new Date(targetYear, 0, 1, 0, 0, 0); // January 1st, midnight
  }, [targetYear]);

  const calculateTimeLeft = (): CountdownTime => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isNewYear: true,
        totalSeconds: 0,
      };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds, isNewYear: false, totalSeconds };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}
