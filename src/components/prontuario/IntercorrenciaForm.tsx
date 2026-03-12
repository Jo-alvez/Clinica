import React, { useState } from 'react';
import { Save, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { Intercorrencia, Paciente, Sessao, Procedimento } from '../../types';
import { cn } from '../../utils';

interface Props {
  paciente: Paciente;
  sessoes: Sessao[];
  procedimentos: Procedimento[];
  intercorrencia?: Intercorrencia;
  onSave: (data: Intercorrencia) => void;
}

export const IntercorrenciaForm: React.FC<Props> = ({ paciente, sessoes, procedimentos, intercorrencia, onSave }) => {
  const [form, setForm] = useState<Partial<Intercorrencia>>(intercorrencia || {
    pacienteId: paciente.id,
    status: 'EM_TRATAMENTO',
    tipo: 'OUTROS',
    dataOcorrencia: new Date().toISOString().split('T')[0],
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      ...form,
      id: form.id || `inc_${Date.now()}`,
      pacienteId: paciente.id,
      criadoEm: form.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    } as Intercorrencia);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const typesMap: Record<Intercorrencia['tipo'], string> = {
    HEMATOMA: 'Hematoma',
    EDEMA: 'Edema Exagerado',
    ASSIMETRIA: 'Assimetria',
    ALERGIA: 'Reação Alérgica',
    NECROSE: 'Necrose Tecidual (CRÍTICO)',
    INFECCAO: 'Infecção Local',
    OUTROS: 'Outra Intercorrência',
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider">Registo de Intercorrência</h3>
          <p className="text-xs text-red-600">Documente detalhadamente para acompanhamento clínico.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Tipo de Intercorrência</label>
            <select 
              value={form.tipo || 'OUTROS'} 
              onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-red-500 outline-none transition-all"
            >
              {Object.entries(typesMap).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Data da Ocorrência</label>
            <input 
              type="date"
              value={form.dataOcorrencia || ''}
              onChange={(e) => setForm({ ...form, dataOcorrencia: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Status Atual</label>
            <div className="flex gap-2">
              <button
                onClick={() => setForm({ ...form, status: 'EM_TRATAMENTO' })}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                  form.status === 'EM_TRATAMENTO' ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-200 text-slate-500"
                )}
              >
                Em Tratamento
              </button>
              <button
                onClick={() => setForm({ ...form, status: 'RESOLVIDA' })}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                  form.status === 'RESOLVIDA' ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-500"
                )}
              >
                Resolvida
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Sessão Relacionada</label>
            <select 
              value={form.sessaoId || ''} 
              onChange={(e) => {
                const sid = e.target.value;
                const s = sessoes.find(x => x.id === sid);
                setForm({ ...form, sessaoId: sid, procedimentoId: s?.procedimentoId });
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-primary outline-none"
            >
              <option value="">Nenhuma ou nova...</option>
              {sessoes.map(s => (
                <option key={s.id} value={s.id}>{s.dataSessao} - {procedimentos.find(p => p.id === s.procedimentoId)?.nome}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Medicações Prescritas / Conduta Inicial</label>
            <textarea 
              value={form.medicacoesPrescritas || ''}
              onChange={(e) => setForm({ ...form, medicacoesPrescritas: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-red-500 h-24 outline-none resize-none"
              placeholder="Ex: Hirudoid 4x dia, compressa fria..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Descrição Detalhada</label>
        <textarea 
          value={form.descricao || ''}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:border-red-500 min-h-[100px] outline-none"
          placeholder="Descreva visualmente o que ocorreu..."
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Conduta & Evolução do Caso</label>
        <textarea 
          value={form.condutaAdotada || ''}
          onChange={(e) => setForm({ ...form, condutaAdotada: e.target.value })}
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:border-emerald-500 min-h-[100px] outline-none"
          placeholder="Descreva as medidas tomadas e como o paciente está reagindo..."
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className={cn(
          "w-full py-4 mt-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
          saved ? "bg-emerald-500 text-white" : "bg-red-500 text-white shadow-red-500/20"
        )}
      >
        {saved ? <><Check size={20} /> Registrado!</> : <><AlertTriangle size={20} /> Salvar Registo de Intercorrência</>}
      </motion.button>
    </div>
  );
};
