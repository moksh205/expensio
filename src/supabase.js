import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mqxzaododkaxqwibmbwy.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeHphb2RvZGtheHF3aWJtYnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MDEzMTQsImV4cCI6MjA5MDE3NzMxNH0.0cDGm3d_SWDRKb5_GbZ1mH-Hj6uUlfMk1Nfr0BaC-NQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)