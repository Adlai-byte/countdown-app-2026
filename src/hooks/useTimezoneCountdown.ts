import { useState, useEffect, useMemo } from 'react';

interface TimezoneCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isNewYear: boolean;
  totalSeconds: number;
}

/**
 * Calculate countdown to New Year for a specific timezone
 */
export function useTimezoneCountdown(timezone: string): TimezoneCountdown {
  const targetYear = useMemo(() => new Date().getFullYear() + 1, []);

  const calculateTimeLeft = (): TimezoneCountdown => {
    // Get current time in the target timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');

    // Create date object representing "now" in target timezone
    const tzYear = getPart('year');
    const tzMonth = getPart('month');
    const tzDay = getPart('day');
    const tzHour = getPart('hour');
    const tzMinute = getPart('minute');
    const tzSecond = getPart('second');

    // If already in the new year in this timezone
    if (tzYear >= targetYear) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isNewYear: true,
        totalSeconds: 0,
      };
    }

    // Calculate difference to midnight Jan 1 of target year
    const tzNow = new Date(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond);
    const newYear = new Date(targetYear, 0, 1, 0, 0, 0);
    const difference = newYear.getTime() - tzNow.getTime();

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

  const [timeLeft, setTimeLeft] = useState<TimezoneCountdown>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [timezone, targetYear]);

  return timeLeft;
}

/**
 * Get current local time in a timezone
 */
export function useTimezoneTime(timezone: string): string {
  const [time, setTime] = useState(() => formatTime(timezone));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime(timezone));
    }, 1000);

    return () => clearInterval(timer);
  }, [timezone]);

  return time;
}

function formatTime(timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date());
}
