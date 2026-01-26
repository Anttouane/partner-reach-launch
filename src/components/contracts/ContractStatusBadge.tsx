import { Badge } from '@/components/ui/badge';
import { ContractStatus, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from '@/types/contract';
import { cn } from '@/lib/utils';

interface ContractStatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  return (
    <Badge className={cn(CONTRACT_STATUS_COLORS[status], className)}>
      {CONTRACT_STATUS_LABELS[status]}
    </Badge>
  );
}
