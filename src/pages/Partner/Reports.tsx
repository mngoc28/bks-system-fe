import React, { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  Download,
  PieChart as PieIcon,
  BarChart3,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { partnerService } from '@/services/partnerService';
import { toastError } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const abortController = new AbortController();
    fetchStats(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [timeRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange, perPage]);

  const fetchStats = async (signal?: AbortSignal) => {
    try {
      const res: any = await partnerService.getPartnerReports({ range: timeRange }, { signal });
      setStats(res?.data || null);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || signal?.aborted) {
        return;
      }
      toastError('Không thể tải báo cáo phân tích.');
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const KPI_STYLE: Record<string, { iconBg: string; iconText: string }> = {
    blue: { iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    violet: { iconBg: 'bg-violet-50', iconText: 'text-violet-600' },
    amber: { iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
  };

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      {/* Header & Filter */}
      <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:p-8">
        <div className="absolute right-0 top-0 -mr-32 -mt-32 size-64 rounded-full bg-blue-50/50 blur-3xl" />
        <div className="relative z-10 space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Trung tâm Phân tích</h1>
          <p className="text-sm font-medium text-slate-500">Theo dõi doanh thu, tỷ lệ lấp đầy và hiệu quả kinh doanh của bạn.</p>
        </div>

        <div className="relative z-10 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
           <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/50 bg-slate-100 p-1.5 shadow-inner [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
             {['7days', '30days', 'month', 'year'].map(range => (
               <Button 
                 key={range}
                 variant={timeRange === range ? 'secondary' : 'ghost'} 
                 size="sm" 
                 onClick={() => setTimeRange(range)}
                className={`h-9 shrink-0 rounded-xl px-4 text-xs font-black uppercase tracking-wider transition-all ${timeRange === range ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
               >
                 {range === '7days' ? '7 ngày' : range === '30days' ? '30 ngày' : range === 'month' ? 'Tháng này' : 'Năm qua'}
               </Button>
             ))}
           </div>
           <Button variant="outline" className="h-10 gap-2 rounded-xl border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:h-11 sm:text-sm">
              <Download size={18} /> Xuất PDF
           </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
         {[
           { title: 'ADR', value: stats?.adr || 0, unit: '₫', icon: DollarSign, color: 'blue', desc: 'Giá thuê trung bình/phòng' },
           { title: 'RevPAR', value: stats?.revpar || 0, unit: '₫', icon: TrendingUp, color: 'emerald', desc: 'Doanh thu trung bình/phòng' },
           { title: 'Occupancy', value: stats?.occupancy_rate || 0, unit: '%', icon: Activity, color: 'violet', desc: 'Tỷ lệ lấp đầy tất cả phòng' },
           { title: 'Total Revenue', value: stats?.total_revenue || 0, unit: '₫', icon: DollarSign, color: 'amber', desc: 'Tổng doanh thu thực tế' }
         ].map((kpi, i) => {
          const style = KPI_STYLE[kpi.color] ?? KPI_STYLE.blue;
          return (
           <div key={i} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute -bottom-4 -right-4 size-24 rounded-full bg-slate-50 opacity-50 transition-transform duration-700 group-hover:scale-150" />
              <div className="relative z-10 mb-4 flex items-start justify-between">
                 <div className={`flex size-12 items-center justify-center rounded-2xl ${style.iconBg} ${style.iconText}`}>
                    <kpi.icon size={24} />
                 </div>
                 <Badge variant="outline" className={`flex items-center gap-1 border-emerald-100 bg-emerald-50 font-bold text-emerald-600`}>
                    <ArrowUpRight size={12} /> 12%
                 </Badge>
              </div>
              <div className="relative z-10">
                 <h3 className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">{kpi.title}</h3>
                 <div className="text-2xl font-black leading-none text-slate-900">
                    {kpi.value.toLocaleString('vi-VN')}{kpi.unit}
                 </div>
                 <p className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <CalendarDays size={10} /> {kpi.desc}
                 </p>
              </div>
           </div>
         )})}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
         {/* Revenue Trend Chart */}
         <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900">
                     <BarChart3 className="text-blue-500" size={20} />
                     Xu hướng Doanh thu
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Biến động theo thời gian</p>
               </div>
            </div>
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.revenue_by_day || []}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}}
                       dy={10}
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}}
                       tickFormatter={(value) => `${value / 1000}k`}
                     />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Occupancy by Property Chart */}
         <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900">
                     <PieIcon className="text-emerald-500" size={20} />
                     Tỉ lệ lấp đầy theo tòa nhà
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Hiệu suất từng bất động sản</p>
               </div>
            </div>
            <div className="flex h-[350px] w-full flex-col items-center gap-4 lg:flex-row">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                       data={stats?.occupancy_by_property || []}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={120}
                       paddingAngle={5}
                       dataKey="occupancy"
                       nameKey="name"
                       cornerRadius={8}
                     >
                        {(stats?.occupancy_by_property || []).map((_entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
               <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-1/3 lg:flex-col lg:gap-3">
                  {(stats?.occupancy_by_property || []).map((entry: any, index: number) => (
                     <div key={index} className="flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <div className="min-w-0 flex-1">
                           <div className="truncate text-[10px] font-black uppercase tracking-tighter text-slate-800">{entry.name}</div>
                           <div className="text-[10px] font-bold text-slate-400">{entry.occupancy}%</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Table: Daily KPIs */}
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
         <h3 className="mb-6 text-lg font-black text-slate-900">Chi tiết chỉ số hàng ngày</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày</th>
                     <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Số phòng bán</th>
                     <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">ADR</th>
                     <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">RevPAR</th>
                     <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Tỷ lệ lấp đầy</th>
                  </tr>
               </thead>
               <tbody>
                  {(stats?.daily_stats || [])
                    .slice((currentPage - 1) * perPage, currentPage * perPage)
                    .map((row: any, i: number) => (
                     <tr key={i} className="group border-b border-slate-50 transition-colors last:border-none hover:bg-slate-50/50">
                        <td className="py-4 text-xs font-bold text-slate-700">{row.date}</td>
                        <td className="py-4 text-xs font-bold text-slate-700">{row.rooms_sold}</td>
                        <td className="py-4 text-right text-xs font-black text-blue-600">{row.adr.toLocaleString('vi-VN')} ₫</td>
                        <td className="py-4 text-right text-xs font-black text-emerald-600">{row.revpar.toLocaleString('vi-VN')} ₫</td>
                        <td className="py-4 text-right text-xs font-black text-slate-900">
                           <div className="inline-flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                 <div className="h-full rounded-full bg-blue-500" style={{ width: `${row.occupancy_rate}%` }} />
                              </div>
                              <span className="min-w-[40px]">{row.occupancy_rate}%</span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {stats?.daily_stats && stats.daily_stats.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-6">
               <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(stats.daily_stats.length / perPage)}
                  onPageChange={setCurrentPage}
                  perPage={perPage}
                  onPerPageChange={setPerPage}
                  totalItems={stats.daily_stats.length}
                  resultsText="ngày ghi nhận"
               />
            </div>
         )}
      </div>
    </div>
  );
};

export default ReportsPage;
