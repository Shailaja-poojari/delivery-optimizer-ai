// client/src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://iwcsrcqilwtuacgenyzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y3NyY3FpbHd0dWFjZ2VueXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzEzMzcsImV4cCI6MjA2NzkwNzMzN30.9xr8UGa5VcUeluZye6f8pKjoh6lDJYN8f01lV8NBtnE';
export const supabase = createClient(supabaseUrl, supabaseKey);


