// app/imageuploader/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) return alert('No file selected.')

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `public/${fileName}`

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (error) {
      console.error('Upload error:', error.message)
      alert('Failed to upload image')
    } else {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      setImageUrl(data.publicUrl)
    }

    setUploading(false)
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Image</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {imageUrl && (
        <div className="mt-6">
          <p className="mb-2">Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" className="w-64 rounded shadow" />
        </div>
      )}
    </main>
  )
}
