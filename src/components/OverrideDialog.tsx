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
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: EstimateLine[];
  claimId: string;
};

export function OverrideDialog({ open, onOpenChange, lines, claimId }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((l) => [l.id, l.cost.toString()])),
  );
  const [rationale, setRationale] = useState("");

  const total = Object.values(values).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) {
      toast.error("Rationale is required when overriding an AI estimate.");
      return;
    }
    toast.success(`Override saved for ${claimId}`, {
      description: `New total: $${total.toLocaleString()}. Rationale logged for audit.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Override AI Estimate — {claimId}</DialogTitle>
          <DialogDescription>
            Adjust line-item costs and provide a rationale. Your override and reasoning will be
            logged for audit and used to improve future AI estimates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-1 border-b border-border">
              <span>Line Item</span>
              <span className="text-right w-24">AI Cost</span>
              <span className="text-right w-32">Override</span>
            </div>
            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                <div>
                  <p className="text-sm font-medium">{line.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.type} · {line.laborHours}h · {line.confidence}% conf.
                  </p>
                </div>
                <span className="text-sm font-mono text-muted-foreground w-24 text-right">
                  ${line.cost.toLocaleString()}
                </span>
                <div className="relative w-32">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={values[line.id]}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [line.id]: e.target.value }))
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