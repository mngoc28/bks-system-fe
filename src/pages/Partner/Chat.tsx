import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { partnerService } from '@/services/partnerService';
import { toastError } from '@/components/ui/toast';
import { format } from 'date-fns';
import echo from '@/lib/echo';
import { Spinner } from '@/components/ui/spinner';

interface Message {
  id: number;
  conversation_id: number;
  user_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface Conversation {
  id: number;
  booking_id: number;
  last_message?: string;
  updated_at: string;
  unread_count: number;
  booking?: {
    room?: { name: string };
    user?: { id: number, name: string, avatar?: string };
  };
}

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      
      // Listen for real-time messages
      (echo as any).private(`conversation.${activeConversation.id}`)
        .listen('MessageSent', (e: any) => {
          setMessages(prev => [...prev, e.message]);
          scrollToBottom();
          // Update last message in sidebar
          setConversations(prev => prev.map(c => 
            c.id === e.message.conversation_id 
              ? { ...c, last_message: e.message.content, updated_at: e.message.created_at } 
              : c
          ));
        });

      return () => {
        (echo as any).leave(`conversation.${activeConversation.id}`);
      };
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res: any = await partnerService.getConversations();
      setConversations(res?.data || []);
      if (res?.data?.length > 0 && !activeConversation) {
        // setActiveConversation(res.data[0]); // Don't auto-select to keep it clean
      }
    } catch {
      toastError('Không thể tải danh sách hội thoại.');
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      setLoading(true);
      const res: any = await partnerService.getMessages(id);
      setMessages(res?.data || []);
    } catch {
      toastError('Không thể tải tin nhắn.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeConversation || sending) return;

    try {
      setSending(true);
      await partnerService.sendMessage({ conversation_id: activeConversation.id, content: inputValue });
      // setMessages(prev => [...prev, res.data]); // Will be handled by Echo if configured properly, but fallback here
      setInputValue('');
      scrollToBottom();
    } catch {
      toastError('Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-950/5">
      {/* Sidebar */}
      <div className="flex w-full flex-col border-r border-slate-100 bg-slate-50/50 md:w-[380px]">
        <div className="space-y-4 p-6">
           <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-slate-900">Tin nhắn</h1>
              <Button variant="ghost" size="icon" className="rounded-full border border-slate-100 bg-white shadow-sm">
                 <MoreVertical size={18} />
              </Button>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Tìm kiếm hội thoại..." 
                className="h-11 rounded-2xl border-none bg-white pl-10 font-medium shadow-sm ring-1 ring-slate-200 transition-all focus:ring-blue-500"
              />
           </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3">
           {conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all ${
                  activeConversation?.id === conv.id 
                    ? 'border-blue-600 bg-blue-600 shadow-lg shadow-blue-200' 
                    : 'border-transparent bg-transparent hover:border-slate-100 hover:bg-white'
                }`}
              >
                 <div className="relative">
                    <Avatar className="size-12 border-2 border-white shadow-sm">
                       <AvatarImage src={conv.booking?.user?.avatar} />
                       <AvatarFallback className="bg-blue-100 font-bold text-blue-600">
                          {conv.booking?.user?.name?.charAt(0) || 'U'}
                       </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white bg-emerald-500" />
                 </div>
                 
                 <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-start justify-between">
                       <h3 className={`truncate font-bold ${activeConversation?.id === conv.id ? 'text-white' : 'text-sm text-slate-900'}`}>
                          {conv.booking?.user?.name}
                       </h3>
                       <span className={`text-[10px] font-medium ${activeConversation?.id === conv.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {format(new Date(conv.updated_at), 'HH:mm')}
                       </span>
                    </div>
                    <div className="flex items-center justify-between">
                       <p className={`truncate text-xs ${activeConversation?.id === conv.id ? 'text-blue-50 opacity-80' : 'text-slate-500'}`}>
                          {conv.last_message || 'Bắt đầu trò chuyện...'}
                       </p>
                       {conv.unread_count > 0 && activeConversation?.id !== conv.id && (
                          <div className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                             {conv.unread_count}
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           ))}

           {conversations.length === 0 && (
              <div className="space-y-3 px-10 py-20 text-center">
                 <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                    <MessageSquare size={32} />
                 </div>
                 <p className="text-sm font-bold text-slate-400">Chưa có hội thoại nào</p>
              </div>
           )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-white">
         {activeConversation ? (
            <>
               {/* Chat Header */}
               <div className="z-10 flex items-center justify-between border-b border-slate-50 bg-white/80 p-4 backdrop-blur-md md:p-6">
                  <div className="flex items-center gap-4">
                     <Avatar className="size-10 border border-slate-100 md:size-12">
                        <AvatarImage src={activeConversation.booking?.user?.avatar} />
                        <AvatarFallback className="bg-slate-100 font-bold uppercase text-slate-600">
                           {activeConversation.booking?.user?.name?.charAt(0)}
                        </AvatarFallback>
                     </Avatar>
                     <div>
                        <h2 className="text-sm font-black leading-tight text-slate-900 md:text-base">
                           {activeConversation.booking?.user?.name}
                        </h2>
                        <div className="mt-0.5 flex items-center gap-1.5">
                           <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trực tuyến • {activeConversation.booking?.room?.name}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-3">
                     <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600">
                        <Phone size={18} />
                     </Button>
                     <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600">
                        <Video size={18} />
                     </Button>
                     <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 transition-all hover:text-slate-900">
                        <MoreVertical size={18} />
                     </Button>
                  </div>
               </div>

               {/* Messages List */}
               <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/20 p-6">
                  {loading ? (
                     <div className="flex h-full items-center justify-center">
                        <Spinner size="sm" spinnerClassName="border-y-blue-600" />
                     </div>
                  ) : (
                     messages.map((msg) => {
                        const isMe = msg.user_id !== activeConversation.booking?.user?.id; // Assuming user_id in msg is the sender
                        // Actually, logic is usually simpler: if (msg.sender_type === 'partner')
                        
                        return (
                           <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group duration-300 animate-in fade-in slide-in-from-bottom-2`}>
                              <div className={`flex max-w-[80%] flex-col md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                                 <div className={`rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${
                                    isMe 
                                      ? 'rounded-tr-none bg-blue-600 text-white' 
                                      : 'rounded-tl-none border border-slate-100 bg-white text-slate-700'
                                 }`}>
                                    {msg.content}
                                 </div>
                                 <div className="mt-2 flex items-center gap-1.5 px-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                       {format(new Date(msg.created_at), 'HH:mm')}
                                    </span>
                                    {isMe && (
                                       <span className="text-blue-500">
                                          {msg.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </div>
                        );
                     })
                  )}
                  <div ref={scrollRef} />
               </div>

               {/* Chat Input */}
               <div className="border-t border-slate-50 bg-white p-4 md:p-6">
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2 shadow-inner ring-1 ring-slate-100 transition-all focus-within:bg-white focus-within:ring-blue-500 md:gap-4 md:p-3">
                     <div className="flex items-center gap-1 px-2 md:gap-2">
                        <Button variant="ghost" size="icon" className="hidden size-9 rounded-full text-slate-400 hover:text-blue-600 sm:flex">
                           <Paperclip size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-9 rounded-full text-slate-400 hover:text-blue-600">
                           <Smile size={20} />
                        </Button>
                     </div>
                     <Input 
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 border-none bg-transparent text-sm font-medium shadow-none placeholder:text-slate-400 focus-visible:ring-0"
                     />
                     <div className="flex items-center gap-2 px-2">
                        <Button variant="ghost" size="icon" className="hidden size-9 rounded-full text-slate-400 hover:text-blue-600 sm:flex">
                           <ImageIcon size={18} />
                        </Button>
                        <Button 
                           onClick={handleSendMessage}
                           disabled={!inputValue.trim() || sending}
                           className="size-10 rounded-xl bg-blue-600 p-0 text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 md:size-11"
                        >
                           <Send size={18} />
                        </Button>
                     </div>
                  </div>
               </div>
            </>
         ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/10 p-12 text-center">
               <div className="relative mb-8">
                  <div className="duration-[2000ms] flex size-24 animate-bounce items-center justify-center rounded-full bg-blue-50 text-blue-600">
                     <MessageSquare size={40} />
                  </div>
                  <div className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border border-blue-50 bg-white text-sm font-black text-blue-600 shadow-lg">!</div>
               </div>
               <h2 className="mb-2 text-2xl font-black text-slate-900">Chào mừng bạn quay lại!</h2>
               <p className="max-w-[320px] text-sm leading-relaxed text-slate-500">Hãy chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu hỗ trợ khách hàng của bạn.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ChatPage;
