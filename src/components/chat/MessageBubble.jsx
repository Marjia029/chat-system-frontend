import React from 'react';
import { formatMessageTime } from '../../utils/formatters';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-100 ${
          isOwn
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-none hover:from-primary-600 hover:to-primary-700'
            : 'bg-gray-200 text-gray-900 rounded-bl-none hover:bg-gray-300'
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
        <div className={`flex items-center justify-end gap-2 mt-2 ${isOwn ? 'text-primary-100' : 'text-gray-600'}`}>
          <span className="text-xs opacity-80">{formatMessageTime(message.timestamp)}</span>
          {isOwn && (
            <span className={`text-xs transition-all duration-300 ${
              message.is_read ? 'opacity-100' : 'opacity-60'
            }`}>
              {message.is_read ? (
                <CheckCheck className="w-4 h-4 animate-bounce-soft" title="Read" />
              ) : (
                <Check className="w-4 h-4 animate-pulse" title="Sent" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;