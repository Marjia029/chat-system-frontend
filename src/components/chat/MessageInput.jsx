import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react'; //
import { Send, Paperclip, Smile, X } from 'lucide-react'; //
import FilePreview from './FilePreview'; //
import toast from 'react-hot-toast'; //

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  // --- NEW: State for toggling the picker ---
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  // --- NEW: Ref to close picker when clicking outside ---
  const pickerRef = useRef(null);

  // --- NEW: Close picker when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !disabled) {
      onSendMessage(message, selectedFile);
      setMessage('');
      setSelectedFile(null);
      setShowEmojiPicker(false); // --- NEW: Close picker on send ---
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // --- NEW: Function to handle emoji selection ---
  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    // Optional: setShowEmojiPicker(false); // Uncomment if you want it to close after 1 click
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative"> {/* --- NEW: Wrap form in relative div for positioning --- */}
      
      {/* --- NEW: Emoji Picker Window --- */}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-20 left-4 z-50 shadow-xl">
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
        {selectedFile && (
          <FilePreview file={selectedFile} onRemove={removeFile} />
        )}
        
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
          />
          
          {/* File Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={disabled}
          >
            <Paperclip className="w-6 h-6" />
          </button>

          {/* --- NEW: Emoji Toggle Button --- */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              showEmojiPicker ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            disabled={disabled}
          >
            <Smile className="w-6 h-6" />
          </button>
          
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress} // Changed from onKeyPress (deprecated)
              placeholder={selectedFile ? "Add a caption (optional)..." : "Type a message..."}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32"
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
            disabled={(!message.trim() && !selectedFile) || disabled}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;