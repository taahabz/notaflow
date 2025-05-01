'use client'

import { useState, useEffect, useRef } from 'react';
import { FiX, FiMenu, FiImage } from 'react-icons/fi';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onImageUpload?: () => void;
  activeNote?: boolean;
}

export default function Header({ sidebarOpen, setSidebarOpen, onImageUpload, activeNote }: HeaderProps) {
  const [title, setTitle] = useState('Notaflow');
  const [isEditing, setIsEditing] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // On mount, load title from localStorage
  useEffect(() => {
    const savedTitle = localStorage.getItem('header_title');
    if (savedTitle) {
      setTitle(savedTitle);
    }
  }, []);

  // Update document title when header title changes
  useEffect(() => {
    document.title = title;
  }, [title]);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      // Select all text for easy replacement
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const saveTitle = () => {
    // Don't save empty titles
    if (!title.trim()) {
      setTitle('Notaflow');
    }
    
    // Save to localStorage
    localStorage.setItem('header_title', title);
    // Update the document title to match
    document.title = title;
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    saveTitle();
  };

  return (
    <header className="flex items-center justify-between p-3 md:p-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-full hover:bg-[rgb(var(--secondary))] mr-2 md:mr-4"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        
        {isEditing ? (
          <input
            ref={titleInputRef}
            value={title}
            onChange={handleTitleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="font-semibold text-lg md:text-xl bg-transparent border-b border-[rgb(var(--accent))] outline-none"
            autoFocus
          />
        ) : (
          <h1 
            className="font-semibold text-lg md:text-xl cursor-pointer hover:text-[rgb(var(--accent))] transition-colors"
            onClick={handleTitleClick}
            title="Click to edit title"
          >
            {title}
          </h1>
        )}
      </div>
      
      {activeNote && onImageUpload && (
        <button
          onClick={onImageUpload}
          className="p-2 rounded-full hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))]"
          aria-label="Upload image"
        >
          <FiImage />
        </button>
      )}
    </header>
  );
}
