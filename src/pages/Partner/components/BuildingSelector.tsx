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
        <Button variant="outline" className={`h-11 px-4 flex items-center gap-3 bg-white border-gray-200 hover:bg-slate-50 hover:border-blue-300 rounded-xl transition-all shadow-sm group ${className}`}>
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Building2 size={18} />
          </div>
          <div className="text-left flex-1 overflow-hidden">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Tài sản</p>
            <p className="text-sm font-bold text-gray-700 truncate">
              {selectedBuilding ? selectedBuilding.name : allowAll && selectedId === null ? "Tất cả tòa nhà" : placeholder}
            </p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl shadow-xl border-gray-100">
        {allowAll && (
          <DropdownMenuItem 
            onClick={() => onSelect(null)}
            className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <span className="font-medium text-sm">Tất cả tòa nhà</span>
            {selectedId === null && <Check size={16} className="text-blue-600" />}
          </DropdownMenuItem>
        )}
        {buildings.map((building) => (
          <DropdownMenuItem 
            key={building.id} 
            onClick={() => onSelect(String(building.id))}
            className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <span className="font-medium text-sm truncate">{building.name}</span>
            {String(selectedId) === String(building.id) && <Check size={16} className="text-blue-600" />}
          </DropdownMenuItem>
        ))}
        {buildings.length === 0 && !loading && (
          <div className="p-3 text-center text-xs text-gray-400 italic">Chưa có tòa nhà nào</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BuildingSelector;
