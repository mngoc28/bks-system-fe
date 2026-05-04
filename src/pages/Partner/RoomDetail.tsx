import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Home, Square, Users, MapPin, 
  Wallet, Shield, Wrench, History as HistoryIcon, Image as ImageIcon,
  Loader2, Calendar, Phone, Mail, CheckCircle, Clock, AlertCircle,
  ChevronRight
} from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CLOUDINARY_HEADER_IMAGE_URL } from '@/constant';
import { resolveImageUrl } from '@/utils/imageUtils';
import { Room, Booking, MaintenanceRequest } from './types';
import { cn } from '@/lib/utils';

const RoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceRequest[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (roomId) {
      fetchData();
    }
  }, [roomId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [roomRes, bookingsRes, maintRes, imagesRes]: any = await Promise.all([
        partnerService.getRoomDetail(roomId!),
        partnerService.getBookings({ room_id: roomId }),
        partnerService.getMaintenances({ room_id: roomId }),
        partnerService.getRoomImages(roomId!)
      ]);

      const rawRoom = roomRes?.status === 'success' ? roomRes.data : (roomRes?.data ?? roomRes);
      if (!rawRoom) throw new Error('Không tìm thấy thông tin phòng');
      
      setRoom({
        ...rawRoom,
        id: rawRoom.id,
        name: rawRoom.name ?? rawRoom.title ?? 'N/A',
        area: rawRoom.area || 0,
        floor_number: rawRoom.floor_number || 0,
        people: rawRoom.people || 0,
        room_type: rawRoom.room_type || 1,
        status: rawRoom.status === 1 ? 'Trống' : rawRoom.status === 2 ? 'Đang thuê' : 'Đang bảo trì',
        amenities: rawRoom.amenities || [],
        services: rawRoom.services || [],
        prices: rawRoom.prices || []
      });

      const rawBookings = bookingsRes?.data?.data || bookingsRes?.data || (Array.isArray(bookingsRes) ? bookingsRes : []);
      setBookings(rawBookings.map((b: any) => ({
        id: b.id,
        guestName: b.customer_name ?? b.user?.name ?? 'Khách lẻ',
        checkIn: b.check_in_date ?? b.start_date,
        checkOut: b.check_out_date ?? b.end_date,
        totalAmount: b.total_price ?? b.amount ?? 0,
        status: b.status === 1 ? 'Đã duyệt' : b.status === 0 ? 'Chờ duyệt' : b.status === 2 ? 'Đã hủy' : 'Đã hoàn thành',
        phone: b.customer_phone ?? b.user?.phone
      })));

      const rawMaintenances = maintRes?.data?.data || maintRes?.data || (Array.isArray(maintRes) ? maintRes : []);
      setMaintenances(rawMaintenances.map((m: any) => ({
        id: m.id,
        roomName: rawRoom.name,
        type: m.type || m.maintenance_type || 'Sửa chữa',
        description: m.description || m.issueDescription,
        status: m.status === 'completed' || m.status === 'Đã hoàn thành' ? 'Đã hoàn thành' : m.status === 'processing' || m.status === 'Đang xử lý' ? 'Đang xử lý' : 'Chờ xử lý',
        createdAt: m.created_at || m.createdAt
      })));

      setImages(imagesRes?.data || []);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải dữ liệu phòng');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'amenities', label: 'Tiện ích & Dịch vụ' },
    { id: 'tenants', label: 'Lịch sử đặt phòng' },
    { id: 'maintenance', label: 'Bảo trì' },
    { id: 'gallery', label: 'Hình ảnh' },
  ];

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600 size-12" />
        <p className="text-slate-500 font-semibold animate-pulse">Đang tải dữ liệu phòng...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-rose-50 p-4 rounded-full text-rose-500 mb-2">
           <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Oops! Có lỗi xảy ra</h2>
        <p className="text-slate-500 max-w-md">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4 gap-2">
           <ArrowLeft size={18} /> Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
        
        <div className="z-10 space-y-4">
           <Button variant="ghost" onClick={() => navigate(-1)} className="p-0 h-auto text-slate-400 hover:text-blue-600 font-semibold flex items-center gap-2 mb-2">
              <ArrowLeft size={16} /> <span className="text-xs uppercase tracking-widest">Quay lại danh sách</span>
           </Button>
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Phòng {room.name}</h1>
                 <Badge className={cn(
                   "px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider",
                   room.status === 'Trống' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                   room.status === 'Đang thuê' ? "bg-blue-50 text-blue-700 border-blue-200" :
                   "bg-amber-50 text-amber-700 border-amber-200"
                 )}>
                   {room.status}
                 </Badge>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-1.5 uppercase text-xs tracking-wider">
                 <MapPin size={14} className="text-slate-300" /> {room.buildingName} • Tầng {room.floor_number}
              </p>
           </div>
        </div>

         <div className="z-10 flex gap-3">
           <Button size="default" variant="outline" className="rounded-2xl border-2 border-slate-100 font-semibold text-slate-700 hover:bg-slate-50 shadow-sm uppercase text-xs tracking-wider">
              <Shield size={18} className="mr-2 text-indigo-500" /> Hợp đồng
           </Button>
           <Button size="default" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 uppercase text-xs tracking-wider">
              <Wrench size={18} className="mr-2" /> Bảo trì
           </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { icon: <Square size={20} />, label: "Diện tích", value: `${room.area} m²`, color: "bg-blue-50 text-blue-600" },
           { icon: <Users size={20} />, label: "Sức chứa", value: `${room.people} người`, color: "bg-indigo-50 text-indigo-600" },
           { icon: <Home size={20} />, label: "Loại phòng", value: room.room_type === 1 ? "Phòng đơn" : room.room_type === 2 ? "Phòng đôi" : "Căn hộ", color: "bg-amber-50 text-amber-600" },
           { icon: <Wallet size={20} />, label: "Giá thuê từ", value: `${Number(room.prices[0]?.price || 0).toLocaleString()}đ`, color: "bg-emerald-50 text-emerald-600" },
         ].map((card, i) => (
           <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                 <div className={`p-3 w-fit rounded-2xl mb-4 ${card.color}`}>{card.icon}</div>
                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{card.label}</p>
                 <p className="text-xl font-bold text-slate-900 mt-1">{card.value}</p>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/50 w-fit">
         {tabs.map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                  "px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all duration-200",
                  activeTab === tab.id 
                     ? "bg-white text-blue-600 shadow-md shadow-slate-200/50 scale-105" 
                     : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
               )}
            >
               {tab.label}
            </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8 transition-all duration-300">
         {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
               <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden border-2 border-slate-50">
                  <CardHeader className="bg-slate-50/50 border-b border-white p-8">
                     <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <Wallet className="text-blue-500" size={20} /> Biểu giá thuê hiện tại
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                     {room.prices.length > 0 ? room.prices.map((p, i) => (
                        <div key={i} className="flex justify-between items-center p-6 bg-slate-50/50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-blue-50">
                           <div className="space-y-1">
                              <p className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.packageName || p.name || 'Gói chuẩn'}</p>
                              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-2">
                                 <Clock size={12} /> {p.duration || 1} tháng thuê cố định
                              </p>
                           </div>
                           <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">{Number(p.price || 0).toLocaleString()} <span className="text-sm">đ</span></p>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase">mỗi kỳ thanh toán</p>
                           </div>
                        </div>
                     )) : (
                        <div className="text-center py-12 text-slate-400 italic font-medium">Chưa có bảng giá được cấu hình cho phòng này</div>
                     )}
                  </CardContent>
               </Card>

               <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden border-2 border-slate-50">
                  <CardHeader className="bg-slate-50/50 border-b border-white p-8">
                     <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <Phone className="text-indigo-500" size={20} /> Hỗ trợ & Thông tin liên lạc
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="space-y-4">
                        <div className="flex items-center gap-6 p-6 bg-indigo-50/30 rounded-xl border border-indigo-50 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
                           <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-100"><Phone size={24} /></div>
                           <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Tổng đài hỗ trợ 24/7</p>
                              <p className="text-2xl font-bold text-slate-800">1900 8888</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-xl hover:shadow-slate-50 transition-all duration-300">
                           <div className="p-4 bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-200"><Mail size={24} /></div>
                           <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Email quản trị viên</p>
                              <p className="text-2xl font-bold text-slate-800 text-ellipsis overflow-hidden">admin@bkstay.vn</p>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         )}

         {activeTab === 'amenities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4">
               <div className="space-y-8">
                  <div className="flex items-center justify-between px-4">
                     <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
                        <div className="w-2 h-8 bg-amber-500 rounded-full" /> Tiện ích nội thất
                     </h3>
                     <Badge variant="outline" className="font-semibold text-amber-600 border-amber-100">{room.amenities.length} items</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {room.amenities.length > 0 ? room.amenities.map((a: any, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-lg hover:border-amber-100 transition-all duration-300 group">
                           <div className="text-amber-500 bg-amber-50 p-3 rounded-2xl group-hover:scale-110 transition-transform"><CheckCircle size={20} /></div>
                           <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{a.name}</span>
                        </div>
                     )) : <div className="col-span-full py-12 text-center text-slate-400 italic border-2 border-dashed border-slate-100 rounded-xl">Chưa cấu hình tiện ích</div>}
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="flex items-center justify-between px-4">
                     <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
                        <div className="w-2 h-8 bg-blue-500 rounded-full" /> Dịch vụ tòa nhà
                     </h3>
                     <Badge variant="outline" className="font-semibold text-blue-600 border-blue-100">{room.services.length} items</Badge>
                  </div>
                  <div className="space-y-4">
                     {room.services.length > 0 ? room.services.map((s: any, i) => (
                        <div key={i} className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
                           <div className="flex items-center gap-4">
                              <div className="text-blue-500 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 font-bold text-[10px] uppercase tracking-tighter shadow-sm">{s.unit || 'Tháng'}</div>
                              <span className="text-base font-bold text-slate-800 tracking-tight">{s.name}</span>
                           </div>
                           <span className="text-xl font-bold text-blue-600 group-hover:scale-110 transition-transform">{Number(s.price || 0).toLocaleString()} <span className="text-xs">đ</span></span>
                        </div>
                     )) : <div className="py-12 text-center text-slate-400 italic border-2 border-dashed border-slate-100 rounded-xl">Chưa có dịch vụ nào</div>}
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'tenants' && (
            <Card className="rounded-2xl border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 border-2 border-slate-50">
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="bg-slate-900 text-white">
                           <th className="px-10 py-6 text-left text-[10px] font-bold uppercase tracking-widest opacity-60">Khách thuê / Cư dân</th>
                           <th className="px-10 py-6 text-left text-[10px] font-bold uppercase tracking-widest opacity-60">Thời gian ở</th>
                           <th className="px-10 py-6 text-left text-[10px] font-bold uppercase tracking-widest opacity-60">Giá trị hợp đồng</th>
                           <th className="px-10 py-6 text-right text-[10px] font-bold uppercase tracking-widest opacity-60">Trạng thái</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {bookings.length > 0 ? bookings.map((b) => (
                           <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                       {b.guestName?.[0] || 'U'}
                                    </div>
                                    <div className="space-y-1">
                                       <p className="font-bold text-slate-900 text-base">{b.guestName}</p>
                                       <p className="text-xs text-slate-400 font-semibold tracking-tight">{b.phone || 'N/A'}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-3 font-semibold text-slate-700 text-sm">
                                    <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{b.checkIn ? new Date(b.checkIn).toLocaleDateString('vi-VN') : '-'}</span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{b.checkOut ? new Date(b.checkOut).toLocaleDateString('vi-VN') : '-'}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <p className="font-bold text-slate-900 text-lg">{Number(b.totalAmount || 0).toLocaleString()} <span className="text-xs">đ</span></p>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <Badge className={cn(
                                    "px-4 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-widest",
                                    b.status === 'Đã duyệt' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                    b.status === 'Chờ duyệt' ? "bg-amber-50 text-amber-700 border-amber-100" : 
                                    "bg-rose-50 text-rose-700 border-rose-100"
                                 )}>
                                    {b.status}
                                 </Badge>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan={4} className="px-10 py-20 text-center">
                                 <div className="flex flex-col items-center gap-4">
                                    <div className="p-6 bg-slate-50 rounded-full text-slate-200"><HistoryIcon size={48} /></div>
                                    <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">Phòng này chưa có lịch sử cư dân</p>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </Card>
         )}

         {activeTab === 'maintenance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
               {maintenances.length > 0 ? maintenances.map((m) => (
                  <Card key={m.id} className="border-none rounded-2xl shadow-xl shadow-slate-200/30 overflow-hidden hover:shadow-blue-100/50 transition-all duration-500 border-2 border-slate-50">
                     <CardContent className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex gap-8">
                           <div className={cn(
                              "p-6 rounded-[1.75rem] shadow-lg",
                              m.status === 'Đã hoàn thành' ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-amber-500 text-white shadow-amber-100'
                           )}>
                              <Wrench size={32} />
                           </div>
                           <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3">
                                 <h4 className="font-bold text-slate-800 text-xl tracking-tight uppercase">{m.type}</h4>
                                 <Badge variant="outline" className={cn(
                                    "text-[9px] uppercase font-bold px-4 py-1 rounded-full",
                                    m.status === 'Đã hoàn thành' ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-amber-600 border-amber-200 bg-amber-50"
                                 )}>{m.status}</Badge>
                              </div>
                              <p className="text-base text-slate-500 font-medium max-w-2xl leading-relaxed">{m.description || 'Sự cố đã được ghi nhận và xử lý.'}</p>
                              <div className="flex items-center gap-4">
                                 <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 shadow-sm uppercase">
                                    <Calendar size={14} className="text-blue-500" /> Báo lỗi: {new Date(m.createdAt).toLocaleDateString('vi-VN')}
                                 </span>
                                 <span className="text-[11px] text-slate-300 font-semibold italic">Ref ID: #{String(m.id).padStart(5, '0')}</span>
                              </div>
                           </div>
                        </div>
                        <Button className="rounded-2xl h-14 px-8 font-bold text-xs uppercase bg-white border-2 border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm">
                           Chi tiết biên bản
                        </Button>
                     </CardContent>
                  </Card>
               )) : (
                  <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                     <Wrench className="mx-auto text-slate-200 mb-6" size={64} />
                     <p className="text-slate-400 font-bold italic uppercase tracking-[0.2em] text-xs">Phòng này trong tình trạng bảo trì hoàn hảo</p>
                  </div>
               )}
            </div>
         )}

         {activeTab === 'gallery' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4">
               {images.length > 0 ? images.map((img: any) => (
                  <div key={img.id} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-slate-300/30 group border-4 border-white hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                     <img 
                        src={resolveImageUrl(img.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || '/assets/images/photo_error2.png'} 
                        alt="Room Showcase" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
               )) : (
                  <div className="col-span-full py-24 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                     <ImageIcon className="mx-auto text-slate-200 mb-6" size={64} />
                     <p className="text-slate-400 font-bold italic uppercase tracking-[0.2em] text-xs">Chưa có bộ sưu tập hình ảnh cho phòng này</p>
                  </div>
               )}
            </div>
         )}
      </div>
    </div>
  );
};

export default RoomDetail;
