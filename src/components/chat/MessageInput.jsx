import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { 
  Send, Paperclip, Smile, Mic, Trash2, Camera, X, Video, Circle, StopCircle 
} from 'lucide-react';
import FilePreview from './FilePreview';
import toast from 'react-hot-toast';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // --- Recording States (Audio) ---
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  
  // --- NEW: Camera States ---
  const [showCamera, setShowCamera] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  
  // --- Refs ---
  const fileInputRef = useRef(null);
  const pickerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);
  const timerRef = useRef(null);
  const videoRef = useRef(null); // Reference for the HTML Video element

  // --- Close Emoji Picker on Outside Click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Timers for Audio/Video ---
  useEffect(() => {
    if (isRecordingAudio || isRecordingVideo) {
      timerRef.current = setInterval(() => {
        if (isRecordingAudio) setAudioDuration(prev => prev + 1);
        if (isRecordingVideo) setVideoDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setAudioDuration(0);
      setVideoDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecordingAudio, isRecordingVideo]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ==============================
  // 1. CAMERA FUNCTIONS
  // ==============================

  const startCamera = async () => {
    try {
      // Request access to video and audio
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setShowCamera(true);
      // Wait for modal to render, then attach stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Camera Error:', error);
      toast.error('Could not access camera');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
    setIsRecordingVideo(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    // Draw video frame to canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    // Convert to file and send
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      onSendMessage('', file);
      stopCamera();
    }, 'image/jpeg');
  };

  const startVideoRecording = () => {
    const stream = videoRef.current?.srcObject;
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    videoChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
      onSendMessage('', file);
      stopCamera();
    };

    mediaRecorder.start();
    setIsRecordingVideo(true);
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
    }
  };

  // ==============================
  // 2. AUDIO FUNCTIONS
  // ==============================

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        onSendMessage('', audioFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const cancelAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = null;
      setIsRecordingAudio(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // ==============================
  // 3. HANDLERS
  // ==============================

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !disabled) {
      onSendMessage(message, selectedFile);
      setMessage('');
      setSelectedFile(null);
      setShowEmojiPicker(false);
    }
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

  return (
    <div className="relative">
      {/* --- CAMERA MODAL OVERLAY --- */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
          {/* Close Button */}
          <button 
            onClick={stopCamera} 
            className="absolute top-4 right-4 text-white p-2 bg-gray-800 rounded-full hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Video Preview */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />

          {/* Camera Controls */}
          <div className="absolute bottom-8 flex items-center gap-8">
            {!isRecordingVideo ? (
              <>
                {/* 1. Take Photo Button */}
                <button 
                  onClick={capturePhoto}
                  className="p-4 bg-white rounded-full hover:bg-gray-200 transition-transform hover:scale-105 shadow-lg"
                  title="Take Photo"
                >
                  <Camera className="w-8 h-8 text-black" />
                </button>

                {/* 2. Start Video Button */}
                <button 
                  onClick={startVideoRecording}
                  className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-transform hover:scale-105 shadow-lg"
                  title="Record Video"
                >
                  <Video className="w-8 h-8 text-white" />
                </button>
              </>
            ) : (
              // 3. Stop Video Button (during recording)
              <div className="flex flex-col items-center gap-2">
                <div className="text-white font-mono text-xl bg-black bg-opacity-50 px-3 py-1 rounded">
                  {formatTime(videoDuration)}
                </div>
                <button 
                  onClick={stopVideoRecording}
                  className="p-4 bg-white rounded-full hover:bg-gray-200 animate-pulse shadow-lg"
                >
                  <StopCircle className="w-10 h-10 text-red-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- EMOJI PICKER --- */}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-20 left-4 z-50 shadow-xl">
          <EmojiPicker 
            onEmojiClick={(emoji) => setMessage((prev) => prev + emoji.emoji)} 
            width={300} 
            height={400} 
          />
        </div>
      )}

      {/* --- MAIN INPUT BAR --- */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
        {selectedFile && (
          <FilePreview file={selectedFile} onRemove={() => {
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }} />
        )}
        
        <div className="flex items-end gap-2">
          {isRecordingAudio ? (
            // --- AUDIO RECORDING UI ---
            <div className="flex-1 flex items-center justify-between bg-red-50 p-2 rounded-lg border border-red-100 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" />
                <span className="text-red-600 font-medium">Recording {formatTime(audioDuration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={cancelAudioRecording} className="p-2 text-gray-500 hover:text-red-600">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button type="button" onClick={stopAudioRecording} className="p-2 bg-red-500 text-white rounded-full">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            // --- STANDARD INPUT UI ---
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
              />
              
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                disabled={disabled}
              >
                <Paperclip className="w-6 h-6" />
              </button>

              {/* NEW: Camera Button */}
              <button
                type="button"
                onClick={startCamera}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                disabled={disabled}
              >
                <Camera className="w-6 h-6" />
              </button>

              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-lg hover:bg-gray-100 ${showEmojiPicker ? 'text-primary-600' : 'text-gray-400'}`}
                disabled={disabled}
              >
                <Smile className="w-6 h-6" />
              </button>
              
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32"
                  rows={1}
                  disabled={disabled}
                  style={{ minHeight: '40px', height: 'auto' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                />
              </div>

              {message.trim() || selectedFile ? (
                <button
                  type="submit"
                  disabled={disabled}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Send className="w-6 h-6" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startAudioRecording}
                  disabled={disabled}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                >
                  <Mic className="w-6 h-6" />
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;