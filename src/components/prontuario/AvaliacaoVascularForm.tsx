import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { AvaliacaoVascular, Paciente, Sessao } from '../../types';
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

interface MultiToggleProps {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}
const MultiToggle = ({ items, selected, onToggle }: MultiToggleProps) => (
  <div className="flex flex-wrap gap-2">
    {items.map(item => (
      <button
        type="button"
        key={item}
        onClick={() => onToggle(item)}
        className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
          selected.includes(item)
            ? "bg-primary text-white border-primary"
            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
        )}
      >
        {item}
      </button>
    ))}
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

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  paciente: Paciente;
  sessao?: Sessao;
  avaliacao?: AvaliacaoVascular;
  onSave: (data: AvaliacaoVascular) => void;
}

export const AvaliacaoVascularForm: React.FC<Props> = ({ paciente, sessao, avaliacao, onSave }) => {
  const [form, setForm] = useState<Partial<AvaliacaoVascular>>(avaliacao || {
    pacienteId: paciente.id,
    sessaoId: sessao?.id,
    localizacao: [],
    sintomas: [],
    historicoFamiliarVarizes: false,
    usoMeiasCompressivas: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      ...form,
      id: form.id || `av_${Date.now()}`,
      pacienteId: paciente.id,
      sessaoId: sessao?.id,
      criadoEm: form.criadoEm || new Date().toISOString(),
    } as AvaliacaoVascular);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleArrayItem = (key: 'localizacao' | 'sintomas', item: string) => {
    const current = (form[key] as string[]) || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    setForm({ ...form, [key]: updated });
  };

  const set = (key: keyof AvaliacaoVascular, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <Section title="Queixa Vascular & Localização">
        <div className="col-span-full space-y-4">
          <Field label="Presença de Telangiectasias (Vasinhos/Microvarizes)">
            <FormTextArea 
              value={(form.telangiectasias as string) || ''} 
              onChange={e => set('telangiectasias', e.target.value)} 
              placeholder="Descreva o tipo, cor e intensidade..." 
            />
          </Field>
          
          <Field label="Regiões Localizadas">
            <MultiToggle 
              items={['Coxa Medial', 'Coxa Lateral', 'Coxa Posterior', 'Joelho', 'Panturrilha', 'Tornozelo', 'Pés']} 
              selected={(form.localizacao as string[]) || []}
              onToggle={item => toggleArrayItem('localizacao', item)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Sintomas & Histórico">
        <Field label="Sintomas Associados">
          <MultiToggle 
            items={['Dor', 'Peso nas pernas', 'Inchaço', 'Cansaço', 'Queimação', 'Cãibras']} 
            selected={(form.sintomas as string[]) || []}
            onToggle={item => toggleArrayItem('sintomas', item)}
          />
        </Field>
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, historicoFamiliarVarizes: !form.historicoFamiliarVarizes })}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm w-full",
              form.historicoFamiliarVarizes ? "bg-primary/10 border-primary/30 text-primary" : "bg-slate-50 border-slate-200 text-slate-500"
            )}
          >
            <span>Histórico Familiar de Varizes</span>
            {form.historicoFamiliarVarizes && <Check size={16} />}
          </button>
          
          <button
            type="button"
            onClick={() => setForm({ ...form, usoMeiasCompressivas: !form.usoMeiasCompressivas })}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm w-full",
              form.usoMeiasCompressivas ? "bg-primary/10 border-primary/30 text-primary" : "bg-slate-50 border-slate-200 text-slate-500"
            )}
          >
            <span>Uso Prévio de Meias Compressivas</span>
            {form.usoMeiasCompressivas && <Check size={16} />}
          </button>
        </div>
      </Section>

      <Section title="Tratamentos & Observações">
        <div className="col-span-full space-y-4">
          <Field label="Tratamentos Vasculares Prévios">
            <FormTextArea 
              value={(form.tratamentosPrevios as string) || ''} 
              onChange={e => set('tratamentosPrevios', e.target.value)} 
              placeholder="Laser, Cirurgia, Escleroterapia anterior..." 
            />
          </Field>
          
          <Field label="Observações Vasculares Gerais">
            <FormTextArea 
              value={(form.observacoes as string) || ''} 
              onChange={e => set('observacoes', e.target.value)} 
              placeholder="Considerações sobre circulação, coloração, teste de enchimento capilar..." 
            />
          </Field>
        </div>
      </Section>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className={cn(
          "w-full py-4 mt-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
          saved ? "bg-emerald-500 text-white" : "bg-primary text-white shadow-primary/20"
        )}
      >
        {saved ? <><Check size={20} /> Avaliação Vascular Salva!</> : <><Save size={20} /> Salvar Avaliação Vascular</>}
      </motion.button>
    </div>
  );
};
