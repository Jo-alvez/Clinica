import React from 'react';
import { Package, CheckCircle2, Circle, Calendar, ArrowRight, Plus, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { PacotePaciente, Paciente, Pacote, Procedimento } from '../../types';
import { cn } from '../../utils';

interface Props {
  paciente: Paciente;
  pacotesContratados: PacotePaciente[];
  pacotesDisponiveis: Pacote[];
  procedimentos: Procedimento[];
  onAddPacote?: () => void;
  onUseSessao?: (pacoteId: string) => void;
}

export const PacotesTab: React.FC<Props> = ({ 
  paciente, 
  pacotesContratados = [], 
  pacotesDisponiveis = [],
  procedimentos,
  onAddPacote,
  onUseSessao
}) => {
  
  const getProcedimentoNome = (pacoteId: string) => {
    const pacote = pacotesDisponiveis.find(p => p.id === pacoteId);
    if (!pacote) return 'Procedimento';
    const proc = procedimentos.find(pr => pr.id === pacote.procedimentoPrincipalId);
    return proc?.nome || pacote.nome;
  };

  const getPacoteNome = (pacoteId: string) => {
    return pacotesDisponiveis.find(p => p.id === pacoteId)?.nome || 'Pacote de Tratamento';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Meus Pacotes</h2>
          <p className="text-sm text-slate-500">Controle de sessões e validade de pacotes contratados.</p>
        </div>
        <button 
          onClick={onAddPacote}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} /> Novo Pacote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pacotesContratados.length > 0 ? (
          pacotesContratados.map((pp) => {
            const percent = (pp.sessoesUtilizadas / pp.sessoesContratadas) * 100;
            const isFinished = pp.status === 'CONCLUIDO' || pp.sessoesUtilizadas >= pp.sessoesContratadas;

            return (
              <motion.div 
                key={pp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Progress bar background */}
                <div className="absolute top-0 left-0 h-1 bg-slate-100 w-full" />
                <div 
                  className={cn(
                    "absolute top-0 left-0 h-1 transition-all duration-1000",
                    isFinished ? "bg-emerald-500" : "bg-primary"
                  )} 
                  style={{ width: `${percent}%` }} 
                />

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-xl",
                      isFinished ? "bg-emerald-50 text-emerald-500" : "bg-primary/10 text-primary"
                    )}>
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{getPacoteNome(pp.pacoteId)}</h4>
                      <p className="text-xs text-slate-500 font-medium">{getProcedimentoNome(pp.pacoteId)}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    pp.status === 'ATIVO' ? "bg-emerald-100 text-emerald-600" : 
                    pp.status === 'CONCLUIDO' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {pp.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sessões</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">{pp.sessoesUtilizadas}</span>
                        <span className="text-slate-400 font-bold">/ {pp.sessoesContratadas}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Validade</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(pp.dataValidade).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  {/* Sesssion bubbles */}
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: pp.sessoesContratadas }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-3 h-3 rounded-full transition-all duration-500",
                          i < pp.sessoesUtilizadas 
                            ? "bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.4)]" 
                            : "bg-slate-100"
                        )}
                      />
                    ))}
                  </div>

                  {!isFinished && (
                    <button 
                      onClick={() => onUseSessao?.(pp.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-primary/5 text-slate-600 hover:text-primary rounded-xl text-sm font-bold transition-all border border-slate-100 hover:border-primary/20"
                    >
                      <RefreshCcw size={16} /> Registrar Consumo de Sessão
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Package size={48} className="mb-4 opacity-20" />
            <p className="font-bold">Nenhum pacote contratado</p>
            <p className="text-xs mb-6">Este paciente ainda não possui pacotes de procedimentos.</p>
            <button 
              onClick={onAddPacote}
              className="px-6 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-primary hover:text-white hover:border-primary transition-all"
            >
              Vender Primeiro Pacote
            </button>
          </div>
        )}
      </div>

      {pacotesDisponiveis.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Opções Sugeridas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pacotesDisponiveis.map(p => (
              <div key={p.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary/30 transition-all">
                <div>
                  <p className="font-bold text-slate-800">{p.nome}</p>
                  <p className="text-xs text-slate-500">{p.numeroSessoes} Sessões • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valorTotal)}</p>
                </div>
                <button className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
