import { useState, useMemo } from 'react';
import { MessageCircle, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import ChatWindow from '@/components/chat/ChatWindow';
import ConversationList, { type ConversationItem } from '@/components/chat/ConversationList';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Empty from '@/components/Empty';

export default function Messages() {
  const { messages, orders, users, providers, pets, currentUser, addMessage } = useAppStore();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = useMemo<ConversationItem[]>(() => {
    if (!currentUser) return [];

    const orderGrouped: Record<string, { orderId: string; otherId: string; messages: any[] }> = {};

    messages.forEach((msg) => {
      const isSender = msg.senderId === currentUser.id;
      const isReceiver = msg.receiverId === currentUser.id;
      if (!isSender && !isReceiver) return;

      const otherId = isSender ? msg.receiverId : msg.senderId;
      const msgWithOrder = msg as any;
      const orderId = msgWithOrder.orderId || `conv_${otherId}`;

      if (!orderGrouped[orderId]) {
        orderGrouped[orderId] = {
          orderId,
          otherId,
          messages: [],
        };
      }
      orderGrouped[orderId].messages.push(msg);
    });

    return Object.entries(orderGrouped).map(([convId, group]) => {
      const sortedMsgs = [...group.messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const lastMsg = sortedMsgs[sortedMsgs.length - 1];
      const unreadCount = sortedMsgs.filter(
        (m) => m.receiverId === currentUser.id && !m.read
      ).length;

      let otherUser: ConversationItem['otherUser'] = {
        id: group.otherId,
        name: '未知用户',
        avatar: '',
      };

      const isOwner = currentUser.role === 'owner';

      if (isOwner) {
        const provider = providers.find((p) => p.id === group.otherId);
        if (provider) {
          const pUser = users.find((u) => u.id === provider.userId);
          otherUser = {
            id: provider.id,
            name: provider.businessName,
            avatar: (pUser as any)?.avatar || '',
            online: true,
          };
        }
      } else if (currentUser.role === 'provider') {
        const order = orders.find((o) => o.id === group.orderId);
        const ownerId = order?.ownerId || group.otherId;
        const owner = users.find((u) => u.id === ownerId);
        if (owner) {
          otherUser = {
            id: owner.id,
            name: owner.name,
            avatar: (owner as any)?.avatar || '',
            online: Math.random() > 0.3,
          };
        }
      } else {
        const user = users.find((u) => u.id === group.otherId);
        if (user) {
          otherUser = {
            id: user.id,
            name: user.name,
            avatar: (user as any)?.avatar || '',
            online: true,
          };
        }
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = otherUser.name.toLowerCase().includes(query);
        const contentMatch = lastMsg?.content?.toLowerCase().includes(query);
        if (!nameMatch && !contentMatch) return null;
      }

      return {
        id: convId,
        orderId: group.orderId,
        otherUser,
        lastMessage: lastMsg?.content || '',
        unreadCount,
        lastTime: lastMsg?.createdAt || new Date().toISOString(),
      };
    }).filter(Boolean) as ConversationItem[];
  }, [messages, orders, users, providers, currentUser, searchQuery]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const activeMessages = useMemo(() => {
    if (!activeConversation || !currentUser) return [] as any[];
    const otherId = activeConversation.otherUser.id;
    return messages
      .filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === otherId) ||
          (m.senderId === otherId && m.receiverId === currentUser.id)
      ) as any[];
  }, [messages, activeConversation, currentUser]);

  const handleSend = (content: string) => {
    if (!activeConversation || !currentUser) return;
    addMessage({
      orderId: activeConversation.orderId,
      senderId: currentUser.id,
      content,
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50/30">
        <div className="text-center">
          <Empty title="请先登录" description="登录后查看您的消息" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50/40 via-white to-petal-50/20 py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">消息中心</h1>
          <p className="text-sm text-gray-500">与寄养服务方或宠物主人保持沟通</p>
        </div>

        <Card className="overflow-hidden p-0 shadow-card">
          <div className="h-[calc(100vh-200px)] min-h-[600px] grid grid-cols-12 bg-white">
            <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-gray-900">会话</h2>
                  <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-xs font-medium">
                    {conversations.length}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="搜索联系人或消息..."
                    prefixIcon={<Search className="w-4 h-4" />}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {conversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <div className="w-16 h-16 mb-4 rounded-full bg-cream-100 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-brand-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-700 mb-1">暂无消息</h3>
                  <p className="text-sm text-gray-400 text-center">
                    {searchQuery ? '没有找到匹配的会话' : '开始与寄养服务方沟通吧'}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((conv, index) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={cn(
                        'w-full flex items-start gap-3 px-5 py-4 border-b border-gray-50',
                        'transition-all duration-200 text-left animate-fade-in-up',
                        activeConversationId === conv.id
                          ? 'bg-brand-50/70'
                          : 'hover:bg-gray-50 active:bg-gray-100'
                      )}
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cream-100 to-petal-100 flex items-center justify-center overflow-hidden">
                          {conv.otherUser.avatar ? (
                            <img
                              src={conv.otherUser.avatar}
                              alt={conv.otherUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MessageCircle className="w-5 h-5 text-brand-400" />
                          )}
                        </div>
                        {conv.otherUser.online && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-forest-500 border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={cn(
                              'text-sm font-medium truncate',
                              activeConversationId === conv.id ? 'text-brand-700' : 'text-gray-900'
                            )}
                          >
                            {conv.otherUser.name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {(() => {
                              const diff = Date.now() - new Date(conv.lastTime).getTime();
                              const mins = Math.floor(diff / 60000);
                              if (mins < 1) return '刚刚';
                              if (mins < 60) return `${mins}分钟前`;
                              const hours = Math.floor(mins / 60);
                              if (hours < 24) return `${hours}小时前`;
                              const days = Math.floor(hours / 24);
                              return `${days}天前`;
                            })()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              'text-xs truncate flex-1',
                              activeConversationId === conv.id ? 'text-brand-600' : 'text-gray-500'
                            )}
                          >
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span
                              className={cn(
                                'shrink-0 min-w-[20px] h-5 px-1.5 rounded-full',
                                'flex items-center justify-center',
                                'bg-brand-500 text-white text-[11px] font-semibold',
                                'shadow-sm shadow-brand-500/30'
                              )}
                            >
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col">
              {activeConversation ? (
                <ChatWindow
                  conversationId={activeConversation.id}
                  messages={activeMessages as any}
                  currentUserId={currentUser.id}
                  otherUser={activeConversation.otherUser as any}
                  onSend={handleSend}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-cream-50/50 to-white">
                  <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-cream-100 to-petal-100 flex items-center justify-center">
                    <MessageCircle className="w-12 h-12 text-brand-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {conversations.length === 0 ? '暂无消息' : '选择一个会话'}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-xs text-center">
                    {conversations.length === 0
                      ? '您还没有任何消息，下单后即可与服务方开始沟通'
                      : '从左侧选择一个会话开始与对方聊天吧'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
