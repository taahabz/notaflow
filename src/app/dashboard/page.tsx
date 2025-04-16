'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { FiLogOut, FiUpload, FiImage, FiTrash2 } from 'react-icons/fi';
import Image from 'next/image';

export default function Dashboard() {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images:', error);
    } else {
      setImages(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate unique filename
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('user-images')
      .upload(filePath, selectedFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-images')
      .getPublicUrl(filePath);

    // Save to database
    const { error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        url: publicUrl,
        name: selectedFile.name,
        path: filePath
      });

    if (dbError) {
      console.error('Database error:', dbError);
    } else {
      await fetchImages();
    }

    setUploading(false);
    setSelectedFile(null);
  };

  const handleDelete = async (imageId: string, imagePath: string) => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-images')
      .remove([imagePath]);

    if (storageError) {
      console.error('Delete from storage error:', storageError);
      return;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('Delete from db error:', dbError);
    } else {
      setImages(images.filter(img => img.id !== imageId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Image Dashboard</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
          >
            <FiLogOut /> Logout
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-8 h-8 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    {selectedFile ? (
                      <span className="font-medium">{selectedFile.name}</span>
                    ) : (
                      <span><span className="font-medium">Click to upload</span> or drag and drop</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${selectedFile && !uploading ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              {uploading ? 'Uploading...' : (
                <>
                  <FiUpload /> Upload
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {images.map((image) => (
              <motion.div
                key={image.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-800 truncate">{image.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(image.id, image.path)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete image"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <FiImage className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No images yet</h3>
            <p className="mt-2 text-gray-500">Upload your first image using the panel above</p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 border-t border-gray-200 mt-8">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Image Dashboard. All rights reserved.
        </p>
      </footer>
    </div>
  );
}