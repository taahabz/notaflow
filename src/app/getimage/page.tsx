'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface FileObject {
  name: string
}

export default function GetImage() {
  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      const { data: files, error } = await supabase.storage
        .from('images')
        .list('public', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) {
        console.error('Failed to list images:', error.message)
        return
      }

      const urls = files?.map((file: FileObject) => {
        const { data } = supabase.storage
          .from('images')
          .getPublicUrl(`public/${file.name}`)
        return data.publicUrl
      }) || []

      setImageUrls(urls)
    }

    fetchImages()
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Uploaded Images</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {imageUrls.map((url, idx) => (
          <div key={idx} className="border rounded-lg overflow-hidden">
            <img
              src={url}
              alt={`Uploaded ${idx}`}
              className="w-full h-auto object-contain"
              onError={() => console.error('❌ Failed to load image:', url)}
            />
          </div>
        ))}
      </div>
    </main>
  )
}
