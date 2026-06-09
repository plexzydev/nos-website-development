'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id?: string;
  title: string;
  dailyTime: string;
}

interface Props {
  activities: Activity[];
}

function getNextActivityAndDate(activities: Activity[]): { target: Date; title: string; dailyTime: string } | null {
  if (!activities || activities.length === 0) return null;

  const now = new Date();
  
  // Sort activities by dailyTime to ensure chronological order just in case
  const sorted = [...activities].sort((a, b) => a.dailyTime.localeCompare(b.dailyTime));

  for (const activity of sorted) {
    const [hours, minutes] = activity.dailyTime.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If target + 60s is in the future, this is our next/current activity
    if (target.getTime() + (60 * 1000) > now.getTime()) {
      return { target, title: activity.title, dailyTime: activity.dailyTime };
    }
  }

  // If all activities for today have passed, the next one is the first activity tomorrow
  const firstActivity = sorted[0];
  const [hours, minutes] = firstActivity.dailyTime.split(':').map(Number);
  const tomorrowTarget = new Date();
  tomorrowTarget.setDate(tomorrowTarget.getDate() + 1);
  tomorrowTarget.setHours(hours, minutes, 0, 0);
  
  return { target: tomorrowTarget, title: firstActivity.title, dailyTime: firstActivity.dailyTime };
}

export function CountdownTimer({ activities }: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isNow, setIsNow] = useState(false);
  const [currentInfo, setCurrentInfo] = useState<{ title: string; dailyTime: string } | null>(null);

  useEffect(() => {
    if (!activities || activities.length === 0) return;

    const tick = () => {
      const next = getNextActivityAndDate(activities);
      if (!next) return;

      const now = Date.now();
      const diff = next.target.getTime() - now;

      setCurrentInfo({ title: next.title, dailyTime: next.dailyTime });

      // If within 60 seconds past the target, show "in progress"
      if (diff <= 0 && diff > -60000) {
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
  }, [activities]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (!activities || activities.length === 0) {
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
        <p className="mt-3 text-xs font-semibold text-primary">¡Actividad en curso! — {currentInfo?.title}</p>
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
        Próxima: <span className="font-semibold text-foreground">{currentInfo?.title}</span>
        <span className="ml-2 text-muted-foreground/60">· Todos los días a las {currentInfo?.dailyTime}hs</span>
      </p>
    </>
  );
}
