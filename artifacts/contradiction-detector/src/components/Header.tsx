import React from "react";
import { useGetStats } from "@workspace/api-client-react";
import { getGetStatsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const { data: stats, isLoading } = useGetStats({
    query: {
      queryKey: getGetStatsQueryKey(),
    }
  });

  return (
    <header className="border-b border-border bg-background py-8 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold tracking-tight text-foreground">
            Advice Contradiction Detector
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-lg font-serif">
            Where Lenny's guests disagree — AI-analyzed across 300+ episodes
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm font-mono text-muted-foreground uppercase tracking-widest mt-2">
          {isLoading ? (
            <Skeleton className="h-5 w-64 bg-muted/50" />
          ) : stats ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-primary">{stats.total_contradictions}</span> CONTRADICTIONS
              <span className="opacity-40">·</span>
              <span className="text-foreground">{stats.total_topics}</span> TOPICS
              <span className="opacity-40">·</span>
              <span className="text-foreground">{stats.total_guests_featured}</span> GUESTS
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
