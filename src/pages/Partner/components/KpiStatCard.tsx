import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiStatCardProps {
  title: string;
  value: React.ReactNode;
  subLabel?: string;
  icon: LucideIcon;
  colorClass: string;
  isLoading?: boolean;
  tooltip?: string;
  valueClassName?: string;
  compactTooltip?: string;
}

const KpiStatCard: React.FC<KpiStatCardProps> = ({
  title,
  value,
  subLabel,
  icon: Icon,
  colorClass,
  isLoading = false,
  tooltip,
  valueClassName = 'text-slate-900',
  compactTooltip,
}) => (
  <Card className="overflow-hidden border-none bg-slate-50/50 transition-all hover:shadow-md">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2.5 ${colorClass}`}>
          <Icon size={20} />
        </div>
        {isLoading ? (
          <Skeleton className="h-4 w-16" />
        ) : subLabel ? (
          <span className="text-xs font-medium text-slate-400">{subLabel}</span>
        ) : null}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500" title={tooltip}>
          {title}
        </p>
        {isLoading ? (
          <Skeleton className="mt-2 h-9 w-3/4" />
        ) : (
          <h3
            className={`mt-1 text-2xl font-bold tracking-tight ${valueClassName}`}
            title={compactTooltip}
          >
            {value}
          </h3>
        )}
      </div>
    </CardContent>
  </Card>
);

export default KpiStatCard;
