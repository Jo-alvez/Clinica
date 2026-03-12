// === TIPOS CENTRAIS DO SISTEMA ESTÉTICA AVANÇADA ===

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PROFISSIONAL' | 'RECEPCAO';

export interface AppUser {
  id: string;
  clinicaId?: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  avatar: string;
  active: boolean;
  email?: string;
  phone?: string;
  createdAt: string;
  subscriptionPlan?: 'Basic' | 'Pro' | 'Enterprise';
  subscriptionStatus?: 'trial' | 'active' | 'expired';
  trialEndsAt?: string;
}

// ─── Arquitetura Modular (SaaS) ─────────────────────────────────────────────

export interface Modulo {
  id: string;
  nome: string;
  slug: 'core' | 'estetica' | 'podologia' | 'odontologia' | string;
  descricao: string;
  icone: string;
  categoria: string;
  ativo: boolean;
  listaFuncionalidades?: string[];
  planoMinimo?: 'Basic' | 'Pro' | 'Enterprise';
}

export interface ClinicaModulo {
  id: string;
  clinicaId: string;
  moduloId: string;
  status: 'ativo' | 'suspenso' | 'cancelado';
  instaladoEm: string;
  // Populado no frontend
  moduloDetails?: Modulo;
}

// ─── Procedimentos (antigos Serviços) ───────────────────────────────────────

export interface Procedimento {
  id: string;
  clinicaId?: string;
  nome: string;
  categoria: 'Faciais' | 'Corporais' | 'Vasculares' | 'Outros';
  descricao: string;
  indicacoes: string;
  contraindicacoes: string;
  valorPadrao: number;
  duracaoMinutos: number;
  sessoesMedias: number;
  exigeConsentimento: boolean;
  exigeFoto: boolean;
  ativo: boolean;
  corAgenda: string; // tailwind bg color class
}

// ─── Pacientes ─────────────────────────────────────────────────────────────

export interface Paciente {
  id: string;
  clinicaId?: string;
  nomeCompleto: string;
  cpf?: string;
  dataNascimento?: string;
  sexo?: 'M' | 'F' | 'O';
  telefone: string;
  email?: string;
  profissao?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  origem?: string;
  observacoesGerais?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Anamnese Estética (antiga Anamnese) ────────────────────────────────────

export interface AnamneseEstetica {
  id: string;
  pacienteId: string;
  queixaPrincipal?: string;
  objetivoEstetico?: string;
  
  // Histórico Clínico
  historicoMedico?: string;
  doencasCronicas?: string;
  medicamentosContinuos?: string;
  alergiasMedicamentosas?: string;
  alergiasCutaneas?: string;
  cirurgiasAnteriores?: string;
  
  // Histórico Estético
  procedimentosPrevios?: string;
  usoBotoxPrevio?: boolean;
  usoPreenchimentoPrevio?: boolean;
  usoBioestimuladorPrevio?: boolean;
  usoEscleroterapiaPrevio?: boolean;
  
  // Fisiológico & Estilo de Vida
  gestante: boolean;
  lactante: boolean;
  cicloMenstrual?: string;
  usoAnticoncepcional?: boolean;
  menopausa?: boolean;
  tabagista: boolean;
  etilista: boolean;
  praticaExercicios?: boolean;
  exposicaoSolar?: string;
  
  // Risco & Dermatológico
  tendenciaQueloide: boolean;
  disturbioCoagulacao: boolean;
  anticoagulante: boolean;
  historicoTrombose?: boolean;
  fototipo?: string; // Fitzpatrick I-VI
  tipoPele?: string;
  sensibilidadeCutanea?: boolean;
  historiaManchas?: boolean;
  acne?: boolean;
  
