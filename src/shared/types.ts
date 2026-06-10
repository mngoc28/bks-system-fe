
export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  permissionKey?: string;
  isHeader?: boolean;
  /** Collapsible group: collapsed by default when true */
  defaultCollapsed?: boolean;
  /** Badge count on nav item (e.g. pending bookings) */
  badgeCount?: number;
} 
