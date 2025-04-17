'use client'

import { useState, useEffect } from 'react';
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
  FiSun
} from 'react-icons/fi';

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
  theme: 'light' | 'dark';
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
    theme: 'light' 
  });

  useEffect(() => {
    const initializeApp = async () => {
      await fetchNotes();
      await fetchUserProfile();

      const savedTheme = localStorage.getItem('theme');
      const preferredTheme = savedTheme ? savedTheme as 'light' | 'dark' : 'light';
      document.documentElement.classList.toggle('dark', preferredTheme === 'dark');
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
            theme: 'light',
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
  
        setUserProfile(newProfile || { avatar_url: null, theme: 'light' });
      } else {
        setUserProfile(data);
      }
  
      // Apply theme
      const theme = data?.theme || 'light';
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
    }
  };

  const updateTheme = async (theme: 'light' | 'dark') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ theme })
      .eq('user_id', user.id);

    if (!error) {
      setUserProfile(prev => ({ ...prev, theme }));
      document.documentElement.classList.toggle('dark', theme === 'dark');
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

  return (
    <div className={`flex h-screen font-sans ${userProfile.theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
  
      {/* Sidebar */}
      <div 
        className={`fixed md:relative z-30 w-72 h-full ${
          userProfile.theme === 'dark' ? 'bg-black' : 'bg-gray-50'
        } border-r ${
          userProfile.theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        } md:shadow-none transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className={`p-4 border-b ${
          userProfile.theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        } flex items-center justify-between`}>
          <h1 className="text-xl font-semibold text-black dark:text-white">Notes</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <FiX className="w-5 h-5 text-black dark:text-white" />
          </button>
        </div>
  
        <div className="p-4">
          <button
            onClick={createNewNote}
            className="w-full py-2.5 px-4 rounded-full bg-yellow-400 text-black font-medium hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <FiPlus className="w-5 h-5" />
            <span>New Note</span>
          </button>
        </div>
  
        <div className="overflow-y-auto h-[calc(100%-180px)]">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading notes...</div>
            </div>
          ) : notes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No notes found
            </div>
          ) : (
            <ul className={`divide-y ${
              userProfile.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-200'
            }`}>
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
                        ? 'bg-yellow-100 dark:bg-yellow-900/20' 
                        : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
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
                        <p className={`font-medium truncate text-black dark:text-white`}>
                          {note.title || 'Untitled Note'}
                        </p>
                        <p className={`text-sm truncate mt-0.5 text-gray-700 dark:text-gray-400`}>
                          {note.content.substring(0, 80).replace(/\n/g, ' ') || 'No additional text'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-xs text-gray-600 dark:text-gray-500`}>
                            {formatDate(note.updated_at)}
                          </span>
                          {note.is_pinned && (
                            <FiMapPin className="w-3.5 h-3.5 text-yellow-400" />
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-300/70 dark:hover:bg-gray-700/70 rounded-full ml-2"
                      >
                        <FiTrash2 className="w-4 h-4 text-black dark:text-white" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
  
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
          userProfile.theme === 'dark' ? 'border-gray-800 bg-black' : 'border-gray-200 bg-gray-50'
        }`}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
  
      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${
        userProfile.theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}>
        <div className={`p-4 border-b ${
          userProfile.theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        } flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
            >
              <FiMenu className="w-5 h-5 text-black dark:text-white" />
            </button>
            {activeNote ? (
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => togglePin(activeNote)}
                  className={`p-2 rounded-full ${
                    activeNote.is_pinned ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  <FiMapPin className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => setActiveNote({...activeNote, title: e.target.value})}
                  className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full text-black dark:text-white"
                />
                {isSaving && (
                  <span className={`text-sm text-gray-600 dark:text-gray-400`}>Saving...</span>
                )}
              </div>
            ) : (
              <span className="text-xl font-semibold text-black dark:text-white">Notes</span>
            )}
          </div>
  
          {/* Profile Section */}
          <div className="relative">
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              {userProfile.avatar_url ? (
                <img 
                  src={userProfile.avatar_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-800"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-800">
                  <FiUser className="w-5 h-5 text-black dark:text-white" />
                </div>
              )}
            </button>
  
            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute right-0 top-12 w-48 rounded-lg shadow-xl border ${
                    userProfile.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                  } p-2 z-30`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-black dark:text-white">
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
                  
                  <button
                    onClick={() => {
                      updateTheme(userProfile.theme === 'light' ? 'dark' : 'light');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-black dark:text-white"
                  >
                    {userProfile.theme === 'light' ? (
                      <>
                        <FiMoon className="w-5 h-5" />
                        <span className="text-sm">Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <FiSun className="w-5 h-5" />
                        <span className="text-sm">Light Mode</span>
                      </>
                    )}
                  </button>
                  
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
            <textarea
              value={activeNote.content}
              onChange={(e) => setActiveNote({...activeNote, content: e.target.value})}
              className={`w-full h-full p-2 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-black dark:text-white`}
              placeholder="Start writing your note here..."
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className={`text-center p-6 max-w-md text-black dark:text-gray-300`}>
              <FiEdit className={`w-12 h-12 mx-auto mb-4 text-gray-500 dark:text-gray-500`} />
              <h2 className="text-xl font-medium mb-2">No Note Selected</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-400">
                Select a note from the sidebar or create a new one to get started.
              </p>
              <button
                onClick={createNewNote}
                className="py-2 px-6 rounded-full bg-yellow-400 text-black font-medium hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 shadow-sm mx-auto"
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
              className="fixed bottom-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
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