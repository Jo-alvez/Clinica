import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { AnamneseEstetica, Paciente } from '../../types';
import { cn } from '../../utils';

// ─── Sub-components OUTSIDE the parent to prevent remount on re-render ────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4 pt-4 first:pt-0">
    <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-primary/10 pb-2">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500">{label}</label>
    {children}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
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

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}
const FormTextArea = ({ value, onChange, ...rest }: TextAreaProps) => (
  <textarea
    {...rest}
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-primary outline-none transition-all min-h-[80px]"
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
      "flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm",
      checked
        ? "bg-primary/10 border-primary/30 text-primary font-semibold"
        : "bg-slate-50 border-slate-200 text-slate-500"
    )}
  >
    <span>{label}</span>
    {checked
      ? <Check size={16} />
      : <div className="w-4 h-4 rounded-full border border-slate-300" />
    }
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  paciente: Paciente;
  anamnese?: AnamneseEstetica;
  onSave: (data: AnamneseEstetica) => void;
}

export const AnamneseEsteticaForm: React.FC<Props> = ({ paciente, anamnese, onSave }) => {
  const [form, setForm] = useState<Partial<AnamneseEstetica>>(anamnese || {
    pacienteId: paciente.id,
    gestante: false,
    lactante: false,
    tabagista: false,
    etilista: false,
    tendenciaQueloide: false,
    disturbioCoagulacao: false,
    anticoagulante: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      ...form,
      id: form.id || `an_${Date.now()}`,
      pacienteId: paciente.id,
      criadoEm: form.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    } as AnamneseEstetica);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: keyof AnamneseEstetica) =>
    setForm(prev => ({ ...prev, [key]: !prev[key] }));

  const set = (key: keyof AnamneseEstetica, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-8 pb-10">

      <Section title="Queixa & Objetivos">
        <Field label="Queixa Principal">
          <FormInput
            value={(form.queixaPrincipal as string) || ''}
            onChange={e => set('queixaPrincipal', e.target.value)}
            placeholder="Ex: Rugas na testa"
          />
        </Field>
        <Field label="Objetivo Estético">
          <FormInput
            value={(form.objetivoEstetico as string) || ''}
            onChange={e => set('objetivoEstetico', e.target.value)}
            placeholder="Ex: Rejuvenescimento natural"
          />
        </Field>
      </Section>

      <Section title="Histórico Médico">
        <Field label="Histórico Médico Geral">
          <FormTextArea
            value={(form.historicoMedico as string) || ''}
            onChange={e => set('historicoMedico', e.target.value)}
            placeholder="Doenças, condições atuais..."
          />
        </Field>
        <Field label="Doenças Crônicas">
          <FormInput
            value={(form.doencasCronicas as string) || ''}
            onChange={e => set('doencasCronicas', e.target.value)}
            placeholder="Ex: Diabetes, Hipertensão"
          />
        </Field>
        <Field label="Medicamentos de Uso Contínuo">
          <FormInput
            value={(form.medicamentosContinuos as string) || ''}
            onChange={e => set('medicamentosContinuos', e.target.value)}
            placeholder="Nomes e dosagens"
          />
        </Field>
        <Field label="Alergias Medicamentosas">
          <FormInput
            value={(form.alergiasMedicamentosas as string) || ''}
            onChange={e => set('alergiasMedicamentosas', e.target.value)}
            placeholder="Ex: Dipirona, Iodo"
          />
        </Field>
        <Field label="Alergias Cutâneas">
          <FormInput
            value={(form.alergiasCutaneas as string) || ''}
            onChange={e => set('alergiasCutaneas', e.target.value)}
            placeholder="Ex: Metais, cosméticos"
          />
        </Field>
        <Field label="Cirurgias Anteriores">
          <FormInput
            value={(form.cirurgiasAnteriores as string) || ''}
            onChange={e => set('cirurgiasAnteriores', e.target.value)}
            placeholder="Descrição e data aproximada"
          />
        </Field>
      </Section>

      <Section title="Histórico Estético Prévio">
        <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-2">
          <Toggle label="Toxina Botulínica"  checked={!!form.usoBotoxPrevio}           onToggle={() => toggle('usoBotoxPrevio')} />
          <Toggle label="Preenchimento"      checked={!!form.usoPreenchimentoPrevio}    onToggle={() => toggle('usoPreenchimentoPrevio')} />
          <Toggle label="Bioestimulador"     checked={!!form.usoBioestimuladorPrevio}   onToggle={() => toggle('usoBioestimuladorPrevio')} />
          <Toggle label="Escleroterapia"     checked={!!form.usoEscleroterapiaPrevio}   onToggle={() => toggle('usoEscleroterapiaPrevio')} />
        </div>
        <Field label="Outros Procedimentos Realizados">
          <FormTextArea
            value={(form.procedimentosPrevios as string) || ''}
            onChange={e => set('procedimentosPrevios', e.target.value)}
            placeholder="Descreva tratamentos anteriores e resultados"
          />
        </Field>
      </Section>

      <Section title="Fisiológico & Estilo de Vida">
        <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-2">
          <Toggle label="Gestante"           checked={!!form.gestante}             onToggle={() => toggle('gestante')} />
          <Toggle label="Lactante"           checked={!!form.lactante}             onToggle={() => toggle('lactante')} />
          <Toggle label="Tabagista"          checked={!!form.tabagista}            onToggle={() => toggle('tabagista')} />
          <Toggle label="Etilista"           checked={!!form.etilista}             onToggle={() => toggle('etilista')} />
          <Toggle label="Anticoncepcional"   checked={!!form.usoAnticoncepcional}  onToggle={() => toggle('usoAnticoncepcional')} />
          <Toggle label="Menopausa"          checked={!!form.menopausa}            onToggle={() => toggle('menopausa')} />
          <Toggle label="Pratica Exercícios" checked={!!form.praticaExercicios}    onToggle={() => toggle('praticaExercicios')} />
          <Toggle label="Uso Protetor Solar" checked={!!form.usoProtetorSolar}     onToggle={() => toggle('usoProtetorSolar')} />
        </div>
        <Field label="Ciclo Menstrual">
          <FormInput
            value={(form.cicloMenstrual as string) || ''}
            onChange={e => set('cicloMenstrual', e.target.value)}
            placeholder="Regular, irregular, data última..."
          />
        </Field>
        <Field label="Exposição Solar">
          <FormInput
            value={(form.exposicaoSolar as string) || ''}
            onChange={e => set('exposicaoSolar', e.target.value)}
            placeholder="Frequência, intensidade"
          />
        </Field>
      </Section>

      <Section title="Risco & Dermatológico">
        <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-2">
          <Toggle label="Tendência a Quelóide"     checked={!!form.tendenciaQueloide}     onToggle={() => toggle('tendenciaQueloide')} />
          <Toggle label="Distúrbio de Coagulação"  checked={!!form.disturbioCoagulacao}   onToggle={() => toggle('disturbioCoagulacao')} />
          <Toggle label="Uso de Anticoagulante"    checked={!!form.anticoagulante}        onToggle={() => toggle('anticoagulante')} />
          <Toggle label="Histórico de Trombose"    checked={!!form.historicoTrombose}     onToggle={() => toggle('historicoTrombose')} />
          <Toggle label="Sensibilidade Cutânea"    checked={!!form.sensibilidadeCutanea}  onToggle={() => toggle('sensibilidadeCutanea')} />
          <Toggle label="Histórico de Manchas"     checked={!!form.historiaManchas}       onToggle={() => toggle('historiaManchas')} />
          <Toggle label="Acne Ativa/Cicatricial"   checked={!!form.acne}                  onToggle={() => toggle('acne')} />
        </div>
        <Field label="Fototipo de Fitzpatrick">
          <select
            value={form.fototipo || ''}
            onChange={e => set('fototipo', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-primary outline-none"
          >
            <option value="">Selecionar...</option>
            <option value="I">Tipo I (Pele muito clara, sempre queima)</option>
            <option value="II">Tipo II (Pele clara, queima facilmente)</option>
            <option value="III">Tipo III (Pele morena clara, queima moderadamente)</option>
            <option value="IV">Tipo IV (Pele morena moderada, queima pouco)</option>
            <option value="V">Tipo V (Pele morena escura, raramente queima)</option>
            <option value="VI">Tipo VI (Pele negra, nunca queima)</option>
          </select>
        </Field>
        <Field label="Tipo de Pele">
          <select
            value={form.tipoPele || ''}
            onChange={e => set('tipoPele', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:border-primary outline-none"
          >
            <option value="">Selecionar...</option>
            <option value="Eudérmica">Eudérmica (Normal)</option>
            <option value="Alípica">Alípica (Seca)</option>
            <option value="Lipídica">Lipídica (Oleosa)</option>
            <option value="Mista">Mista</option>
          </select>
        </Field>
        <Field label="Rotina de Skincare / Produtos em Uso">
          <FormTextArea
            value={(form.rotinaSkincare as string) || ''}
            onChange={e => set('rotinaSkincare', e.target.value)}
            placeholder="Produtos utilizados diariamente"
          />
        </Field>
      </Section>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className={cn(
          "w-full py-4 mt-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
          saved ? "bg-emerald-500 text-white" : "bg-primary text-white shadow-primary/20"
        )}
      >
        {saved ? <><Check size={20} /> Anamnese Salva com Sucesso!</> : <><Save size={20} /> Salvar Anamnese Estética</>}
      </motion.button>
    </div>
  );
};
