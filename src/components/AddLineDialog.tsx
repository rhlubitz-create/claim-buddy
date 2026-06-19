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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EstimateLine } from "@/data/claims";
import { LABOR_RATES, laborCostOf } from "@/data/claims";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  onAdd?: (line: EstimateLine, rationale: string) => void;
};

const LINE_TYPES: EstimateLine["type"][] = ["Replacement", "Repair", "Refinish", "Service", "Labor"];

export function AddLineDialog({ open, onOpenChange, claimId, onAdd }: Props) {
  const [action, setAction] = useState("");
  const [damage, setDamage] = useState("");
  const [type, setType] = useState<EstimateLine["type"]>("Repair");
  const [hours, setHours] = useState("1.0");
  const [rate, setRate] = useState(LABOR_RATES["Repair"].toString());
  const [parts, setParts] = useState("0");
  const [rationale, setRationale] = useState("");

  const laborCost = Math.round((parseFloat(hours) || 0) * (parseFloat(rate) || 0));
  const total = laborCost + (parseFloat(parts) || 0);

  const handleTypeChange = (value: EstimateLine["type"]) => {
    setType(value);
    setRate(LABOR_RATES[value].toString());
  };

  const reset = () => {
    setAction("");
    setDamage("");
    setType("Repair");
    setHours("1.0");
    setRate(LABOR_RATES["Repair"].toString());
    setParts("0");
    setRationale("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) {
      toast.error("Damage + repair action name is required.");
      return;
    }
    if (!rationale.trim()) {
      toast.error("Rationale is required when adding a damage + repair action.");
      return;
    }

    const line: EstimateLine = {
      id: `l-agent-${Date.now()}`,
      action: action.trim(),
      damage: damage.trim() || undefined,
      type,
      laborHours: parseFloat(hours) || 0,
      laborRate: parseFloat(rate) || 0,
      partsCost: parseFloat(parts) || 0,
      confidence: 0,
      overridden: true,
      addedByAgent: true,
      override: {
        by: "Alex Park (Claims Agent)",
        rationale: rationale.trim(),
        at: new Date().toISOString(),
        previousLaborHours: 0,
        previousLaborRate: 0,
        previousPartsCost: 0,
      },
    };

    onAdd?.(line, rationale.trim());
    toast.success(`Damage + repair action added to ${claimId}`, {
      description: `${line.action} — $${total.toLocaleString()} total.`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Add damage + repair action
          </DialogTitle>
          <DialogDescription>
            Add a missing damage finding and repair action to the AI estimate. Labor cost is calculated as hours × rate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action" className="text-xs font-semibold uppercase tracking-wider">
              Damage + Repair Action <span className="text-destructive">*</span>
            </Label>
            <Input
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Rear bumper reinforcement"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="damage" className="text-xs font-semibold uppercase tracking-wider">
              Damage Descriptor
            </Label>
            <Input
              id="damage"
              value={damage}
              onChange={(e) => setDamage(e.target.value)}
              placeholder="e.g. dent, cracked, paint damage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-xs font-semibold uppercase tracking-wider">
              Type
            </Label>
            <Select value={type} onValueChange={(v) => handleTypeChange(v as EstimateLine["type"])}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours" className="text-xs font-semibold uppercase tracking-wider">
                Hours
              </Label>
              <div className="relative">
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  step="0.1"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="pr-5 font-mono text-right"
                  required
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                  h
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" className="text-xs font-semibold uppercase tracking-wider">
                Rate
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  $
                </span>
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  step="1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="pl-5 pr-5 font-mono text-right"
                  required
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                  /h
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parts" className="text-xs font-semibold uppercase tracking-wider">
                Parts
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  $
                </span>
                <Input
                  id="parts"
                  type="number"
                  min="0"
                  step="0.01"
                  value={parts}
                  onChange={(e) => setParts(e.target.value)}
                  className="pl-5 font-mono text-right"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-sm bg-secondary border border-border">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Calculated Total
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
              placeholder="Explain why this damage + repair action was missed by the AI and why it is needed (e.g. 'AI photo did not capture inner panel buckling visible in supplemental photos')."
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add damage + repair action</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
