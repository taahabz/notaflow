'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiUser } from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';

interface AvatarUploaderProps {
  onAvatarUploaded: (url: string) => void;
  onCancel: () => void;
  currentAvatarUrl?: string | null;
}

export default function AvatarUploader({ onAvatarUploaded, onCancel, currentAvatarUrl }: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.includes('image')) {
      setUploadError('Please select a valid image file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onAvatarUploaded(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[rgb(var(--card))] rounded-lg shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
          <h3 className="font-medium">Change Avatar</h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-[rgb(var(--secondary))]"
          >
            <FiX />
          </button>
        </div>
        
        <div 
          className={`p-6 ${dragActive ? 'bg-[rgb(var(--secondary))]' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {currentAvatarUrl && (
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[rgb(var(--accent))]">
                <img 
                  src={currentAvatarUrl} 
                  alt="Current avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          <div className={`border-2 border-dashed rounded-lg p-8 text-center 
            ${dragActive ? 'border-[rgb(var(--accent))]' : 'border-[rgb(var(--border))]'}`}
          >
            <div className="flex flex-col items-center justify-center">
              <FiUser className="w-12 h-12 mb-4 text-[rgb(var(--accent))]" />
              
              <p className="mb-4 text-[rgb(var(--foreground))]">
                Drag and drop your avatar image here, or click to select
              </p>
              
              <button
                onClick={handleButtonClick}
                disabled={isUploading}
                className="px-4 py-2 bg-[rgb(var(--accent))] text-white rounded-md hover:bg-[rgb(var(--accent-hover))] transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Select Avatar'}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          
          {uploadError && (
            <p className="mt-4 text-[rgb(var(--error))] text-sm text-center">
              {uploadError}
            </p>
          )}
          
          <div className="mt-4 text-xs text-[rgb(var(--foreground))] opacity-70 text-center">
            Supported formats: JPEG, PNG, GIF, WebP
          </div>
        </div>
      </motion.div>
    </div>
  );
} 