'use client';

import { useTransition } from 'react';
import { voteForumThread } from '@/lib/db/actions-forum';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface VoteButtonsProps {
  threadId: string;
  upvotes: number;
  downvotes: number;
}

export function VoteButtons({ threadId, upvotes, downvotes }: VoteButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (val: 1 | -1) => {
    startTransition(async () => {
      try {
        await voteForumThread(threadId, val);
      } catch (e: any) {
        toast.error('Error al votar');
      }
    });
  };

  const totalScore = upvotes - downvotes;

  return (
    <div className="flex flex-col items-center bg-secondary/50 rounded-lg p-2 space-y-1">
      <button 
        onClick={() => handleVote(1)} 
        disabled={isPending}
        className="p-1 hover:bg-primary/20 hover:text-primary rounded text-muted-foreground transition-colors disabled:opacity-50"
        title="Votar positivo"
      >
        <ChevronUp className="size-6" />
      </button>
      <span className="font-heading font-bold text-lg">{totalScore}</span>
      <button 
        onClick={() => handleVote(-1)} 
        disabled={isPending}
        className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded text-muted-foreground transition-colors disabled:opacity-50"
        title="Votar negativo"
      >
        <ChevronDown className="size-6" />
      </button>
    </div>
  );
}
