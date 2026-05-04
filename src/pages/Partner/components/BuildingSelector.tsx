import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Building {
  id: number | string;
  name: string;
}

interface BuildingSelectorProps {
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  className?: string;
  placeholder?: string;
  allowAll?: boolean;
}

const BuildingSelector: React.FC<BuildingSelectorProps> = ({ 
  onSelect, 
  selectedId, 
  className = "", 
  placeholder = "Chọn tòa nhà",
  allowAll = true
}) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getBuildings();
      const payload = res?.data?.data || res?.data || res || [];
      const list = Array.isArray(payload) ? payload : (payload?.data || []);
      
      setBuildings(list.map((b: any) => ({
        id: b.id,
        name: b.name || b.title
      })));
    } catch (error) {
      console.error('Error fetching buildings for selector:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBuilding = buildings.find(b => String(b.id) === String(selectedId));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`group flex h-11 items-center gap-3 rounded-xl border-gray-200 bg-white px-4 shadow-sm transition-all hover:border-blue-300 hover:bg-slate-50 ${className}`}>
          <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 transition-colors group-hover:bg-blue-100">
            <Building2 size={18} />
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-gray-400">Tài sản</p>
            <p className="truncate text-sm font-bold text-gray-700">
              {selectedBuilding ? selectedBuilding.name : allowAll && selectedId === null ? "Tất cả tòa nhà" : placeholder}
            </p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 rounded-xl border-gray-100 p-2 shadow-xl">
        {allowAll && (
          <DropdownMenuItem 
            onClick={() => onSelect(null)}
            className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="text-sm font-medium">Tất cả tòa nhà</span>
            {selectedId === null && <Check size={16} className="text-blue-600" />}
          </DropdownMenuItem>
        )}
        {buildings.map((building) => (
          <DropdownMenuItem 
            key={building.id} 
            onClick={() => onSelect(String(building.id))}
            className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="truncate text-sm font-medium">{building.name}</span>
            {String(selectedId) === String(building.id) && <Check size={16} className="text-blue-600" />}
          </DropdownMenuItem>
        ))}
        {buildings.length === 0 && !loading && (
          <div className="p-3 text-center text-xs italic text-gray-400">Chưa có tòa nhà nào</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BuildingSelector;
