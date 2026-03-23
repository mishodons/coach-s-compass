import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<number, { label: string; className: string }> = {
  1: { label: 'Incomplete', className: 'bg-muted text-muted-foreground hover:bg-muted' },
  2: { label: 'In Progress', className: 'bg-warning/15 text-warning hover:bg-warning/20 border-warning/30' },
  3: { label: 'Complete', className: 'bg-success/15 text-success hover:bg-success/20 border-success/30' },
};

interface StatusBadgeProps {
  status: number;
  onClick?: () => void;
  className?: string;
}

export function StatusBadge({ status, onClick, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[1];
  return (
    <Badge
      variant="outline"
      className={cn(config.className, onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {config.label}
    </Badge>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    beginner: 'bg-info/15 text-info border-info/30',
    intermediate: 'bg-warning/15 text-warning border-warning/30',
    advanced: 'bg-success/15 text-success border-success/30',
  };
  return (
    <Badge variant="outline" className={cn(colors[level] || '', 'capitalize')}>
      {level}
    </Badge>
  );
}

export function PlayerStatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <Badge
      variant="outline"
      className={cn(
        isActive
          ? 'bg-success/15 text-success border-success/30'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}
