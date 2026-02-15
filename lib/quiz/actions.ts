'use server';

import { createClient } from '@/lib/supabase/server';

export async function submitQuizEmail(email: string) {
  const supabase = await createClient();
  
  await supabase
    .from('quiz_emails')
    .insert({ email });
    
  // Ignore error, it just means that the email was already submitted
}
