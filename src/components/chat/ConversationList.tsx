import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/utils/date';

export interface ConversationItem {
  id: string;
  orderId: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
  };
  lastMessage: string;
  unreadCount: number;
  lastTime: string;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-16 h-16 mb-4 rounded-full bg-cream-100 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-brand-400" />
        </div>
        <h4 className="text-base font-medium text-gray-700 mb-1">暂无会话</h4>
        <p className="text-sm text-gray-400 text-center">
          还没有任何消息，开始与寄养服务方沟通吧
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-r border-gray-100 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">消息</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {conversations.length} 个会话
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv, index) => {
          const isActive = conv.id === activeId;
          return (
            <button
              key={conv.id}
              onClick={() => onSelect?.(conv.id)}
              className={cn(
                'w-full flex items-start gap-3 px-5 py-4 border-b border-gray-50',
                'transition-all duration-200 text-left animate-fade-in-up',
                isActive
                  ? 'bg-brand-50/70'
                  : 'hover:bg-gray-50 active:bg-gray-100'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
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
                      isActive ? 'text-brand-700' : 'text-gray-900'
                    )}
                  >
                    {conv.otherUser.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatRelative(conv.lastTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'text-xs truncate flex-1',
                      isActive ? 'text-brand-600' : 'text-gray-500'
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
          );
        })}
      </div>
    </div>
  );
}
