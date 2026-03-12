import React, { useState, useEffect } from 'react';
import { Save, Check, Plus, Trash2, Calculator, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlanoTerapeutico, Paciente, Procedimento, ProcedimentoNoPlano } from '../../types';
import { cn } from '../../utils';

interface Props {
  paciente: Paciente;
  procedimentos: Procedimento[];
  plano?: PlanoTerapeutico;
  onSave: (data: PlanoTerapeutico) => void;
}

export const PlanoTerapeuticoForm: React.FC<Props> = ({ paciente, procedimentos, plano, onSave }) => {
  const [form, setForm] = useState<PlanoTerapeutico>(plano || {
    id: `plt_${Date.now()}`,
    pacienteId: paciente.id,
    objetivosTratamento: '',
    itens: [],
    valorTotalBruto: 0,
    desconto: 0,
    valorFinal: 0,
    status: 'EM_ELABORACAO',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  });

  const [saved, setSaved] = useState(false);

  // Recalculate totals when itens or discount change
  useEffect(() => {
    const bruto = form.itens.reduce((acc, item) => acc + item.valorTotal, 0);
    const final = bruto - form.desconto;
    if (bruto !== form.valorTotalBruto || final !== form.valorFinal) {
      setForm(prev => ({ ...prev, valorTotalBruto: bruto, valorFinal: final }));
    }
  }, [form.itens, form.desconto]);

  const handleSave = () => {
    onSave({
      ...form,
      atualizadoEm: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addItem = (procId: string) => {
    const proc = procedimentos.find(p => p.id === procId);
    if (!proc) return;

    const newItem: ProcedimentoNoPlano = {
      procedimentoId: proc.id,
      nome: proc.nome,
      sessoes: proc.sessoesMedias || 1,
      valorUnitario: proc.valorPadrao || 0,
      valorTotal: (proc.sessoesMedias || 1) * (proc.valorPadrao || 0),
    };

    setForm({ ...form, itens: [...form.itens, newItem] });
  };

  const removeItem = (index: number) => {
    const newItems = [...form.itens];
    newItems.splice(index, 1);
    setForm({ ...form, itens: newItems });
  };

  const updateItem = (index: number, updates: Partial<ProcedimentoNoPlano>) => {
    const newItems = [...form.itens];
    const item = { ...newItems[index], ...updates };
    item.valorTotal = item.sessoes * item.valorUnitario;
    newItems[index] = item;
    setForm({ ...form, itens: newItems });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
           <Info size={16} className="text-primary" /> Objetivo Clínico
        </h3>
        <textarea
          value={form.objetivosTratamento || ''}
          onChange={(e) => setForm({ ...form, objetivosTratamento: e.target.value })}
          className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-100 bg-slate-50 focus:border-primary focus:bg-white outline-none h-24 transition-all"
          placeholder="Ex: Rejuvenescimento facial completo com foco em flacidez e rugas dinâmicas..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Procedimentos Planejados</h3>
          <div className="relative group">
             <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-all">
                <Plus size={14} /> Adicionar
             </button>
             <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 p-2 space-y-1">
                {procedimentos.filter(p => !form.itens.some(i => i.procedimentoId === p.id)).map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => addItem(p.id)}
                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 rounded-lg text-slate-600 truncate"
                  >
                    {p.nome}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {form.itens.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4"
              >
                <div className="flex-1 w-full">
                  <p className="text-sm font-bold text-slate-800">{item.nome}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Procedimento Selecionado</p>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="text-center shrink-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Sessões</p>
                    <div className="flex items-center gap-2">
                       <input 
                        type="number" 
                        value={item.sessoes}
                        onChange={(e) => updateItem(index, { sessoes: parseInt(e.target.value) || 0 })}
                        className="w-12 px-2 py-1 text-xs font-bold text-center border border-slate-100 rounded-lg bg-slate-50 outline-none"
                       />
                    </div>
                  </div>

                  <div className="text-center shrink-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Valor Unit.</p>
                    <input 
                        type="number" 
                        value={item.valorUnitario}
                        onChange={(e) => updateItem(index, { valorUnitario: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 text-xs font-bold text-center border border-slate-100 rounded-lg bg-slate-50 outline-none"
                    />
                  </div>

                  <div className="text-right shrink-0 min-w-[80px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total</p>
                    <p className="text-sm font-bold text-primary">R$ {item.valorTotal}</p>
                  </div>

                  <button 
                    onClick={() => removeItem(index)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {form.itens.length === 0 && (
            <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-slate-400">
               <Plus size={32} className="opacity-20 mb-2" />
               <p className="text-xs font-bold uppercase tracking-widest">Nenhum procedimento no plano</p>
               <p className="text-[10px] mt-1">Comece adicionando procedimentos acima</p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary card */}
      <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
         <div className="space-y-6 flex-1 w-full md:w-auto">
            <div className="flex items-center gap-3">
               <Calculator size={24} className="text-primary" />
               <h3 className="text-lg font-bold">Resumo do Orçamento</h3>
            </div>
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Subtotal Bruto</p>
                  <p className="text-xl font-bold">R$ {form.valorTotalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Desconto Aplicado</p>
                  <input 
                    type="number" 
                    value={form.desconto || ''}
                    onChange={(e) => setForm({...form, desconto: parseFloat(e.target.value) || 0})}
                    className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-sm font-bold outline-none focus:border-primary w-24"
                    placeholder="R$ 0,00"
                  />
               </div>
            </div>
         </div>

         <div className="bg-primary px-10 py-6 rounded-[24px] text-center min-w-[200px] shadow-2xl shadow-primary/40">
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-1">Valor Final do Plano</p>
            <p className="text-3xl font-black">R$ {form.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
         </div>
      </div>

      <div className="flex gap-4">
         <div className="flex flex-col gap-2 flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Status do Plano</label>
            <div className="flex gap-2 p-1 bg-white border border-slate-100 rounded-2xl">
              {['EM_ELABORACAO', 'ATIVO', 'CONCLUIDO'].map(st => (
                <button
                  key={st}
                  onClick={() => setForm({...form, status: st as any})}
                  className={cn(
                    "flex-1 py-3 text-xs font-bold rounded-xl transition-all",
                    form.status === st 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {st === 'EM_ELABORACAO' ? 'Rascunho' : st === 'ATIVO' ? 'Aprovar Plano' : 'Finalizar'}
                </button>
              ))}
            </div>
         </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className={cn(
              "self-end px-12 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl",
              saved ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"
            )}
          >
            {saved ? <><Check size={20} /> Salvo!</> : <><Save size={20} /> Salvar Plano</>}
          </motion.button>
      </div>
    </div>
  );
};
