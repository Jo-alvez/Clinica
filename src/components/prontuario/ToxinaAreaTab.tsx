import React, { useState, useEffect, useRef } from 'react';
import { Save, Check, Plus, Trash2, Info, Syringe, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AplicacaoToxina, Sessao, Paciente } from '../../types';
import { cn } from '../../utils';

interface Props {
  paciente: Paciente;
  sessao: Sessao;
  aplicacoes?: AplicacaoToxina[];
  onSave: (aplicacoes: AplicacaoToxina[]) => void;
}

interface Marcacao {
  id: string;
  x: number;
  y: number;
  unidades: number;
  area: string;
  visao: VisaoType;
}

type VisaoType = 'FRENTE' | 'DORSO' | 'LATERAL_ESQ' | 'LATERAL_DIR' | 'FACE_FRONTAL' | 'FACE_ESQ' | 'FACE_DIR';

const VISOES: { id: VisaoType; label: string; shortLabel: string }[] = [
  { id: 'FRENTE',       label: 'Corpo Frente',      shortLabel: 'Frente' },
  { id: 'DORSO',        label: 'Corpo Dorso',       shortLabel: 'Dorso' },
  { id: 'LATERAL_ESQ',  label: 'Corpo Lat. Esq',   shortLabel: 'Lat. Esq' },
  { id: 'LATERAL_DIR',  label: 'Corpo Lat. Dir',    shortLabel: 'Lat. Dir' },
  { id: 'FACE_FRONTAL', label: 'Face Frontal',      shortLabel: 'Face. Fr' },
  { id: 'FACE_ESQ',     label: 'Face Esquerda',     shortLabel: 'Face. Esq' },
  { id: 'FACE_DIR',     label: 'Face Direita',      shortLabel: 'Face. Dir' },
];

// ─── IMAGE PATHS PER VISAO ──────────────────────────────────────────────────
const VISAO_IMAGE: Record<VisaoType, string> = {
  FRENTE:       '/images/maps/frente.png',
  DORSO:        '/images/maps/dorso.png',
  LATERAL_ESQ:  '/images/maps/Lateralesquerda.png',
  LATERAL_DIR:  '/images/maps/Lateraldireita.png',
  FACE_FRONTAL: '/images/maps/face_frontal.png',
  FACE_ESQ:     '/images/maps/face_esquerda.png',
  FACE_DIR:     '/images/maps/face_direita.png',
};


// ─── VIEWBOX PER VISAO ───────────────────────────────────────────────────────
const VIEWBOX: Record<VisaoType, string> = {
  FRENTE:       '0 0 100 100',
  DORSO:        '0 0 100 100',
  LATERAL_ESQ:  '0 0 100 100',
  LATERAL_DIR:  '0 0 100 100',
  FACE_FRONTAL: '0 0 100 100',
  FACE_ESQ:     '0 0 100 100',
  FACE_DIR:     '0 0 100 100',
};

