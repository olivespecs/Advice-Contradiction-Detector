import React from "react";
import { type Contradiction } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExpandedContradictionModalProps {
  contradiction: Contradiction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpandedContradictionModal({ contradiction, isOpen, onClose }: ExpandedContradictionModalProps) {
  const { toast } = useToast();

  if (!contradiction) return null;

  const handleShare = () => {
    const text = `${contradiction.guest_a.name} vs ${contradiction.guest_b.name} on ${contradiction.topic}: ${contradiction.tension_summary} — via Advice Contradiction Detector`;
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Share the contradiction with your team.",
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border p-0 gap-0">
        <div className="sticky top-0 bg-card/95 backdrop-blur-md z-10 border-b border-border p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {contradiction.canonical_topic}
              </span>
              <span className="text-xs font-mono text-accent font-medium px-3 py-1 bg-accent/10 rounded-full">
                {Math.round(contradiction.confidence * 100)}% confident
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="font-mono text-xs uppercase h-8">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
          </div>
          
          <DialogTitle className="font-serif text-2xl lg:text-3xl text-primary leading-tight">
            {contradiction.tension_summary}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Contradiction details between {contradiction.guest_a.name} and {contradiction.guest_b.name}
          </DialogDescription>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-12">
          {/* Guest A */}
          <div className="flex flex-col gap-4 border-l-4 border-muted pl-6">
            <div>
              <h3 className="font-serif text-2xl text-foreground font-semibold">
                {contradiction.guest_a.name}
              </h3>
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-wide mt-1">
                {contradiction.guest_a.position}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Episode: <span className="text-foreground">{contradiction.guest_a.episode_title}</span>
              </p>
            </div>
            <blockquote className="font-serif text-lg text-foreground/90 italic leading-relaxed">
              "{contradiction.guest_a.quote}"
            </blockquote>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-1" />
            <span className="font-mono text-primary font-bold tracking-widest">VS</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Guest B */}
          <div className="flex flex-col gap-4 border-l-4 border-primary/50 pl-6">
            <div>
              <h3 className="font-serif text-2xl text-foreground font-semibold">
                {contradiction.guest_b.name}
              </h3>
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-wide mt-1">
                {contradiction.guest_b.position}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Episode: <span className="text-foreground">{contradiction.guest_b.episode_title}</span>
              </p>
            </div>
            <blockquote className="font-serif text-lg text-foreground/90 italic leading-relaxed">
              "{contradiction.guest_b.quote}"
            </blockquote>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
