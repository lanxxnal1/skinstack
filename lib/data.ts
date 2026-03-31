import { createClient } from '@/lib/supabase-browser';
import type { Product, FinishedProduct, DurationHistory } from '@/types';

// ── Products ──────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertProduct(product: Omit<Product, 'id' | 'user_id'>): Promise<Product> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, user_id: user!.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('products').update(updates).eq('id', id).eq('user_id', user!.id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', user!.id);
  if (error) throw error;
}

// ── Finished Products ─────────────────────────────────────────────────────────

export async function fetchFinishedProducts(): Promise<FinishedProduct[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('finished_products')
    .select('*')
    .order('finish_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertFinishedProduct(
  product: Omit<FinishedProduct, 'id' | 'user_id'>
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('finished_products')
    .insert({ ...product, user_id: user!.id });
  if (error) throw error;
}

// ── Duration History ──────────────────────────────────────────────────────────

export async function fetchDurationHistory(): Promise<DurationHistory> {
  const supabase = createClient();
  const { data, error } = await supabase.from('duration_history').select('*');
  if (error) throw error;

  const byProduct: Record<string, number[]> = {};
  const byCategory: Record<string, number[]> = {};
  for (const row of data) {
    if (!byProduct[row.product_name]) byProduct[row.product_name] = [];
    byProduct[row.product_name].push(row.duration);
    if (!byCategory[row.category]) byCategory[row.category] = [];
    byCategory[row.category].push(row.duration);
  }
  return { byProduct, byCategory };
}

export async function insertDurationHistory(
  productName: string,
  category: string,
  duration: number
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('duration_history').insert({
    user_id: user!.id,
    product_name: productName,
    category,
    duration,
    recorded_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ── Brands ────────────────────────────────────────────────────────────────────

export async function fetchBrands(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('name')
    .order('name');
  if (error) throw error;
  return data.map((r: { name: string }) => r.name);
}

export async function insertBrand(name: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('brands')
    .upsert({ user_id: user!.id, name }, { onConflict: 'user_id,name' });
  if (error) throw error;
}
