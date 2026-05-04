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

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      const res: any = await partnerService.getPartnerReports({ range: timeRange });
      setStats(res?.data || null);
    } catch (e) {
      toastError('Không thể tải báo cáo phân tích.');
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trung tâm Phân tích</h1>
          <p className="text-sm font-medium text-slate-500">Theo dõi doanh thu, tỷ lệ lấp đầy và hiệu quả kinh doanh của bạn.</p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
           <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner border border-slate-200/50">
             {['7days', '30days', 'month', 'year'].map(range => (
               <Button 
                 key={range}
                 variant={timeRange === range ? 'secondary' : 'ghost'} 
                 size="sm" 
                 onClick={() => setTimeRange(range)}
                 className={`rounded-xl h-9 px-4 text-xs font-black uppercase tracking-wider transition-all ${timeRange === range ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
               >
                 {range === '7days' ? '7 ngày' : range === '30days' ? '30 ngày' : range === 'month' ? 'Tháng này' : 'Năm qua'}
               </Button>
             ))}
           </div>
           <Button variant="outline" className="h-11 rounded-xl px-4 gap-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
              <Download size={18} /> Xuất PDF
           </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { title: 'ADR', value: stats?.adr || 0, unit: '₫', icon: DollarSign, color: 'blue', desc: 'Giá thuê trung bình/phòng' },
           { title: 'RevPAR', value: stats?.revpar || 0, unit: '₫', icon: TrendingUp, color: 'emerald', desc: 'Doanh thu trung bình/phòng' },
           { title: 'Occupancy', value: stats?.occupancy_rate || 0, unit: '%', icon: Activity, color: 'violet', desc: 'Tỷ lệ lấp đầy tất cả phòng' },
           { title: 'Total Revenue', value: stats?.total_revenue || 0, unit: '₫', icon: DollarSign, color: 'amber', desc: 'Tổng doanh thu thực tế' }
         ].map((kpi, i) => (
           <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${kpi.color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700`} />
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className={`w-12 h-12 rounded-2xl bg-${kpi.color}-50 flex items-center justify-center text-${kpi.color}-600`}>
                    <kpi.icon size={24} />
                 </div>
                 <Badge variant="outline" className={`bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1 font-bold`}>
                    <ArrowUpRight size={12} /> 12%
                 </Badge>
              </div>
              <div className="relative z-10">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.title}</h3>
                 <div className="text-2xl font-black text-slate-900 leading-none">
                    {kpi.value.toLocaleString('vi-VN')}{kpi.unit}
                 </div>
                 <p className="text-[10px] font-bold text-slate-500 mt-3 flex items-center gap-1">
                    <CalendarDays size={10} /> {kpi.desc}
                 </p>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Revenue Trend Chart */}
         <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                     <BarChart3 className="text-blue-500" size={20} />
                     Xu hướng Doanh thu
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Biến động theo thời gian</p>
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
         <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                     <PieIcon className="text-emerald-500" size={20} />
                     Tỉ lệ lấp đầy theo tòa nhà
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiệu suất từng bất động sản</p>
               </div>
            </div>
            <div className="h-[350px] w-full flex items-center">
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
               <div className="w-1/3 flex flex-col gap-3">
                  {(stats?.occupancy_by_property || []).map((entry: any, index: number) => (
                     <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                           <div className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tighter">{entry.name}</div>
                           <div className="text-[10px] font-bold text-slate-400">{entry.occupancy}%</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Table: Daily KPIs */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
         <h3 className="text-lg font-black text-slate-900 mb-6">Chi tiết chỉ số hàng ngày</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày</th>
                     <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Số phòng bán</th>
                     <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ADR</th>
                     <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">RevPAR</th>
                     <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tỷ lệ lấp đầy</th>
                  </tr>
               </thead>
               <tbody>
                  {(stats?.daily_stats || []).map((row: any, i: number) => (
                     <tr key={i} className="border-b border-slate-50 last:border-none group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 text-xs font-bold text-slate-700">{row.date}</td>
                        <td className="py-4 text-xs font-bold text-slate-700">{row.rooms_sold}</td>
                        <td className="py-4 text-xs font-black text-blue-600 text-right">{row.adr.toLocaleString('vi-VN')} ₫</td>
                        <td className="py-4 text-xs font-black text-emerald-600 text-right">{row.revpar.toLocaleString('vi-VN')} ₫</td>
                        <td className="py-4 text-xs font-black text-slate-900 text-right">
                           <div className="inline-flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.occupancy_rate}%` }} />
                              </div>
                              <span className="min-w-[40px]">{row.occupancy_rate}%</span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default ReportsPage;
