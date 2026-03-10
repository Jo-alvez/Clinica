// === TIPOS CENTRAIS DO SISTEMA PODOLOGY PRO ===

export type UserRole = 'ADMIN' | 'GERENTE' | 'RECEPCIONISTA';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  avatar: string;
  active: boolean;
  email?: string;
  phone?: string;
  createdAt: string;
}

// ─── Serviços ──────────────────────────────────────────────────────────────

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  valorPadrao: number;
  duracaoMinutos: number;
  ativo: boolean;
  corAgenda: string; // tailwind bg color class
}

// ─── Pacientes ─────────────────────────────────────────────────────────────

export interface Paciente {
  id: string;
  nomeCompleto: string;
  cpf?: string;
  dataNascimento?: string;
  sexo?: 'M' | 'F' | 'O';
  telefone: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  observacoesGerais?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Anamnese ──────────────────────────────────────────────────────────────

export interface Anamnese {
  id: string;
  pacienteId: string;
  diabetico: boolean;
  hipertenso: boolean;
  gestante: boolean;
  problemasCirculatorios: boolean;
  neuropatia: boolean;
  alergias: string;
  medicamentosEmUso: string;
  historicoMicose: boolean;
  historicoUnhaEncravada: boolean;
  historicoFissuras: boolean;
  dorAoAndar: boolean;
  sensibilidadeAlterada: boolean;
  observacoesClincias: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Agenda ────────────────────────────────────────────────────────────────

export type AgendamentoStatus =
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'AGUARDANDO'
  | 'EM_ATENDIMENTO'
  | 'FINALIZADO'
  | 'CANCELADO'
  | 'FALTOU'
  | 'REMARCADO';

export interface Agendamento {
  id: string;
  pacienteId: string;
  servicoId: string;
  criadoPorUserId: string;
  dataAgendada: string; // YYYY-MM-DD
  horaInicio: string;   // HH:MM
  horaFim: string;      // HH:MM
  status: AgendamentoStatus;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Atendimento ───────────────────────────────────────────────────────────

export type AtendimentoStatus = 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';

export interface Atendimento {
  id: string;
  pacienteId: string;
  agendamentoId?: string;
  servicoId: string;
  dataAtendimento: string;
  horaInicio: string;
  horaFim?: string;
  status: AtendimentoStatus;
  queixaPrincipal?: string;
  descricaoProcedimento?: string;
  observacoesClinidas?: string;
  orientacoesPaciente?: string;
  retornoRecomendadoEm?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Estoque ────────────────────────────────────────────────────────────────

export interface Produto {
  id: string;
  nome: string;
  codigoInterno?: string;
  categoria: 'PRODUTO' | 'INSUMO' | 'EQUIPAMENTO';
  descricao?: string;
  unidadeMedida: string;
  precoVenda: number;
  custoMedio: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Financeiro ─────────────────────────────────────────────────────────────

export interface FinanceiroMovimentacao {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoriaPrincipal: 'SERVICO' | 'PRODUTO' | 'DESPESA' | 'AJUSTE';
  subcategoria?: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  dataMovimentacao: string;
  pacienteId?: string;
  atendimentoId?: string;
  criadoPorUserId: string;
  observacoes?: string;
  criadoEm: string;
}
