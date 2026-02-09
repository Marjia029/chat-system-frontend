import React from 'react';
import { X, File, Image, Video, Music } from 'lucide-react';

const FilePreview = ({ file, onRemove }) => {
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-8 h-8 text-purple-500" />;
    } else if (file.type.startsWith('audio/')) {
      return <Music className="w-8 h-8 text-green-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="relative bg-gray-100 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-3">
        {file.type.startsWith('image/') ? (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-white rounded">
            {getFileIcon()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        </div>

        <button
          onClick={onRemove}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default FilePreview;