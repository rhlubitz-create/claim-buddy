import { useMemo, useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
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
import {
  POLICYHOLDERS,
  DEFAULT_SIMILAR,
  generateEstimateForNewClaim,
  type Claim,
  type Severity,
} from "@/data/claims";
import { toast } from "sonner";

type Props = {
  onSubmit: (claim: Claim) => void;
};

const ACCIDENT_TYPES = [
  "Front-end collision",
  "Rear-end collision",
  "Side-swipe",
  "Curb strike",
  "Parking-lot collision",
  "Reversing collision",
  "Vandalism / Parts theft",
  "Hail / Weather",
  "Other",
];
const DAMAGE_TYPES = [
  "Impact",
  "Scrape / Paint damage",
  "Dent",
  "Broken assembly",
  "Vandalism / Theft",
  "Glass damage",
];
const SEVERITIES: Severity[] = ["Minor", "Moderate", "Severe"];

export function SubmitClaim({ onSubmit }: Props) {
  const [userId, setUserId] = useState("");
  const [accidentType, setAccidentType] = useState("");
  const [description, setDescription] = useState("");
  const [damageLocation, setDamageLocation] = useState("");
  const [damageType, setDamageType] = useState("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const policyholder = useMemo(
    () => POLICYHOLDERS[userId.trim()] ?? null,
    [userId],
  );

  const handlePhoto = (file: File | null) => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    if (!file) {
      setPhotoFile(null);
      setPhotoUrl(null);
      return;
    }
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const reset = () => {
    setUserId("");
    setAccidentType("");
    setDescription("");
    setDamageLocation("");
    setDamageType("");
    setSeverity("");
    handlePhoto(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyholder) {
      toast.error("Unknown User ID.");
      return;
    }
    if (!accidentType || !damageType || !severity || !damageLocation.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!photoUrl) {
      toast.error("Please upload a photo of the damage.");
      return;
    }

    const id = `CLM-${Math.floor(1000 + Math.random() * 8999)}`;
    const newClaim: Claim = {
      id,
      status: "New",
      filedAt: new Date().toISOString(),
      policyholder: {
        userId: policyholder.userId,
        name: policyholder.name,
        policyNumber: policyholder.policyNumber,
        coverage: policyholder.coverage,
      },
      vehicle: policyholder.vehicle,
      accident: {
        type: accidentType,
        description: description.trim() || "No description provided.",
        damageLocation: damageLocation.trim(),
        damageType,
        severity: severity as Severity,
      },
      photo: photoUrl,
      flags: [],
      estimate: generateEstimateForNewClaim(severity as Severity),
      similar: DEFAULT_SIMILAR,
    };

    onSubmit(newClaim);
    toast.success("Submitted", {
      description: `Claim ${id} routed to the Agent Inbox.`,
    });
    // Clear the form WITHOUT revoking the blob URL — the inbox needs it to
    // render the uploaded photo.
    setUserId("");
    setAccidentType("");
    setDescription("");
    setDamageLocation("");
    setDamageType("");
    setSeverity("");
    setPhotoFile(null);
    setPhotoUrl(null);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {"\n"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Submit a Claim</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Report an accident and upload a photo of the damage. Your claim will be routed to a Claims Agent for review.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-md border border-primary/20 bg-primary/5 p-6 shadow-sm"
        >
          <section className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Policyholder
            </h2>
            <div>
              <Label htmlFor="userId" className="text-xs font-semibold mb-1.5 block">
                User ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 000-00-000"
                className="font-mono"
              />
            </div>

            {userId.trim() && !policyholder && (
              <div className="flex items-center gap-2 p-2.5 rounded-sm bg-destructive/5 border border-destructive/20 text-xs">
                <AlertCircle className="size-4 text-destructive flex-shrink-0" />
                No policyholder found for that User ID.
              </div>
            )}
            {policyholder && (
              <div className="p-4 rounded-sm bg-success/5 border border-success/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-success">
                  <CheckCircle2 className="size-4" /> Policyholder verified
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <Info label="Name" value={policyholder.name} />
                  <Info label="Policy #" value={policyholder.policyNumber} mono />
                  <Info
                    label="Vehicle"
                    value={`${policyholder.vehicle.year} ${policyholder.vehicle.make} ${policyholder.vehicle.model}`}
                  />
                  <Info label="Coverage" value={policyholder.coverage} />
                </dl>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Accident Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Accident Type" required>
                <Select value={accidentType} onValueChange={setAccidentType}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {ACCIDENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Damage Severity" required>
                <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Damage Location" required>
                <Input
                  value={damageLocation}
                  onChange={(e) => setDamageLocation(e.target.value)}
                  placeholder="e.g. Front-right fender"
                />
              </Field>
              <Field label="Damage Type" required>
                <Select value={damageType} onValueChange={setDamageType}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {DAMAGE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Accident Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what happened…"
                rows={4}
              />
            </Field>
          </section>

          <section className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Photo / Video of Damage <span className="text-destructive">*</span>
            </h2>
            <label
              htmlFor="photo"
              className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-sm cursor-pointer hover:bg-secondary/40 transition-colors"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Damage preview"
                  className="max-h-72 rounded-sm outline-1 -outline-offset-1 outline-black/5"
                />
              ) : (
                <>
                  <Upload className="size-6 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload a photo</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, or MP4 up to 25 MB</span>
                </>
              )}
              <input
                id="photo"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
              />
            </label>
            {photoFile && (
              <p className="text-[11px] text-muted-foreground font-mono">
                {photoFile.name} · {(photoFile.size / 1024).toFixed(0)} KB
              </p>
            )}
          </section>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={reset}>Clear</Button>
            <Button type="submit">Submit Claim</Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-semibold mb-1.5 block">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-[11px]" : "text-foreground"}>{value}</dd>
    </div>
  );
}