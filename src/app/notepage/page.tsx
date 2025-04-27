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
import { useThemeContext, ThemeType } from '@/contexts/ThemeContext';
import ImageUploader from './components/ImageUploader';

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
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Initialize the editor on mount and when value changes
  useEffect(() => {
    if (editorRef.current) {
      // Only update innerHTML if the HTML content is different
      // This prevents cursor position reset when typing
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  // Make sure placeholder is shown when content is empty
  useEffect(() => {
    if (editorRef.current) {
      if (!value || value === '<p></p>' || value === '<br>') {
        editorRef.current.classList.add('empty');
      } else {
        editorRef.current.classList.remove('empty');
      }
    }
  }, [value]);

  const handleChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleBold = (e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand('bold', false);
    handleChange();
  };

  const handleItalic = (e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand('italic', false);
    handleChange();
  };

  const handleList = (e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand('insertUnorderedList', false);
    handleChange();
  };

  const handleOrderedList = (e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand('insertOrderedList', false);
    handleChange();
  };

  const handleLink = (e: React.MouseEvent) => {
    e.preventDefault();
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
        className={`flex-1 p-4 overflow-auto outline-none bg-[rgb(var(--background))] text-[rgb(var(--foreground))] ${!value ? 'empty' : ''}`}
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
  
  // Reference to the current active editor element
  const currentEditorElement = useRef<HTMLElement | null>(null);

  // Update the current editor element when the editor rendered
  const updateEditorRef = (element: HTMLElement | null) => {
    currentEditorElement.current = element;
  };

  const { theme, setTheme } = useThemeContext()
  
  const themes = [
    { value: Theme.LIGHT, label: 'Light', color: { bg: 'rgb(252, 252, 252)', text: 'rgb(28, 28, 30)', accent: 'rgb(225, 185, 40)' } },
    { value: Theme.DARK, label: 'Dark', color: { bg: 'rgb(20, 20, 24)', text: 'rgb(250, 250, 252)', accent: 'rgb(245, 205, 50)' } },
    { value: Theme.BLUE, label: 'Blue', color: { bg: 'rgb(248, 252, 255)', text: 'rgb(10, 35, 75)', accent: 'rgb(15, 100, 230)' } },
    { value: Theme.GREEN, label: 'Green', color: { bg: 'rgb(248, 254, 250)', text: 'rgb(10, 60, 35)', accent: 'rgb(20, 162, 80)' } },
    { value: Theme.PURPLE, label: 'Purple', color: { bg: 'rgb(252, 250, 255)', text: 'rgb(60, 25, 90)', accent: 'rgb(115, 60, 225)' } },
    { value: Theme.PINK, label: 'Pink', color: { bg: 'rgb(255, 250, 252)', text: 'rgb(85, 25, 50)', accent: 'rgb(230, 65, 115)' } },
    { value: Theme.ORANGE, label: 'Orange', color: { bg: 'rgb(255, 252, 250)', text: 'rgb(75, 40, 15)', accent: 'rgb(235, 125, 35)' } },
  ]

  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const updateTheme = async (selectedTheme: Theme) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Update in database
      await supabase
        .from('profiles')
        .update({ theme: selectedTheme })
        .eq('id', user.id);
      
      // Update in context
      setTheme(selectedTheme as ThemeType);
      
      // Close profile menu
      setProfileMenuOpen(false);
    } catch (error) {
      console.error('Error updating theme:', error);
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
      console.error('Avatar upload error:', uploadError);
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

  const ThemeSelector = () => {
    return (
      <div className="theme-selector flex flex-col bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-3 shadow-md">
        <h3 className="text-sm font-medium mb-3 text-[rgb(var(--foreground))]">Color Theme</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:flex md:flex-wrap">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value as ThemeType)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-md transition-all hover:scale-[1.05] ${
                theme === t.value ? 'ring-2 ring-[rgb(var(--accent))]' : 'hover:bg-[rgb(var(--secondary-hover))]'
              }`}
              style={{
                background: t.color.bg,
                color: t.color.text,
              }}
            >
              <span 
                className="w-6 h-6 rounded-full mb-1"
                style={{ background: t.color.accent }}
              />
              <span 
                className="text-xs font-medium"
                style={{ color: t.color.text }}
              >
                {t.label}
              </span>
              {theme === t.value && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[rgb(var(--accent))] rounded-full flex items-center justify-center">
                  <FiCheck size={10} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleImageUpload = () => {
    setShowImageUploader(true);
  };

  const handleImageUploaded = (imageUrl: string) => {
    if (activeNote) {
      // Insert the image at cursor position
      const img = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; margin: 10px 0;" />`;
      
      // Insert image into the editor content
      const updatedContent = activeNote.content 
        ? activeNote.content.replace(/<\/p>$/, `${img}</p>`)
        : `<p>${img}</p>`;
      
      // Update note with new content
      const updatedNote = { ...activeNote, content: updatedContent };
      setActiveNote(updatedNote);
      debouncedUpdate(updatedNote);
    }
    
    // Close the uploader
    setShowImageUploader(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between p-3 md:p-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-[rgb(var(--secondary))] mr-2 md:mr-4"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <h1 className="font-semibold text-lg md:text-xl">Notaflow</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {activeNote && (
            <button
              onClick={handleImageUpload}
              className="p-2 rounded-full hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))]"
              aria-label="Upload image"
            >
              <FiImage />
            </button>
          )}
          
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center justify-center p-2 rounded-full hover:bg-[rgb(var(--secondary))]"
              aria-label="Profile menu"
            >
              <FiUser />
            </button>
            
            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] z-10"
                >
                  <div className="p-3 mb-1 border-b border-[rgb(var(--border))]">
                    <ThemeSelector />
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-left hover:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))]"
                  >
                    <FiLogOut className="mr-3" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[rgb(var(--card))] border-r border-[rgb(var(--border))] flex flex-col w-full sm:max-w-xs md:max-w-sm min-h-0"
            >
              <div className="p-3 flex items-center justify-between border-b border-[rgb(var(--border))]">
                <h2 className="font-medium">All Notes</h2>
                <button
                  onClick={createNewNote}
                  className="p-2 rounded-full hover:bg-[rgb(var(--secondary))]"
                  aria-label="Create new note"
                >
                  <FiPlus />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-pulse">Loading notes...</div>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="p-4 text-center text-[rgb(var(--foreground))] opacity-70">
                    <p>No notes yet</p>
                    <button
                      onClick={createNewNote}
                      className="mt-2 text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))]"
                    >
                      Create your first note
                    </button>
                  </div>
                ) : (
                  // Note list
                  <div className="divide-y divide-[rgb(var(--border))]">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => setActiveNote(note)}
                        className={`note-list-item p-3 cursor-pointer hover:bg-[rgb(var(--secondary))] transition-colors ${
                          activeNote?.id === note.id
                            ? "bg-[rgb(var(--secondary))]"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium truncate mr-2">
                            {note.title || "Untitled"}
                          </h3>
                          <div className="flex items-center">
                            {note.is_pinned && (
                              <FiMapPin className="text-[rgb(var(--accent))]" />
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs opacity-70">
                          <div className="truncate max-w-[180px]">
                            {note.content ? (
                              <div dangerouslySetInnerHTML={{ 
                                __html: note.content.replace(/<[^>]*>/g, ' ').substring(0, 80) + '...' 
                              }} />
                            ) : (
                              "No content"
                            )}
                          </div>
                          <div>{formatDate(note.updated_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main editor area */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[rgb(var(--background))]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="animate-pulse">Loading...</div>
            </div>
          ) : !activeNote ? (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
              <h2 className="text-xl font-medium mb-2">No note selected</h2>
              <p className="text-[rgb(var(--foreground))] opacity-70 mb-4 max-w-md">
                Select a note from the sidebar or create a new one to get started.
              </p>
              <button
                onClick={createNewNote}
                className="flex items-center px-4 py-2 rounded-md bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))] transition-colors"
              >
                <FiPlus className="mr-2" /> Create new note
              </button>
            </div>
          ) : (
            <>
              <div className="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]">
                <div className="p-3 md:p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => {
                        const updatedNote = { ...activeNote, title: e.target.value };
                        setActiveNote(updatedNote);
                        debouncedUpdate(updatedNote);
                      }}
                      placeholder="Untitled"
                      className="w-full bg-transparent outline-none font-medium text-lg"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePin(activeNote)}
                      className={`p-2 rounded-full hover:bg-[rgb(var(--secondary))] ${
                        activeNote.is_pinned ? "text-[rgb(var(--accent))]" : ""
                      }`}
                      aria-label={activeNote.is_pinned ? "Unpin note" : "Pin note"}
                    >
                      <FiMapPin />
                    </button>
                    <button
                      onClick={() => deleteNote(activeNote.id)}
                      className="p-2 rounded-full hover:bg-[rgb(var(--secondary))] text-[rgb(var(--error))]"
                      aria-label="Delete note"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-3 md:p-5 pb-24 md:pb-5">
                <div className="h-full">
                  <RichTextEditor
                    value={activeNote.content || ''}
                    onChange={(content) => {
                      const updatedNote = { ...activeNote, content: content };
                      setActiveNote(updatedNote);
                      debouncedUpdate(updatedNote);
                    }}
                    placeholder="Start writing your note here..."
                  />
                </div>
              </div>
              
              <div className="p-2 text-xs text-center opacity-60">
                {isSaving ? "Saving..." : "All changes saved"}
              </div>
            </>
          )}
        </main>
      </div>
      
      {/* Save notification */}
      <AnimatePresence>
        {showSaveNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-[rgb(var(--success))] text-white px-4 py-2 rounded-md shadow-lg"
          >
            Note saved!
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile floating action button */}
      <div className="md:hidden">
        {!activeNote && (
          <button
            onClick={createNewNote}
            className="floating-action-button"
            aria-label="Create new note"
          >
            <FiPlus size={24} />
          </button>
        )}
      </div>
      
      {/* Mobile bottom menu - only shown on small screens */}
      <div className="md:hidden">
        <nav className="mobile-menu">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`mobile-menu-item ${sidebarOpen ? 'active' : ''}`}
          >
            <FiMenu size={20} />
            <span className="text-xs">Notes</span>
          </button>
          
          {activeNote && (
            <>
              <button
                onClick={() => togglePin(activeNote)}
                className={`mobile-menu-item ${activeNote.is_pinned ? 'active' : ''}`}
              >
                <FiMapPin size={20} />
                <span className="text-xs">Pin</span>
              </button>
              
              <button
                onClick={handleImageUpload}
                className="mobile-menu-item"
              >
                <FiImage size={20} />
                <span className="text-xs">Image</span>
              </button>
              
              <button
                onClick={() => deleteNote(activeNote.id)}
                className="mobile-menu-item text-[rgb(var(--error))]"
              >
                <FiTrash2 size={20} />
                <span className="text-xs">Delete</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={`mobile-menu-item ${profileMenuOpen ? 'active' : ''}`}
          >
            <FiUser size={20} />
            <span className="text-xs">Profile</span>
          </button>
        </nav>
      </div>
      
      {/* Image Uploader Modal */}
      <AnimatePresence>
        {showImageUploader && (
          <ImageUploader
            onImageUploaded={handleImageUploaded}
            onCancel={() => setShowImageUploader(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}