import React from "react";
import { Search } from "lucide-react";
import { useListTopics, getListTopicsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FilterBarProps {
  selectedTopic: string | null;
  onTopicSelect: (topic: string | null) => void;
  highConfidenceOnly: boolean;
  onConfidenceChange: (high: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterBar({
  selectedTopic,
  onTopicSelect,
  highConfidenceOnly,
  onConfidenceChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  const { data: topics } = useListTopics({
    query: {
      queryKey: getListTopicsQueryKey(),
    }
  });

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border py-4 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Topics Scroll Area */}
        <div className="flex-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
          <div className="flex items-center gap-2 w-max">
            <Button
              variant={selectedTopic === null ? "default" : "outline"}
              size="sm"
              onClick={() => onTopicSelect(null)}
              className={`rounded-full h-8 px-4 font-mono text-xs uppercase ${selectedTopic === null ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card text-muted-foreground hover:text-foreground"}`}
            >
              All Topics
            </Button>
            {topics?.map((topicCount) => (
              <Button
                key={topicCount.topic}
                variant={selectedTopic === topicCount.topic ? "default" : "outline"}
                size="sm"
                onClick={() => onTopicSelect(topicCount.topic)}
                className={`rounded-full h-8 px-4 font-mono text-xs uppercase ${selectedTopic === topicCount.topic ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {topicCount.topic} <span className="ml-1.5 opacity-50">{topicCount.count}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Search & Toggles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guest..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 bg-card border-border text-sm font-mono focus-visible:ring-primary rounded-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="confidence-mode"
              checked={highConfidenceOnly}
              onCheckedChange={onConfidenceChange}
              className="data-[state=checked]:bg-accent"
            />
            <Label htmlFor="confidence-mode" className="text-xs font-mono uppercase text-muted-foreground cursor-pointer">
              High confidence only
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
