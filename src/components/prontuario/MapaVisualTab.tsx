import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, MapPin, User, Info, Save, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Paciente, Sessao, Procedimento } from '../../types';
import { cn } from '../../utils';

interface Point {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label?: string;
  value?: string;
  type?: string;
}

interface Props {
  paciente: Paciente;
  sessoes: Sessao[];
  procedimentos: Procedimento[];
}

export const MapaVisualTab: React.FC<Props> = ({ paciente, sessoes, procedimentos }) => {
  const [activeMap, setActiveMap] = useState<'FRENTE' | 'DORSO' | 'LATERAL_ESQ' | 'LATERAL_DIR' | 'FACE_FRONTAL' | 'FACE_ESQ' | 'FACE_DIR'>('FRENTE');
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const mapRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  // Persistence Key
  const storageKey = `proclin_mapa_visual_${paciente.id}`;

  // Load from persistence
  useEffect(() => {
    const savedPoints = localStorage.getItem(storageKey);
    if (savedPoints) {
      try {
        setPoints(JSON.parse(savedPoints));
      } catch (e) {
        console.error("Erro ao carregar mapa visual salvo", e);
      }
    }
  }, [paciente.id]);

  // Save to persistence
  useEffect(() => {
    if (points.length >= 0) {
      localStorage.setItem(storageKey, JSON.stringify(points));
    }
  }, [points, storageKey]);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    
    // If a point is selected, don't add a new one unless clicking elsewhere
    if (selectedPointId) {
       setSelectedPointId(null);
       return;
    }

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Converte coordenadas da tela para coordenadas do mapa com zoom
    const mapX = zoomOrigin.x + (x - zoomOrigin.x) / zoom;
    const mapY = zoomOrigin.y + (y - zoomOrigin.y) / zoom;

    const newPoint: Point = {
      id: `pt_${Date.now()}`,
      x: mapX,
      y: mapY,
      label: '', // empty by default so user can type it
      value: '0',
      type: 'Botox',
    };

    setPoints([...points, newPoint]);
    setSelectedPointId(newPoint.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (zoom === 1) {
        setZoom(2.5);
        setZoomOrigin({ x, y });
    } else {
        setZoom(1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
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

  const updatePoint = (id: string, updates: Partial<Point>) => {
    setPoints(points.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id));
    setSelectedPointId(null);
  };

  const selectedPoint = points.find(p => p.id === selectedPointId);

  const getImagePath = () => {
    switch(activeMap) {
      case 'FRENTE':      return "/images/maps/frente.png";
      case 'DORSO':       return "/images/maps/dorso.png";
      case 'LATERAL_ESQ': return "/images/maps/Lateralesquerda.png";
      case 'LATERAL_DIR': return "/images/maps/Lateraldireita.png";
      case 'FACE_FRONTAL':return "/images/maps/face_frontal.png";
      case 'FACE_ESQ':    return "/images/maps/face_esquerda.png";
      case 'FACE_DIR':    return "/images/maps/face_direita.png";
      default:               return "";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
      {/* Left: Map Area */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(['FRENTE', 'DORSO', 'LATERAL_ESQ', 'LATERAL_DIR', 'FACE_FRONTAL', 'FACE_ESQ', 'FACE_DIR'] as const).map(type => (
              <button
                key={type}
                onClick={() => { setActiveMap(type); setZoom(1); setSelectedPointId(null); }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black tracking-tight transition-all",
                  activeMap === type 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                {type === 'FRENTE' ? 'Corpo Frente' : type === 'DORSO' ? 'Corpo Dorso' : type === 'LATERAL_ESQ' ? 'Corpo Lat. Esq' : type === 'LATERAL_DIR' ? 'Corpo Lat. Dir' : type === 'FACE_FRONTAL' ? 'Face Frontal' : type === 'FACE_ESQ' ? 'Face Esq' : 'Face Dir'}
              </button>
            ))}
          </div>
           <div className="flex items-center gap-2">
               <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
                 <button onClick={() => setZoom(1)} className={cn("p-1 rounded", zoom === 1 ? "bg-white shadow-sm" : "opacity-40")}><ZoomOut size={14}/></button>
                 <button onClick={() => setZoom(2.5)} className={cn("p-1 rounded", zoom > 1 ? "bg-white shadow-sm" : "opacity-40")}><ZoomIn size={14}/></button>
               </div>
               
               <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                  className={cn(
                    "px-4 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md text-[10px]",
                    saved ? "bg-emerald-500 text-white shadow-emerald-500/10" : "bg-primary text-white shadow-primary/10 hover:scale-[1.02]"
                  )}
                >
                  {saved ? <><Check size={14} /> Salvo!</> : <><Save size={14} /> Confirmar Alterações</>}
                </motion.button>
          </div>
        </div>

        <div 
          ref={mapRef}
          onClick={handleMapClick}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 relative bg-white cursor-crosshair overflow-hidden"
          style={{ touchAction: 'none' }}
        >
          <motion.div 
            className="w-full h-full flex items-center justify-center relative"
            animate={{ scale: zoom, originX: zoomOrigin.x / 100, originY: zoomOrigin.y / 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
             <img 
               src={getImagePath()} 
               alt="Anatomia" 
               className="h-full w-auto object-contain pointer-events-none bg-slate-50 rounded-2xl"
               onError={(e) => { e.currentTarget.style.display = 'none'; }}
             />
             
             {points.map(pt => (
              <motion.div
                key={pt.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={(e) => { e.stopPropagation(); setSelectedPointId(pt.id); }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border shadow-sm flex items-center justify-center transition-all z-10",
                  selectedPointId === pt.id ? "bg-primary border-white scale-125 z-20" : "bg-white border-primary/50"
                )}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              >
                <div className={cn(
                  "w-0.5 h-0.5 rounded-full",
                  selectedPointId === pt.id ? "bg-white" : "bg-primary"
                )} />
                
                {/* Labels bubble */}
                {(selectedPointId === pt.id || pt.value !== '0') && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded shadow-lg pointer-events-none font-bold">
                    {pt.value} {pt.type === 'Botox' ? 'U' : 'ml'}
                  </div>
                )}

                {/* On-Map Delete button */}
                {selectedPointId === pt.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={(e) => { e.stopPropagation(); removePoint(pt.id); }}
                    className="absolute -top-4 -right-4 w-5 h-5 bg-white rounded-full border border-red-200 flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-50 transition-colors z-[30]"
                  >
                    <Trash2 size={10} className="text-red-500" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right: Point Editor */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-y-auto">
          {selectedPoint ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-tight">
                  <MapPin size={16} className="text-primary" /> Detalhes
                </h3>
                <button onClick={() => removePoint(selectedPoint.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Região</label>
                  <input 
                    type="text" 
                    value={selectedPoint.label}
                    onChange={(e) => updatePoint(selectedPoint.id, { label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-primary outline-none font-medium"
                    placeholder="Ex: Glabela"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Procedimento</label>
                  <select 
                    value={selectedPoint.type}
                    onChange={(e) => updatePoint(selectedPoint.id, { type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-primary outline-none font-medium"
                  >
                    <option value="Botox">Toxina</option>
                    <option value="Preenchimento">Preenchimento</option>
                    <option value="Bioestimulador">Bioestimulador</option>
                    <option value="Fios">Fios de PDO</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Qtd ({selectedPoint.type === 'Botox' ? 'UI' : 'ml'})
                  </label>
                  <div className="flex items-center gap-2">
                    <button 
                       onClick={() => updatePoint(selectedPoint.id, { value: Math.max(0, (parseFloat(selectedPoint.value || '0') - (selectedPoint.type === 'Botox' ? 1 : 0.1))).toString() })}
                       className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all font-bold"
                    >−</button>
                    <input 
                      type="text" 
                      value={selectedPoint.value}
                      onChange={(e) => updatePoint(selectedPoint.id, { value: e.target.value })}
                      className="flex-1 text-center font-bold text-sm text-primary py-2 bg-slate-50 rounded-lg"
                    />
                    <button 
                       onClick={() => updatePoint(selectedPoint.id, { value: (parseFloat(selectedPoint.value || '0') + (selectedPoint.type === 'Botox' ? 1 : 0.1)).toFixed(selectedPoint.type === 'Botox' ? 0 : 1).toString() })}
                       className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all font-bold"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[9px] text-slate-400 flex gap-2">
                  <Info size={10} />
                  Coordenadas: {selectedPoint.x.toFixed(1)}%, {selectedPoint.y.toFixed(1)}%
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <MapPin size={24} className="opacity-20" />
              </div>
              <p className="text-xs font-bold">Nenhum ponto</p>
              <p className="text-[10px] mt-1">Marque uma área para editar.</p>
              
              <div className="mt-8 p-4 bg-slate-50/50 rounded-2xl w-full text-left border border-slate-100">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Resumo</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Total:</span>
                    <span className="font-bold text-slate-700">{points.length}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Toxina:</span>
                    <span className="font-bold text-primary">{points.filter(p => p.type === 'Botox').reduce((acc, p) => acc + parseFloat(p.value || '0'), 0)} UI</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
