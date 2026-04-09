import React, { useState, useEffect, ChangeEvent } from 'react';
import { Plus, Edit, Trash2, Calendar, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { NewsPost } from './types';
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

const News: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [form, setForm] = useState<Partial<NewsPost>>({
    title: '',
    content: '',
    status: 'Nháp',
    thumbnail: 'https://via.placeholder.com/150'
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getNews();
      setNewsList(res.data.data.data || res.data.data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (post?: NewsPost) => {
    if (post) {
      setEditingPost(post);
      setForm(post);
    } else {
      setEditingPost(null);
      setForm({ title: '', content: '', status: 'Nháp', thumbnail: 'https://via.placeholder.com/150' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPost) {
        await partnerService.updateNews(String(editingPost.id), form);
      } else {
        await partnerService.createNews(form);
      }
      fetchNews();
      setIsModalOpen(false);
    } catch (error) {
      alert('Lỗi khi lưu bài viết.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Bạn có muốn xóa bài viết này?')) {
      try {
        await partnerService.deleteNews(id);
        fetchNews();
      } catch (error) {
        alert('Lỗi khi xóa bài viết.');
      }
    }
  };

  if (loading) {
    return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tin tức & Ưu đãi</h1>
          <p className="text-gray-500 mt-1">Cập nhật các chương trình khuyến mãi và thông báo cho khách hàng của bạn.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 font-bold">
          <Plus size={18} className="mr-2" /> Soạn bài viết mới
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Bài viết</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ngày đăng</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {newsList.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                         <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="max-w-md">
                        <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{post.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{post.content}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      post.status === 'Đã đăng' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {post.status === 'Đã đăng' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button onClick={() => handleOpenModal(post)} variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600 h-8 w-8"><Edit size={16} /></Button>
                       <Button onClick={() => handleDelete(post.id)} variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 h-8 w-8"><Trash2 size={16} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Chỉnh sửa bài viết' : 'Soạn bài viết mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tiêu đề bài viết</Label>
              <Input value={form.title} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})} placeholder="VD: Chương trình khuyến mãi hè 2024..." />
            </div>
            <div className="grid gap-2">
               <Label>Nội dung</Label>
               <PlainTextarea className="min-h-[200px]" value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Trạng thái</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                <option value="Nháp">Nháp</option>
                <option value="Đã đăng">Đã đăng</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">Lưu bài viết</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default News;
