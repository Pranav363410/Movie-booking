import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zovfnkbgktkhaiafaiwa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdmZua2Jna3RraGFpYWZhaXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxOTI3NjgsImV4cCI6MjA5MDc2ODc2OH0.9i73PqZOU6gtCeb-EBKCaTmyvEBdTtESpha_FjRNRMk'

export const supabase = createClient(supabaseUrl, supabaseKey)