import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import { VoteButtons } from './vote-buttons';

interface ThreadCardProps {
  thread: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    upvotes: number;
    downvotes: number;
    author: {
      nickname: string | null;
      avatarUrl: string | null;
    };
    commentsCount?: number;
  };
}

export function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <div className="flex gap-4 p-4 border border-border rounded-xl bg-card hover:bg-secondary/20 transition-colors">
      {/* Voting column */}
      <VoteButtons threadId={thread.id} upvotes={thread.upvotes} downvotes={thread.downvotes} />

      {/* Content column */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <Link href={`/foro/${thread.id}`} className="block group">
          <h3 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {thread.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 mt-1">
            {thread.content}
          </p>
        </Link>
        
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {thread.author.avatarUrl ? (
              <img src={thread.author.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/20" />
            )}
            <span className="font-medium text-foreground">{thread.author.nickname || 'Anónimo'}</span>
          </div>
          <span>•</span>
          <span>{formatDistanceToNow(thread.createdAt, { addSuffix: true, locale: es })}</span>
          
          {thread.commentsCount !== undefined && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                <MessageSquare className="size-4" />
                <span>{thread.commentsCount} comentarios</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
