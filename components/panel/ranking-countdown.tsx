'use client';

import { useEffect, useState } from 'react';
import { Clock, Timer } from 'lucide-react';

interface RankingCountdownProps {
  endDateISO: string;
}

export function RankingCountdown({ endDateISO }: RankingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const end = new Date(endDateISO);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('¡Periodo finalizado!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(' '));
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDateISO]);

  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-4 py-2.5">
      <Timer className="size-4 text-primary shrink-0" />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Termina en</span>
        <span className="font-heading text-sm font-700 tracking-tight text-foreground">{timeLeft || '...'}</span>
      </div>
    </div>
  );
}
