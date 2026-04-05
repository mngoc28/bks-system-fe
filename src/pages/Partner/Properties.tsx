import React, { useState, useEffect, ChangeEvent } from 'react';
import { Plus, MapPin, Maximize, AirVent, Zap, Wallet, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { Building, Room } from './types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlainTextarea } from "@/components/ui/textarea";
import { partnerService } from '@/services/partnerService';
import { usePartnerBuildingTypesQuery } from '@/hooks/useBuildingQuery';
import { RENT_CATEGORY } from '@/constant';
import { useTranslation } from 'react-i18next';

const Properties: React.FC = () => {
  const { t } = useTranslation();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const { data: buildingTypes } = usePartnerBuildingTypesQuery();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [targetBuildingId, setTargetBuildingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const buildingsRes: any = await partnerService.getBuildings();
      const roomsRes: any = await partnerService.getRooms();
      
      setBuildings(buildingsRes.data.data.data || buildingsRes.data.data);
      setRooms(roomsRes.data.data.data || roomsRes.data.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Trống': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Đang thuê': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Đang bảo trì': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleAddBuilding = () => {
    setEditingBuilding(null);
    setIsBuildingModalOpen(true);
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setIsBuildingModalOpen(true);
  };

  const handleDeleteBuilding = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bất động sản này? Tất cả phòng liên quan cũng sẽ bị ảnh hưởng.')) {
      try {
        await partnerService.deleteBuilding(String(id));
        fetchData();
      } catch (error) {
        alert('Không thể xóa bất động sản này.');
      }
    }
  };

  const handleAddRoom = (buildingId: string) => {
    setTargetBuildingId(buildingId);
    setEditingRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setTargetBuildingId(String(room.buildingId));
    setIsRoomModalOpen(true);
  };

  const handleDeleteRoom = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await partnerService.deleteRoom(String(id));
        fetchData();
      } catch (error) {
        alert('Không thể xóa phòng này.');
      }
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="font-medium">Đang tải dữ liệu tài sản...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Dữ liệu Tài sản</h1>
          <p className="text-gray-500 mt-1">Danh sách tòa nhà, resort, villa và các phòng hiện có.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleAddBuilding} variant="outline" className="flex items-center gap-2">
            <Plus size={18} />
            Thêm Bất động sản
          </Button>
        </div>
      </div>

      {buildings.length > 0 ? buildings.map(building => {
        const buildingRooms = rooms.filter(r => String(r.buildingId) === String(building.id));
        
        return (
          <div key={building.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group/building">
            <div className="bg-slate-50 border-b border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">
                    {building.rent_category ? t(`RENT_CATEGORY.${building.rent_category}`) : t("common.property")}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded uppercase tracking-wider">
                    {buildingTypes?.data?.find(type => type.id === building.property_type_id)?.name || building.property_type_id}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800">{building.name}</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  <span>{building.address}</span>
                  <span className="mx-2">•</span>
                  <span>Tổng: <span className="font-semibold text-gray-700">{building.totalRooms || 0} đơn vị</span></span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleAddRoom(String(building.id))} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus size={16} className="mr-1" /> Thêm Phòng
                </Button>
                <Button onClick={() => handleEditBuilding(building)} variant="ghost" size="icon" className="text-gray-400 hover:text-amber-600">
                  <Edit size={18} />
                </Button>
                <Button onClick={() => handleDeleteBuilding(String(building.id))} variant="ghost" size="icon" className="text-gray-400 hover:text-red-600">
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>

            <div className="p-6">
              {buildingRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {buildingRooms.map(room => (
                    <div key={room.id} className="group/room border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all bg-white flex flex-col h-full relative">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(room.status)}`}>
                          {room.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-5 flex-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Maximize size={16} className="text-gray-400" />
                          <span>Diện tích: {room.area} m²</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AirVent size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <span className="leading-snug">Tiện ích: {Array.isArray(room.amenities) ? room.amenities.join(', ') : 'Trống'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Zap size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <span className="leading-snug">Dịch vụ: {Array.isArray(room.services) ? room.services.join(', ') : 'Trống'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 mt-auto">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                          <Wallet size={10} />
                          Bảng giá gói
                        </div>
                        {room.prices && room.prices.length > 0 ? room.prices.map((price, idx) => (
                          <div key={price.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{price.packageName}:</span>
                            <span className={`font-semibold ${idx === 0 ? 'text-gray-800' : 'text-emerald-600'}`}>
                              {price.price.toLocaleString('vi-VN')} ₫{price.duration > 1 && '/th'}
                            </span>
                          </div>
                        )) : <div className="text-[10px] text-gray-400 italic">Chưa cài đặt giá</div>}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                        <Button onClick={() => handleEditRoom(room)} variant="outline" size="sm" className="flex-1 text-xs">Chỉnh sửa</Button>
                        <Button onClick={() => handleDeleteRoom(String(room.id))} variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 group/delete">
                           <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 italic">Chưa có thông tin phòng cho bất động sản này.</p>
                  <Button variant="ghost" onClick={() => handleAddRoom(String(building.id))} className="mt-2 text-blue-600 hover:bg-blue-50">+ Thêm phòng đầu tiên</Button>
                </div>
              )}
            </div>
          </div>
        );
      }) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
           <div className="p-4 bg-blue-50 text-blue-600 rounded-full w-fit mx-auto mb-4">
              <Plus size={32} />
           </div>
           <h3 className="text-xl font-bold text-gray-800">Bạn chưa có tài sản nào</h3>
           <p className="text-gray-500 mt-2">Bắt đầu bằng việc thêm tòa nhà hoặc biệt thự đầu tiên của bạn.</p>
           <Button onClick={handleAddBuilding} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6">Thêm ngay Bất động sản</Button>
        </div>
      )}

      <BuildingModal 
        isOpen={isBuildingModalOpen} 
        onClose={() => setIsBuildingModalOpen(false)} 
        building={editingBuilding}
        buildingTypes={buildingTypes?.data || []}
        onSave={async (data) => {
          try {
            if (editingBuilding) {
              await partnerService.updateBuilding(String(editingBuilding.id), data);
            } else {
              const submitData = {
                ...data,
                user_id: 0,
              };
              await partnerService.createBuilding(submitData);
            }
            fetchData();
            setIsBuildingModalOpen(false);
          } catch (error) {
            console.error('Save error:', error);
            alert('Lỗi khi lưu thông tin bất động sản.');
          }
        }}
      />

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        room={editingRoom}
        buildingId={targetBuildingId || ''}
        onSave={async (data) => {
          try {
            if (editingRoom) {
              await partnerService.updateRoom(String(editingRoom.id), data);
            } else {
              await partnerService.createRoom(data);
            }
            fetchData();
            setIsRoomModalOpen(false);
          } catch (error) {
            alert('Lỗi khi lưu thông tin phòng.');
          }
        }}
      />
    </div>
  );
};

const BuildingModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  building: Building | null, 
  buildingTypes: any[],
  onSave: (data: Partial<Building>) => void 
}> = ({ isOpen, onClose, building, buildingTypes, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Building>>({
    name: building?.name || '',
    address: building?.address || '',
    property_type_id: building?.property_type_id || 0,
    rent_category: building?.rent_category || 0,
    description: building?.description || ''
  });

  React.useEffect(() => {
    if (building) {
      setFormData({
        name: building.name,
        address: building.address,
        property_type_id: building.property_type_id,
        rent_category: building.rent_category,
        description: building.description
      });
    } else {
      setFormData({ name: '', address: '', property_type_id: 0, rent_category: 0, description: '' });
    }
  }, [building, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{building ? 'Cập nhật Bất động sản' : 'Thêm Bất động sản mới'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên bất động sản</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Alpha Resort" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Loại hình</Label>
            <select 
              id="type" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
              value={formData.property_type_id}
              onChange={e => setFormData({...formData, property_type_id: Number(e.target.value)})}
            >
              <option value={0}>Chọn loại hình</option>
              {buildingTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rent_category">Hình thức cho thuê</Label>
            <select 
              id="rent_category" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
              value={formData.rent_category}
              onChange={e => setFormData({...formData, rent_category: Number(e.target.value)})}
            >
              <option value={0}>Chọn hình thức</option>
              {Object.entries(RENT_CATEGORY).map(([value, labelKey]) => (
                <option key={value} value={value}>{t(labelKey as string)}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="VD: 123 Nguyễn Văn Linh..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Mô tả ngắn</Label>
            <PlainTextarea id="desc" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onSave(formData)}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RoomModal: React.FC<{ isOpen: boolean, onClose: () => void, room: Room | null, buildingId: string, onSave: (data: Partial<Room>) => void }> = ({ isOpen, onClose, room, buildingId, onSave }) => {
  const [formData, setFormData] = useState<Partial<Room>>({
    name: room?.name || '',
    area: room?.area || 0,
    amenities: room?.amenities || [],
    services: room?.services || [],
    buildingId: buildingId,
    prices: room?.prices || [{ id: 'p' + Date.now(), packageName: 'Gói chuẩn', price: 0, duration: 1 }]
  });

  React.useEffect(() => {
    if (room) {
      setFormData({...room});
    } else {
      setFormData({
        name: '', 
        area: 0, 
        buildingId, 
        amenities: [], 
        services: [], 
        prices: [{ id: 'p' + Date.now(), packageName: 'Gói chuẩn', price: 0, duration: 1 }]
      });
    }
  }, [room, buildingId, isOpen]);

  const addPrice = () => {
    setFormData({
      ...formData,
      prices: [...(formData.prices || []), { id: 'p' + Date.now(), packageName: '', price: 0, duration: 1 }]
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tên phòng/Số phòng</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: P.101" />
            </div>
            <div className="grid gap-2">
              <Label>Diện tích (m²)</Label>
              <Input type="number" value={formData.area} onChange={e => setFormData({...formData, area: Number(e.target.value)})} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tiện nghi (Ngăn cách bằng dấu phẩy)</Label>
            <Input 
              value={formData.amenities?.join(', ')} 
              onChange={e => setFormData({...formData, amenities: e.target.value.split(',').map(s => s.trim())})} 
              placeholder="VD: Wifi, Máy lạnh, Giường..."
            />
          </div>

          <div className="grid gap-2 border-t pt-4">
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
               <Label className="font-bold flex items-center gap-2"><Wallet size={16} /> Thiết lập giá thuê</Label>
               <Button variant="outline" size="sm" onClick={addPrice}>+ Thêm gói</Button>
            </div>
            <div className="space-y-3">
              {formData.prices?.map((p, idx) => (
                <div key={p.id} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-100 relative">
                  <div className="col-span-12 items-center flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Gói #{idx + 1}</span>
                    {idx > 0 && (
                      <button onClick={() => setFormData({...formData, prices: formData.prices?.filter(pr => pr.id !== p.id)})} className="text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="col-span-5 grid gap-1">
                    <span className="text-[10px] text-gray-500">Tên gói</span>
                    <Input value={p.packageName} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newPrices = [...(formData.prices || [])];
                        newPrices[idx].packageName = e.target.value;
                        setFormData({...formData, prices: newPrices});
                    }} placeholder="VD: Gói 6 tháng" className="h-8 text-xs" />
                  </div>
                  <div className="col-span-4 grid gap-1">
                    <span className="text-[10px] text-gray-500">Giá (VNĐ)</span>
                    <Input type="number" value={p.price} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newPrices = [...(formData.prices || [])];
                        newPrices[idx].price = Number(e.target.value);
                        setFormData({...formData, prices: newPrices});
                    }} className="h-8 text-xs font-bold" />
                  </div>
                  <div className="col-span-3 grid gap-1">
                    <span className="text-[10px] text-gray-500">Tháng</span>
                    <Input type="number" value={p.duration} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newPrices = [...(formData.prices || [])];
                        newPrices[idx].duration = Number(e.target.value);
                        setFormData({...formData, prices: newPrices});
                    }} className="h-8 text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onSave(formData)}>Hoàn tất</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Properties;
