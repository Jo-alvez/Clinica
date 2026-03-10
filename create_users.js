import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rrvxhvhmghdsnajdqfpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydnhodmhtZ2hkc25hamRxZnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzc2NTgsImV4cCI6MjA4ODcxMzY1OH0.xwE9X6gYiVOjTa464mjXQnYqbfz-9rmds7dhCL4awBk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Creating Admin...");
  const { error: err1 } = await supabase.auth.signUp({
    email: 'admin@podologypro.com',
    password: '123',
    options: {
      data: { name: 'Administrador', username: 'admin', role: 'ADMIN' },
    },
  });
  if (err1) console.error("Admin error:", err1);

  console.log("Creating Gerente...");
  const { error: err2 } = await supabase.auth.signUp({
    email: 'gerente@podologypro.com',
    password: '123',
    options: {
      data: { name: 'Gerente', username: 'gerente', role: 'GERENTE' },
    },
  });
  if (err2) console.error("Gerente error:", err2);

  console.log("Creating Colaborador...");
  const { error: err3 } = await supabase.auth.signUp({
    email: 'colaborador1@podologypro.com',
    password: '123',
    options: {
      data: { name: 'Colaborador 1', username: 'colaborador1', role: 'RECEPCIONISTA' },
    },
  });
  if (err3) console.error("Colab error:", err3);

  console.log("Done.");
}

main();
