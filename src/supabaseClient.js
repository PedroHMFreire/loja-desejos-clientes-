import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cleebtgvhgdsjtmvyzof.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsZWVidGd2aGdkc2p0bXZ5em9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTc2MDUsImV4cCI6MjA3MTQ3MzYwNX0.m9bxrHPx74_mIxo97ewDlwtnwvPoRlKuuDtAnoVnNTM'

export const supabase = createClient(supabaseUrl, supabaseKey)