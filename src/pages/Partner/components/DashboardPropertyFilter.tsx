import React from 'react';
import PropertySelector from '@/pages/Partner/components/PropertySelector';

interface DashboardPropertyFilterProps {
  selectedPropertyKey: string | null;
  onPropertyChange: (propertyKey: string | null) => void;
  className?: string;
}

/**
 * Header property scope filter for partner dashboard (Phase 3 T3.1).
 */
const DashboardPropertyFilter: React.FC<DashboardPropertyFilterProps> = ({
  selectedPropertyKey,
  onPropertyChange,
  className = '',
}) => {
  return (
    <PropertySelector
      selectedId={selectedPropertyKey}
      onSelect={onPropertyChange}
      allowAll
      placeholder="Tất cả tài sản"
      className={className}
    />
  );
};

export default DashboardPropertyFilter;
