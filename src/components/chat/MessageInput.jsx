import React, { useState } from 'react';
import { Send, Smile } from 'lucide-react';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-t border-gray-200 p-4 bg-white transition-all duration-300 hover:bg-gray-50"
    >
      <div className={`flex items-end gap-3 p-2 rounded-lg border-2 transition-all duration-300 ${
        isFocused ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-200 bg-white'
      }`}>
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-100 transition-all duration-200 active:scale-95"
          title="Add emoji"
        >
          <Smile className="w-6 h-6" />
        </button>
        
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type a message..."
            className="w-full resize-none bg-transparent px-2 py-2 focus:outline-none placeholder:text-gray-400 text-gray-900 font-medium"
            rows={1}
            disabled={disabled}
            style={{
              minHeight: '40px',
              height: 'auto',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600 disabled:hover:shadow-none active:scale-95 transition-all duration-200 group"
          title="Send message"
        >
          <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;