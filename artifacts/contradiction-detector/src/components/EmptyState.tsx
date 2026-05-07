import React from "react";

interface EmptyStateProps {
  message?: string;
  onClearFilters?: () => void;
}

export function EmptyState({ message = "No contradictions found matching your filters.", onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-border rounded-xl bg-card/50">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/50 border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <h3 className="font-serif text-xl font-medium text-foreground mb-2">
        Signal Lost
      </h3>
      <p className="text-muted-foreground font-mono text-sm max-w-sm mb-6">
        {message}
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="text-xs font-mono uppercase tracking-widest text-primary hover:text-primary/80 underline underline-offset-4"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
