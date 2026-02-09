import React, { useState } from 'react';
import { Download, File, Play, Volume2, X } from 'lucide-react';
import { formatMessageTime } from '../../utils/formatters';
import { Check, CheckCheck } from 'lucide-react';

const MediaMessageBubble = ({ message, isOwn }) => {
  const [showFullImage, setShowFullImage] = useState(false);

  const getFileIcon = () => {
    if (message.file_type?.startsWith('audio/')) {
      return <Volume2 className="w-8 h-8" />;
    }
    return <File className="w-8 h-8" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = message.file_url;
    link.download = message.file_name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderImageMessage = () => (
    <>
      <div
        onClick={() => setShowFullImage(true)}
        className="cursor-pointer rounded-lg overflow-hidden"
      >
        <img
          src={message.file_url}
          alt={message.file_name}
          className="max-w-xs max-h-64 object-cover hover:opacity-90 transition-opacity"
        />
      </div>
      {message.content && (
        <p className="text-sm mt-2 break-words">{message.content}</p>
      )}

      {/* Full Image Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={message.file_url}
            alt={message.file_name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );

  const renderVideoMessage = () => (
    <>
      <video
        controls
        className="max-w-xs max-h-64 rounded-lg"
      >
        <source src={message.file_url} type={message.file_type} />
        Your browser does not support the video tag.
      </video>
      {message.content && (
        <p className="text-sm mt-2 break-words">{message.content}</p>
      )}
    </>
  );

  const renderAudioMessage = () => (
    <>
      <div className="flex items-center gap-3 bg-white bg-opacity-10 rounded-lg p-3">
        <Volume2 className="w-6 h-6" />
        <audio controls className="flex-1">
          <source src={message.file_url} type={message.file_type} />
          Your browser does not support the audio tag.
        </audio>
      </div>
      {message.content && (
        <p className="text-sm mt-2 break-words">{message.content}</p>
      )}
    </>
  );

  const renderFileMessage = () => (
    <>
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{message.file_name}</p>
          <p className="text-xs opacity-75">{formatFileSize(message.file_size)}</p>
        </div>
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
      {message.content && (
        <p className="text-sm mt-2 break-words">{message.content}</p>
      )}
    </>
  );

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return renderImageMessage();
      case 'video':
        return renderVideoMessage();
      case 'audio':
        return renderAudioMessage();
      case 'file':
        return renderFileMessage();
      default:
        return <p className="text-sm break-words">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwn
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        {renderMessageContent()}
        
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
          <span className="text-xs">{formatMessageTime(message.timestamp)}</span>
          {isOwn && (
            <span className="text-xs">
              {message.is_read ? (
                <CheckCheck className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaMessageBubble;