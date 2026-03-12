
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = "https://rrvxhvhmghdsnajdqfpm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydnhodmhtZ2hkc25hamRxZnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzc2NTgsImV4cCI6MjA4ODcxMzY1OH0.xwE9X6gYiVOjTa464mjXQnYqbfz-9rmds7dhCL4awBk";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initial Data
const INITIAL_SERVICOS = [
  { id: 's1', nome: 'Podologia Preventiva', descricao: 'Avaliação e cuidados preventivos dos pés', valor_padrao: 120, duracao_minutos: 45, ativo: true, cor_agenda: 'bg-blue-500' },
  { id: 's2', nome: 'Tratamento Onicomicose', descricao: 'Tratamento de micose nas unhas', valor_padrao: 150, duracao_minutos: 60, ativo: true, cor_agenda: 'bg-purple-500' },
  { id: 's3', nome: 'Tratamento de Fissuras', descricao: 'Tratamento de rachaduras nos pés', valor_padrao: 100, duracao_minutos: 40, ativo: true, cor_agenda: 'bg-orange-500' },
  { id: 's4', nome: 'Tratamento Onicocriptose', descricao: 'Tratamento de unha encravada', valor_padrao: 180, duracao_minutos: 60, ativo: true, cor_agenda: 'bg-red-500' },
  { id: 's5', nome: 'Tratamento de Verruga', descricao: 'Tratamento de verruga plantar', valor_padrao: 140, duracao_minutos: 50, ativo: true, cor_agenda: 'bg-yellow-500' },
  { id: 's6', nome: 'Calo (Geral)', descricao: 'Remoção e tratamento de calosidades', valor_padrao: 90, duracao_minutos: 30, ativo: true, cor_agenda: 'bg-green-500' },
  { id: 's7', nome: 'Onicotomia', descricao: 'Corte e modelagem terapêutica das unhas', valor_padrao: 80, duracao_minutos: 30, ativo: true, cor_agenda: 'bg-teal-500' },
  { id: 's8', nome: 'Podoprofilaxia', descricao: 'Limpeza e higienização profissional dos pés', valor_padrao: 110, duracao_minutos: 45, ativo: true, cor_agenda: 'bg-cyan-500' },
];

const INITIAL_PACIENTES = [
  { id: 'p1', name: 'Maria Santos Oliveira', cpf: '123.456.789-00', phone: '(11) 98765-4321', email: 'maria@email.com', address: 'Rua das Flores, 123', birth_date: '1985-06-15' },
  { id: 'p2', name: 'João Carlos Silva', cpf: '987.654.321-00', phone: '(11) 91234-5678', email: 'joao@email.com', address: 'Av. Paulista, 456', birth_date: '1972-11-30' },
];

const INITIAL_PRODUTOS = [
  { nome: 'Creme Ureia 10%', descricao: 'Hidratação profunda', preco_venda: 45, estoque_atual: 20, categoria: 'PRODUTO', unidade_medida: 'UN' },
  { nome: 'Óleo Melaleuca', descricao: 'Antifúngico natural', preco_venda: 35, estoque_atual: 15, categoria: 'PRODUTO', unidade_medida: 'UN' },
];

async function seed() {
  console.log('Seeding data...');
  
  const { error: sErr } = await supabase.from('servicos').upsert(INITIAL_SERVICOS);
  if (sErr) console.error('Error seeding servicos:', sErr);

  const { error: pErr } = await supabase.from('clientes').upsert(INITIAL_PACIENTES);
  if (pErr) console.error('Error seeding clientes:', pErr);

  const { error: prodErr } = await supabase.from('produtos').upsert(INITIAL_PRODUTOS);
  if (prodErr) console.error('Error seeding produtos:', prodErr);

  console.log('Seed finished.');
}

seed();
