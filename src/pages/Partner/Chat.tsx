import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Check,
  CheckCheck,
  MessageSquare,
  ArrowLeft,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { partnerService } from '@/services/partnerService';
import { toastError, toastInfo } from '@/components/ui/toast';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { isOwnChatMessage, mapRealtimeChatMessage, type ChatMessagePayload } from '@/utils/chatRealtime';
import { getEcho } from '@/lib/echoClient';
import ImageLightbox from '@/components/ui/image-lightbox';
import { CLOUDINARY_HEADER_IMAGE_URL } from '@/constant';

interface Conversation {
  id: number;
  booking_id: number;
  last_message?: string;
  updated_at: string;
  unread_count: number;
  company_name?: string | null;
  room_name?: string | null;
  property_name?: string | null;
  counterparty?: {
    id: number;
    name: string;
    avatar?: string;
    role: string;
  };
  booking?: {
    room?: { name: string };
    user?: { id: number, name: string, avatar?: string };
  };
}

const resolveChatImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const baseUrl = CLOUDINARY_HEADER_IMAGE_URL.replace(/\/+$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${path}`;
};

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<Array<{ src: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = (url: string) => {
    const imagesInChat = messages
      .filter((msg) => msg.metadata?.type === 'image' && msg.metadata?.url)
      .map((msg) => ({ src: resolveChatImageUrl(msg.metadata!.url as string) }));

    const resolvedUrl = resolveChatImageUrl(url);
    const idx = imagesInChat.findIndex((img) => img.src === resolvedUrl);
    setLightboxSlides(imagesInChat);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const handleAttachImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    if (!file.type.startsWith('image/')) {
      toastError('Chỉ hỗ trợ gửi tệp hình ảnh.');
      return;
    }

    try {
      setSending(true);
      const res: any = await partnerService.uploadImage(file);
      const url = res?.data?.url;
      if (!url) {
        throw new Error('Upload failed');
      }

      const sendRes: any = await partnerService.sendMessage({
        conversation_id: activeConversation.id,
        content: '[Hình ảnh]',
        metadata: {
          type: 'image',
          url: url,
        },
      });

      const sent = sendRes?.data as ChatMessagePayload | undefined;
      if (sent) {
        setMessages((prev) => {
          if (prev.some((item) => item.id === sent.id)) {
            return prev;
          }
          return [...prev, sent];
        });
      }
      scrollToBottom();
    } catch {
      toastError('Không thể gửi hình ảnh.');
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchConversations(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (activeConversation) {
      const controller = new AbortController();
      fetchMessages(activeConversation.id, controller.signal);
      return () => {
        controller.abort();
      };
    }
  }, [activeConversation]);

  // Listen to all conversations globally for sidebar updates and popup notifications
  useEffect(() => {
    const echoInstance = getEcho();
    if (!echoInstance || conversations.length === 0) {
      return;
    }

    const channels = conversations.map((conv) => {
      const channel = echoInstance.private(`conversation.${conv.id}`);
      channel.listen('.MessageSent', (payload: Record<string, unknown>) => {
        const incoming = mapRealtimeChatMessage(payload);
        
        // 1. Update conversations list in sidebar (last message, time, sorted)
        setConversations((prev) => {
          return prev
            .map((c) => {
              if (c.id === incoming.conversation_id) {
                const isCurrentActive = activeConversation?.id === c.id;
                const newUnreadCount = isCurrentActive ? 0 : c.unread_count + 1;
                return {
                  ...c,
                  last_message: incoming.content,
                  updated_at: incoming.created_at,
                  unread_count: newUnreadCount,
                };
              }
              return c;
            })
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        });

        // 2. If it's the active conversation, append message to pane
        if (activeConversation?.id === incoming.conversation_id) {
          setMessages((prev) => {
            if (prev.some((item) => item.id === incoming.id)) {
              return prev;
            }
            return [...prev, incoming];
          });
          scrollToBottom();
        } else {
          // 3. If it's NOT the active conversation, show a Toast popup notification!
          const counterpartyId = conv.counterparty?.id ?? conv.booking?.user?.id;
          const isMe = isOwnChatMessage(incoming, counterpartyId);
          if (!isMe) {
            const senderName = incoming.user?.name || conv.counterparty?.name || 'Khách hàng';
            let locationSuffix = "";
            if (conv.room_name && conv.property_name) {
              locationSuffix = ` - ${conv.room_name} (${conv.property_name})`;
            } else if (conv.property_name) {
              locationSuffix = ` - ${conv.property_name}`;
            } else if (conv.room_name) {
              locationSuffix = ` - ${conv.room_name}`;
            }
            toastInfo(`💬 Tin nhắn mới từ ${senderName}${locationSuffix}: "${incoming.content}"`, {
              action: {
                label: "Mở chat",
                onClick: () => {
                  setActiveConversation(conv);
                },
              },
              duration: 6000,
            });
          }
        }
      });
      return { id: conv.id, channel };
    });

    return () => {
      channels.forEach(({ id }) => {
        echoInstance.leave(`conversation.${id}`);
      });
    };
  }, [conversations, activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async (signal?: AbortSignal) => {
    try {
      const res: any = await partnerService.getConversations({ signal });
      if (signal?.aborted) return;
      setConversations(res?.data || []);
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.name === 'AbortError' || signal?.aborted) {
        return;
      }
      toastError('Không thể tải danh sách hội thoại.');
    }
  };

  const fetchMessages = async (id: number, signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res: any = await partnerService.getMessages(id, { signal });
      if (signal?.aborted) return;
      setMessages(res?.data || []);
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.name === 'AbortError' || signal?.aborted) {
        return;
      }
      toastError('Không thể tải tin nhắn.');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeConversation || sending) return;

    try {
      setSending(true);
      const res: any = await partnerService.sendMessage({ conversation_id: activeConversation.id, content: inputValue });
      const sent = res?.data as ChatMessagePayload | undefined;
      if (sent) {
        setMessages((prev) => {
          if (prev.some((item) => item.id === sent.id)) {
            return prev;
          }
          return [...prev, sent];
        });
      }
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
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-blue-950/5 sm:h-[calc(100vh-140px)] sm:rounded-[32px]">
      {/* Sidebar */}
      <div className={cn(
        'w-full flex-col border-r border-slate-100 bg-slate-50/50 md:flex md:w-[380px]',
        activeConversation ? 'hidden md:flex' : 'flex',
      )}>
        <div className="space-y-4 p-4 sm:p-6">
           <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-slate-900">Tin nhắn</h1>
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
                       <AvatarImage src={conv.counterparty?.avatar || conv.booking?.user?.avatar} />
                       <AvatarFallback className="bg-blue-100 font-bold text-blue-600">
                          {(conv.counterparty?.name || conv.booking?.user?.name)?.charAt(0) || 'U'}
                       </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white bg-emerald-500" />
                 </div>
                 
                 <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                       <h3 className={`truncate text-sm font-black ${activeConversation?.id === conv.id ? 'text-white' : 'text-slate-900'}`}>
                          {conv.counterparty?.name || conv.booking?.user?.name}
                       </h3>
                       <span className={`text-[10px] font-medium shrink-0 ${activeConversation?.id === conv.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {format(new Date(conv.updated_at), 'HH:mm')}
                       </span>
                    </div>
                    {conv.room_name && (
                       <div className={`mb-1 truncate text-[11px] font-bold ${activeConversation?.id === conv.id ? 'text-blue-100/80' : 'text-slate-400'}`}>
                          {conv.room_name}
                       </div>
                    )}
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
      <div className={cn(
        'flex-1 flex-col bg-white',
        activeConversation ? 'flex' : 'hidden md:flex',
      )}>
         {activeConversation ? (
            <>
               {/* Chat Header */}
               <div className="z-10 flex items-center justify-between border-b border-slate-50 bg-white/80 p-3 backdrop-blur-md sm:p-4 md:p-6">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                     <Button
                       variant="ghost"
                       size="icon"
                       className="shrink-0 rounded-xl md:hidden"
                       onClick={() => setActiveConversation(null)}
                       aria-label="Quay lại danh sách hội thoại"
                     >
                       <ArrowLeft size={18} />
                     </Button>
                     <Avatar className="size-10 border border-slate-100 md:size-12">
                        <AvatarImage src={activeConversation.counterparty?.avatar || activeConversation.booking?.user?.avatar} />
                        <AvatarFallback className="bg-slate-100 font-bold uppercase text-slate-600">
                           {(activeConversation.counterparty?.name || activeConversation.booking?.user?.name)?.charAt(0)}
                        </AvatarFallback>
                     </Avatar>
                      <div>
                        <h2 className="text-sm font-black leading-tight text-slate-900 md:text-base">
                           {activeConversation.counterparty?.name || activeConversation.booking?.user?.name}
                        </h2>
                         <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Trực tuyến
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {activeConversation.room_name || activeConversation.booking?.room?.name}
                              {activeConversation.property_name && ` (${activeConversation.property_name})`}
                            </span>
                         </div>
                      </div>
                  </div>

               </div>

               {/* Messages List */}
               <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/20 p-6">
                  {loading ? (
                     <div className="flex h-full items-center justify-center">
                        <Spinner size="sm" />
                     </div>
                  ) : (
                     messages.map((msg) => {
                        const counterpartyId = activeConversation.counterparty?.id ?? activeConversation.booking?.user?.id;
                        const isMe = isOwnChatMessage(msg, counterpartyId);

                        return (
                           <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group duration-300 animate-in fade-in slide-in-from-bottom-2`}>
                              <div className={`flex max-w-[80%] flex-col md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                                 <div className={cn(
                                    'rounded-2xl overflow-hidden shadow-sm',
                                    msg.metadata?.type === 'image' ? 'p-1 bg-white border border-slate-100' : 'px-4 py-3 text-sm font-medium leading-relaxed',
                                    isMe 
                                      ? msg.metadata?.type === 'image' ? 'rounded-tr-none' : 'rounded-tr-none bg-blue-600 text-white'
                                      : msg.metadata?.type === 'image' ? 'rounded-tl-none' : 'rounded-tl-none border border-slate-100 bg-white text-slate-700'
                                 )}>
                                    {msg.metadata?.type === 'image' && msg.metadata?.url ? (
                                       <img
                                          src={resolveChatImageUrl(msg.metadata.url as string)}
                                          alt="Chat attachment"
                                          className="max-h-60 max-w-full rounded-xl cursor-zoom-in hover:brightness-95 transition-all object-cover"
                                          onClick={() => handleImageClick(msg.metadata!.url as string)}
                                       />
                                    ) : (
                                       msg.content
                                    )}
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
                  <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleFileChange}
                     accept="image/*"
                     className="hidden"
                  />
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2 shadow-inner ring-1 ring-slate-100 transition-all focus-within:bg-white focus-within:ring-blue-500 md:gap-4 md:p-3">
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleAttachImage}
                        className="size-10 rounded-xl hover:bg-slate-200"
                        aria-label="Đính kèm ảnh"
                     >
                        <Image size={18} className="text-slate-500" />
                     </Button>
                     <Input 
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 border-none bg-transparent text-sm font-medium shadow-none placeholder:text-slate-400 focus-visible:ring-0"
                     />
                     <div className="flex items-center gap-2 px-2">
                        <Button 
                           onClick={() => handleSendMessage()}
                           disabled={!inputValue.trim() || sending}
                           className="size-10 rounded-xl bg-blue-600 p-0 text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none disabled:pointer-events-none md:size-11"
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
      <ImageLightbox
         open={lightboxOpen}
         onClose={() => setLightboxOpen(false)}
         index={lightboxIndex}
         slides={lightboxSlides}
       />
    </div>
  );
};

export default ChatPage;
