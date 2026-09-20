import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// L'app fonctionne même sans Supabase configuré : dans ce cas elle
// bascule automatiquement sur des données simulées en mémoire
// (voir src/lib/api.js). Dès que tu renseignes .env avec ton URL et
// ta clé anon, elle se connecte à la vraie base.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
