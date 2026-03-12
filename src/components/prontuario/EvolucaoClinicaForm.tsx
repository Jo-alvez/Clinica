import React, { useState } from 'react';
import { Save, Check, Clock, User, Clipboard, Beaker } from 'lucide-react';
import { motion } from 'motion/react';
import { Sessao, Paciente, Procedimento, AppUser, Produto, FrascoToxina } from '../../types';
import { cn } from '../../utils';

interface Props {
  paciente: Paciente;
  sessao: Sessao;
  procedimentos: Procedimento[];
  profissionais: AppUser[];
  onSave: (data: Sessao) => void;
}

export const EvolucaoClinicaForm: React.FC<Props> = ({ paciente, sessao, procedimentos, profissionais, onSave }) => {
  const [form, setForm] = useState<Sessao>({
    ...sessao,
    procedimentoRealizado: sessao.procedimentoRealizado || procedimentos.find(p => p.id === sessao.procedimentoId)?.nome,
    status: sessao.status || 'EM_ANDAMENTO',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      ...form,
      atualizadoEm: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const profissional = profissionais.find(p => p.id === form.profissionalId);
  const procedimento = procedimentos.find(p => p.id === form.procedimentoId);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-primary">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Data & Hora</p>
            <p className="text-sm font-semibold text-slate-900">{form.dataSessao} às {form.horaInicio}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-primary">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Profissional</p>
            <p className="text-sm font-semibold text-slate-900">{profissional?.name || 'Não atribuído'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-primary">
            <Clipboard size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Procedimento</p>
            <p className="text-sm font-semibold text-slate-900">{procedimento?.nome || 'Não definido'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Execução</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Região Tratada</label>
            <input 
              type="text"
              value={form.regiaoTratada || ''}
              onChange={(e) => setForm({...form, regiaoTratada: e.target.value})}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-primary"
              placeholder="Ex: Terço superior da face"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Técnica Utilizada</label>
            <input 
              type="text"
              value={form.tecnica || ''}
              onChange={(e) => setForm({...form, tecnica: e.target.value})}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-primary"
              placeholder="Ex: Retroinjeção, pontos isolados..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Resposta Imediata / Intercorrências</label>
            <textarea 
              value={form.respostaImediata || ''}
              onChange={(e) => setForm({...form, respostaImediata: e.target.value})}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-primary h-20"
              placeholder="Edema, eritema, dor, sangramento..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Produtos & Unidades</h3>
          
          {/* Toxin Logic if applicable */}
          {(procedimento?.nome.toLowerCase().includes('toxina') || procedimento?.nome.toLowerCase().includes('botox')) && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Beaker size={18} />
                <span className="font-bold text-sm">Controle de Toxina</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Total de Unidades Aplicadas</label>
                <input 
                  type="number"
                  value={form.totalUnidadesAplicadas || ''}
                  onChange={(e) => setForm({...form, totalUnidadesAplicadas: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-primary"
                  placeholder="Ex: 50"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">O detalhamento por área pode ser feito no Mapa Facial.</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Insumos Utilizados (Ampolas/Seringas)</label>
            <input 
              type="text"
              value={form.insumosUtilizados || ''}
              onChange={(e) => setForm({...form, insumosUtilizados: e.target.value})}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-primary"
              placeholder="Ex: 1 ampola 1ml, 2 agulhas 30G..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Orientações Pós-Procedimento</label>
            <textarea 
              value={form.orientacoesPaciente || ''}
              onChange={(e) => setForm({...form, orientacoesPaciente: e.target.value})}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-primary h-20"
              placeholder="O que o paciente deve ou não fazer..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Evolução Clínica Detalhada</label>
        <textarea 
          value={form.observacoes || ''}
          onChange={(e) => setForm({...form, observacoes: e.target.value})}
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-primary min-h-[120px]"
          placeholder="Descreva detalhadamente como foi a sessão, comportamento do paciente e condutas futuras..."
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="flex gap-2">
          <button
            onClick={() => setForm({...form, status: 'FINALIZADO'})}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold border transition-all",
              form.status === 'FINALIZADO' ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-500"
            )}
          >
            Finalizar Sessão
          </button>
          <button
            onClick={() => setForm({...form, status: 'CANCELADO'})}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold border transition-all",
              form.status === 'CANCELADO' ? "bg-red-500 border-red-500 text-white" : "bg-white border-slate-200 text-slate-500"
            )}
          >
            Cancelar
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className={cn(
            "px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg min-w-[200px]",
            saved ? "bg-emerald-500 text-white" : "bg-primary text-white shadow-primary/20"
          )}
        >
          {saved ? <><Check size={20} /> Salvo!</> : <><Save size={20} /> Salvar Evolução</>}
        </motion.button>
      </div>
    </div>
  );
};
