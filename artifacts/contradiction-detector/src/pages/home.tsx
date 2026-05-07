import React, { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { ContradictionCard } from "@/components/ContradictionCard";
import { ExpandedContradictionModal } from "@/components/ExpandedContradictionModal";
import { EmptyState } from "@/components/EmptyState";
import { useListContradictions, getListContradictionsQueryKey } from "@workspace/api-client-react";
import { type Contradiction } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [highConfidenceOnly, setHighConfidenceOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContradiction, setSelectedContradiction] = useState<Contradiction | null>(null);

  const { data: contradictions, isLoading } = useListContradictions(
    {}, 
    {
      query: {
        queryKey: getListContradictionsQueryKey({}),
      }
    }
  );

  const filteredContradictions = useMemo(() => {
    if (!contradictions) return [];
    
    return contradictions.filter(c => {
      // Filter by topic
      if (selectedTopic && c.canonical_topic !== selectedTopic) {
        return false;
      }
      
      // Filter by confidence
      if (highConfidenceOnly && c.confidence < 0.80) {
        return false;
      }
      
      // Filter by guest name
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesA = c.guest_a.name.toLowerCase().includes(query);
        const matchesB = c.guest_b.name.toLowerCase().includes(query);
        if (!matchesA && !matchesB) {
          return false;
        }
      }
      
      return true;
    });
  }, [contradictions, selectedTopic, highConfidenceOnly, searchQuery]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <Header />
      
      <FilterBar
        selectedTopic={selectedTopic}
        onTopicSelect={setSelectedTopic}
        highConfidenceOnly={highConfidenceOnly}
        onConfidenceChange={setHighConfidenceOnly}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-border h-80">
                <Skeleton className="h-full w-full bg-card" />
              </div>
            ))}
          </div>
        ) : filteredContradictions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContradictions.map(contradiction => (
              <ContradictionCard 
                key={contradiction.id} 
                contradiction={contradiction} 
                onClick={setSelectedContradiction}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            onClearFilters={() => {
              setSelectedTopic(null);
              setHighConfidenceOnly(false);
              setSearchQuery("");
            }}
          />
        )}
      </main>

      <ExpandedContradictionModal
        contradiction={selectedContradiction}
        isOpen={!!selectedContradiction}
        onClose={() => setSelectedContradiction(null)}
      />
    </div>
  );
}
