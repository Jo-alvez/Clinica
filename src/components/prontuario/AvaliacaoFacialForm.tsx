import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { AvaliacaoFacial, Paciente, Sessao } from '../../types';
import { cn } from '../../utils';

// ─── Sub-components OUTSIDE to prevent remount scroll-jump ──────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4 border-b border-slate-100 pb-6 last:border-0">
    <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-tight">{label}</label>
    {children}
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}
const FormTextArea = ({ value, onChange, ...rest }: TextAreaProps) => (
  <textarea
    {...rest}
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-primary outline-none transition-all resize-none h-20"
  />
);

interface ToggleProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}
const Toggle = ({ label, checked, onToggle }: ToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      "flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm w-full",
      checked 
        ? "bg-primary/10 border-primary/30 text-primary font-semibold" 
        : "bg-slate-50 border-slate-200 text-slate-500"
    )}
  >
    <span>{label}</span>
    {checked ? <Check size={16} /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
  </button>
);

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  paciente: Paciente;
  sessao?: Sessao;
  avaliacao?: AvaliacaoFacial;
  onSave: (data: AvaliacaoFacial) => void;
}

export const AvaliacaoFacialForm: React.FC<Props> = ({ paciente, sessao, avaliacao, onSave }) => {
  const [form, setForm] = useState<Partial<AvaliacaoFacial>>(avaliacao || {
    pacienteId: paciente.id,
    sessaoId: sessao?.id,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      ...form,
      id: form.id || `af_${Date.now()}`,
      pacienteId: paciente.id,
      sessaoId: sessao?.id,
      criadoEm: form.criadoEm || new Date().toISOString(),
    } as AvaliacaoFacial);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const set = (key: keyof AvaliacaoFacial, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const toggle = (key: keyof AvaliacaoFacial) => setForm(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8 pb-20">
      {/* Interactive Facial Map */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8">
           <div className="relative w-64 h-80 shrink-0 select-none">
              <svg viewBox="0 0 200 250" className="w-full h-full text-slate-200">
                {/* Schematic Face */}
                <path d="M100 20C60 20 30 50 30 110C30 180 60 230 100 230C140 230 170 180 170 110C170 50 140 20 100 20Z" fill="white" stroke="currentColor" strokeWidth="2" />
                
                {/* Clickable Regions (Simplified bounding boxes) */}
                <rect x="50" y="30" width="100" height="40" rx="10" className="fill-primary/5 hover:fill-primary/20 stroke-primary/30 cursor-pointer transition-all" onClick={() => scrollToSection('testa')} />
                <rect x="85" y="75" width="30" height="20" rx="5" className="fill-primary/5 hover:fill-primary/20 stroke-primary/30 cursor-pointer transition-all" onClick={() => scrollToSection('glabela')} />
                <circle cx="65" cy="100" r="15" className="fill-primary/5 hover:fill-primary/20 stroke-primary/30 cursor-pointer transition-all" onClick={() => scrollToSection('periocular')} />
                <circle cx="135" cy="100" r="15" className="fill-primary/5 hover:fill-primary/20 stroke-primary/30 cursor-pointer transition-all" onClick={() => scrollToSection('periocular')} />
                <rect x="80" y="160" width="40" height="20" rx="10" className="fill-primary/5 hover:fill-primary/20 stroke-primary/30 cursor-pointer transition-all" onClick={() => scrollToSection('labios')} />
                <rect x="55" y="130" width="30" height="30" rx="5" className="fill-primary/5 hover:fill-primary/20 stroke-primary/30 cursor-pointer transition-all" onClick={() => scrollToSection('malar')} />
                <rect x="115" y="130" width="30" height="30" rx="5" className="fill-primary/5 hover:fill-primary/20 stroke-primary/30 cursor-pointer transition-all" onClick={() => scrollToSection('malar')} />
                <path d="M60 210 L140 210 L120 230 L80 230 Z" className="fill-primary/5 hover:fill-primary/20 stroke-primary/30 cursor-pointer transition-all" onClick={() => scrollToSection('pescoco')} />
              </svg>
              {/* Labels for guidance */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary pointer-events-none">Fronte</div>
              <div className="absolute top-[80px] left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary pointer-events-none">Glabela</div>
              <div className="absolute top-[105px] left-[55px] text-[8px] font-bold text-primary/60 pointer-events-none">Orbicular</div>
              <div className="absolute top-[165px] left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary pointer-events-none">Lábios</div>
           </div>

           <div className="flex-1 space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Mapa de Avaliação</h2>
              <p className="text-sm text-slate-500 leading-relaxed">Clique nas regiões da face para preencher detalhadamente as queixas e observações clínicas. O mapa ajuda a identificar as áreas de maior prioridade para o plano terapêutico.</p>
              <div className="flex flex-wrap gap-2">
                 {['Testa', 'Glabela', 'Orbicular', 'Malar', 'Lábios', 'Pescoço'].map(reg => (
                   <button 
                     key={reg} 
                     type="button"
                     onClick={() => scrollToSection(reg.toLowerCase())}
                     className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all"
                   >
                     {reg}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
      <Section title="Terços Superior e Médio">
        <Field label="Testa (Frontal)">
          <div id="testa">
            <FormTextArea value={(form.testa as string) || ''} onChange={e => set('testa', e.target.value)} placeholder="Linhas dinâmicas, estáticas, força..." />
          </div>
        </Field>
        <Field label="Glabela (Corrugador/Prócero)">
          <div id="glabela">
            <FormTextArea value={(form.glabela as string) || ''} onChange={e => set('glabela', e.target.value)} placeholder="Hipertonia, linhas de expressão..." />
          </div>
        </Field>
        <Field label="Periocular (Pés de galinha/Olheiras)">
          <div id="periocular">
            <FormTextArea value={(form.periocular as string) || ''} onChange={e => set('periocular', e.target.value)} placeholder="Flacidez, perda de volume, bolsas..." />
          </div>
        </Field>
        <Field label="Malar (Maçãs do rosto)">
          <div id="malar">
            <FormTextArea value={(form.malar as string) || ''} onChange={e => set('malar', e.target.value)} placeholder="Sustentação, perda de volume..." />
          </div>
        </Field>
      </Section>

      <Section title="Terço Inferior e Lábios">
        <Field label="Lábios">
          <div id="labios">
            <FormTextArea value={(form.labios as string) || ''} onChange={e => set('labios', e.target.value)} placeholder="Volume, contorno, hidratação, assimetria..." />
          </div>
        </Field>
        <Field label="Sulco Nasogeniano (Bigode Chinês)">
          <div id="sulconasogeniano">
            <FormTextArea value={(form.sulcoNasogeniano as string) || ''} onChange={e => set('sulcoNasogeniano', e.target.value)} placeholder="Profundidade, flacidez..." />
          </div>
        </Field>
        <Field label="Mento (Queixo)">
          <div id="mento">
            <FormTextArea value={(form.mento as string) || ''} onChange={e => set('mento', e.target.value)} placeholder="Projeção, contração muscular..." />
          </div>
        </Field>
        <Field label="Mandíbula">
          <div id="mandibula">
            <FormTextArea value={(form.mandibula as string) || ''} onChange={e => set('mandibula', e.target.value)} placeholder="Definição, contorno..." />
          </div>
        </Field>
      </Section>

      <Section title="Pescoço e Qualidade da Pele">
        <Field label="Pescoço (Platisma)">
          <div id="pescoco">
            <FormTextArea value={(form.pescoco as string) || ''} onChange={e => set('pescoco', e.target.value)} placeholder="Bandas platismais, flacidez..." />
          </div>
        </Field>
        <Field label="Qualidade Geral da Pele">
          <FormTextArea value={(form.qualidadePele as string) || ''} onChange={e => set('qualidadePele', e.target.value)} placeholder="Textura, brilho, espessura..." />
        </Field>
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <Toggle label="Poros Dilatados" checked={!!form.porosDilatados} onToggle={() => toggle('porosDilatados')} />
          <Field label="Hidratação">
             <input 
              type="text" 
              value={form.hidratacao || ''}
              onChange={(e) => setForm({...form, hidratacao: e.target.value})}
              placeholder="Ex: Baixa, normal, alta"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-primary"
             />
          </Field>
        </div>
      </Section>

      <Section title="Manchas e Cicatrizes">
        <Field label="Manchas (Melasma, Efélides, Solares)">
          <FormTextArea value={(form.manchas as string) || ''} onChange={e => set('manchas', e.target.value)} placeholder="Localização e característica" />
        </Field>
        <Field label="Cicatrizes (Acne, Outras)">
          <FormTextArea value={(form.cicatrizes as string) || ''} onChange={e => set('cicatrizes', e.target.value)} placeholder="Tipo e profundidade" />
        </Field>
      </Section>

      <div className="pt-2">
        <Field label="Observações de Avaliação Facial">
          <FormTextArea value={(form.observacoes as string) || ''} onChange={e => set('observacoes', e.target.value)} placeholder="Considerações clínicas adicionais" />
        </Field>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className={cn(
          "w-full py-4 mt-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
          saved ? "bg-emerald-500 text-white" : "bg-primary text-white shadow-primary/20"
        )}
      >
        {saved ? <><Check size={20} /> Avaliação Facial Salva!</> : <><Save size={20} /> Salvar Avaliação Facial</>}
      </motion.button>
    </div>
  );
};
