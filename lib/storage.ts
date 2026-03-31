import { createClient } from '@/lib/supabase-browser';

export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('product-photos').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('product-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBase64Photo(
  base64: string,
  userId: string
): Promise<string> {
  const response = await fetch(base64);
  const blob = await response.blob();
  const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
  return uploadPhoto(file, userId);
}

export async function deletePhoto(photoUrl: string): Promise<void> {
  const supabase = createClient();
  const match = photoUrl.match(/product-photos\/(.+)$/);
  if (!match) return;
  await supabase.storage.from('product-photos').remove([match[1]]);
}