  // Skincare
  rotinaSkincare?: string;
  usoProtetorSolar?: boolean;
  
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProcedimentoNoPlano {
  procedimentoId: string;
  nome: string;
  sessoes: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface PlanoTerapeutico {
  id: string;
  pacienteId: string;
  objetivosTratamento?: string;
  indicacoesProcedimentos?: string[]; // IDs de procedimentos ou nomes
  numeroSessoesEstimado?: number;
  intervaloRecomendado?: string;
  regioesTratar?: string;
  itens: ProcedimentoNoPlano[];
  valorTotalBruto: number;
  desconto: number;
  valorFinal: number;
  status: 'EM_ELABORACAO' | 'ATIVO' | 'CONCLUIDO' | 'CANCELADO';
  criadoEm: string;
  atualizadoEm: string;
}

export interface AvaliacaoFacial {
  id: string;
  pacienteId: string;
  sessaoId?: string;
  
  // Regiões
  testa?: string;
  glabela?: string;
  periocular?: string;
  malar?: string;
  labios?: string;
  sulcoNasogeniano?: string;
  mento?: string;
  mandibula?: string;
  pescoco?: string;
  
  // Qualidade
  qualidadePele?: string;
  porosDilatados?: boolean;
  manchas?: string;
  cicatrizes?: string;
  hidratacao?: string;
  
  observacoes?: string;
  criadoEm: string;
}

export interface AvaliacaoCorporal {
  id: string;
  pacienteId: string;
  sessaoId?: string;
  
  peso?: number;
  altura?: number;
  imc?: number;
  
  // Regiões (Gordura, Flacidez, Celulite, Estrias)
  abdomen?: string;
  flancos?: string;
  coxas?: string;
  gluteos?: string;
  bracos?: string;
  papada?: string;
  
  grauCelulite?: string;
  retencaoLiquidos?: boolean;
  assimetrias?: string;
  
  observacoes?: string;
  criadoEm: string;
}

export interface AvaliacaoVascular {
  id: string;
  pacienteId: string;
  sessaoId?: string;
  
  telangiectasias?: string;
  distribuicaoVasos?: string;
  localizacao?: string[]; // 'Coxa', 'Panturrilha', etc.
  
  sintomas?: string[]; // 'Dor', 'Peso', 'Inchaço'
  
  historicoFamiliarVarizes?: boolean;
  tratamentosPrevios?: string;
  usoMeiasCompressivas?: boolean;
  
  observacoes?: string;
  criadoEm: string;
}

export interface ProntuarioEstetico {
  id: string;
  pacienteId: string;
  resumoClinico?: string;
  observacoesGerais?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// --- Podologia specific models ---

export interface AvaliacaoPodologica {
  id: string;
  pacienteId: string;
  sessaoId?: string;
  
  // Alterações de Pele
  calosidade: boolean;
  fissuras: boolean;
  verrugaPlantar: boolean;
  micoses: boolean;
  hidrose: 'Normal' | 'Hiper' | 'Anidrose';
  
  // Alterações de Unhas
  onicocriptose: boolean;
  onicomicose: boolean;
  onicofose: boolean;
  
  // Deformidades
  halluxValgus: boolean;
  dedosEmGarra: boolean;
  
  observacoes?: string;
  criadoEm: string;
}

export interface LesaoPodologica {
  id: string;
  sessaoId: string;
  pacienteId: string;
  tipo: string;
  x: number;
  y: number;
  pe: 'ESQUERDO' | 'DIREITO';
  visao: 'PLANTAR' | 'DORSAL';
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
  clinicaId?: string;
  pacienteId: string;
  procedimentoId: string; 
  servicoId?: string; // Temporário para compatibilidade
  profissionalId: string; 
  criadoPorUserId?: string; // Temporário para compatibilidade
  dataAgendada: string; // YYYY-MM-DD
  horaInicio: string;   // HH:MM
  horaFim: string;      // HH:MM
  status: AgendamentoStatus;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Sessões / Atendimentos ────────────────────────────────────────────────

export type SessaoStatus = 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';

export interface Sessao {
  id: string;
  clinicaId?: string;
  pacienteId: string;
  agendamentoId?: string;
  procedimentoId: string;
  profissionalId: string;
  dataSessao: string;
  horaInicio: string;
  horaFim?: string;
  status: SessaoStatus;
  
  // Registro Clínico da Sessão
  procedimentoRealizado?: string;
  regiaoTratada?: string;
  tecnica?: string;
  
  // Produtos/Insumos (Resumo ou lista de IDs)
  // Toxin info
  totalUnidadesAplicadas?: number;
  insumosUtilizados?: string;
  
  observacoes?: string;
  respostaImediata?: string;
  intercorrencias?: string;
  orientacoesPaciente?: string;
  
  valorCobrado?: number;
  formaPagamento?: string;
  retornoPrevistoEm?: string;
  
  criadoEm: string;
  atualizadoEm: string;
}

export interface Intercorrencia {
  id: string;
  pacienteId: string;
  sessaoId?: string;
  procedimentoId?: string;
  tipo: 'HEMATOMA' | 'EDEMA' | 'ASSIMETRIA' | 'ALERGIA' | 'NECROSE' | 'INFECCAO' | 'OUTROS';
  dataOcorrencia: string;
  descricao: string;
  condutaAdotada: string;
  medicacoesPrescritas?: string;
  status: 'EM_TRATAMENTO' | 'RESOLVIDA';
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Insumos & Produtos (Estética) ─────────────────────────────────────────

export interface Produto {
  id: string;
  clinicaId?: string;
  nome: string;
  codigoInterno?: string;
  categoria: 'TOXINA' | 'PREENCHEDOR' | 'BIOESTIMULADOR' | 'INSUMO' | 'PRODUTO_VENDA' | 'OUTROS';
  marca?: string;
  fabricante?: string;
  apresentacao?: string;
  unidadeMedida: string;
  precoVenda?: number;
  custoMedio: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FrascoToxina {
  id: string;
  produtoId: string;
  loteId?: string;
  marca: string;
  totalUnidades: number;
  unidadesDisponiveis: number;
  diluicao?: string;
  dataAbertura?: string;
  dataValidadeUso?: string;
  status: 'FECHADO' | 'ABERTO' | 'FINALIZADO' | 'DESCARTADO';
  custoTotal: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AplicacaoToxina {
  id: string;
  sessaoId: string;
  pacienteId: string;
  frascoToxinaId?: string;
  pontos: {
    id: string;
    area: string;
    unidades: number;
    x: number;
    y: number;
  }[];
  unidadesTotais: number;
  observacoes?: string;
  criadoEm: string;
}

export interface ConsumoSessao {
  id: string;
  sessaoId: string;
  produtoId: string;
  loteId?: string;
  quantidadeUsada: number;
  unidade: string;
  observacoes?: string;
  criadoEm: string;
}

// ─── CRM e Financeiro ──────────────────────────────────────────────────────

export interface FinanceiroMovimentacao {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoriaPrincipal: 'PROCEDIMENTO' | 'PRODUTO' | 'DESPESA' | 'OUTROS';
  subcategoria?: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  dataMovimentacao: string;
  pacienteId?: string;
  sessaoId?: string;
  criadoPorUserId: string;
  observacoes?: string;
  criadoEm: string;
}

export type VendaStatus = 'FINALIZADA' | 'CANCELADA' | 'ESTORNADA';
export type TipoCliente = 'CADASTRADO' | 'AVULSO' | 'NAO_IDENTIFICADO';

export interface Venda {
  id: string;
  numeroVenda: string;
  clienteId?: string;
  clienteNomeAvulso?: string;
  clienteTelefoneAvulso?: string;
  tipoCliente: TipoCliente;
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: string;
  valorRecebido: number;
  troco: number;
  status: VendaStatus;
  observacoes?: string;
  vendidoPorUserId: string;
  sessaoId?: string;
  criadoEm: string;
  updatedAt: string;
}

export interface CrmPaciente {
  id: string;
  pacienteId: string;
  statusCrm: 'LEAD' | 'AVALIACAO_AGENDADA' | 'EM_TRATAMENTO' | 'EM_RETORNO' | 'PAUSADO' | 'INATIVO' | 'FIDELIZADO';
  interessePrincipal?: string;
  ultimaVisita?: string;
  proximaAcao?: string;
  potencialRetorno?: string;
  observacaoComercial?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Fotos & Termos ────────────────────────────────────────────────────────

export interface FotoClinica {
  id: string;
  pacienteId: string;
  sessaoId?: string;
  procedimentoId?: string;
  tipoFoto: 'ANTES' | 'DEPOIS_IMEDIATO' | 'EVOLUCAO' | 'INTERCORRENCIA' | 'ACOMPANHAMENTO' | 'ALTA';
  regiao?: string;
  legenda?: string;
  arquivoUrl: string;
  dataFoto: string;
  criadoEm: string;
}

export interface Consentimento {
  id: string;
  pacienteId: string;
  procedimentoId?: string;
  sessaoId?: string;
  modeloNome: string;
  textoFinal: string;
  assinaturaPacienteUrl?: string;
  assinadoEm?: string;
  criadoEm: string;
}

// ─── Chat ───────────────────────────────────────────────────────────────────

export type ChatType = 'PRIVATE' | 'GROUP';
export type MessageType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'SYSTEM';
export type MessageSendStatus = 'ENVIANDO' | 'ENVIADA' | 'ENTREGUE' | 'LIDA' | 'ERRO';

export interface ChatConversation {
  id: string;
  type: ChatType;
  nomeGroup?: string;
  descricaoGroup?: string;
  avatarUrl?: string;
  createdByUserId?: string;
  isInstitutional: boolean;
  active: boolean;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ChatParticipant {
  id: string;
  conversationId: string;
  userId: string;
  roleInGroup: 'MEMBER' | 'ADMIN_GROUP';
  joinedAt: string;
  leftAt?: string;
  active: boolean;
  addedByUserId?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  messageType: MessageType;
  textContent?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  replyToMessageId?: string;
  statusEnvio: MessageSendStatus;
  editedAt?: string;
  removedAt?: string;
  createdAt: string;
  updatedAt: string;
  senderName?: string;
}

export interface ChatMessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
}

// ─── Pacotes de Procedimentos ──────────────────────────────────────────────

export interface Pacote {
  id: string;
  clinicaId?: string;
  nome: string;
  procedimentoPrincipalId: string;
  numeroSessoes: number;
  valorTotal: number;
  validadeMeses: number;
  ativo: boolean;
  criadoEm: string;
}

export interface PacotePaciente {
  id: string;
  pacienteId: string;
  pacoteId: string;
  vendaId?: string;
  sessoesContratadas: number;
  sessoesUtilizadas: number;
  status: 'ATIVO' | 'CONCLUIDO' | 'CANCELADO' | 'VENCIDO';
  dataCompra: string;
  dataValidade: string;
  criadoEm: string;
}

// ─── Ajuda / Central de Conhecimento ───────────────────────────────────────
export type HelpCategory = 
  | 'PRIMEIROS_PASSOS' 
  | 'PACIENTES' 
  | 'AGENDA' 
  | 'PROCEDIMENTOS' 
  | 'FINANCEIRO' 
  | 'ESTOQUE' 
  | 'VENDAS' 
  | 'RELATORIOS';

export interface HelpArticle {
  id: string;
  titulo: string;
  descricaoCurta?: string;
  categoria: HelpCategory;
  conteudo: string; // HTML ou Markdown com passos
  ordem: number;
  ativo: boolean;
  favorito?: boolean;
  imageUrl?: string;
  gifUrl?: string;
  createdAt: string;
}

export type Page =
  | 'login'
  | 'dashboard'
  | 'agenda'
  | 'patients'
  | 'service-record'
  | 'inventory'
  | 'sales'
  | 'reports'
  | 'chat-list'
  | 'chat-detail'
  | 'help'
  | 'settings'
  | 'clinic-data'
  | 'manage-services'
  | 'manage-users'
  | 'agenda-settings'
  | 'backup-data';
