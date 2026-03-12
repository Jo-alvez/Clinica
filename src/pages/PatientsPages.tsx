import React, { useState, useMemo } from 'react';
import {
  Search, Plus, ChevronRight, User, Phone, Mail,
  Calendar, AlertCircle, ArrowLeft, Edit3, Check,
  X, FileText, Activity, Clock, Footprints, Bandage,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate, calcAge } from '../utils';
import { AppUser, Paciente, AnamneseEstetica, Sessao, Agendamento, Procedimento, FotoClinica, Consentimento, Pacote, PacotePaciente, AplicacaoToxina, ClinicaModulo } from '../types';
import { can } from '../permissions';
import { ProntuarioEsteticoTab } from '../components/prontuario/ProntuarioEsteticoTab';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PatientsPageProps {
  currentUser: AppUser;
  pacientes: Paciente[];
  anamneses: AnamneseEstetica[];
  atendimentos: Sessao[];
  agendamentos: Agendamento[];
  servicos: Procedimento[];
  fotos: FotoClinica[];
  profissionais: AppUser[];
  onAddPaciente: (p: Paciente) => void;
  onUpdatePaciente: (p: Paciente) => void;
  onAddAnamneseEstetica: (a: AnamneseEstetica) => void;
  onUpdateAnamneseEstetica: (a: AnamneseEstetica) => void;
  onUpdateSessao: (s: Sessao) => void;
  onAddSessao: (s: Sessao) => void;
  onAddConsentimento: (c: Consentimento) => void;
  onAddFoto: (f: FotoClinica) => void;
  onRemoveFoto: (id: string) => void;
  pacotesContratados?: PacotePaciente[];
  pacotesDisponiveis?: Pacote[];
  aplicacoesToxina?: AplicacaoToxina[];
  onUseSessaoPacote?: (id: string) => void;
  onSaveToxina?: (data: AplicacaoToxina[]) => void;
  consentimentos?: Consentimento[];
  selectedPacienteId?: string | null;
  onSelectPacienteId?: (id: string | null) => void;
  installedModules?: ClinicaModulo[];
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

// ─── Patient List ─────────────────────────────────────────────────────────────

export const PatientsPage: React.FC<PatientsPageProps> = ({
  currentUser, pacientes, anamneses, atendimentos, agendamentos, servicos, fotos, profissionais,
  onAddPaciente, onUpdatePaciente, onAddAnamneseEstetica, onUpdateAnamneseEstetica, onUpdateSessao,
  onAddSessao,
  onAddConsentimento,
  onAddFoto,
  onRemoveFoto,
  pacotesContratados = [],
  pacotesDisponiveis = [],
  aplicacoesToxina = [],
  onUseSessaoPacote,
  onSaveToxina,
  consentimentos = [],
  selectedPacienteId: propSelectedPacienteId,
  onSelectPacienteId: propOnSelectPacienteId,
  installedModules = []
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [showModal, setShowModal] = useState(false);
  const [localSelectedPacienteId, setLocalSelectedId] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<any>('ANAMNESE');

  const selectedPacienteId = propSelectedPacienteId !== undefined ? propSelectedPacienteId : localSelectedPacienteId;
  const setSelectedPacienteId = (id: string | null) => {
    setActiveFormTab('ANAMNESE'); // Reset tab when switching patients
    if (propOnSelectPacienteId) propOnSelectPacienteId(id);
    else setLocalSelectedId(id);
  };

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

    const handleSaveAnamneseEstetica = (a: AnamneseEstetica) => {
      const exists = anamneses.find(x => x.pacienteId === a.pacienteId);
      if (exists) onUpdateAnamneseEstetica(a);
      else onAddAnamneseEstetica(a);
    };

    return (
      <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
        {/* Elegant Profile Header */}
        <div className="bg-white px-6 pt-6 pb-2 border-b border-slate-100">
          <div className="flex items-start justify-between mb-6">
            <button 
              onClick={() => setSelectedPacienteId(null)} 
              className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold text-xs uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-primary transition-all">
                <Edit3 size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 mb-6">
            <div className="relative">
              <div className="size-24 bg-primary/10 rounded-[32px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${paciente.id}/400/400`} 
                  alt={paciente.nomeCompleto} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 size-7 bg-emerald-500 border-4 border-white rounded-full shadow-lg" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{paciente.nomeCompleto}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-xs font-semibold">{calcAge(paciente.dataNascimento || '')} anos</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <User size={14} className="text-primary" />
                  <span className="text-xs font-semibold">Paciente desde {formatDate(paciente.criadoEm)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone size={14} className="text-primary" />
                  <span className="text-xs font-semibold">{paciente.telefone}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pb-2">
              <button 
                 onClick={() => {
                   const newSessao: Sessao = {
                     id: `s_${Date.now()}`,
                     pacienteId: paciente.id,
                     profissionalId: currentUser.id,
                     procedimentoId: '', 
                     dataSessao: new Date().toISOString().split('T')[0],
                     horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                     status: 'EM_ANDAMENTO',
                     criadoEm: new Date().toISOString(),
                     atualizadoEm: new Date().toISOString(),
                   };
                   onAddSessao(newSessao);
                   setActiveFormTab('EVOLUCAO');
                   
                   // Optional: scroll slightly to tab area to bring it into focus
                   setTimeout(() => {
                     window.scrollTo({ top: 400, behavior: 'smooth' });
                   }, 100);
                }}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Nova Sessão
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-8">
          <ProntuarioEsteticoTab
            paciente={paciente}
            sessoes={atendimentos.filter(s => s.pacienteId === paciente.id)}
            procedimentos={servicos}
            profissionais={profissionais}
            anamnese={anamneses.find(a => a.pacienteId === paciente.id)}
            fotos={fotos.filter(f => f.pacienteId === paciente.id)}
            onUpdateAnamnese={handleSaveAnamneseEstetica}
            onUpdateSessao={onUpdateSessao}
            onAddSessao={onAddSessao}
            onAddConsentimento={onAddConsentimento}
            onAddFoto={onAddFoto}
            onRemoveFoto={onRemoveFoto}
            pacotesContratados={pacotesContratados.filter(pp => pp.pacienteId === paciente.id)}
            pacotesDisponiveis={pacotesDisponiveis}
            aplicacoesToxina={aplicacoesToxina.filter(at => at.pacienteId === paciente.id)}
            onUseSessaoPacote={onUseSessaoPacote}
            onSaveToxina={onSaveToxina}
            consentimentos={consentimentos.filter(c => c.pacienteId === paciente.id)}
            activeTab={activeFormTab}
            onTabChange={setActiveFormTab}
            installedModules={installedModules}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-4 bg-slate-50">
      {/* Header */}
      <header className="bg-white px-4 pt-5 pb-3 border-b border-slate-100">
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
              .sort((a, b) => b.dataSessao.localeCompare(a.dataSessao))[0];
            const nextAg = agendamentos
              .filter(a => a.pacienteId === paciente.id && !['CANCELADO','FINALIZADO'].includes(a.status))
              .sort((a, b) => a.dataAgendada.localeCompare(b.dataAgendada))[0];
            const hasAnamneseEstetica = anamneses.some(a => a.pacienteId === paciente.id);

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
                      {!hasAnamneseEstetica && (
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
                          Último: {formatDate(lastAt.dataSessao)}
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
