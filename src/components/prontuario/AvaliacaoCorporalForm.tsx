import React, { useState, useEffect } from 'react';
import { Save, Check, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { AvaliacaoCorporal, Paciente, Sessao } from '../../types';
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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}
const FormInput = ({ value, onChange, ...rest }: InputProps) => (
  <input
    {...rest}
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-primary outline-none transition-all"
  />
);

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  paciente: Paciente;
  sessao?: Sessao;
  avaliacao?: AvaliacaoCorporal;
  onSave: (data: AvaliacaoCorporal) => void;
}

export const AvaliacaoCorporalForm: React.FC<Props> = ({ paciente, sessao, avaliacao, onSave }) => {
  const [form, setForm] = useState<Partial<AvaliacaoCorporal>>(avaliacao || {
    pacienteId: paciente.id,
    sessaoId: sessao?.id,
    retencaoLiquidos: false,
  });

  const [saved, setSaved] = useState(false);

  // Auto-calculate IMC
  useEffect(() => {
    if (form.peso && form.altura) {
      const hStr = form.altura.toString().replace(',', '.');
      const h = parseFloat(hStr);
      const w = form.peso;
      if (h > 0) {
        const imc = w / (h * h);
        if (imc !== form.imc) {
          setForm(prev => ({ ...prev, imc: parseFloat(imc.toFixed(2)) }));
        }
      }
    }
  }, [form.peso, form.altura]);

  const handleSave = () => {
    onSave({
      ...form,
      id: form.id || `ac_${Date.now()}`,
      pacienteId: paciente.id,
      sessaoId: sessao?.id,
      criadoEm: form.criadoEm || new Date().toISOString(),
    } as AvaliacaoCorporal);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key: keyof AvaliacaoCorporal, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <Section title="Medidas & Bioimpedancia">
        <div className="grid grid-cols-3 gap-3 col-span-full">
          <Field label="Peso (kg)">
             <FormInput 
              type="number" 
              step="0.1"
              value={form.peso || ''}
              onChange={e => set('peso', parseFloat(e.target.value) || undefined)}
              placeholder="0.0"
             />
          </Field>
          <Field label="Altura (m)">
             <FormInput 
              type="number" 
              step="0.01"
              value={form.altura || ''}
              onChange={e => set('altura', parseFloat(e.target.value) || undefined)}
              placeholder="1.65"
             />
          </Field>
          <Field label="IMC">
             <div className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-100 font-bold text-primary flex items-center gap-2">
               <Scale size={14} />
               {form.imc || '--.-'}
             </div>
          </Field>
        </div>
      </Section>

      <Section title="Regiões Avaliadas">
        <Field label="Abdômen">
          <FormTextArea value={(form.abdomen as string) || ''} onChange={e => set('abdomen', e.target.value)} placeholder="Gordura, flacidez, estrias..." />
        </Field>
        <Field label="Flancos">
          <FormTextArea value={(form.flancos as string) || ''} onChange={e => set('flancos', e.target.value)} placeholder="Acúmulo de gordura, medidas..." />
        </Field>
        <Field label="Coxas / Culotes">
          <FormTextArea value={(form.coxas as string) || ''} onChange={e => set('coxas', e.target.value)} placeholder="Celulite, flacidez cutânea/muscular..." />
        </Field>
        <Field label="Glúteos">
          <FormTextArea value={(form.gluteos as string) || ''} onChange={e => set('gluteos', e.target.value)} placeholder="Celulite (grau), ptose, fibrose..." />
        </Field>
        <Field label="Braços (Tríceps)">
          <FormTextArea value={(form.bracos as string) || ''} onChange={e => set('bracos', e.target.value)} placeholder="Flacidez, gordura, tônus..." />
        </Field>
        <Field label="Papada (Submentoniana)">
          <FormTextArea value={(form.papada as string) || ''} onChange={e => set('papada', e.target.value)} placeholder="Espessura da gordura, flacidez..." />
        </Field>
      </Section>

      <Section title="Aspectos Clínicos Corporais">
        <Field label="Grau de Celulite (HLDG)">
          <select 
            value={form.grauCelulite || ''} 
            onChange={e => set('grauCelulite', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-primary outline-none"
          >
            <option value="">Selecionar...</option>
            <option value="Grau I">Grau I (Invisível)</option>
            <option value="Grau II">Grau II (Visível à compressão)</option>
            <option value="Grau III">Grau III (Visível em repouso - "casca de laranja")</option>
            <option value="Grau IV">Grau IV (Nódulos dolorosos e deformidade)</option>
          </select>
        </Field>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Retenção de Líquidos</label>
          <button
            type="button"
            onClick={() => setForm({ ...form, retencaoLiquidos: !form.retencaoLiquidos })}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm w-full",
              form.retencaoLiquidos 
                ? "bg-primary/10 border-primary/30 text-primary font-semibold" 
                : "bg-slate-50 border-slate-200 text-slate-500"
            )}
          >
            <span>Presente / Edema</span>
            {form.retencaoLiquidos ? <Check size={16} /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
          </button>
        </div>
        <div className="col-span-full">
          <Field label="Assimetrias ou Observações">
            <FormTextArea value={(form.assimetrias as string) || ''} onChange={e => set('assimetrias', e.target.value)} placeholder="Diferença entre lados, cicatrizes corporais..." />
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
        {saved ? <><Check size={20} /> Avaliação Corporal Salva!</> : <><Save size={20} /> Salvar Avaliação Corporal</>}
      </motion.button>
    </div>
  );
};
