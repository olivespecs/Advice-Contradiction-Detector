import React from "react";
import { type Contradiction } from "@workspace/api-client-react";

interface ContradictionCardProps {
  contradiction: Contradiction;
  onClick: (contradiction: Contradiction) => void;
}

export function ContradictionCard({ contradiction, onClick }: ContradictionCardProps) {
  const confidencePercent = Math.round(contradiction.confidence * 100);

  return (
    <div 
      onClick={() => onClick(contradiction)}
      className="group relative flex flex-col bg-card border border-border hover:border-primary/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]"
    >
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {contradiction.canonical_topic}
        </span>
        <span className="text-xs font-mono text-accent font-medium px-2 py-1 bg-accent/10 rounded-sm">
          {confidencePercent}% confident
        </span>
      </div>

      <div className="p-6 flex flex-col md:flex-row gap-6 relative grow">
        {/* Guest A */}
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-serif text-xl text-foreground font-semibold">
            {contradiction.guest_a.name}
          </h3>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
            {contradiction.guest_a.position}
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">
            "{contradiction.guest_a.quote}"
          </p>
        </div>

        {/* VS Divider */}
        <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-8">
          <div className="w-px h-full bg-border/50 absolute top-0 bottom-0 left-1/2 -translate-x-1/2" />
          <div className="relative z-10 bg-card border border-primary text-primary font-mono text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
            VS
          </div>
        </div>
        
        {/* Mobile VS Divider */}
        <div className="md:hidden flex items-center justify-center py-2">
          <div className="h-px w-full bg-border/50 relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-primary text-primary font-mono text-xs font-bold px-2 py-1 rounded-full">
              VS
            </div>
          </div>
        </div>

        {/* Guest B */}
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-serif text-xl text-foreground font-semibold">
            {contradiction.guest_b.name}
          </h3>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
            {contradiction.guest_b.position}
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">
            "{contradiction.guest_b.quote}"
          </p>
        </div>
      </div>

      <div className="p-5 bg-black/40 border-t border-border mt-auto">
        <p className="font-serif text-foreground/90 italic">
          {contradiction.tension_summary}
        </p>
      </div>
    </div>
  );
}
