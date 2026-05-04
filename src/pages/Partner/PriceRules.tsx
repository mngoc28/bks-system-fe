import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingUp, 
  Trash2, 
  Edit, 
  Calendar, 
  Tag, 
  Percent, 
  Settings2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { partnerService } from '@/services/partnerService';
import { toastError, toastSuccess } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

const PriceRulesPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    rule_type: 'seasonal',
    adjustment_type: 'percentage',
    adjustment_value: 0,
    start_date: '',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getPriceRules();
      setRules(res?.data || []);
    } catch (e) {
      toastError('Không thể tải danh sách quy tắc giá.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      rule_type: 'seasonal',
      adjustment_type: 'percentage',
      adjustment_value: 0,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      rule_type: rule.rule_type,
      adjustment_type: rule.adjustment_type,
      adjustment_value: rule.adjustment_value,
      start_date: rule.start_date,
      end_date: rule.end_date || '',
      is_active: rule.is_active
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingRule) {
        await partnerService.updatePriceRule(editingRule.id, formData);
        toastSuccess('Đã cập nhật quy tắc giá thành công.');
      } else {
        await partnerService.createPriceRule(formData);
        toastSuccess('Đã thêm quy tắc giá mới.');
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (e) {
      toastError('Lỗi khi lưu quy tắc giá.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quy tắc này?')) return;
    try {
      await partnerService.deletePriceRule(id);
      toastSuccess('Đã xóa quy tắc giá.');
      fetchRules();
    } catch (e) {
      toastError('Lỗi khi xóa quy tắc giá.');
    }
  };

  const toggleStatus = async (rule: any) => {
    try {
      await partnerService.updatePriceRule(rule.id, { 
        ...rule, 
        is_active: !rule.is_active 
      });
      toastSuccess(`Đã ${rule.is_active ? 'tắt' : 'bật'} quy tắc giá.`);
      fetchRules();
    } catch (e) {
      toastError('Lỗi khi cập nhật trạng thái.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" />
            Cấu hình Giá động
          </h1>
          <p className="text-sm text-slate-500">Tự động điều chỉnh giá theo mùa, ngày lễ hoặc nhu cầu thị trường.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl px-6 gap-2 font-semibold shadow-lg shadow-blue-200">
           <Plus size={20} /> Thêm quy tắc mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {rules.map(rule => (
            <div key={rule.id} className={`bg-white rounded-2xl border ${rule.is_active ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-75'} p-6 transition-all hover:shadow-md relative overflow-hidden group`}>
               <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-gradient-to-br ${rule.is_active ? 'from-emerald-500/10' : 'from-slate-500/10'} rounded-full blur-2xl transition-opacity opacity-0 group-hover:opacity-100`} />
               
               <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                     <h3 className="font-bold text-slate-900 text-lg">{rule.name}</h3>
                     <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 uppercase text-[10px] tracking-widest font-bold">
                        {rule.rule_type === 'seasonal' ? 'Theo mùa' : rule.rule_type === 'holiday' ? 'Ngày lễ' : 'Sự kiện'}
                     </Badge>
                  </div>
                  <Checkbox 
                    checked={!!rule.is_active} 
                    onCheckedChange={() => toggleStatus(rule)}
                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
               </div>

               <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        {rule.adjustment_type === 'percentage' ? <Percent size={20} /> : <Tag size={20} />}
                     </div>
                     <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Điều chỉnh</div>
                        <div className="text-xl font-black text-slate-800">
                           {rule.adjustment_value > 0 ? '+' : ''}{rule.adjustment_value}{rule.adjustment_type === 'percentage' ? '%' : ' ₫'}
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <Calendar size={14} className="text-slate-400" />
                     <span className="text-[11px] font-bold text-slate-600">{rule.start_date}</span>
                     <ArrowRight size={12} className="text-slate-300" />
                     <span className="text-[11px] font-bold text-slate-600">{rule.end_date || 'Vô hạn'}</span>
                  </div>
               </div>

               <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(rule)} className="flex-1 rounded-lg gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                     <Edit size={14} /> Chỉnh sửa
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="w-10 h-10 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                     <Trash2 size={16} />
                  </Button>
               </div>
            </div>
         ))}

         {rules.length === 0 && !loading && (
            <div className="col-span-full bg-white rounded-xl border-2 border-dashed border-slate-200 p-20 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings2 size={32} className="text-slate-300" />
               </div>
               <h3 className="text-lg font-bold text-slate-800">Chưa có quy tắc giá nào</h3>
               <p className="text-slate-500 mb-6 max-w-md mx-auto small">Tạo quy tắc giá để tự động tăng giá trong mùa cao điểm hoặc giảm giá ưu đãi cho các sự kiện đặc biệt.</p>
               <Button onClick={handleOpenCreate} variant="outline" className="rounded-xl font-bold h-11 px-8 border-slate-200">
                  Thêm quy tắc đầu tiên
               </Button>
            </div>
         )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">{editingRule ? 'Cập nhật quy tắc' : 'Thêm quy tắc mới'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên quy tắc</Label>
               <Input 
                 placeholder="Ví dụ: Mùa hè cao điểm" 
                 value={formData.name} 
                 onChange={e => setFormData({...formData, name: e.target.value})}
                 className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loại quy tắc</Label>
                  <Select value={formData.rule_type} onValueChange={v => setFormData({...formData, rule_type: v})}>
                     <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="seasonal">Theo mùa</SelectItem>
                        <SelectItem value="holiday">Ngày lễ</SelectItem>
                        <SelectItem value="event">Sự kiện</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</Label>
                  <div className="flex items-center h-12 gap-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
                     <Checkbox checked={formData.is_active} onCheckedChange={(v: boolean) => setFormData({...formData, is_active: v})} />
                     <span className="text-sm font-bold text-slate-600">{formData.is_active ? 'Kích hoạt' : 'Vô hiệu'}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dạng điều chỉnh</Label>
                  <Select value={formData.adjustment_type} onValueChange={v => setFormData({...formData, adjustment_type: v})}>
                     <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                        <SelectItem value="fixed">Cố định (₫)</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá trị (+ / -)</Label>
                  <Input 
                    type="number" 
                    value={formData.adjustment_value} 
                    onChange={e => setFormData({...formData, adjustment_value: Number(e.target.value)})}
                    className="h-12 rounded-xl font-bold"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
               <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} /> Ngày bắt đầu</Label>
                  <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="h-12 rounded-xl" />
               </div>
               <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} /> Ngày kết thúc</Label>
                  <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="h-12 rounded-xl" />
               </div>
               <p className="col-span-2 text-[10px] text-slate-400 italic">Để trống ngày kết thúc nếu muốn quy tắc áp dụng vĩnh viễn.</p>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-slate-50 gap-3">
             <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-600">Hủy bỏ</Button>
             <Button onClick={handleSave} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-200">Lưu quy tắc</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriceRulesPage;
