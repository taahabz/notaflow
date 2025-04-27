'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLogOut, 
  FiPlus, 
  FiTrash2, 
  FiMapPin, 
  FiMenu, 
  FiX, 
  FiCheck, 
  FiEdit,
  FiUser,
  FiUpload,
  FiMoon,
  FiSun,
  FiSettings,
  FiImage,
  FiBold,
  FiItalic,
  FiList,
  FiLink
} from 'react-icons/fi';

// Custom Editor Component with proper types
const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (content: string) => void; 
  placeholder: string;
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleBold = () => {
    document.execCommand('bold', false);
    handleChange();
  };

  const handleItalic = () => {
    document.execCommand('italic', false);
    handleChange();
  };

  const handleList = () => {
    document.execCommand('insertUnorderedList', false);
    handleChange();
  };

  const handleOrderedList = () => {
    document.execCommand('insertOrderedList', false);
    handleChange();
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      handleChange();
    }
  };

  return (
    <div className="flex flex-col border rounded-lg shadow-sm h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-[rgb(var(--secondary))] border-b border-[rgb(var(--border))] rounded-t-lg">
        <button onClick={handleBold} className="p-2 rounded hover:bg-[rgb(var(--secondary-hover))]">
          <FiBold />
        </button>
        <button onClick={handleItalic} className="p-2 rounded hover:bg-[rgb(var(--secondary-hover))]">
          <FiItalic />
        </button>
        <button onClick={handleList} className="p-2 rounded hover:bg-[rgb(var(--secondary-hover))]">
          <FiList />
        </button>
        <button onClick={handleOrderedList} className="p-2 rounded hover:bg-[rgb(var(--secondary-hover))]">
          <span className="font-bold">1.</span>
        </button>
        <button onClick={handleLink} className="p-2 rounded hover:bg-[rgb(var(--secondary-hover))]">
          <FiLink />
        </button>
      </div>
      
      {/* Editable Content */}
      <div
        ref={editorRef}
        contentEditable
        className="flex-1 p-4 overflow-auto outline-none bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleChange}
        onBlur={handleChange}
        data-placeholder={placeholder}
      />
    </div>
  );
};

// Define theme types
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  PINK = 'pink',
  ORANGE = 'orange',
}

type Note = {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
};

type Profile = {
  avatar_url: string | null;
  theme: Theme;
};

