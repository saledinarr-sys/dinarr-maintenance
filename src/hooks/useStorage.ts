import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useStorage() {
  const [uploading, setUploading] = useState(false);

  const uploadPhotos = async (files: File[], ticketId: string): Promise<string[]> => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${ticketId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('ticket-photos').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('ticket-photos').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setUploading(false);
    return urls;
  };

  return { uploadPhotos, uploading };
}
