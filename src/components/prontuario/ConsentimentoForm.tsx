import React, { useState } from 'react';
import { FileText, Shield, Check, X, Bookmark, Printer, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Paciente, Procedimento, Consentimento } from '../../types';
import { cn } from '../../utils';

interface ConsentimentoFormProps {
  paciente: Paciente;
  procedimentos: Procedimento[];
  onSave: (data: Consentimento) => void;
}

const DEFAULT_MODELS = [
  { id: 'toxina', name: 'Termo de Consentimento - Toxina Botulínica', content: `Pelo presente Termo de Consentimento Livre e Esclarecido, eu, [PACIENTE], declaro que fui devidamente informado(a) sobre o procedimento de aplicação de Toxina Botulínica.
  
1. **O PROCEDIMENTO:** Compreendo que a toxina botulínica é utilizada para relaxamento temporário da musculatura facial, visando a redução de rugas dinâmicas.
2. **RISCOS E EFEITOS COLATERAIS:** Fui alertado(a) sobre possíveis efeitos como hematomas, leve inchaço, cefaleia temporária ou, em casos raros, ptose palpebral.
3. **PÓS-OPERATÓRIO:** Comprometo-me a seguir as orientações de não deitar por 4 horas, não massagear a área e não praticar exercícios intensos nas primeiras 24 horas.
4. **RESULTADOS:** Entendo que o efeito inicia-se entre 3 a 5 dias, com pico em 15 dias, e durabilidade média de 3 a 6 meses.

Declaro estar satisfeito(a) com as explicações recebidas.` },
  { id: 'preenchimento', name: 'Termo de Consentimento - Preenchimento com Ácido Hialurônico', content: `Declaro que fui informado(a) sobre a aplicação de preenchedores à base de Ácido Hialurônico em [PACIENTE].

1. **OBJETIVO:** Reposição de volume facial e correção de sulcos.
2. **DURABILIDADE:** O produto é reabsorvível, com duração estimada de 8 a 12 meses.
3. **CONTRAINDICAÇÕES:** Declarei não possuir alergia a componentes da fórmula ou doenças autoimunes em atividade.
4. **POTENCIAIS RISCOS:** Edema, eritema e raramente oclusão vascular.` },
];

export const ConsentimentoForm: React.FC<ConsentimentoFormProps> = ({
  paciente,
  procedimentos,
  onSave
}) => {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS[0]);
  const [isSigned, setIsSigned] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSign = () => {
    setIsSigned(true);
    setShowSuccess(true);
    
    const newConsent: Consentimento = {
      id: `c_${Date.now()}`,
      pacienteId: paciente.id,
      modeloNome: selectedModel.name,
      textoFinal: selectedModel.content.replace('[PACIENTE]', paciente.nomeCompleto),
      assinaturaPacienteUrl: 'assinatura_digital_hash',
      assinadoEm: new Date().toISOString(),
      criadoEm: new Date().toISOString(),
    };
    
    onSave(newConsent);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-primary" size={24} /> Termos de Consentimento
          </h3>
          <p className="text-slate-500 text-sm font-medium">Documentação legal e segurança do paciente.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto">
          {DEFAULT_MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model);
                setIsSigned(false);
              }}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all",
                selectedModel.id === model.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-400 hover:text-primary"
              )}
            >
              {model.id === 'toxina' ? 'Botox' : 'Preenchimento'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden relative">
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-purple-500 w-full" />
        
        <div className="p-8 sm:p-12">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
               <div className="inline-flex p-3 bg-primary/5 rounded-2xl text-primary mb-2">
                  <FileText size={32} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">TCLE</h2>
               <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{selectedModel.name}</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-[24px] border border-slate-100 text-slate-700 leading-relaxed font-serif text-lg whitespace-pre-wrap">
              {selectedModel.content.replace('[PACIENTE]', paciente.nomeCompleto)}
            </div>

            <div className="pt-12 border-t border-dashed border-slate-200">
               <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                  {isSigned ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                       <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-emerald-500/20">
                          <Check size={32} strokeWidth={3} />
                       </div>
                       <p className="font-bold text-slate-900">Documento Assinado Digitalmente</p>
                       <p className="text-sm text-slate-500">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                       <p className="text-[10px] font-mono text-slate-300 mt-2">HASH: 4f2c9e1...a3b7</p>
                    </motion.div>
                  ) : (
                    <div className="w-full space-y-6">
                       <div className="text-center mb-4">
                          <p className="text-sm text-slate-500 mb-1">Assinatura do Paciente</p>
                          <p className="text-lg font-black text-slate-900">{paciente.nomeCompleto}</p>
                       </div>
                       
                       <button 
                         onClick={handleSign}
                         className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all group"
                       >
                          <Bookmark size={20} className="group-hover:translate-y-[-2px] transition-transform" /> 
                          Confirmar Identidade e Assinar Termo
                       </button>
                       <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest leading-relaxed">
                          Ao clicar no botão acima, você declara que leu e concorda com todos os termos apresentados, conferindo validade jurídica a esta assinatura digital.
                       </p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 z-10"
            >
              <Check size={18} /> Termo salvo e vinculado com sucesso!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap justify-center gap-4 py-4">
         <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Printer size={18} /> Imprimir
         </button>
         <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Download size={18} /> Baixar PDF
         </button>
         <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Share2 size={18} /> Enviar WhatsApp
         </button>
      </div>
    </div>
  );
};