export default function NotesApp() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile>({ 
    avatar_url: null, 
    theme: Theme.LIGHT 
  });

  useEffect(() => {
    const initializeApp = async () => {
      await fetchNotes();
      await fetchUserProfile();

      const savedTheme = localStorage.getItem('theme');
      const preferredTheme = savedTheme ? savedTheme as Theme : Theme.LIGHT;
      updateThemeClass(preferredTheme);
    };

    initializeApp();

    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateThemeClass = (theme: Theme) => {
    // Remove all theme classes first
    document.documentElement.classList.remove('dark', 'theme-blue', 'theme-green', 'theme-purple', 'theme-pink', 'theme-orange');
    
    // Add the appropriate class based on theme
    switch (theme) {
      case Theme.DARK:
        document.documentElement.classList.add('dark');
        break;
      case Theme.BLUE:
        document.documentElement.classList.add('theme-blue');
        break;
      case Theme.GREEN:
        document.documentElement.classList.add('theme-green');
        break;
      case Theme.PURPLE:
        document.documentElement.classList.add('theme-purple');
        break;
      case Theme.PINK:
        document.documentElement.classList.add('theme-pink');
        break;
      case Theme.ORANGE:
        document.documentElement.classList.add('theme-orange');
        break;
      default:
        // Light theme is the default, no class needed
        break;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      // First try to fetch the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, theme')
        .eq('user_id', user.id)
        .single();
  
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching profile:', error);
        return;
      }
  
      // If profile doesn't exist, create it
      if (!data) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            theme: Theme.LIGHT,
            avatar_url: null
          })
          .select()
          .single();
  
        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }
  
        // Refetch the newly created profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('avatar_url, theme')
          .eq('user_id', user.id)
          .single();
  
        setUserProfile(newProfile || { avatar_url: null, theme: Theme.LIGHT });
      } else {
        setUserProfile(data);
      }
  
      // Apply theme
      const theme = data?.theme || Theme.LIGHT;
      updateThemeClass(theme);
      localStorage.setItem('theme', theme);
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
    }
  };

  const updateTheme = async (theme: Theme) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ theme })
      .eq('user_id', user.id);

    if (!error) {
      setUserProfile(prev => ({ ...prev, theme }));
      updateThemeClass(theme);
      localStorage.setItem('theme', theme);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id);

    if (!updateError) {
      setUserProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    }
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data || []);
      if (data && data.length > 0 && !activeNote) {
        setActiveNote(data[0]);
      }
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const createNewNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newNote = {
      title: 'Untitled Note',
      content: '',
      user_id: user.id,
      is_pinned: false
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(newNote)
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
    } else {
      setNotes([data, ...notes]);
      setActiveNote(data);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  const updateNote = async (updatedNote: Note) => {
    if (!updatedNote) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('notes')
      .update({
        title: updatedNote.title,
        content: updatedNote.content,
        is_pinned: updatedNote.is_pinned,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedNote.id);

    if (error) {
      console.error('Error updating note:', error);
    } else {
      // Update the local state and sort the notes
      const updatedNotes = notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      );
      
      // Re-sort notes to maintain pinned order
      const sortedNotes = [...updatedNotes].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      
      setNotes(sortedNotes);
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 2000);
    }
    setIsSaving(false);
  };

  const deleteNote = async (noteId: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
    } else {
      const filteredNotes = notes.filter(note => note.id !== noteId);
      setNotes(filteredNotes);
      if (activeNote?.id === noteId) {
        setActiveNote(filteredNotes.length > 0 ? filteredNotes[0] : null);
      }
    }
  };

  const togglePin = async (note: Note) => {
    const updatedNote = { 
      ...note, 
      is_pinned: !note.is_pinned,
      updated_at: new Date().toISOString()
    };
    await updateNote(updatedNote);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).replace(/,/g, '');
  };

  // Debounced note update
  const debouncedUpdate = (note: Note) => {
    if (!note) return;
    const timeoutId = setTimeout(() => {
      updateNote(note);
    }, 800);
    return () => clearTimeout(timeoutId);
  };

  // Effect for auto-saving
  useEffect(() => {
    if (activeNote) {
      const cleanup = debouncedUpdate(activeNote);
      return cleanup;
    }
  }, [activeNote?.title, activeNote?.content]);

  const ThemeSelector = ({ onSelect, currentTheme }: { onSelect: (theme: Theme) => void, currentTheme: Theme }) => {
    const [showThemePicker, setShowThemePicker] = useState(false);
    
    const themeOptions = [
      { name: 'Light', value: Theme.LIGHT, color: 'bg-white border border-gray-200' },
      { name: 'Dark', value: Theme.DARK, color: 'bg-black border border-gray-800' },
      { name: 'Blue', value: Theme.BLUE, color: 'bg-blue-50 border border-blue-200' },
      { name: 'Green', value: Theme.GREEN, color: 'bg-green-50 border border-green-200' },
      { name: 'Purple', value: Theme.PURPLE, color: 'bg-purple-50 border border-purple-200' },
      { name: 'Pink', value: Theme.PINK, color: 'bg-pink-50 border border-pink-200' },
      { name: 'Orange', value: Theme.ORANGE, color: 'bg-orange-50 border border-orange-200' },
    ];
    
    return (
      <div className="relative">
        <button
          onClick={() => setShowThemePicker(!showThemePicker)}
          className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-black dark:text-white"
        >
          <FiSettings className="w-5 h-5" />
          <span className="text-sm">Theme Options</span>
        </button>
        
        {showThemePicker && (
          <div className="absolute left-0 right-0 mt-1 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-40">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Choose a theme</p>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    setShowThemePicker(false);
                  }}
                  className={`p-2 rounded-md flex flex-col items-center gap-1 ${
                    currentTheme === option.value ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${option.color}`}></div>
                  <span className="text-xs text-black dark:text-white">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Update handleImageUpload to work with our custom editor
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        // Compress image if needed
        let imageFile = file;
        if (file.size > 1024 * 1024) {
          // If more than 1MB, import and use the compression library
          const imageCompression = await import('browser-image-compression');
          imageFile = await imageCompression.default(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920
          });
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Upload to supabase
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload image
        const { error: uploadError } = await supabase.storage
          .from('note_images')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('note_images')
          .getPublicUrl(filePath);

        // Insert image using document.execCommand
        if (activeNote) {
          document.execCommand('insertImage', false, publicUrl);
          // Get the editor div element
          const editorDiv = document.querySelector('[contenteditable="true"]') as HTMLDivElement;
          if (editorDiv) {
            // Update the note content in state
            setActiveNote({
              ...activeNote,
              content: editorDiv.innerHTML
            });
          }
        }
      } catch (error) {
        console.error('Error in image upload:', error);
      }
    };
  };

  return (
    <div className={`flex h-screen font-sans bg-[rgb(var(--background))] text-[rgb(var(--foreground))]`}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
  
      {/* Sidebar */}
      <div 
        className={`fixed md:relative z-30 w-72 h-full bg-[rgb(var(--secondary))] border-r border-[rgb(var(--border))] md:shadow-none transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className={`p-4 border-b border-[rgb(var(--border))] flex items-center justify-between`}>
          <h1 className="text-xl font-semibold text-[rgb(var(--foreground))]">Notes</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-full hover:bg-[rgb(var(--secondary-hover))]"
          >
            <FiX className="w-5 h-5 text-[rgb(var(--foreground))]" />
          </button>
        </div>
  
        <div className="p-4">
          <button
            onClick={createNewNote}
            className="w-full py-2.5 px-4 rounded-full bg-[rgb(var(--accent))] text-black font-medium hover:bg-[rgb(var(--accent-hover))] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <FiPlus className="w-5 h-5" />
            <span>New Note</span>
          </button>
        </div>
  
        <div className="overflow-y-auto h-[calc(100%-180px)]">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-pulse text-[rgb(var(--foreground))] opacity-60">Loading notes...</div>
            </div>
          ) : notes.length === 0 ? (
            <div className="p-4 text-center text-[rgb(var(--foreground))] opacity-60 text-sm">
              No notes found
            </div>
          ) : (
            <ul className={`divide-y divide-[rgb(var(--border))]`}>
              <AnimatePresence>
                {notes.map(note => (
                  <motion.li
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 cursor-pointer group ${
                      activeNote?.id === note.id 
                        ? 'bg-[rgb(var(--accent))] bg-opacity-10' 
                        : 'hover:bg-[rgb(var(--secondary-hover))]'
                    }`}
                    onClick={() => {
                      setActiveNote(note);
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate text-[rgb(var(--foreground))]`}>
                          {note.title || 'Untitled Note'}
                        </p>
                        <p className={`text-sm truncate mt-0.5 text-[rgb(var(--foreground))] opacity-70`}>
                          {note.content.replace(/<[^>]*>/g, '').substring(0, 80).replace(/\n/g, ' ') || 'No additional text'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-xs text-[rgb(var(--foreground))] opacity-50`}>
                            {formatDate(note.updated_at)}
                          </span>
                          {note.is_pinned && (
                            <FiMapPin className="w-3.5 h-3.5 text-[rgb(var(--accent))]" />
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-[rgb(var(--secondary-hover))] rounded-full ml-2"
                      >
                        <FiTrash2 className="w-4 h-4 text-[rgb(var(--foreground))]" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
  
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--secondary))]`}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary-hover))] rounded-full transition"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
  
      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden bg-[rgb(var(--background))]`}>
        <div className={`p-4 border-b border-[rgb(var(--border))] flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-[rgb(var(--secondary))] rounded-full"
            >
              <FiMenu className="w-5 h-5 text-[rgb(var(--foreground))]" />
            </button>
            {activeNote ? (
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => togglePin(activeNote)}
                  className={`p-2 rounded-full ${
                    activeNote.is_pinned ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--foreground))] opacity-60 hover:opacity-100'
                  }`}
                >
                  <FiMapPin className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleImageUpload}
                  className="p-2 rounded-full text-[rgb(var(--foreground))] opacity-60 hover:opacity-100 hover:bg-[rgb(var(--secondary))]"
                >
                  <FiImage className="w-5 h-5" />
                </button>
                
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => setActiveNote({...activeNote, title: e.target.value})}
                  className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full text-[rgb(var(--foreground))]"
                />
                {isSaving && (
                  <span className={`text-sm text-[rgb(var(--foreground))] opacity-60`}>Saving...</span>
                )}
              </div>
            ) : (
              <span className="text-xl font-semibold text-[rgb(var(--foreground))]">Notes</span>
            )}
          </div>
  
          {/* Profile Section */}
          <div className="relative">
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="p-1 rounded-full hover:bg-[rgb(var(--secondary))] transition-colors"
            >
              {userProfile.avatar_url ? (
                <img 
                  src={userProfile.avatar_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[rgb(var(--border))]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[rgb(var(--secondary))] flex items-center justify-center border-2 border-[rgb(var(--border))]">
                  <FiUser className="w-5 h-5 text-[rgb(var(--foreground))]" />
                </div>
              )}
            </button>
  
            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute right-0 top-12 w-48 rounded-lg shadow-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] p-2 z-30`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-[rgb(var(--secondary))] rounded-md text-[rgb(var(--foreground))]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleAvatarUpload(e.target.files[0]);
                          setProfileMenuOpen(false);
                        }
                      }}
                    />
                    <FiUpload className="w-5 h-5" />
                    <span className="text-sm">Change Photo</span>
                  </label>
                  
                  <ThemeSelector 
                    onSelect={(theme) => {
                      updateTheme(theme);
                      setProfileMenuOpen(false);
                    }}
                    currentTheme={userProfile.theme} 
                  />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="text-sm">Log Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
  
        {activeNote ? (
          <div className="flex-1 overflow-auto p-4">
            <RichTextEditor
              value={activeNote.content}
              onChange={(content) => setActiveNote({...activeNote, content})}
              placeholder="Start writing your note here..."
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className={`text-center p-6 max-w-md text-[rgb(var(--foreground))]`}>
              <FiEdit className={`w-12 h-12 mx-auto mb-4 text-[rgb(var(--foreground))] opacity-50`} />
              <h2 className="text-xl font-medium mb-2">No Note Selected</h2>
              <p className="mb-4 text-[rgb(var(--foreground))] opacity-70">
                Select a note from the sidebar or create a new one to get started.
              </p>
              <button
                onClick={createNewNote}
                className="py-2 px-6 rounded-full bg-[rgb(var(--accent))] text-black font-medium hover:bg-[rgb(var(--accent-hover))] transition-all flex items-center justify-center gap-2 shadow-sm mx-auto"
              >
                <FiPlus className="w-5 h-5" />
                <span>New Note</span>
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showSaveNotification && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 bg-[rgb(var(--accent))] text-black px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
            >
              <FiCheck className="w-5 h-5" />
              <span>Note saved</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}