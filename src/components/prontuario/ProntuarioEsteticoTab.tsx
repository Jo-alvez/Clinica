import React, { useState } from 'react';
import {
  User, ClipboardList, Activity, Layout,
  Map as MapIcon, History, Camera, FileText,
  AlertCircle, Briefcase, PlusCircle, ShieldCheck, Syringe, CheckCircle2, Footprints
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Paciente, Sessao, Procedimento, AppUser,
  AnamneseEstetica, AvaliacaoFacial, AvaliacaoCorporal,
  AvaliacaoVascular, PlanoTerapeutico, Intercorrencia, FotoClinica, Consentimento,
  Pacote, PacotePaciente, AplicacaoToxina, ClinicaModulo
} from '../../types';
import { cn, formatDate } from '../../utils';


// Import sub-components
import { AnamneseEsteticaForm } from './AnamneseEsteticaForm';
import { AvaliacaoFacialForm } from './AvaliacaoFacialForm';
import { AvaliacaoCorporalForm } from './AvaliacaoCorporalForm';
import { AvaliacaoVascularForm } from './AvaliacaoVascularForm';
import { PlanoTerapeuticoForm } from './PlanoTerapeuticoForm';
import { EvolucaoClinicaForm } from './EvolucaoClinicaForm';
import { IntercorrenciaForm } from './IntercorrenciaForm';
import { FotosClinicasTab } from './FotosClinicasTab';
import { MapaVisualTab } from './MapaVisualTab';
import { ConsentimentoForm } from './ConsentimentoForm';
import { ToxinaAreaTab } from './ToxinaAreaTab';
import { PacotesTab } from './PacotesTab';
import { PodologiaMapeamentoTab } from './PodologiaMapeamentoTab';
import { AvaliacaoPodologicaForm } from './AvaliacaoPodologicaForm';

interface Props {
  paciente: Paciente;
  sessoes: Sessao[];
  procedimentos: Procedimento[];
  profissionais: AppUser[];
  anamnese?: AnamneseEstetica | null;
  fotos: FotoClinica[];
  onUpdateAnamnese: (data: AnamneseEstetica) => void;
  onUpdateSessao: (data: Sessao) => void;
  onAddSessao: (data: Sessao) => void;
  onAddConsentimento: (data: Consentimento) => void;
  onAddFoto: (foto: FotoClinica) => void;
  onRemoveFoto: (id: string) => void;
  consentimentos?: Consentimento[];
  pacotesContratados?: PacotePaciente[];
  pacotesDisponiveis?: Pacote[];
  aplicacoesToxina?: AplicacaoToxina[];
  onUseSessaoPacote?: (id: string) => void;
  onSaveToxina?: (data: AplicacaoToxina[]) => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  installedModules?: ClinicaModulo[];
}

type TabType =
  | 'IDENTIFICACAO'
  | 'ANAMNESE'
  | 'AVALIACAO'
  | 'PLANO'
  | 'MAPA'
  | 'EVOLUCAO'
  | 'INTERCORRENCIA'
  | 'FOTOS'
  | 'DOCUMENTOS'
  | 'TERMO'
  | 'PACOTES'
  | 'TOXINA'
  | 'MAPEAMENTO_PE'
  | 'AVALIACAO_PODO';

