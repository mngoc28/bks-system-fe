
export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  permissionKey?: string;
}; 
