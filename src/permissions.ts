import { UserRole } from './types';

// ─── Permissões disponíveis no sistema ─────────────────────────────────────

export type Permission =
  | 'agenda.view'
  | 'agenda.create'
  | 'agenda.update'
  | 'agenda.cancel'
  | 'paciente.view'
  | 'paciente.create'
  | 'paciente.update'
  | 'atendimento.view'
  | 'atendimento.create'
  | 'atendimento.finalize'
  | 'anamnese.view'
  | 'anamnese.edit'
  | 'estoque.view'
  | 'estoque.manage'
  | 'financeiro.view'
  | 'financeiro.manage'
  | 'relatorios.view'
  | 'relatorios.gerencial'
  | 'chat.view'
  | 'usuarios.manage'
  | 'configuracoes.manage';

// ─── Permissões por perfil ─────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'agenda.view', 'agenda.create', 'agenda.update', 'agenda.cancel',
    'paciente.view', 'paciente.create', 'paciente.update',
    'atendimento.view', 'atendimento.create', 'atendimento.finalize',
    'anamnese.view', 'anamnese.edit',
    'estoque.view', 'estoque.manage',
    'financeiro.view', 'financeiro.manage',
    'relatorios.view', 'relatorios.gerencial',
    'chat.view',
    'usuarios.manage',
    'configuracoes.manage',
  ],
  GERENTE: [
    'agenda.view', 'agenda.create', 'agenda.update', 'agenda.cancel',
    'paciente.view', 'paciente.create', 'paciente.update',
    'atendimento.view', 'atendimento.create', 'atendimento.finalize',
    'anamnese.view', 'anamnese.edit',
    'estoque.view', 'estoque.manage',
    'financeiro.view', 'financeiro.manage',
    'relatorios.view', 'relatorios.gerencial',
    'chat.view',
  ],
  RECEPCIONISTA: [
    'agenda.view', 'agenda.create', 'agenda.update',
    'paciente.view', 'paciente.create', 'paciente.update',
    'atendimento.view',
    'anamnese.view',
    'estoque.view',
    'financeiro.view',
    'chat.view',
  ],
};

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin Master',
  GERENTE: 'Gerente',
  RECEPCIONISTA: 'Recepcionista',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  GERENTE: 'bg-blue-100 text-blue-700',
  RECEPCIONISTA: 'bg-emerald-100 text-emerald-700',
};
