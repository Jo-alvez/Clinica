import React, { useState, useMemo } from 'react';
import {
  Search, Plus, ChevronRight, User, Phone, Mail,
  Calendar, AlertCircle, ArrowLeft, Edit3, Check,
  X, FileText, Activity, Clock, Footprints, Bandage,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate, calcAge } from '../utils';
import { AppUser, Paciente, Anamnese, Atendimento, Agendamento, Servico } from '../types';
import { can } from '../permissions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PatientsPageProps {
  currentUser: AppUser;
  pacientes: Paciente[];
  anamneses: Anamnese[];
  atendimentos: Atendimento[];
  agendamentos: Agendamento[];
  servicos: Servico[];
  onAddPaciente: (p: Paciente) => void;
  onUpdatePaciente: (p: Paciente) => void;
  onAddAnamnese: (a: Anamnese) => void;
  onUpdateAnamnese: (a: Anamnese) => void;
}

// ─── New Patient Form ─────────────────────────────────────────────────────────

const EMPTY_PATIENT_FORM = {
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  sexo: '' as '' | 'M' | 'F' | 'O',
  telefone: '',
  email: '',
  endereco: '',
  cidade: '',
  estado: '',
  observacoesGerais: '',
};

const NovoPacienteModal: React.FC<{
  onClose: () => void;
  onSave: (p: Paciente) => void;
}> = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ ...EMPTY_PATIENT_FORM });
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (!form.nomeCompleto.trim()) { setError('Nome completo é obrigatório.'); return; }
    if (!form.telefone.trim()) { setError('Telefone é obrigatório.'); return; }

    const now = new Date().toISOString();
    const novoPaciente: Paciente = {
      id: `p_${Date.now()}`,
      nomeCompleto: form.nomeCompleto.trim(),
      cpf: form.cpf || undefined,
      dataNascimento: form.dataNascimento || undefined,
      sexo: form.sexo || undefined,
      telefone: form.telefone.trim(),
      email: form.email || undefined,
      endereco: form.endereco || undefined,
      cidade: form.cidade || undefined,
      estado: form.estado || undefined,
      observacoesGerais: form.observacoesGerais || undefined,
      ativo: true,
      criadoEm: now,
      atualizadoEm: now,
    };
    onSave(novoPaciente);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end"
      style={{ maxWidth: '448px', margin: '0 auto', left: 0, right: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full bg-white rounded-t-2xl z-10 pb-8 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Novo Paciente</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={20} className="text-slate-500" /></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          {[
            { key: 'nomeCompleto', label: 'Nome Completo *', placeholder: 'Nome completo do paciente' },
            { key: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
            { key: 'telefone', label: 'Telefone *', placeholder: '(00) 00000-0000' },
            { key: 'email', label: 'E-mail', placeholder: 'email@exemplo.com' },
            { key: 'dataNascimento', label: 'Data de Nascimento', placeholder: '', type: 'date' },
            { key: 'endereco', label: 'Endereço', placeholder: 'Rua, número, bairro' },
            { key: 'cidade', label: 'Cidade', placeholder: 'Cidade' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">{label}</label>
              <input
                type={type ?? 'text'}
                value={form[key as keyof typeof form] as string}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Sexo</label>
            <div className="flex gap-2">
              {[{ v: 'F', l: 'Feminino' }, { v: 'M', l: 'Masculino' }, { v: 'O', l: 'Outro' }].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setForm(f => ({ ...f, sexo: v as 'M' | 'F' | 'O' }))}
                  className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors',
                    form.sexo === v ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200'
                  )}
                >{l}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Observações Gerais</label>
            <textarea
              value={form.observacoesGerais}
              onChange={e => setForm(f => ({ ...f, observacoesGerais: e.target.value }))}
              placeholder="Informações relevantes sobre o paciente..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-primary resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
            Cadastrar Paciente
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Anamnese Tab ─────────────────────────────────────────────────────────────

const AnamneseTab: React.FC<{
  pacienteId: string;
  anamneses: Anamnese[];
  currentUser: AppUser;
  onSave: (a: Anamnese) => void;
}> = ({ pacienteId, anamneses, currentUser, onSave }) => {
  const existing = anamneses.find(a => a.pacienteId === pacienteId);
  const canEdit = can(currentUser.role, 'anamnese.edit');

  const EMPTY: Omit<Anamnese, 'id' | 'pacienteId' | 'criadoEm' | 'atualizadoEm'> = {
    diabetico: false, hipertenso: false, gestante: false,
    problemasCirculatorios: false, neuropatia: false,
    alergias: '', medicamentosEmUso: '',
    historicoMicose: false, historicoUnhaEncravada: false, historicoFissuras: false,
    dorAoAndar: false, sensibilidadeAlterada: false, observacoesClincias: '',
  };

  const [editing, setEditing] = useState(!existing);
  const [form, setForm] = useState(existing ? {
    diabetico: existing.diabetico, hipertenso: existing.hipertenso,
    gestante: existing.gestante, problemasCirculatorios: existing.problemasCirculatorios,
    neuropatia: existing.neuropatia, alergias: existing.alergias,
    medicamentosEmUso: existing.medicamentosEmUso, historicoMicose: existing.historicoMicose,
    historicoUnhaEncravada: existing.historicoUnhaEncravada, historicoFissuras: existing.historicoFissuras,
    dorAoAndar: existing.dorAoAndar, sensibilidadeAlterada: existing.sensibilidadeAlterada,
    observacoesClincias: existing.observacoesClincias,
  } : { ...EMPTY });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof form) => {
    if (!editing || !canEdit) return;
    setForm(f => ({ ...f, [key]: !f[key] }));
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const a: Anamnese = {
      id: existing?.id ?? `anam_${Date.now()}`,
      pacienteId,
      ...form,
      criadoEm: existing?.criadoEm ?? now,
      atualizadoEm: now,
    };
    onSave(a);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const boolFields: { key: keyof typeof form; label: string }[] = [
    { key: 'diabetico', label: 'Diabético(a)' },
    { key: 'hipertenso', label: 'Hipertenso(a)' },
    { key: 'gestante', label: 'Gestante' },
    { key: 'problemasCirculatorios', label: 'Problemas Circulatórios' },
    { key: 'neuropatia', label: 'Neuropatia' },
    { key: 'historicoMicose', label: 'Histórico de Micose' },
    { key: 'historicoUnhaEncravada', label: 'Histórico de Unha Encravada' },
    { key: 'historicoFissuras', label: 'Histórico de Fissuras' },
    { key: 'dorAoAndar', label: 'Dor ao Andar' },
    { key: 'sensibilidadeAlterada', label: 'Sensibilidade Alterada' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Anamnese Podológica</h3>
        {canEdit && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-primary text-sm font-semibold">
            <Edit3 size={14} /> Editar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {boolFields.map(({ key, label }) => {
          const val = form[key as keyof typeof form] as boolean;
          return (
            <button
              key={key}
              onClick={() => toggle(key as keyof typeof form)}
              disabled={!editing || !canEdit}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl border text-left text-sm font-medium transition-colors',
                val ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-50 border-slate-100 text-slate-500',
                editing && canEdit ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                val ? 'border-primary bg-primary' : 'border-slate-300'
              )}>
                {val && <Check size={10} className="text-white" />}
              </div>
              {label}
            </button>
          );
        })}
      </div>

      {[
        { key: 'alergias', label: 'Alergias' },
        { key: 'medicamentosEmUso', label: 'Medicamentos em Uso' },
        { key: 'observacoesClincias', label: 'Observações Clínicas' },
      ].map(({ key, label }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">{label}</label>
          <textarea
            value={form[key as keyof typeof form] as string}
            onChange={e => editing && canEdit && setForm(f => ({ ...f, [key]: e.target.value }))}
            readOnly={!editing || !canEdit}
            placeholder={`${label}...`}
            rows={2}
            className={cn('w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none',
              editing && canEdit
                ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-primary'
                : 'border-transparent bg-slate-50 text-slate-700'
            )}
          />
        </div>
      ))}

      {editing && canEdit && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className={cn('w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2',
            saved ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'
          )}
        >
          {saved ? <><Check size={20} /> Salvo!</> : 'Salvar Anamnese'}
        </motion.button>
      )}

      {!existing && !editing && (
        <div className="text-center py-8 text-slate-400">
          <FileText size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Anamnese não preenchida</p>
        </div>
      )}
    </div>
  );
};

// ─── Patient Profile ──────────────────────────────────────────────────────────

const PatientProfile: React.FC<{
  paciente: Paciente;
  anamneses: Anamnese[];
  atendimentos: Atendimento[];
  agendamentos: Agendamento[];
  servicos: Servico[];
  currentUser: AppUser;
  onBack: () => void;
  onSaveAnamnese: (a: Anamnese) => void;
}> = ({ paciente, anamneses, atendimentos, agendamentos, servicos, currentUser, onBack, onSaveAnamnese }) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'anamnese' | 'historico'>('dados');

  const patientAtendimentos = atendimentos
    .filter(a => a.pacienteId === paciente.id)
    .sort((a, b) => b.dataAtendimento.localeCompare(a.dataAtendimento));

  const patientAgendamentos = agendamentos
    .filter(a => a.pacienteId === paciente.id)
    .sort((a, b) => b.dataAgendada.localeCompare(a.dataAgendada))
    .slice(0, 5);

  const tabs = [
    { id: 'dados', label: 'Dados' },
    { id: 'anamnese', label: 'Anamnese' },
    { id: 'historico', label: 'Histórico' },
  ] as const;

  const SEXO_LABEL = { M: 'Masculino', F: 'Feminino', O: 'Outro' };

  return (
    <div className="flex-1 flex flex-col pb-4 bg-slate-50">
      {/* Header */}
      <header className="bg-white px-4 pt-5 pb-0 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-900 truncate">{paciente.nomeCompleto}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {paciente.dataNascimento ? `${calcAge(paciente.dataNascimento)} · ` : ''}
              {paciente.sexo ? SEXO_LABEL[paciente.sexo] : ''}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-slate-100 -mx-4 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-3 text-sm font-semibold border-b-2 transition-colors',
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* ── Dados ── */}
            {activeTab === 'dados' && (
              <div className="space-y-4">
                {/* Contact card */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contato</h3>
                  {paciente.telefone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-primary shrink-0" />
                      <span className="text-sm text-slate-700">{paciente.telefone}</span>
                    </div>
                  )}
                  {paciente.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-primary shrink-0" />
                      <span className="text-sm text-slate-700">{paciente.email}</span>
                    </div>
                  )}
                  {paciente.cpf && (
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700">CPF: {paciente.cpf}</span>
                    </div>
                  )}
                  {paciente.dataNascimento && (
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700">
                        {formatDate(paciente.dataNascimento)} · {calcAge(paciente.dataNascimento)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Address */}
                {(paciente.endereco || paciente.cidade) && (
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Endereço</h3>
                    {paciente.endereco && <p className="text-sm text-slate-700">{paciente.endereco}</p>}
                    {paciente.cidade && (
                      <p className="text-sm text-slate-500">{paciente.cidade}{paciente.estado ? ` - ${paciente.estado}` : ''}</p>
                    )}
                  </div>
                )}

                {/* Obs */}
                {paciente.observacoesGerais && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">⚠ Observações</h3>
                    <p className="text-sm text-slate-700">{paciente.observacoesGerais}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{patientAtendimentos.length}</p>
                    <p className="text-xs text-slate-400 mt-1">Atendimentos</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{patientAgendamentos.length}</p>
                    <p className="text-xs text-slate-400 mt-1">Agendamentos</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Anamnese ── */}
            {activeTab === 'anamnese' && (
              <AnamneseTab
                pacienteId={paciente.id}
                anamneses={anamneses}
                currentUser={currentUser}
                onSave={onSaveAnamnese}
              />
            )}

            {/* ── Histórico ── */}
            {activeTab === 'historico' && (
              <div className="space-y-3">
                {patientAtendimentos.length === 0 && patientAgendamentos.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Activity size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">Nenhum histórico ainda</p>
                  </div>
                )}

                {patientAtendimentos.map(at => {
                  const servico = servicos.find(s => s.id === at.servicoId);
                  return (
                    <div key={at.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-bold text-slate-900">{servico?.nome ?? '—'}</span>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                          at.status === 'FINALIZADO' ? 'bg-emerald-100 text-emerald-700' :
                          at.status === 'CANCELADO' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-700'
                        )}>
                          {at.status === 'FINALIZADO' ? 'Finalizado' : at.status === 'CANCELADO' ? 'Cancelado' : 'Em Andamento'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                        <Calendar size={12} />
                        <span>{formatDate(at.dataAtendimento)}</span>
                        <Clock size={12} />
                        <span>{at.horaInicio}</span>
                      </div>
                      {at.queixaPrincipal && (
                        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 mt-2">{at.queixaPrincipal}</p>
                      )}
                      {at.orientacoesPaciente && (
                        <p className="text-xs text-primary mt-2 font-medium">✓ {at.orientacoesPaciente}</p>
                      )}
                    </div>
                  );
                })}

                {/* Upcoming appointments */}
                {patientAgendamentos.filter(a => a.status !== 'FINALIZADO' && a.status !== 'CANCELADO').length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Próximos Agendamentos</p>
                    {patientAgendamentos
                      .filter(a => a.status !== 'FINALIZADO' && a.status !== 'CANCELADO')
                      .map(ag => {
                        const servico = servicos.find(s => s.id === ag.servicoId);
                        return (
                          <div key={ag.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                              <Calendar size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{servico?.nome ?? '—'}</p>
                              <p className="text-xs text-slate-400">{formatDate(ag.dataAgendada)} · {ag.horaInicio}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Patient List ─────────────────────────────────────────────────────────────

export const PatientsPage: React.FC<PatientsPageProps> = ({
  currentUser, pacientes, anamneses, atendimentos, agendamentos, servicos,
  onAddPaciente, onUpdatePaciente, onAddAnamnese, onUpdateAnamnese,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [showModal, setShowModal] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);

  const canCreate = can(currentUser.role, 'paciente.create');

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return pacientes
      .filter(p => {
        if (filter === 'ativos' && !p.ativo) return false;
        if (filter === 'inativos' && p.ativo) return false;
        if (!term) return true;
        return (
          p.nomeCompleto.toLowerCase().includes(term) ||
          (p.cpf ?? '').includes(term) ||
          (p.telefone ?? '').includes(term)
        );
      })
      .sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));
  }, [pacientes, search, filter]);

  // If patient is selected, show their profile
  if (selectedPacienteId) {
    const paciente = pacientes.find(p => p.id === selectedPacienteId);
    if (!paciente) {
      setSelectedPacienteId(null);
      return null;
    }

    const handleSaveAnamnese = (a: Anamnese) => {
      const exists = anamneses.find(x => x.pacienteId === a.pacienteId);
      if (exists) onUpdateAnamnese(a);
      else onAddAnamnese(a);
    };

    return (
      <PatientProfile
        paciente={paciente}
        anamneses={anamneses}
        atendimentos={atendimentos}
        agendamentos={agendamentos}
        servicos={servicos}
        currentUser={currentUser}
        onBack={() => setSelectedPacienteId(null)}
        onSaveAnamnese={handleSaveAnamnese}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-4 bg-slate-50">
      {/* Header */}
      <header className="bg-white px-4 pt-5 pb-3 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pacientes</h1>
            <p className="text-xs text-slate-400 mt-0.5">{pacientes.filter(p => p.ativo).length} pacientes ativos</p>
          </div>
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

        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white border border-transparent focus:border-primary transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {([['todos', 'Todos'], ['ativos', 'Ativos'], ['inativos', 'Inativos']] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                filter === v ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
              )}
            >{l}</button>
          ))}
        </div>
      </header>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <User size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">
              {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </p>
            {!search && canCreate && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md"
              >
                + Cadastrar Paciente
              </button>
            )}
          </div>
        )}

        <AnimatePresence>
          {filtered.map(paciente => {
            const lastAt = atendimentos
              .filter(a => a.pacienteId === paciente.id && a.status === 'FINALIZADO')
              .sort((a, b) => b.dataAtendimento.localeCompare(a.dataAtendimento))[0];
            const nextAg = agendamentos
              .filter(a => a.pacienteId === paciente.id && !['CANCELADO','FINALIZADO'].includes(a.status))
              .sort((a, b) => a.dataAgendada.localeCompare(b.dataAgendada))[0];
            const hasAnamnese = anamneses.some(a => a.pacienteId === paciente.id);

            return (
              <motion.div
                key={paciente.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                onClick={() => setSelectedPacienteId(paciente.id)}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {paciente.nomeCompleto.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-900 truncate text-sm">{paciente.nomeCompleto}</p>
                      {!hasAnamnese && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded shrink-0">SEM ANAM.</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-500">{paciente.telefone}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      {lastAt && (
                        <span className="text-[10px] text-slate-400">
                          Último: {formatDate(lastAt.dataAtendimento)}
                        </span>
                      )}
                      {nextAg && (
                        <span className="text-[10px] text-primary font-semibold">
                          Próx: {formatDate(nextAg.dataAgendada)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* New Patient Modal */}
      <AnimatePresence>
        {showModal && (
          <NovoPacienteModal
            onClose={() => setShowModal(false)}
            onSave={onAddPaciente}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
