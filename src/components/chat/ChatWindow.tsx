import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  User,
  CircleDot,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';
import { formatDateTime } from '@/utils/date';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  messages: Message[];
  currentUserId: string | string[];
  otherUser?: ChatUser;
  onSend?: (content: string) => void;
}

export default function ChatWindow({
  messages,
  currentUserId,
  otherUser,
  onSend,
}: ChatWindowProps) {
  const currentUserIds = Array.isArray(currentUserId) ? currentUserId : [currentUserId];
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    onSend?.(content);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (!otherUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-cream-50/50 to-white">
        <div className="w-20 h-20 mb-5 rounded-3xl bg-gradient-to-br from-cream-100 to-petal-100 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-brand-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">选择会话</h3>
        <p className="text-sm text-gray-400">
          从左侧选择一个会话开始聊天
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cream-100 to-petal-100 flex items-center justify-center overflow-hidden">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-brand-400" />
              )}
            </div>
            {otherUser.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-forest-500 border-2 border-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900">
                {otherUser.name}
              </span>
              {otherUser.online && (
                <span className="flex items-center gap-0.5 text-[10px] text-forest-600 font-medium">
                  <CircleDot className="w-2.5 h-2.5" />
                  在线
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {otherUser.online ? '现在可以回复' : '不在线，稍后回复'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-all">
            <Phone className="w-4.5 h-4.5" />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-all">
            <Video className="w-4.5 h-4.5" />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-all">
            <MoreVertical className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gradient-to-b from-white via-cream-50/30 to-white"
      >
        {sortedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12">
            <div className="w-14 h-14 mb-3 rounded-2xl bg-gradient-to-br from-brand-50 to-cream-100 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-brand-400" />
            </div>
            <p className="text-sm text-gray-400">开始和 {otherUser.name} 聊天吧</p>
          </div>
        ) : (
          sortedMessages.map((msg, index) => {
            const isSelf = currentUserIds.includes(msg.senderId);
            const prev = sortedMessages[index - 1];
            const showTime =
              !prev ||
              Math.abs(
                new Date(msg.createdAt).getTime() -
                  new Date(prev.createdAt).getTime()
              ) >
                5 * 60 * 1000;

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex animate-fade-in-up',
                  isSelf ? 'justify-end' : 'justify-start'
                )}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div
                  className={cn(
                    'max-w-[75%] space-y-1',
                    isSelf ? 'items-end' : 'items-start'
                  )}
                >
                  {showTime && (
                    <div
                      className={cn(
                        'text-[10px] text-gray-400 mb-1',
                        isSelf ? 'text-right' : 'text-left'
                      )}
                    >
                      {formatDateTime(msg.createdAt)}
                    </div>
                  )}

                  {!isSelf && (
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-cream-100 to-petal-100 flex items-center justify-center overflow-hidden">
                        {otherUser.avatar ? (
                          <img
                            src={otherUser.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5 text-brand-400" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'px-4 py-2.5 rounded-2xl rounded-bl-md',
                          'bg-gray-100 text-gray-800 text-sm leading-relaxed',
                          'shadow-sm'
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )}

                  {isSelf && (
                    <div
                      className={cn(
                        'px-4 py-2.5 rounded-2xl rounded-br-md',
                        'bg-gradient-to-br from-brand-500 to-brand-600 text-white text-sm leading-relaxed',
                        'shadow-sm shadow-brand-500/20'
                      )}
                    >
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-100 bg-white px-5 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              rows={1}
              className={cn(
                'w-full px-4 py-3 pr-12 rounded-xl border text-sm resize-none',
                'bg-gray-50/70 border-gray-200 placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 focus:bg-white',
                'transition-all max-h-32'
              )}
              style={{ minHeight: '48px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              'bg-brand-500 text-white shadow-sm shadow-brand-500/30',
              'hover:bg-brand-600 active:bg-brand-700 transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-500'
            )}
          >
            <Send className="w-5 h-5 -translate-x-0.5" />
          </button>
        </div>
        <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400">
          <span>按 Enter 发送</span>
          <span>·</span>
          <span>Shift + Enter 换行</span>
        </div>
      </div>
    </div>
  );
}
