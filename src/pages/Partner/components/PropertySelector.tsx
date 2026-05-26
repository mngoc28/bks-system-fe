import React, { useState, useEffect } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { partnerService } from "@/services/partnerService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useMemo } from "react";

interface PropertyOption {
  id: number | string;
  name: string;
}

interface PropertySelectorProps {
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  className?: string;
  placeholder?: string;
  allowAll?: boolean;
  properties?: any[];
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  onSelect,
  selectedId,
  className = "",
  placeholder = "Chọn tòa nhà",
  allowAll = true,
  properties: passedProperties,
}) => {
  const [internalProperties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!passedProperties) {
      const abortController = new AbortController();
      void fetchProperties(abortController.signal);
      return () => {
        abortController.abort();
      };
    }
  }, [passedProperties]);

  const fetchProperties = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res: any = await partnerService.getProperties(undefined, { signal });
      const payload = res?.data?.data || res?.data || res || [];
      const list = Array.isArray(payload) ? payload : payload?.data || [];

      setProperties(
        list.map((b: any) => ({
          id: b.id,
          name: b.name || b.title,
        })),
      );
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || signal?.aborted) {
        return;
      }
      console.error("Error fetching properties for selector:", error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const properties = useMemo(() => {
    if (passedProperties) {
      return passedProperties.map((p: any) => ({
        id: p.id,
        name: p.name || p.title || "",
      }));
    }
    return internalProperties;
  }, [passedProperties, internalProperties]);

  const selectedProperty = properties.find((p) => String(p.id) === String(selectedId));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`group flex h-11 items-center gap-3 rounded-xl border-gray-200 bg-white px-4 shadow-sm transition-all hover:border-blue-300 hover:bg-slate-50 ${className}`}
        >
          <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 transition-colors group-hover:bg-blue-100">
            <Building2 size={18} />
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-gray-400">Tài sản</p>
            <p className="truncate text-sm font-bold text-gray-700">
              {selectedProperty
                ? selectedProperty.name
                : allowAll && selectedId === null
                  ? "Tất cả tòa nhà"
                  : placeholder}
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
        {properties.map((property) => (
          <DropdownMenuItem
            key={property.id}
            onClick={() => onSelect(String(property.id))}
            className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="truncate text-sm font-medium">{property.name}</span>
            {String(selectedId) === String(property.id) && <Check size={16} className="text-blue-600" />}
          </DropdownMenuItem>
        ))}
        {properties.length === 0 && !loading && (
          <div className="p-3 text-center text-xs italic text-gray-400">Chưa có tòa nhà nào</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PropertySelector;