// ─── AREA SUGGESTIONS PER VISAO ──────────────────────────────────────────────
const AREA_SUGESTOES: Record<VisaoType, string[]> = {
  FRENTE:      ['Axila', 'Palma', 'Décolleté', 'Abdômen'],
  DORSO:       ['Trapézio', 'Coluna Lombar', 'Dorso', 'Hiperhidrose Dorso'],
  LATERAL_ESQ: ['Pescoço Lat. Esq', 'Ombro Esq', 'Braço Esq'],
  LATERAL_DIR: ['Pescoço Lat. Dir', 'Ombro Dir', 'Braço Dir'],
  FACE_FRONTAL:['Glabela', 'Fronte', 'Pé de Galinha', 'Zigomático', 'Nasalis', 'Lábio Superior', 'Mento', 'Platisma', 'DAO'],
  FACE_ESQ:    ['Pré-auricular Esq', 'Masseter Esq', 'Pé de Galinha Esq', 'Platisma Esq'],
  FACE_DIR:    ['Pré-auricular Dir', 'Masseter Dir', 'Pé de Galinha Dir', 'Platisma Dir'],
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export const ToxinaAreaTab: React.FC<Props> = ({ paciente, sessao, aplicacoes = [], onSave }) => {
  const [visaoAtiva, setVisaoAtiva] = useState<VisaoType>('FRENTE');
  const [zoom, setZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>([]);
  const [saved, setSaved] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  // Persistence Key
  const storageKey = `proclin_toxina_${paciente.id}_${sessao.id}`;

  // Load from persistence or initial
  useEffect(() => {
    const savedMarcacoes = localStorage.getItem(storageKey);
    if (savedMarcacoes) {
      try {
        setMarcacoes(JSON.parse(savedMarcacoes));
      } catch (e) {
        console.error("Erro ao carregar marcações salvas", e);
      }
    } else if (aplicacoes.length > 0) {
      setMarcacoes(
        aplicacoes.flatMap(a =>
          a.pontos.map(p => ({
            id: p.id,
            x: p.x,
            y: p.y,
            unidades: p.unidades,
            area: p.area,
            visao: (p as any).visao || 'FRENTE',
          }))
        )
      );
    }
  }, [paciente.id, sessao.id, aplicacoes]);

  // Save to persistence
  useEffect(() => {
    if (marcacoes.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(marcacoes));
    }
  }, [marcacoes, storageKey]);

  const marcacoesAtivas = marcacoes.filter(m => m.visao === visaoAtiva);
  const totalUnidades = marcacoes.reduce((acc, m) => acc + m.unidades, 0);
  const visaoIndex = VISOES.findIndex(v => v.id === visaoAtiva);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Se clicar com Alt ou SHIFT, reseta o zoom, senão adiciona ponto (lógica simples)
    if (e.altKey) {
        setZoom(1);
        return;
    }

    // Se já estiver com muito zoom e clicar perto de um ponto, seleciona ele
    // Mas o onClick do ponto já faz isso. Então aqui apenas adicionamos se não houver zoom em andamento ou se for intent do user.
    
    // Converte coordenadas da tela para coordenadas do SVG com zoom
    const svgX = zoomOrigin.x + (x - zoomOrigin.x) / zoom;
    const svgY = zoomOrigin.y + (y - zoomOrigin.y) / zoom;

    const newM: Marcacao = {
      id: `mark_${Date.now()}`,
      x: svgX,
      y: svgY,
      unidades: 4,
      area: '',
      visao: visaoAtiva,
    };
    setMarcacoes(prev => [...prev, newM]);
    setSelectedPoint(newM.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
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

  const updateMarcacao = (id: string, updates: Partial<Marcacao>) =>
    setMarcacoes(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

  const removeMarcacao = (id: string) => {
    setMarcacoes(prev => prev.filter(m => m.id !== id));
    if (selectedPoint === id) setSelectedPoint(null);
  };

  const handleSave = () => {
    const grouped: AplicacaoToxina = {
      id: `tox_${Date.now()}`,
      sessaoId: sessao.id,
      pacienteId: paciente.id,
      frascoToxinaId: 'default',
      pontos: marcacoes.map(m => ({
        id: m.id,
        area: m.area,
        unidades: m.unidades,
        x: m.x,
        y: m.y,
        visao: m.visao,
      } as any)),
      unidadesTotais: totalUnidades,
      criadoEm: new Date().toISOString(),
    };
    onSave([grouped]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };


  const viewCountByVisao = (v: VisaoType) => marcacoes.filter(m => m.visao === v).length;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 truncate">
            <Syringe className="text-primary" size={22} />
            Mapa de Aplicação de Toxina
          </h3>
          <p className="text-xs text-slate-400 mt-1">Dê um duplo clique para ampliar e marcar com precisão.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setZoom(1)} 
                className={cn("px-3 py-1 text-[10px] font-bold rounded-lg transition-all", zoom === 1 ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >1x</button>
              <button 
                onClick={() => setZoom(2.5)} 
                className={cn("px-3 py-1 text-[10px] font-bold rounded-lg transition-all", zoom > 1 ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >2.5x</button>
           </div>
           <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm">
             <span>{totalUnidades} UI Total</span>
             <span className="text-primary/40">•</span>
             <span>{marcacoes.length} pontos</span>
           </div>
           
           <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={marcacoes.length === 0}
              className={cn(
                "px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg text-sm",
                marcacoes.length === 0
                  ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                  : saved
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-primary text-white shadow-primary/20 hover:scale-[1.05]"
              )}
            >
              {saved ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> Confirmar Aplicação</>}
            </motion.button>
        </div>
      </div>

      {/* ── Visão Selector (tabs) ────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setVisaoAtiva(VISOES[Math.max(0, visaoIndex - 1)].id); setZoom(1); }}
          disabled={visaoIndex === 0}
          className="p-2 rounded-xl bg-slate-100 text-slate-500 disabled:opacity-30 hover:bg-slate-200 transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex flex-1 gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {VISOES.map((v) => {
            const count = viewCountByVisao(v.id);
            return (
              <button
                key={v.id}
                onClick={() => { setVisaoAtiva(v.id); setZoom(1); }}
                className={cn(
                  "relative flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap",
                  visaoAtiva === v.id
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {v.shortLabel}
                {count > 0 && (
                  <span className={cn(
                    "absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center",
                    visaoAtiva === v.id ? "bg-white text-primary" : "bg-primary text-white"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => { setVisaoAtiva(VISOES[Math.min(VISOES.length - 1, visaoIndex + 1)].id); setZoom(1); }}
          disabled={visaoIndex === VISOES.length - 1}
          className="p-2 rounded-xl bg-slate-100 text-slate-500 disabled:opacity-30 hover:bg-slate-200 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Main Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: Map ──────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-3">
          <div
            ref={mapRef}
            className="relative bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xl group cursor-crosshair h-[600px]"
            style={{ touchAction: 'none' }}
            onWheel={handleWheel}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Zoom Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 pointer-events-none">
                <Info size={12} className="text-primary" />
                Dê zoom com os dedos ou clique duplo
            </div>

            {/* image + SVG overlay */}
            <motion.div
              className="w-full h-full flex items-center justify-center relative"
              animate={{ scale: zoom, originX: zoomOrigin.x / 100, originY: zoomOrigin.y / 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={handleMapClick}
              onDoubleClick={handleDoubleClick}
            >
              <img
                src={VISAO_IMAGE[visaoAtiva]}
                alt="Mapa Anatômico"
                className="h-full w-auto object-contain pointer-events-none select-none"
                style={{ transform: undefined }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />

              {/* SVG overlay — points only */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: 10 }}
              >
                <AnimatePresence mode="wait">
                  <motion.g key={visaoAtiva} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {marcacoesAtivas.map((m) => (
                      <motion.g
                        key={m.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedPoint(m.id); }}
                        className="cursor-pointer"
                      >
                        {selectedPoint === m.id && (
                          <motion.circle
                            cx={m.x} cy={m.y} r={0.8}
                            className="fill-none stroke-primary/30 stroke-[0.1]"
                            animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                        <circle
                          cx={m.x} cy={m.y} r={selectedPoint === m.id ? 0.5 : 0.35}
                          className={cn(
                            "transition-all duration-200",
                            selectedPoint === m.id
                              ? "fill-primary stroke-white stroke-[0.08]"
                              : "fill-primary/60 stroke-white stroke-[0.04]"
                          )}
                        />
                        <text
                          x={m.x} y={m.y - 1.0}
                          textAnchor="middle"
                          style={{ fontSize: '1.1px', fontWeight: '900', fill: 'var(--color-primary)' }}
                        >
                          {m.unidades}
                        </text>
                        {selectedPoint === m.id && (
                          <motion.g
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={(e) => { e.stopPropagation(); removeMarcacao(m.id); }}
                            className="cursor-pointer"
                          >
                            <circle cx={m.x + 3} cy={m.y - 3} r="2" fill="white" className="stroke-red-500 stroke-[0.3]" />
                            <text x={m.x + 3} y={m.y - 2.3} textAnchor="middle" style={{ fontSize: '2px', fill: '#ef4444', fontWeight: 700 }}>×</text>
                          </motion.g>
                        )}
                      </motion.g>
                    ))}
                  </motion.g>
                </AnimatePresence>
              </svg>
            </motion.div>

            {/* Instruction hint */}
            {marcacoesAtivas.length === 0 && zoom === 1 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                <Plus size={28} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">Clique para marcar um ponto</p>
                <p className="text-[10px] text-slate-300 mt-1">Vista: {VISOES.find(v => v.id === visaoAtiva)?.label}</p>
              </div>
            )}
          </div>

          {/* View mini-summary bar */}
          <div className="flex gap-2 flex-wrap">
            {VISOES.filter(v => viewCountByVisao(v.id) > 0).map(v => (
              <button
                key={v.id}
                onClick={() => setVisaoAtiva(v.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                  visaoAtiva === v.id ? "bg-primary/10 text-primary border-primary/25" : "bg-white text-slate-500 border-slate-200 hover:border-primary/20"
                )}
              >
                <span className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[8px]">
                  {viewCountByVisao(v.id)}
                </span>
                {v.label}: {marcacoes.filter(m => m.visao === v.id).reduce((a, m) => a + m.unidades, 0)} UI
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Point list ──────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Pontos — {VISOES.find(v => v.id === visaoAtiva)?.label}
            </h4>
            <span className="text-xs font-bold text-slate-400">
              {marcacoesAtivas.reduce((a, m) => a + m.unidades, 0)} UI
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
            <AnimatePresence mode="popLayout">
              {marcacoesAtivas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-10 flex flex-col items-center justify-center text-slate-400"
                >
                  <Syringe size={24} className="mb-2 opacity-20" />
                  <p className="text-xs">Nenhum ponto nesta visão</p>
                </motion.div>
              ) : (
                marcacoesAtivas.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all",
                      selectedPoint === m.id ? "bg-white border-primary shadow-md" : "bg-slate-50 border-slate-100"
                    )}
                    onClick={() => {
                        setSelectedPoint(m.id);
                        // Auto zoom to point if far away?
                        if (zoom === 1) {
                            setZoom(2.5);
                            setZoomOrigin({ x: m.x, y: m.y });
                        }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
                        {/* Area input */}
                        <div className="col-span-2 space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Área</label>
                          <input
                            type="text"
                            value={m.area}
                            list={`areas-${m.id}`}
                            onChange={e => updateMarcacao(m.id, { area: e.target.value })}
                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0 outline-none"
                            placeholder="Ex: Glabela"
                            onClick={e => e.stopPropagation()}
                          />
                          <datalist id={`areas-${m.id}`}>
                            {AREA_SUGESTOES[visaoAtiva].map(s => <option key={s} value={s} />)}
                          </datalist>
                        </div>

                        {/* Units */}
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">UI</label>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={e => { e.stopPropagation(); updateMarcacao(m.id, { unidades: Math.max(1, m.unidades - 1) }); }}
                              className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black hover:bg-primary hover:text-white transition-all"
                            >−</button>
                            <input
                              type="number"
                              value={m.unidades}
                              onChange={e => updateMarcacao(m.id, { unidades: parseInt(e.target.value) || 0 })}
                              className="w-10 bg-transparent border-none p-0 text-sm font-bold text-primary focus:ring-0 outline-none text-center"
                              onClick={e => e.stopPropagation()}
                            />
                            <button
                              onClick={e => { e.stopPropagation(); updateMarcacao(m.id, { unidades: m.unidades + 1 }); }}
                              className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black hover:bg-primary hover:text-white transition-all"
                            >+</button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={e => { e.stopPropagation(); removeMarcacao(m.id); }}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};
