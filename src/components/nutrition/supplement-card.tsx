import type { Supplement } from '@/types';
import { cn } from '@/lib/utils';
import { Shield, FlaskConical, Leaf } from 'lucide-react';

interface SupplementCardProps {
  supplement: Supplement;
}

const evidenceColors = {
  strong: 'bg-success/10 text-success',
  moderate: 'bg-warning/10 text-warning',
  emerging: 'bg-primary/10 text-primary',
};

const categoryIcons = {
  core: Shield,
  fat_loss: FlaskConical,
  recovery: Leaf,
  health: Shield,
};

export function SupplementCard({ supplement }: SupplementCardProps) {
  const Icon = categoryIcons[supplement.category] ?? Shield;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{supplement.name}</h3>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', evidenceColors[supplement.evidenceLevel])}>
              {supplement.evidenceLevel}
            </span>
          </div>
          <p className="mt-1 text-sm text-primary font-medium">{supplement.dosage}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{supplement.timing}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase">Benefits</h4>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {supplement.benefits.map((benefit, i) => (
              <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {supplement.notes && (
          <p className="text-xs text-muted-foreground italic">{supplement.notes}</p>
        )}

        {supplement.contraindications && supplement.contraindications.length > 0 && (
          <div className="rounded-lg bg-destructive/5 p-2">
            <p className="text-xs text-destructive">
              <strong>Note:</strong> {supplement.contraindications.join('. ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
