import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { EstimateLine } from "@/data/claims";
import { lineTotal } from "@/data/claims";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: EstimateLine[];
  claimId: string;
  onSave?: (updatedLines: EstimateLine[]) => void;
};

export function OverrideDialog({ open, onOpenChange, lines, claimId, onSave }: Props) {
  const [labor, setLabor] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((l) => [l.id, l.laborCost.toString()])),
  );
  const [parts, setParts] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((l) => [l.id, l.partsCost.toString()])),
  );
  const [rationale, setRationale] = useState("");

  const lineNewTotal = (id: string) =>
    (parseFloat(labor[id]) || 0) + (parseFloat(parts[id]) || 0);
  const total = lines.reduce((sum, l) => sum + lineNewTotal(l.id), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) {
      toast.error("Rationale is required when overriding an AI estimate.");
      return;
    }
    const now = new Date().toISOString();
    const agent = "Alex Park (Claims Agent)";
    const updated: EstimateLine[] = lines.map((l) => {
      const newLabor = parseFloat(labor[l.id]) || 0;
      const newParts = parseFloat(parts[l.id]) || 0;
      const changed = newLabor !== l.laborCost || newParts !== l.partsCost;
      if (!changed) return l;
      return {
        ...l,
        laborCost: newLabor,
        partsCost: newParts,
        overridden: true,
        override: {
          by: agent,
          rationale: rationale.trim(),
          at: now,
          // Preserve the ORIGINAL AI costs across repeated overrides.
          previousLaborCost: l.override?.previousLaborCost ?? l.laborCost,
          previousPartsCost: l.override?.previousPartsCost ?? l.partsCost,
        },
      };
    });
    onSave?.(updated);
    toast.success(`Override saved for ${claimId}`, {
      description: `New total: $${total.toLocaleString()}. Rationale logged for audit.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Override AI Estimate — {claimId}</DialogTitle>
          <DialogDescription>
            Adjust line-item costs and provide a rationale. Your override and reasoning will be
            logged for audit and used to improve future AI estimates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_repeat(4,auto)] gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-1 border-b border-border items-end">
              <span>Line Item</span>
              <span className="text-right w-24">AI Labor</span>
              <span className="text-right w-28">Override Labor</span>
              <span className="text-right w-24">AI Parts</span>
              <span className="text-right w-28">Override Parts</span>
            </div>
            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-[1fr_repeat(4,auto)] gap-3 items-center">
                <div>
                  <p className="text-sm font-medium">{line.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.type} · {line.laborHours}h · {line.confidence}% conf. · current total $
                    {lineTotal(line).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-mono text-muted-foreground w-24 text-right">
                  ${line.laborCost.toLocaleString()}
                </span>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={labor[line.id]}
                    onChange={(e) =>
                      setLabor((prev) => ({ ...prev, [line.id]: e.target.value }))
                    }
                    className="pl-5 font-mono text-sm h-9"
                  />
                </div>
                <span className="text-sm font-mono text-muted-foreground w-24 text-right">
                  ${line.partsCost.toLocaleString()}
                </span>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={parts[line.id]}
                    onChange={(e) =>
                      setParts((prev) => ({ ...prev, [line.id]: e.target.value }))
                    }
                    className="pl-5 font-mono text-sm h-9"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-3 rounded-sm bg-secondary border border-border">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Override Total
            </span>
            <span className="text-lg font-mono font-bold">${total.toLocaleString()}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rationale" className="text-xs font-semibold uppercase tracking-wider">
              Rationale <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Explain why you are overriding the AI estimate (e.g. 'OEM parts confirmed unavailable, switching to aftermarket supplier per repair shop quote')."
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Override</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}