import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://lfqgtbjwwtjfvrisakka.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmcWd0Ymp3d3RqZnZyaXNha2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDc2Njg4NDIsImV4cCI6MTk2MzI0NDg0Mn0.f8Q42e4sToBKHV5XF-ABJdRqiGUypvK0yWMpqWxVz0A'
const supabase = createClient(supabaseUrl, supabaseKey)


export default supabase;