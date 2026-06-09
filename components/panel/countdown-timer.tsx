'use client';

import { useEffect, useState } from 'react';

interface Props {
  dailyTime: string | null; // e.g. '14:00'
  title: string | null;
}

function getNextOccurrence(dailyTime: string): Date {
  const [hours, minutes] = dailyTime.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // If the time already passed today, set it to tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

export function CountdownTimer({ dailyTime, title }: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isNow, setIsNow] = useState(false);

  useEffect(() => {
    if (!dailyTime) return;

    const tick = () => {
      const target = getNextOccurrence(dailyTime);
      const now = Date.now();
      const diff = target.getTime() - now;

      // If within 60 seconds of the target, show "in progress"
      if (diff <= 0) {
        setIsNow(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsNow(false);
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [dailyTime]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (!dailyTime) {
    return (
      <>
        <div className="mt-5 flex items-baseline gap-1 font-heading">
          <span className="text-5xl font-700 tabular-nums text-foreground/30">00</span>
          <span className="text-lg text-muted-foreground/50">h</span>
          <span className="text-5xl font-700 tabular-nums text-foreground/30">00</span>
          <span className="text-lg text-muted-foreground/50">m</span>
          <span className="text-5xl font-700 tabular-nums text-foreground/30">00</span>
          <span className="text-lg text-muted-foreground/50">s</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Sin actividades programadas</p>
      </>
    );
  }

  if (isNow) {
    return (
      <>
        <div className="mt-5 flex items-baseline gap-1 font-heading">
          <span className="text-5xl font-700 tabular-nums text-primary animate-pulse">00</span>
          <span className="text-lg text-muted-foreground">h</span>
          <span className="text-5xl font-700 tabular-nums text-primary animate-pulse">00</span>
          <span className="text-lg text-muted-foreground">m</span>
          <span className="text-5xl font-700 tabular-nums text-primary animate-pulse">00</span>
          <span className="text-lg text-muted-foreground">s</span>
        </div>
        <p className="mt-3 text-xs font-semibold text-primary">¡Actividad en curso! — {title}</p>
      </>
    );
  }

  return (
    <>
      <div className="mt-5 flex items-baseline gap-1 font-heading">
        <span className="text-5xl font-700 tabular-nums text-foreground">{pad(timeLeft.hours)}</span>
        <span className="text-lg text-muted-foreground">h</span>
        <span className="text-5xl font-700 tabular-nums text-foreground">{pad(timeLeft.minutes)}</span>
        <span className="text-lg text-muted-foreground">m</span>
        <span className="text-5xl font-700 tabular-nums text-primary">{pad(timeLeft.seconds)}</span>
        <span className="text-lg text-muted-foreground">s</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Próxima: <span className="font-semibold text-foreground">{title}</span>
        <span className="ml-2 text-muted-foreground/60">· Todos los días a las {dailyTime}hs</span>
      </p>
    </>
  );
}