export const ProntuarioEsteticoTab: React.FC<Props> = ({
  paciente,
  sessoes,
  procedimentos,
  profissionais,
  anamnese,
  fotos,
  onUpdateAnamnese,
  onUpdateSessao,
  onAddSessao,
  onAddConsentimento,
  onAddFoto,
  onRemoveFoto,
  consentimentos = [],
  pacotesContratados = [],
  pacotesDisponiveis = [],
  aplicacoesToxina = [],
  onUseSessaoPacote,
  onSaveToxina,
  activeTab: externalActiveTab,
  onTabChange,
  installedModules = []
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>('ANAMNESE');
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  
  const setActiveTab = (tab: TabType) => {
    if (onTabChange) onTabChange(tab);
    setInternalActiveTab(tab);
  };

  const [activeEvalSubTab, setActiveEvalSubTab] = useState<'FACIAL' | 'CORPORAL' | 'VASCULAR'>('FACIAL');

  // Verificar módulos instalados
  const isModuleActive = (slug: string) => installedModules.some(m => m.moduloDetails?.slug === slug && m.status === 'ativo');
  const hasEstetica = isModuleActive('estetica');
  const hasPodologia = isModuleActive('podologia');

  const baseTabs = [
    { id: 'ANAMNESE', label: 'Anamnese', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'PLANO', label: 'Plano Terapêutico', icon: Layout, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'EVOLUCAO', label: 'Evolução Clínica', icon: History, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'TERMO', label: 'Termos (TCLE)', icon: ShieldCheck, color: 'text-violet-500', bg: 'bg-violet-50' },
    { id: 'FOTOS', label: 'Fotos', icon: Camera, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'INTERCORRENCIA', label: 'Intercorrência', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'DOCUMENTOS', label: 'Docs', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  const esteticaTabs = hasEstetica ? [
    { id: 'AVALIACAO', label: 'Avaliação', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'MAPA', label: 'Mapa Visual', icon: MapIcon, color: 'text-pink-500', bg: 'bg-pink-50' },
    { id: 'PACOTES', label: 'Pacotes', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'TOXINA', label: 'Toxina', icon: Syringe, color: 'text-purple-600', bg: 'bg-purple-50' },
  ] : [];

  const podologiaTabs = hasPodologia ? [
    { id: 'MAPEAMENTO_PE', label: 'Mapa dos Pés', icon: Footprints, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'AVALIACAO_PODO', label: 'Av. Podológica', icon: ClipboardList, color: 'text-teal-600', bg: 'bg-teal-50' },
  ] : [];

  const tabs = [...baseTabs.slice(0, 1), ...esteticaTabs, ...podologiaTabs, ...baseTabs.slice(1)];

  const renderContent = () => {
    switch (activeTab) {
      case 'ANAMNESE':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <AnamneseEsteticaForm paciente={paciente} anamnese={anamnese || undefined} onSave={onUpdateAnamnese} />
          </motion.div>
        );
      case 'AVALIACAO':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
               <button
                 onClick={() => setActiveEvalSubTab('FACIAL')}
                 className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeEvalSubTab === 'FACIAL' ? "bg-white text-primary shadow-sm" : "text-slate-500")}
               >Facial</button>
               <button
                 onClick={() => setActiveEvalSubTab('CORPORAL')}
                 className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeEvalSubTab === 'CORPORAL' ? "bg-white text-primary shadow-sm" : "text-slate-500")}
               >Corporal</button>
               <button
                 onClick={() => setActiveEvalSubTab('VASCULAR')}
                 className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", activeEvalSubTab === 'VASCULAR' ? "bg-white text-primary shadow-sm" : "text-slate-500")}
               >Vascular (PEIM)</button>
            </div>
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
               {activeEvalSubTab === 'FACIAL' && <AvaliacaoFacialForm paciente={paciente} onSave={(d) => console.log('Eval Facial', d)} />}
               {activeEvalSubTab === 'CORPORAL' && <AvaliacaoCorporalForm paciente={paciente} onSave={(d) => console.log('Eval Body', d)} />}
               {activeEvalSubTab === 'VASCULAR' && <AvaliacaoVascularForm paciente={paciente} onSave={(d) => console.log('Eval Vascular', d)} />}
            </div>
          </motion.div>
        );
      case 'PLANO':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <PlanoTerapeuticoForm paciente={paciente} procedimentos={procedimentos} onSave={(d) => console.log('Plano', d)} />
          </motion.div>
        );
      case 'MAPA':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <MapaVisualTab paciente={paciente} sessoes={sessoes} procedimentos={procedimentos} />
          </motion.div>
        );
      case 'EVOLUCAO':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-bold text-slate-900">Histórico de Evolução Clínica</h3>
               <button
                 onClick={() => {
                   const newSessao: Sessao = {
                     id: `s_${Date.now()}`,
                     pacienteId: paciente.id,
                     profissionalId: profissionais[0].id, // Default to first for now
                     procedimentoId: '',
                     dataSessao: new Date().toISOString().split('T')[0],
                     horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                     status: 'EM_ANDAMENTO',
                     criadoEm: new Date().toISOString(),
                     atualizadoEm: new Date().toISOString(),
                   };
                   onAddSessao(newSessao);
                 }}
                 className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 <PlusCircle size={18} /> Nova Evolução
               </button>
            </div>
            {sessoes.length > 0 ? (
              <div className="space-y-4">
                {sessoes.map(s => (
                  <div key={s.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <EvolucaoClinicaForm
                      paciente={paciente}
                      sessao={s}
                      procedimentos={procedimentos}
                      profissionais={profissionais}
                      onSave={onUpdateSessao}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-slate-400 border border-slate-100">
                 <History size={48} className="mb-4 opacity-20" />
                 <p className="font-medium text-slate-500">Nenhuma sessão registrada</p>
                 <p className="text-xs">As sessões aparecerão aqui conforme forem realizadas.</p>
              </div>
            )}
          </motion.div>
        );
      case 'TERMO':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <ConsentimentoForm
              paciente={paciente}
              procedimentos={procedimentos}
              onSave={onAddConsentimento}
            />
          </motion.div>
        );
      case 'INTERCORRENCIA':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
             <IntercorrenciaForm paciente={paciente} sessoes={sessoes} procedimentos={procedimentos} onSave={(d) => console.log('Intercorrencia', d)} />
          </motion.div>
        );
     case 'PACOTES':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <PacotesTab 
              paciente={paciente} 
              procedimentos={procedimentos} 
              pacotesContratados={pacotesContratados} 
              pacotesDisponiveis={pacotesDisponiveis}
              onUseSessao={onUseSessaoPacote}
              onAddPacote={() => console.log('Abrir modal de venda')}
             />
          </motion.div>
        );
      case 'TOXINA':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
             <ToxinaAreaTab 
              paciente={paciente} 
              sessao={sessoes[0] || { id: 'preview', status: 'EM_ANDAMENTO', dataSessao: '', horaInicio: '', profissionalId: '', procedimentoId: '', pacienteId: paciente.id, criadoEm: '', atualizadoEm: '' }} 
              aplicacoes={aplicacoesToxina}
              onSave={onSaveToxina} 
             />
          </motion.div>
        );
      case 'MAPEAMENTO_PE':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <PodologiaMapeamentoTab paciente={paciente} onSave={(d) => console.log('Podologia Map', d)} />
          </motion.div>
        );
      case 'AVALIACAO_PODO':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
             <AvaliacaoPodologicaForm paciente={paciente} onSave={(d) => console.log('Av Podologica', d)} />
          </motion.div>
        );
      case 'FOTOS':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <FotosClinicasTab
               paciente={paciente}
               fotos={fotos}
               procedimentos={procedimentos}
               sessoes={sessoes}
               onAddFoto={onAddFoto}
               onRemoveFoto={onRemoveFoto}
             />
          </motion.div>
        );
     case 'DOCUMENTOS':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-slate-500" /> Documentos Assinados
                </h3>
                <p className="text-sm text-slate-500 mt-1">Registro legal de todos os TCLEs assinados pelo paciente.</p>
              </div>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                {consentimentos.length} documento{consentimentos.length !== 1 ? 's' : ''}
              </span>
            </div>

            {consentimentos.length > 0 ? (
              <div className="space-y-4">
                {consentimentos.map((c) => (
                  <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-start gap-5">
                    <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center shrink-0">
                      <ShieldCheck size={28} className="text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{c.modeloNome}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          Assinado em {c.assinadoEm ? new Date(c.assinadoEm).toLocaleDateString('pt-BR') : '—'}
                        </span>
                        {c.assinadoEm && (
                          <span className="text-xs font-mono text-slate-300 bg-slate-50 px-2 py-0.5 rounded">
                            HASH: {c.id.slice(-8).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{c.textoFinal.slice(0, 150)}...</p>
                    </div>
                    <a
                      href="#"
                      className="shrink-0 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all border border-slate-100"
                      onClick={(e) => e.preventDefault()}
                    >
                      Visualizar
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100">
                <ShieldCheck size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-slate-500">Nenhum documento assinado</p>
                <p className="text-xs mt-1">Os TCLEs assinados na aba "Termos" aparecerão aqui automaticamente.</p>
              </div>
            )}
          </motion.div>
        );
      default:
        return (
          <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
             <FileText size={48} className="mb-4 opacity-20" />
             <p className="font-medium text-slate-500">Módulo em Desenvolvimento</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Patient Mini-Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
               {paciente.nomeCompleto.charAt(0)}
            </div>
            <div>
               <h1 className="text-xl font-bold text-slate-900">{paciente.nomeCompleto}</h1>
               <div className="flex gap-3 text-xs text-slate-500 font-medium">
                  <span>CPF: {paciente.cpf}</span>
                  <span className="text-slate-300">•</span>
                  <span>ID: {paciente.id}</span>
               </div>
            </div>
         </div>

         <div className="hidden sm:flex gap-6">
            <div className="text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Procedimentos</p>
               <p className="text-lg font-bold text-slate-900">{sessoes.length}</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status CRM</p>
               <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[10px] font-bold mt-1">EM TRATAMENTO</span>
            </div>
         </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300",
              activeTab === tab.id
                ? `${tab.bg} ${tab.color} shadow-sm ring-1 ring-black/5`
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-50"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};
