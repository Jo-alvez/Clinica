import React, { useState } from 'react';
import { Camera, Plus, Trash2, Maximize2, Layers, Calendar, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FotoClinica, Paciente, Sessao, Procedimento } from '../../types';
import { cn } from '../../utils';
import { PhotoComparator } from './PhotoComparator';

interface Props {
  paciente: Paciente;
  fotos: FotoClinica[];
  procedimentos: Procedimento[];
  sessoes: Sessao[];
  onAddFoto: (foto: FotoClinica) => void;
  onRemoveFoto: (id: string) => void;
}

export const FotosClinicasTab: React.FC<Props> = ({ paciente, fotos, procedimentos, sessoes, onAddFoto, onRemoveFoto }) => {
  const [selectedType, setSelectedType] = useState<FotoClinica['tipoFoto'] | 'ALL'>('ALL');
  const [isCapturing, setIsCapturing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [newFoto, setNewFoto] = useState<Partial<FotoClinica>>({
    tipoFoto: 'EVOLUCAO',
    dataFoto: new Date().toISOString().split('T')[0],
  });

  const filteredFotos = selectedType === 'ALL' ? fotos : fotos.filter(f => f.tipoFoto === selectedType);
  const sortedFotos = [...filteredFotos].sort((a, b) => b.dataFoto.localeCompare(a.dataFoto));

  const handleToggleCompare = (id: string) => {
    if (compareSelection.includes(id)) {
      setCompareSelection(compareSelection.filter(x => x !== id));
    } else if (compareSelection.length < 2) {
      setCompareSelection([...compareSelection, id]);
    }
  };

  const handleAdd = () => {
    const f: FotoClinica = {
      ...newFoto,
      id: `fot_${Date.now()}`,
      pacienteId: paciente.id,
      arquivoUrl: `https://picsum.photos/seed/${Math.random()}/800/800`, // Mock photo
      criadoEm: new Date().toISOString(),
    } as FotoClinica;
    onAddFoto(f);
    setIsCapturing(false);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          {['ALL', 'ANTES', 'DEPOIS_IMEDIATO', 'EVOLUCAO', 'INTERCORRENCIA'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all",
                selectedType === t ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:bg-white/50"
              )}
            >
              {t === 'ALL' ? 'Todas' : t === 'DEPOIS_IMEDIATO' ? 'Pós' : t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button 
             onClick={() => { setCompareMode(!compareMode); setCompareSelection([]); }}
             className={cn(
               "flex items-center justify-center h-10 w-10 rounded-xl transition-all",
               compareMode ? "bg-primary text-white" : "bg-primary/10 text-primary border border-primary/20"
             )}
             title="Comparar fotos"
          >
            <Layers size={18} />
          </button>
          <button 
             onClick={() => setIsCapturing(true)}
             className="flex items-center justify-center h-10 px-4 bg-primary text-white rounded-xl font-bold gap-2 text-sm shadow-lg shadow-primary/20"
          >
            <Camera size={18} />
            <span className="hidden sm:inline">Nova Foto</span>
          </button>
        </div>
      </div>

      {compareMode && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 animate-in fade-in slide-in-from-top-4">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-primary">Comparador Antes vs Depois</h3>
              <p className="text-xs text-slate-500">Selecione 2 fotos para comparar</p>
           </div>
           <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-inner">
               {compareSelection.length === 2 ? (
                 <PhotoComparator 
                   beforeUrl={fotos.find(f => f.id === compareSelection[0])?.arquivoUrl || ''} 
                   afterUrl={fotos.find(f => f.id === compareSelection[1])?.arquivoUrl || ''} 
                   className="h-[400px]"
                 />
               ) : (
                 <div className="grid grid-cols-2 gap-4 h-[300px] sm:h-[400px]">
                    {compareSelection.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center bg-white/50 border border-dashed border-primary/30 rounded-xl">
                        <Maximize2 size={32} className="text-primary/30 mb-2" />
                        <p className="text-xs text-slate-400">Clique nas fotos abaixo para comparar</p>
                      </div>
                    )}
                    {compareSelection.map(id => {
                      const f = fotos.find(x => x.id === id);
                      return (
                        <div key={id} className="relative group overflow-hidden rounded-xl bg-slate-200 border-2 border-primary">
                          <img src={f?.arquivoUrl} alt="Foto comparada" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase">
                            {f?.tipoFoto} ({f?.dataFoto})
                          </div>
                          <button 
                             onClick={() => handleToggleCompare(id)}
                             className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                    {compareSelection.length === 1 && (
                      <div className="flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4">
                        <p className="text-xs text-slate-400 text-center italic">Selecione a próxima foto...</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
        </div>
      )}

      {/* Grid of photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {sortedFotos.map((foto) => (
            <motion.div
              layout
              key={foto.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                compareSelection.includes(foto.id) ? "border-primary shadow-lg ring-4 ring-primary/20" : "border-slate-100 hover:border-slate-300"
              )}
              onClick={() => compareMode ? handleToggleCompare(foto.id) : null}
            >
              <img src={foto.arquivoUrl} alt={foto.legenda} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                 <p className="text-white font-bold text-[10px] truncate">{procedimentos.find(p => p.id === foto.procedimentoId)?.nome || 'Procedimento'}</p>
                 <div className="flex items-center justify-between mt-1">
                   <p className="text-white/70 text-[8px] flex items-center gap-1">
                     <Calendar size={8} /> {foto.dataFoto}
                   </p>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onRemoveFoto(foto.id); }}
                     className="text-white/50 hover:text-red-400 p-1 rounded-md"
                   >
                     <Trash2 size={12} />
                   </button>
                 </div>
              </div>

              <div className={cn(
                "absolute top-2 left-2 backdrop-blur-md text-[8px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1",
                foto.tipoFoto === 'ANTES' ? "bg-amber-500/80 text-white" : 
                foto.tipoFoto === 'DEPOIS_IMEDIATO' ? "bg-emerald-500/80 text-white" : "bg-white/80 text-slate-700"
              )}>
                {foto.tipoFoto.replace('_', ' ')}
              </div>

              {compareMode && (
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all bg-black/0 group-hover:bg-black/10",
                  compareSelection.includes(foto.id) && "bg-primary/20"
                )}>
                   <div className={cn(
                     "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                     compareSelection.includes(foto.id) ? "bg-primary border-primary text-white scale-125 shadow-lg" : "bg-white/60 border-white text-slate-400 group-hover:scale-110"
                   )}>
                     <Plus size={14} className={cn(compareSelection.includes(foto.id) && "rotate-45")} />
                   </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedFotos.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
             <Camera size={40} className="mb-3 opacity-20" />
             <p className="text-sm">Nenhuma foto encontrada</p>
             <p className="text-xs mt-1">Inicie documentando o "Antes" do procedimento</p>
          </div>
        )}
      </div>

      {/* Capture Dialog (Mock) */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-lg flex items-center justify-center p-4"
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <h2 className="text-lg font-bold text-slate-900">Anexar Foto Clínica</h2>
                 <button onClick={() => setIsCapturing(false)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400"><Trash2 size={20} /></button>
               </div>
               
               <div className="p-6 space-y-6">
                 {/* Visual Mock of Camera */}
                 <div className="aspect-video bg-slate-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                    <Camera size={48} className="text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Acesse a câmera do seu dispositivo</p>
                    <button className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm">Abrir Câmera</button>
                    <p className="mt-3 text-[10px] text-slate-400">Ou arraste um arquivo para cá</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                     <select 
                       value={newFoto.tipoFoto} 
                       onChange={(e) => setNewFoto({...newFoto, tipoFoto: e.target.value as any})}
                       className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none"
                     >
                        <option value="ANTES">Antes</option>
                        <option value="DEPOIS_IMEDIATO">Depois Imediato</option>
                        <option value="EVOLUCAO">Evolução</option>
                        <option value="INTERCORRENCIA">Intercorrência</option>
                     </select>
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                     <input 
                       type="date"
                       value={newFoto.dataFoto}
                       onChange={(e) => setNewFoto({...newFoto, dataFoto: e.target.value})}
                       className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none"
                     />
                   </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Procedimento ou Sessão</label>
                    <select 
                      value={newFoto.procedimentoId} 
                      onChange={(e) => setNewFoto({...newFoto, procedimentoId: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none"
                    >
                       <option value="">Nenhum...</option>
                       {procedimentos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                 </div>

                 <button 
                   onClick={handleAdd}
                   className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20"
                 >
                   Salvar Registro Fotográfico
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
