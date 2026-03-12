import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock,
  User, X, Check, AlertCircle, MoreHorizontal, MapPin, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency, addMinutes } from '../utils';
import { Agendamento, AgendamentoStatus, AppUser, Procedimento, Paciente } from '../types';
import { can } from '../permissions';

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AgendamentoStatus, { label: string; color: string; dot: string }> = {
  AGENDADO:       { label: 'Agendado',       color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  CONFIRMADO:     { label: 'Confirmado',     color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  AGUARDANDO:     { label: 'Aguardando',     color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  EM_ATENDIMENTO: { label: 'Em Sessao', color: 'bg-purple-100 text-purple-700',dot: 'bg-purple-500' },
  FINALIZADO:     { label: 'Finalizado',     color: 'bg-slate-100 text-slate-500',  dot: 'bg-slate-400' },
  CANCELADO:      { label: 'Cancelado',      color: 'bg-red-100 text-red-600',      dot: 'bg-red-500' },
  FALTOU:         { label: 'Faltou',         color: 'bg-red-50 text-red-400',       dot: 'bg-red-300' },
  REMARCADO:      { label: 'Remarcado',      color: 'bg-orange-100 text-orange-600',dot: 'bg-orange-500' },
};

// ─── Date helpers ────────────────────────────────────────────────────────────

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekDays(base: Date): Date[] {
  const day = base.getDay(); // 0=Sun
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const WEEKDAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// ─── Props ───────────────────────────────────────────────────────────────────

interface AgendaPageProps {
  currentUser: AppUser;
  agendamentos: Agendamento[];
  pacientes: Paciente[];
  servicos: Procedimento[];
  onAddAgendamento: (a: Agendamento) => void;
  onUpdateStatus: (id: string, status: AgendamentoStatus) => void;
}

// ─── New Appointment Modal ────────────────────────────────────────────────────

interface NovoAgendamentoForm {
  pacienteId: string;
  servicoId: string;
  dataAgendada: string;
  horaInicio: string;
  observacoes: string;
}

const EMPTY_FORM: NovoAgendamentoForm = {
  pacienteId: '',
  servicoId: '',
  dataAgendada: '',
  horaInicio: '09:00',
  observacoes: '',
};

// ─── Status Change Dropdown ───────────────────────────────────────────────────

const NEXT_STATUS_OPTIONS: Record<AgendamentoStatus, AgendamentoStatus[]> = {
  AGENDADO:       ['CONFIRMADO', 'CANCELADO', 'REMARCADO'],
  CONFIRMADO:     ['AGUARDANDO', 'CANCELADO'],
  AGUARDANDO:     ['EM_ATENDIMENTO', 'FALTOU', 'CANCELADO'],
  EM_ATENDIMENTO: ['FINALIZADO', 'CANCELADO'],
  FINALIZADO:     [],
  CANCELADO:      [],
  FALTOU:         ['REMARCADO'],
  REMARCADO:      ['AGENDADO'],
};

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

const AgendamentoDetail = ({
  agendamento, paciente, servico, onClose, onStatusChange, currentUser,
}: {
  agendamento: Agendamento;
  paciente: Paciente | undefined;
  servico: Procedimento | undefined;
  onClose: () => void;
  onStatusChange: (status: AgendamentoStatus) => void;
  currentUser: AppUser;
}) => {
  const cfg = STATUS_CONFIG[agendamento.status];
  const nextOptions = NEXT_STATUS_OPTIONS[agendamento.status];
  const canUpdate = can(currentUser.role, 'agenda.update');
  const canCancel = can(currentUser.role, 'agenda.cancel');

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ maxWidth: '448px', margin: '0 auto', left: 0, right: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-2xl z-10 pb-8 max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Detalhes do Agendamento</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="px-5 pt-5 pb-2 space-y-4">
          {/* Patient */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{paciente?.nomeCompleto ?? '—'}</p>
              <p className="text-sm text-slate-500">{paciente?.telefone ?? ''}</p>
            </div>
          </div>

          {/* Service */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span className="font-semibold text-slate-800 text-sm">{servico?.nome ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <span className="text-sm text-slate-600">{agendamento.horaInicio} – {agendamento.horaFim}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm text-slate-600">
                {(() => {
                  const [y, m, d] = agendamento.dataAgendada.split('-');
                  return `${d}/${m}/${y}`;
                })()}
              </span>
            </div>
            {servico && (
              <div className="text-sm font-semibold text-primary">{formatCurrency(servico.valorPadrao)}</div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Status</span>
            <span className={cn('text-xs font-bold px-3 py-1.5 rounded-xl', cfg.color)}>{cfg.label}</span>
          </div>

          {/* Quick Start Action */}
          {(agendamento.status === 'AGUARDANDO' || agendamento.status === 'CONFIRMADO' || agendamento.status === 'EM_ATENDIMENTO') && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onStatusChange('EM_ATENDIMENTO');
                onClose();
              }}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-soft text-white rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Activity size={20} />
              {agendamento.status === 'EM_ATENDIMENTO' ? 'Continuar Atendimento' : 'Iniciar Atendimento'}
            </motion.button>
          )}

          {agendamento.observacoes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-600 mb-1">Observações</p>
              <p className="text-sm text-slate-700">{agendamento.observacoes}</p>
            </div>
          )}

          {/* Actions */}
          {(canUpdate || canCancel) && nextOptions.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alterar Status</p>
              <div className="grid grid-cols-2 gap-2">
                {nextOptions.map((s) => {
                  if (s === 'CANCELADO' && !canCancel) return null;
                  const c = STATUS_CONFIG[s];
                  return (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => { onStatusChange(s); onClose(); }}
                      className={cn(
                        'py-3 rounded-xl font-semibold text-sm transition-colors',
                        s === 'CANCELADO' || s === 'FALTOU'
                          ? 'bg-red-50 text-red-500 border border-red-100'
                          : s === 'FINALIZADO'
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-primary text-white shadow-md shadow-primary/20'
                      )}
                    >
                      {c.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Agenda Page ─────────────────────────────────────────────────────────

export const AgendaPage: React.FC<AgendaPageProps> = ({
  currentUser, agendamentos, pacientes, servicos, onAddAgendamento, onUpdateStatus,
}) => {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date>(todayDate);
  const [weekBase, setWeekBase] = useState<Date>(todayDate);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NovoAgendamentoForm>({ ...EMPTY_FORM, dataAgendada: toYMD(todayDate) });
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [formError, setFormError] = useState('');

  const weekDays = useMemo(() => getWeekDays(weekBase), [weekBase]);

  // Filter appointments for selected date, sorted by time
  const dayAgendamentos = useMemo(() => {
    const ymd = toYMD(selectedDate);
    return agendamentos
      .filter(a => a.dataAgendada === ymd)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [agendamentos, selectedDate]);

  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); };
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); };
  const goToday = () => { setSelectedDate(todayDate); setWeekBase(todayDate); };

  const handleSelectDate = (d: Date) => {
    setSelectedDate(d);
    setForm(f => ({ ...f, dataAgendada: toYMD(d) }));
  };

  const handleSaveAgendamento = () => {
    setFormError('');
    if (!form.pacienteId) { setFormError('Selecione um paciente.'); return; }
    if (!form.servicoId) { setFormError('Selecione um serviço.'); return; }
    if (!form.dataAgendada) { setFormError('Selecione uma data.'); return; }
    if (!form.horaInicio) { setFormError('Defina o horário.'); return; }

    const servico = servicos.find(s => s.id === form.servicoId);
    const horaFim = servico ? addMinutes(form.horaInicio, servico.duracaoMinutos) : addMinutes(form.horaInicio, 45);

    const novo: Agendamento = {
      id: `ag_${Date.now()}`,
      pacienteId: form.pacienteId,
      procedimentoId: form.servicoId, // Map servicoId to procedimentoId
      servicoId: form.servicoId,
      profissionalId: currentUser.id, // DEFAULT: current user is the professional
      criadoPorUserId: currentUser.id,
      dataAgendada: form.dataAgendada,
      horaInicio: form.horaInicio,
      horaFim,
      status: 'AGENDADO',
      observacoes: form.observacoes || undefined,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    onAddAgendamento(novo);
    setForm({ ...EMPTY_FORM, dataAgendada: form.dataAgendada });
    setShowModal(false);

    // Navigate to the new date
    const [y, m, d] = form.dataAgendada.split('-').map(Number);
    const newDate = new Date(y, m - 1, d);
    setSelectedDate(newDate);
    setWeekBase(newDate);
  };

  const canCreate = can(currentUser.role, 'agenda.create');
  const selectedAgPaciente = selectedAgendamento ? pacientes.find(p => p.id === selectedAgendamento.pacienteId) : undefined;
  const selectedAgProcedimento = selectedAgendamento ? servicos.find(s => s.id === selectedAgendamento.servicoId) : undefined;

  // Month header label
  const monthLabel = `${MONTHS_PT[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  const isToday = (d: Date) => toYMD(d) === toYMD(todayDate);
  const isSelected = (d: Date) => toYMD(d) === toYMD(selectedDate);

  // Count appointments per day in the week (for dots)
  const dayCount = (d: Date) => agendamentos.filter(a => a.dataAgendada === toYMD(d)).length;

  return (
    <div className="flex-1 flex flex-col pb-4 bg-slate-50 overflow-hidden">
      {/* ─── Header ─── */}
      <header className="bg-white px-4 pt-5 pb-3 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Agenda</h1>
            <p className="text-xs text-slate-400 mt-0.5">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
              Hoje
            </button>
            {canCreate && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowModal(true)}
                className="bg-primary text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-primary/30"
              >
                <Plus size={20} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Week strip */}
        <div className="flex items-center gap-1">
          <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-1 gap-1">
            {weekDays.map((d, i) => {
              const count = dayCount(d);
              return (
                <button
                  key={i}
                  onClick={() => handleSelectDate(d)}
                  className={cn(
                    'flex-1 flex flex-col items-center py-1.5 rounded-xl transition-colors relative',
                    isSelected(d) ? 'bg-primary text-white' :
                    isToday(d) ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'
                  )}
                >
                  <span className="text-[10px] font-semibold">{WEEKDAY_SHORT[i]}</span>
                  <span className={cn('text-sm font-bold mt-0.5', isSelected(d) ? 'text-white' : '')}>{d.getDate()}</span>
                  {count > 0 && (
                    <span className={cn(
                      'text-[8px] font-bold mt-0.5 px-1 rounded-full',
                      isSelected(d) ? 'bg-white/30 text-white' : 'bg-primary/20 text-primary'
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {/* ─── Appointment list ─── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          {dayAgendamentos.length === 0
            ? 'Nenhum agendamento'
            : `${dayAgendamentos.length} agendamento${dayAgendamentos.length > 1 ? 's' : ''}`}
        </p>

        <AnimatePresence>
          {dayAgendamentos.map((ag) => {
            const paciente = pacientes.find(p => p.id === ag.pacienteId);
            const servico = servicos.find(s => s.id === ag.servicoId);
            const cfg = STATUS_CONFIG[ag.status];
            return (
              <motion.div
                key={ag.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedAgendamento(ag)}
                className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform"
              >
                {/* Time column */}
                <div className="flex flex-col items-center min-w-[44px]">
                  <span className="text-sm font-bold text-slate-900">{ag.horaInicio}</span>
                  <span className="text-[11px] text-slate-400">{ag.horaFim}</span>
                </div>

                {/* Divider with color dot */}
                <div className="flex flex-col items-center gap-1 self-stretch">
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', cfg.dot)} />
                  <div className="flex-1 w-px bg-slate-100" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {paciente?.nomeCompleto ?? 'Paciente não encontrado'}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{servico?.nome ?? '—'}</p>
                  {servico && (
                    <p className="text-xs font-semibold text-primary mt-1">{formatCurrency(servico.valorPadrao)}</p>
                  )}
                </div>

                {/* Status badge */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', cfg.color)}>
                    {cfg.label}
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {dayAgendamentos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">Nenhum agendamento</p>
            <p className="text-slate-400 text-sm mt-1">para este dia</p>
            {canCreate && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-5 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary/20"
              >
                + Novo Agendamento
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── New Appointment Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ maxWidth: '448px', margin: '0 auto', left: 0, right: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-white rounded-t-2xl z-10 pb-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Novo Agendamento</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-slate-100">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="px-5 py-5 space-y-4">
                {/* Patient */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Paciente *</label>
                  <select
                    value={form.pacienteId}
                    onChange={e => setForm(f => ({ ...f, pacienteId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Selecione o paciente...</option>
                    {pacientes.filter(p => p.ativo).map(p => (
                      <option key={p.id} value={p.id}>{p.nomeCompleto}</option>
                    ))}
                  </select>
                </div>

                {/* Service */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Serviço *</label>
                  <select
                    value={form.servicoId}
                    onChange={e => setForm(f => ({ ...f, servicoId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Selecione o serviço...</option>
                    {servicos.filter(s => s.ativo).map(s => (
                      <option key={s.id} value={s.id}>{s.nome} — {formatCurrency(s.valorPadrao)} ({s.duracaoMinutos}min)</option>
                    ))}
                  </select>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Data *</label>
                    <input
                      type="date"
                      value={form.dataAgendada}
                      onChange={e => setForm(f => ({ ...f, dataAgendada: e.target.value }))}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Horário *</label>
                    <input
                      type="time"
                      value={form.horaInicio}
                      onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Duration preview */}
                {form.servicoId && (
                  <div className="bg-primary/5 rounded-xl p-3 flex items-center gap-2">
                    <Clock size={16} className="text-primary shrink-0" />
                    <span className="text-sm text-slate-700">
                      Término previsto: <strong className="text-primary">
                        {addMinutes(form.horaInicio, servicos.find(s => s.id === form.servicoId)?.duracaoMinutos ?? 45)}
                      </strong>
                    </span>
                  </div>
                )}

                {/* Observations */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Observações</label>
                  <textarea
                    value={form.observacoes}
                    onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                    placeholder="Informações adicionais..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <span className="text-sm text-red-600">{formError}</span>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveAgendamento}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                >
                  Confirmar Agendamento
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Detail Bottom Sheet ─── */}
      <AnimatePresence>
        {selectedAgendamento && (
          <AgendamentoDetail
            agendamento={selectedAgendamento}
            paciente={selectedAgPaciente}
            servico={selectedAgProcedimento}
            onClose={() => setSelectedAgendamento(null)}
            onStatusChange={(status) => {
              onUpdateStatus(selectedAgendamento.id, status);
              setSelectedAgendamento(null);
            }}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
