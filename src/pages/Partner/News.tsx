import React, { useState, useEffect, ChangeEvent } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { partnerService } from '@/services/partnerService';
import { NewsPost } from './types';
import InlineSheet from './components/InlineSheet';
import { PlainTextarea } from '@/components/ui/textarea';
import { toastError, toastSuccess } from '@/components/ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const formatDate = (value: unknown): string => {
    if (!value) return 'N/A';
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString('vi-VN');
  };

  const normalizeNews = (rows: any[]): NewsPost[] => {
    return (rows || []).map((post: any) => ({
      ...post,
      createdAt: post.createdAt ?? post.created_at ?? post.published_at ?? null,
      title: post.title ?? '',
      content: post.content ?? post.excerpt ?? '',
      thumbnail: post.thumbnail ?? 'https://via.placeholder.com/150',
      status: post.status === 'Đã đăng' || post.status === 'Nháp'
        ? post.status
        : (Number(post.status) === 1 ? 'Đã đăng' : 'Nháp'),
    })) as NewsPost[];
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getNews();
      const payload = res?.data?.data?.data || res?.data?.data || [];
      setNewsList(normalizeNews(payload));
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
      toastSuccess('Đã lưu bài viết.');
    } catch {
      toastError('Lỗi khi lưu bài viết.');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await partnerService.deleteNews(id);
      fetchNews();
      toastSuccess('Đã xóa bài viết.');
    } catch {
      toastError('Lỗi khi xóa bài viết.');
    }
  };

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tin tức & Ưu đãi</h1>
          <p className="mt-1 text-gray-500">Cập nhật các chương trình khuyến mãi và thông báo cho khách hàng của bạn.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="h-10 bg-blue-600 px-4 font-bold text-white hover:bg-blue-700">
          <Plus size={18} className="mr-2" /> Soạn bài viết mới
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Bài viết</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Ngày đăng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {newsList.map((post) => (
                <tr key={post.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                         <img src={post.thumbnail} alt={post.title} className="size-full object-cover" />
                      </div>
                      <div className="max-w-md">
                        <h3 className="line-clamp-1 text-sm font-bold uppercase tracking-tight text-gray-800 transition-colors group-hover:text-blue-600">{post.title}</h3>
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{post.content}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(post.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                      post.status === 'Đã đăng' 
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700' 
                        : 'border-amber-100 bg-amber-50 text-amber-700'
                    }`}>
                      {post.status === 'Đã đăng' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button onClick={() => handleOpenModal(post)} variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-blue-600"><Edit size={16} /></Button>
                       <Button onClick={() => handleDelete(post.id)} variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-red-600"><Trash2 size={16} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InlineSheet
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPost ? 'Chỉnh sửa bài viết' : 'Soạn bài viết mới'}
        widthClassName="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">Lưu bài viết</Button>
          </div>
        }
      >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Tiêu đề bài viết</Label>
              <Input value={form.title} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})} placeholder="VD: Chương trình khuyến mãi hè 2024..." />
            </div>
            <div className="grid gap-2">
               <Label>Nội dung</Label>
                <PlainTextarea className="min-h-[200px]" value={form.content} onChange={(e: any) => setForm({...form, content: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(val) => setForm({...form, status: val as any})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nháp">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Clock size={14} /> Nháp (Bản thảo)
                    </div>
                  </SelectItem>
                  <SelectItem value="Đã đăng">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={14} /> Đã đăng (Công khai)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
      </InlineSheet>
    </div>
  );
};

export default News;
