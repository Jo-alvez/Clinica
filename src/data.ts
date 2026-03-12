import {
  AppUser, Procedimento, Paciente, AnamneseEstetica,
  Agendamento, Sessao, FinanceiroMovimentacao,
  Pacote, PacotePaciente, AplicacaoToxina
} from './types';

// --- Usuarios iniciais ---
// Mantendo apenas os usuários de sistema essenciais para o primeiro acesso
export const INITIAL_USERS: AppUser[] = [
  {
    id: 'u0',
    username: 'dono',
    password: '123',
    name: 'SaaS Plataforma (Dono)',
    role: 'SUPER_ADMIN',
    avatar: 'https://picsum.photos/seed/dono_saas/200/200',
    active: true,
    email: 'dono@plataforma.com',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u1',
    username: 'admin',
    password: '123',
    name: 'Administrador Clínica',
    role: 'ADMIN',
    avatar: 'https://picsum.photos/seed/admin_master/200/200',
    active: true,
    email: 'admin@estetica.com.br',
    subscriptionPlan: 'Pro',
    createdAt: '2026-01-01T00:00:00Z',
  }
];

// --- Procedimentos Iniciais ---
export const INITIAL_PROCEDIMENTOS: Procedimento[] = [];

// --- Pacientes iniciais ---
export const INITIAL_PACIENTES: Paciente[] = [];

// --- Anamnese Estetica ---
export const INITIAL_ANAMNESES: AnamneseEstetica[] = [];

// --- Agendamentos iniciais ---
export const INITIAL_AGENDAMENTOS: Agendamento[] = [];

// --- Atendimentos/Sessoes ---
export const INITIAL_SESSAO: Sessao[] = [];

// --- Financeiro inicial ---
export const INITIAL_FINANCEIRO: FinanceiroMovimentacao[] = [];

// --- Artigos de Ajuda (Documentação do Sistema) ---
import { HelpArticle } from './types';

export const INITIAL_HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'h1',
    titulo: 'Guia de Inicio Rapido: Fluxo Completo',
    categoria: 'PRIMEIROS_PASSOS',
    ordem: 1,
    ativo: true,
    conteudo: `### Bem-vindo ao Esteta Pro!
Este guia detalha o fluxo ideal para um atendimento de excelencia.

1. **Configuração:** Vá em Ajustes e gerencie seus serviços e profissionais.
2. **Recepcao:** Cadastre o paciente e agende o horario na **Agenda**.
3. **Triagem:** O paciente preenche a **Anamnese** no modulo de Pacientes.
4. **Execucao:** Registre a **Evolucao Clinica** e as fotos do procedimento.
5. **Finalizacao:** Realize o recebimento no **Financeiro**.`,
    createdAt: new Date().toISOString()
  }
];
 
// --- Pacotes Iniciais ---
export const INITIAL_PACOTES: Pacote[] = [];

export const INITIAL_PACOTES_PACIENTE: PacotePaciente[] = [];

// --- Toxina ---
export const INITIAL_TOXINA: AplicacaoToxina[] = [];
