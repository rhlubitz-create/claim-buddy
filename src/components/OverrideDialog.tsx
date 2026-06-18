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
import { lineTotal, laborCostOf } from "@/data/claims";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: EstimateLine[];
  claimId: string;
  onSave?: (updatedLines: EstimateLine[]) => void;
};

export function OverrideDialog({ open, onOpenChange, lines, claimId, onSave }: Props) {
  const [hours, setHours] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((l) => [l.id, l.laborHours.toString()])),
  );
  const [rate, setRate] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((l) => [l.id, l.laborRate.toString()])),
  );
  const [parts, setParts] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((l) => [l.id, l.partsCost.toString()])),
  );
  const [rationale, setRationale] = useState("");

  const lineNewLabor = (id: string) =>
    Math.round((parseFloat(hours[id]) || 0) * (parseFloat(rate[id]) || 0));
  const lineNewTotal = (id: string) =>
    lineNewLabor(id) + (parseFloat(parts[id]) || 0);
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
      const newHours = parseFloat(hours[l.id]) || 0;
      const newRate = parseFloat(rate[l.id]) || 0;
      const newParts = parseFloat(parts[l.id]) || 0;
      const changed =
        newHours !== l.laborHours ||
        newRate !== l.laborRate ||
        newParts !== l.partsCost;
      if (!changed) return l;
      return {
        ...l,
        laborHours: newHours,
        laborRate: newRate,
        partsCost: newParts,
        overridden: true,
        override: {
          by: agent,
          rationale: rationale.trim(),
          at: now,
          // Preserve the ORIGINAL AI values across repeated overrides.
          previousLaborHours: l.override?.previousLaborHours ?? l.laborHours,
          previousLaborRate: l.override?.previousLaborRate ?? l.laborRate,
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
            Edit labor <strong>hours</strong> (a judgment call about repair complexity — used as
            training signal) and, if needed, correct the looked-up labor <strong>rate</strong> or
            the parts estimate. Labor cost is calculated as hours × rate. A rationale is required
            and all edits are logged for audit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_repeat(6,auto)] gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-1 border-b border-border items-end">
              <span>Line Item</span>
              <span className="text-right w-20">AI Hours</span>
              <span className="text-right w-24">Override Hours</span>
              <span className="text-right w-20">AI Rate</span>
              <span className="text-right w-24">Override Rate</span>
              <span className="text-right w-24">AI Parts</span>
              <span className="text-right w-28">Override Parts</span>
            </div>
            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-[1fr_repeat(6,auto)] gap-3 items-center">
                <div>
                  <p className="text-sm font-medium">{line.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.type} · labor ${laborCostOf(line).toLocaleString()} · {line.confidence}% conf. · total $
                    {lineTotal(line).toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-mono text-muted-foreground w-20 text-right">
                  {line.laborHours}h
                </span>
                <div className="relative w-24">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={hours[line.id]}
                    onChange={(e) =>
                      setHours((prev) => ({ ...prev, [line.id]: e.target.value }))
                    }
                    className="pr-6 font-mono text-sm h-9 text-right"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    h
                  </span>
                </div>
                <span className="text-sm font-mono text-muted-foreground w-20 text-right">
                  ${line.laborRate}/h
                </span>
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={rate[line.id]}
                    onChange={(e) =>
                      setRate((prev) => ({ ...prev, [line.id]: e.target.value }))
                    }
                    className="pl-5 pr-6 font-mono text-sm h-9"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                    /h
                  </span>
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