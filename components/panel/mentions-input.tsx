'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Mechanic = { id: string; nickname: string | null; userHash: string | null };

export function MentionsInput({ name }: { name: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Mechanic[]>([]);
  const [selected, setSelected] = useState<Mechanic[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const cleanQuery = query.startsWith('@') ? query.slice(1) : query;
        const res = await fetch(`/api/mechanics?q=${encodeURIComponent(cleanQuery)}`);
        const data = await res.json();
        // Filter out already selected
        const filtered = data.filter((m: Mechanic) => !selected.find(s => s.id === m.id));
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  }, [query, selected]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addMechanic = (mechanic: Mechanic) => {
    setSelected(prev => [...prev, mechanic]);
    setQuery('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeMechanic = (id: string) => {
    setSelected(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input with the actual IDs */}
      <input type="hidden" name={name} value={selected.map(m => m.id).join(',')} />

      {/* Selected chips + input */}
      <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background/50 px-3 py-2 ring-offset-background transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-card">
        {selected.map(m => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20"
          >
            @{m.nickname}
            <button
              type="button"
              onClick={() => removeMechanic(m.id)}
              className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder={selected.length === 0 ? 'Buscar mecánico...' : ''}
          className="min-w-[120px] flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-50 mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/30 backdrop-blur-xl">
          {loading ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">Sin resultados</div>
          ) : (
            results.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => addMechanic(m)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase text-primary ring-1 ring-primary/20">
                  {m.nickname?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium">{m.nickname} <span className="text-primary/70">{m.userHash}</span></p>
                  <p className="text-[10px] text-muted-foreground">{m.id}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
