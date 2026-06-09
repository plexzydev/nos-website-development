'use client';

import { useState } from 'react';
import { BellOff, BellRing } from 'lucide-react';

export function DiscordNotifToggle({ initialValue }: { initialValue: boolean }) {
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/toggle-discord-notifs', { method: 'POST' });
      const data = await res.json();
      setEnabled(data.discordNotifs);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
        enabled
          ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20 hover:bg-green-500/20'
          : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20'
      } ${loading ? 'opacity-50 cursor-wait' : ''}`}
      title={enabled ? 'Desactivar notificaciones Discord' : 'Activar notificaciones Discord'}
    >
      {enabled ? <BellRing className="size-3.5" /> : <BellOff className="size-3.5" />}
      Discord DM: {enabled ? 'Activado' : 'Desactivado'}
    </button>
  );
}
