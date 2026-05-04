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
    } catch (e) {
      toastError('Không thể tải danh sách hội thoại.');
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      setLoading(true);
      const res: any = await partnerService.getMessages(id);
      setMessages(res?.data || []);
    } catch (e) {
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
    } catch (e) {
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
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-blue-950/5">
      {/* Sidebar */}
      <div className="w-full md:w-[380px] border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 space-y-4">
           <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-slate-900">Tin nhắn</h1>
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-100">
                 <MoreVertical size={18} />
              </Button>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Tìm kiếm hội thoại..." 
                className="pl-10 h-11 rounded-2xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-blue-500 transition-all font-medium"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
           {conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 border-2 ${
                  activeConversation?.id === conv.id 
                    ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' 
                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100'
                }`}
              >
                 <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                       <AvatarImage src={conv.booking?.user?.avatar} />
                       <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                          {conv.booking?.user?.name?.charAt(0) || 'U'}
                       </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                       <h3 className={`font-bold truncate ${activeConversation?.id === conv.id ? 'text-white' : 'text-slate-900 text-sm'}`}>
                          {conv.booking?.user?.name}
                       </h3>
                       <span className={`text-[10px] font-medium ${activeConversation?.id === conv.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {format(new Date(conv.updated_at), 'HH:mm')}
                       </span>
                    </div>
                    <div className="flex justify-between items-center">
                       <p className={`text-xs truncate ${activeConversation?.id === conv.id ? 'text-blue-50 opacity-80' : 'text-slate-500'}`}>
                          {conv.last_message || 'Bắt đầu trò chuyện...'}
                       </p>
                       {conv.unread_count > 0 && activeConversation?.id !== conv.id && (
                          <div className="min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                             {conv.unread_count}
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           ))}

           {conversations.length === 0 && (
              <div className="py-20 text-center space-y-3 px-10">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <MessageSquare size={32} />
                 </div>
                 <p className="text-sm font-bold text-slate-400">Chưa có hội thoại nào</p>
              </div>
           )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
         {activeConversation ? (
            <>
               {/* Chat Header */}
               <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                  <div className="flex items-center gap-4">
                     <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-slate-100">
                        <AvatarImage src={activeConversation.booking?.user?.avatar} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold uppercase">
                           {activeConversation.booking?.user?.name?.charAt(0)}
                        </AvatarFallback>
                     </Avatar>
                     <div>
                        <h2 className="font-black text-slate-900 text-sm md:text-base leading-tight">
                           {activeConversation.booking?.user?.name}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trực tuyến • {activeConversation.booking?.room?.name}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-3">
                     <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Phone size={18} />
                     </Button>
                     <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Video size={18} />
                     </Button>
                     <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                        <MoreVertical size={18} />
                     </Button>
                  </div>
               </div>

               {/* Messages List */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
                  {loading ? (
                     <div className="h-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                     </div>
                  ) : (
                     messages.map((msg) => {
                        const isMe = msg.user_id !== activeConversation.booking?.user?.id; // Assuming user_id in msg is the sender
                        // Actually, logic is usually simpler: if (msg.sender_type === 'partner')
                        
                        return (
                           <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                              <div className={`flex flex-col max-w-[80%] md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                                 <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                                    isMe 
                                      ? 'bg-blue-600 text-white rounded-tr-none' 
                                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                 }`}>
                                    {msg.content}
                                 </div>
                                 <div className="flex items-center gap-1.5 mt-2 px-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
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
               <div className="p-4 md:p-6 bg-white border-t border-slate-50">
                  <div className="flex items-center gap-2 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-2xl ring-1 ring-slate-100 focus-within:ring-blue-500 focus-within:bg-white transition-all shadow-inner">
                     <div className="flex items-center gap-1 md:gap-2 px-2">
                        <Button variant="ghost" size="icon" className="hidden sm:flex text-slate-400 hover:text-blue-600 rounded-full h-9 w-9">
                           <Paperclip size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 rounded-full h-9 w-9">
                           <Smile size={20} />
                        </Button>
                     </div>
                     <Input 
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm font-medium placeholder:text-slate-400"
                     />
                     <div className="flex items-center gap-2 px-2">
                        <Button variant="ghost" size="icon" className="hidden sm:flex text-slate-400 hover:text-blue-600 rounded-full h-9 w-9">
                           <ImageIcon size={18} />
                        </Button>
                        <Button 
                           onClick={handleSendMessage}
                           disabled={!inputValue.trim() || sending}
                           className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 w-10 md:h-11 md:w-11 p-0 shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                           <Send size={18} />
                        </Button>
                     </div>
                  </div>
               </div>
            </>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
               <div className="relative mb-8">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 animate-bounce duration-[2000ms]">
                     <MessageSquare size={40} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 text-sm font-black border border-blue-50">!</div>
               </div>
               <h2 className="text-2xl font-black text-slate-900 mb-2">Chào mừng bạn quay lại!</h2>
               <p className="text-slate-500 text-sm max-w-[320px] leading-relaxed">Hãy chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu hỗ trợ khách hàng của bạn.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ChatPage;
