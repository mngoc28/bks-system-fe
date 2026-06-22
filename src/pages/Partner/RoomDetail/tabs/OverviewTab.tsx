import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Clock, Phone, Mail } from 'lucide-react';
import { Room } from '../../types';
import { cn } from '@/lib/utils';
import {
  resolvePartnerContactEmail,
  resolvePartnerContactPhone,
} from '@/utils/partnerRoomDisplay';

interface OverviewTabProps {
  room: Room;
}

const CONTACT_PLACEHOLDER = 'Chưa cấu hình — vui lòng cập nhật trong hồ sơ đối tác';

export const OverviewTab: React.FC<OverviewTabProps> = ({ room }) => {
  const contactPhone = resolvePartnerContactPhone(room.partner_phone, room.support_phone);
  const contactEmail = resolvePartnerContactEmail(room.partner_email, room.support_email);
  const phoneSource = room.partner_phone?.trim()
    ? 'Liên hệ đối tác'
    : room.support_phone?.trim()
      ? 'Tổng đài hỗ trợ 24/7'
      : 'Số điện thoại';
  const emailSource = room.partner_email?.trim()
    ? 'Email đối tác'
    : room.support_email?.trim()
      ? 'Email hỗ trợ hệ thống'
      : 'Email';

  return (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 lg:grid-cols-2">
      <Card className="overflow-hidden rounded-2xl border-2 border-slate-100 shadow-sm">
        <CardHeader className="border-b border-white bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
            <Wallet className="text-blue-500" size={20} /> Biểu giá thuê hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 lg:p-8">
          {room.prices.length > 0 ? room.prices.map((p: any, i: number) => (
            <div key={i} className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-6 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-50">
              <div className="space-y-1">
                <p className="text-lg font-bold uppercase tracking-tight text-slate-800 transition-colors group-hover:text-blue-600">{p.packageName || p.name || 'Gói chuẩn'}</p>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <Clock size={12} /> {p.duration || 1} tháng thuê cố định
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{Number(p.price || 0).toLocaleString()} <span className="text-sm">đ</span></p>
                <p className="text-[10px] font-semibold uppercase text-slate-400">mỗi kỳ thanh toán</p>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center font-medium italic text-slate-400">Chưa có bảng giá được cấu hình cho phòng này</div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-2 border-slate-100 shadow-sm">
        <CardHeader className="border-b border-white bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
            <Phone className="text-indigo-500" size={20} /> Hỗ trợ & Thông tin liên lạc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-6 rounded-xl border border-indigo-50 bg-indigo-50/30 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-50">
              <div className="rounded-2xl bg-indigo-500 p-4 text-white shadow-lg shadow-indigo-100"><Phone size={24} /></div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{phoneSource}</p>
                <p className={cn(
                  'text-2xl font-bold break-all',
                  contactPhone ? 'text-slate-800' : 'text-sm font-medium italic text-slate-400',
                )}>
                  {contactPhone ?? CONTACT_PLACEHOLDER}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 rounded-xl border border-slate-100 bg-slate-50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-50">
              <div className="rounded-2xl bg-slate-800 p-4 text-white shadow-lg shadow-slate-200"><Mail size={24} /></div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{emailSource}</p>
                <p className={cn(
                  'overflow-hidden text-ellipsis font-bold break-all',
                  contactEmail ? 'text-2xl text-slate-800' : 'text-sm font-medium italic text-slate-400',
                )}>
                  {contactEmail ?? CONTACT_PLACEHOLDER}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
