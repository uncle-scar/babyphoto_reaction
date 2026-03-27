import { supabase } from './supabase';

export async function uploadImageToStorage(
  imageBase64: string,
  fileName?: string
): Promise<{ path: string; url: string } | null> {
  try {
    const base64Data = imageBase64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const filePath = `${timestamp}-${randomId}.jpg`;

    const { data, error } = await supabase.storage
      .from('baby-photos')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('baby-photos')
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

export async function deleteImageFromStorage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('baby-photos')
      .remove([path]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
