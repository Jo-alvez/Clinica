import React, { useState, useRef } from 'react';
import { Footprints, Bandage, Plus, Check, Map as MapIcon, Info, Target, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Paciente, Sessao, LesaoPodologica } from '../../types';
import { cn } from '../../utils';

interface Props {
  paciente: Paciente;
  sessao?: Sessao;
  onSave?: (lesoes: LesaoPodologica[]) => void;
}

const LESION_TYPES = [
  { id: 'MICOSE', label: 'Micose', color: 'bg-amber-500' },
  { id: 'FISSURA', label: 'Fissura', color: 'bg-red-500' },
  { id: 'VERRUGA', label: 'Verruga', color: 'bg-emerald-500' },
  { id: 'CALOSIDADE', label: 'Calosidade', color: 'bg-indigo-500' },
  { id: 'UNHA_ENCRAVADA', label: 'Unha Encravada', color: 'bg-teal-500' },
  { id: 'ONICOMICOSE', label: 'Onicomicose', color: 'bg-blue-500' },
];

export const PodologiaMapeamentoTab: React.FC<Props> = ({ paciente, sessao, onSave }) => {
  const [selectedType, setSelectedType] = useState(LESION_TYPES[0]);
  const [lesoes, setLesoes] = useState<LesaoPodologica[]>([]);
  const [activeSide, setActiveSide] = useState<'ESQUERDO' | 'DIREITO'>('DIREITO');
  const [activeVisao, setActiveVisao] = useState<'PLANTAR' | 'DORSAL'>('PLANTAR');

  const [zoom, setZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const mapRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!mapRef.current) return;
    
    const isPinch = e.ctrlKey;
    const zoomDirection = e.deltaY > 0 ? -1 : 1;
    const factor = isPinch ? 0.05 : 0.1;
    const amount = isPinch ? -e.deltaY * factor : zoomDirection * factor;
    
    const newZoom = Math.max(1, Math.min(zoom + amount, 5));
    if (newZoom !== zoom) {
       const rect = mapRef.current.getBoundingClientRect();
       const x = ((e.clientX - rect.left) / rect.width) * 100;
       const y = ((e.clientY - rect.top) / rect.height) * 100;
       setZoomOrigin({ x, y });
       setZoom(newZoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && mapRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      
      if (lastTouchDistance.current !== null) {
         const diff = dist - lastTouchDistance.current;
         const newZoom = Math.max(1, Math.min(zoom + (diff * 0.015), 5));
         if (newZoom !== zoom) {
             const rect = mapRef.current.getBoundingClientRect();
             const midX = (touch1.clientX + touch2.clientX) / 2;
             const midY = (touch1.clientY + touch2.clientY) / 2;
             const x = ((midX - rect.left) / rect.width) * 100;
             const y = ((midY - rect.top) / rect.height) * 100;
             setZoomOrigin({ x, y });
             setZoom(newZoom);
         }
      }
      lastTouchDistance.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const novaLesao: LesaoPodologica = {
      id: `l_${Date.now()}`,
      pacienteId: paciente.id,
      sessaoId: sessao?.id || 'manual',
      tipo: selectedType.id,
      x,
      y,
      pe: activeSide,
      visao: activeVisao,
    };

    setLesoes([...lesoes, novaLesao]);
  };

  const removeLesao = (id: string) => {
    setLesoes(lesoes.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Control Panel */}
        <div className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">1. Tipo de Ocorrência</h3>
            <div className="grid grid-cols-1 gap-2">
              {LESION_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-bold transition-all",
                    selectedType.id === type.id 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                      : "bg-white text-slate-600 border-slate-100 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", type.color)} />
                    {type.label}
                  </div>
                  {selectedType.id === type.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">2. Visualização</h3>
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
              <button 
                onClick={() => setActiveSide('ESQUERDO')}
                className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all", activeSide === 'ESQUERDO' ? "bg-white text-primary shadow-sm" : "text-slate-500")}
              >Esq</button>
              <button 
                onClick={() => setActiveSide('DIREITO')}
                className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all", activeSide === 'DIREITO' ? "bg-white text-primary shadow-sm" : "text-slate-500")}
              >Dir</button>
            </div>
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 mt-2">
              <button 
                onClick={() => { setActiveVisao('PLANTAR'); setZoom(1); }}
                className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all", activeVisao === 'PLANTAR' ? "bg-white text-primary shadow-sm" : "text-slate-500")}
              >Plantar</button>
              <button 
                onClick={() => { setActiveVisao('DORSAL'); setZoom(1); }}
                className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all", activeVisao === 'DORSAL' ? "bg-white text-primary shadow-sm" : "text-slate-500")}
              >Dorsal</button>
            </div>
          </div>
        </div>

        {/* Foot Map Area */}
        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
             <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Target size={18} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mapa Interativo</p>
               <p className="text-sm font-bold text-slate-900">Clique para marcar a ocorrência</p>
             </div>
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-2 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-xl border border-slate-100 shadow-sm">
             <button onClick={() => setZoom(1)} className={cn("p-1.5 rounded-lg text-slate-600 hover:text-primary transition-colors", zoom === 1 ? "bg-slate-100 text-primary" : "")}><ZoomOut size={16}/></button>
             <button onClick={() => setZoom(Math.min(zoom + 0.5, 5))} className="p-1.5 rounded-lg text-slate-600 hover:text-primary transition-colors"><ZoomIn size={16}/></button>
          </div>

          <div className="relative mt-20 mx-auto aspect-[3/4] max-w-sm h-[400px]">
            <motion.div
              ref={mapRef}
              style={{ touchAction: 'none' }}
              onWheel={handleWheel}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              animate={{ scale: zoom, transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
              className="w-full h-full relative"
            >
             {/* Dynamic Foot Image based on vision */}
             <img 
               src={activeVisao === 'PLANTAR' 
                ? "/images/maps/mapa_plantar.png" 
                : "/images/maps/mapa_dorsal.png"
               } 
               className="w-full h-full object-contain opacity-80 mix-blend-multiply" 
               alt="Anatomia do pé"
             />

             {/* Clickable Overlay */}
             <div 
               className="absolute inset-0 cursor-crosshair"
               onClick={handleMapClick}
             />

             {/* Points Markers */}
             <AnimatePresence>
               {lesoes.filter(l => l.pe === activeSide && l.visao === activeVisao).map(lesao => {
                 const typeColor = LESION_TYPES.find(t => t.id === lesao.tipo)?.color || 'bg-primary';
                 return (
                   <motion.div
                    key={lesao.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{ left: `${lesao.x}%`, top: `${lesao.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group/point"
                   >
                     <div className={cn("size-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-125", typeColor)}>
                        <div className="size-1.5 bg-white rounded-full" />
                     </div>
                     
                     <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/point:opacity-100 transition-opacity z-20 pointer-events-none">
                        <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
                          {LESION_TYPES.find(t => t.id === lesao.tipo)?.label}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                        </div>
                     </div>

                     <button 
                       onClick={(e) => { e.stopPropagation(); removeLesao(lesao.id); }}
                       className="absolute -top-3 -right-3 size-5 bg-white rounded-full shadow-md text-red-500 flex items-center justify-center opacity-0 group-hover/point:opacity-100 transition-opacity"
                     >
                       <X className="size-3" />
                     </button>
                   </motion.div>
                 );
               })}
             </AnimatePresence>
            </motion.div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <div className="size-2 rounded-full bg-primary" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Marcado</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="size-2 rounded-full border border-slate-200" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Livre</span>
                </div>
             </div>
             
             <div className="flex items-center gap-2 text-slate-400">
                <Info size={14} />
                <span className="text-[10px] font-medium leading-none">O mapeamento ajuda a acompanhar a evolução das lesões entre sessões.</span>
             </div>
          </div>
        </div>

        {/* Summary List */}
        <div className="w-full md:w-80 space-y-6">
           <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm overflow-hidden flex flex-col h-full">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Resumo do Mapeamento</h3>
              
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {lesoes.length > 0 ? lesoes.map((l, i) => (
                  <div key={l.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-3">
                       <div className={cn("size-3 rounded-full", LESION_TYPES.find(t => t.id === l.tipo)?.color)} />
                       <div>
                         <p className="text-xs font-black text-slate-800 leading-none">{LESION_TYPES.find(t => t.id === l.tipo)?.label}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{l.pe} • {l.visao}</p>
                       </div>
                    </div>
                    <button onClick={() => removeLesao(l.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                       <X className="size-4" />
                    </button>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-30">
                     <MapIcon size={40} className="mb-2" />
                     <p className="text-xs font-bold">Nenhuma marcação</p>
                  </div>
                )}
              </div>

              {lesoes.length > 0 && (
                <button 
                  onClick={() => onSave?.(lesoes)}
                  className="w-full mt-6 py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Salvar Mapeamento
                </button>
              )}
           </div>

           <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
              <AlertCircle size={24} className="text-amber-500 shrink-0" />
              <div>
                 <p className="text-xs font-bold text-amber-800">Dica de Atendimento</p>
                 <p className="text-[10px] text-amber-700 mt-1 leading-relaxed font-medium">
                   Sempre compare o mapeamento atual com o da sessão anterior para validar o progresso do tratamento podológico.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
