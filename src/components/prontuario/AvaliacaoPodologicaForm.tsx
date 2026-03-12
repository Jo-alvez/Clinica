import React, { useState } from 'react';
import { Footprints, Check, Save } from 'lucide-react';
import { Paciente, AvaliacaoPodologica } from '../../types';
import { cn } from '../../utils';

interface Props {
  paciente: Paciente;
  avaliacao?: AvaliacaoPodologica;
  onSave?: (data: AvaliacaoPodologica) => void;
}

export const AvaliacaoPodologicaForm: React.FC<Props> = ({ paciente, avaliacao, onSave }) => {
  const [form, setForm] = useState<Partial<AvaliacaoPodologica>>(avaliacao || {
    pacienteId: paciente.id,
    calosidade: false,
    fissuras: false,
    verrugaPlantar: false,
    micoses: false,
    hidrose: 'Normal',
    onicocriptose: false,
    onicomicose: false,
    onicofose: false,
    halluxValgus: false,
    dedosEmGarra: false,
  });

  const toggle = (key: keyof AvaliacaoPodologica) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setVal = (key: keyof AvaliacaoPodologica, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Alterações de Pele */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500" /> Alterações de Pele
          </h3>
          <div className="grid grid-cols-1 gap-3">
             {[
               { key: 'calosidade', label: 'Calosidade / Calos' },
               { key: 'fissuras', label: 'Fissuras / Rachaduras' },
               { key: 'verrugaPlantar', label: 'Verruga Plantar (Olho de Peixe)' },
               { key: 'micoses', label: 'Micoses Cutâneas (Tinea Pedis)' },
             ].map(item => (
               <button
                 key={item.key}
                 onClick={() => toggle(item.key as keyof AvaliacaoPodologica)}
                 className={cn(
                   "flex items-center justify-between p-4 rounded-2xl border text-sm font-bold transition-all",
                   form[item.key as keyof AvaliacaoPodologica] 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                    : "bg-white border-slate-100 text-slate-600"
                 )}
               >
                 {item.label}
                 <div className={cn("size-6 rounded-lg flex items-center justify-center transition-all", form[item.key as keyof AvaliacaoPodologica] ? "bg-emerald-500 text-white" : "bg-slate-50")}>
                    {form[item.key as keyof AvaliacaoPodologica] && <Check size={14} />}
                 </div>
               </button>
             ))}
          </div>
          
          <div className="pt-4 space-y-3">
             <label className="text-xs font-bold text-slate-500 uppercase">Hidrose</label>
             <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                {(['Normal', 'Hiper', 'Anidrose'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setVal('hidrose', v)}
                    className={cn("flex-1 py-3 text-xs font-bold rounded-xl transition-all", form.hidrose === v ? "bg-white text-primary shadow-sm" : "text-slate-500")}
                  >{v}</button>
                ))}
             </div>
          </div>
        </div>

        {/* Unhas e Deformidades */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div className="size-2 rounded-full bg-blue-500" /> Unhas e Deformidades
          </h3>
          <div className="grid grid-cols-1 gap-3">
             {[
               { key: 'onicocriptose', label: 'Onicocriptose (Unha Encravada)' },
               { key: 'onicomicose', label: 'Onicomicose (Micose de Unha)' },
               { key: 'onicofose', label: 'Onicofose (Calo Subungueal)' },
               { key: 'halluxValgus', label: 'Hállux Valgus (Joanete)' },
               { key: 'dedosEmGarra', label: 'Dedos em Garra / Martelo' },
             ].map(item => (
               <button
                 key={item.key}
                 onClick={() => toggle(item.key as keyof AvaliacaoPodologica)}
                 className={cn(
                   "flex items-center justify-between p-4 rounded-2xl border text-sm font-bold transition-all",
                   form[item.key as keyof AvaliacaoPodologica] 
                    ? "bg-blue-50 border-blue-200 text-blue-800" 
                    : "bg-white border-slate-100 text-slate-600"
                 )}
               >
                 {item.label}
                 <div className={cn("size-6 rounded-lg flex items-center justify-center transition-all", form[item.key as keyof AvaliacaoPodologica] ? "bg-blue-500 text-white" : "bg-slate-50")}>
                    {form[item.key as keyof AvaliacaoPodologica] && <Check size={14} />}
                 </div>
               </button>
             ))}
          </div>
        </div>

      </div>

      <div className="pt-6 border-t border-slate-100 flex flex-col items-end gap-4">
         <div className="w-full">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Observações Complementares</label>
            <textarea 
              value={form.observacoes}
              onChange={(e) => setVal('observacoes', e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]"
              placeholder="Digite aqui observações sobre a postura, tipo de calçado ou recomendações específicas..."
            />
         </div>
         <button 
           onClick={() => onSave?.(form as AvaliacaoPodologica)}
           className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/25 hover:-translate-y-1 transition-all flex items-center gap-2"
         >
           <Save size={18} /> Salvar Avaliação Podológica
         </button>
      </div>
    </div>
  );
};
