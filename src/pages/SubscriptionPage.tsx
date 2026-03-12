import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Download,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { AppUser } from '../types';

interface SubscriptionPageProps {
  currentUser: AppUser;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ currentUser }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');

  const clinicaState = {
    plano: 'Pro',
    valor: 197.00,
    ciclo: 'mensal',
    usuariosPermitidos: 5,
    pacientesPermitidos: 'Ilimitado',
    recursos: ['Agenda e Prontuário Avançado', 'Gestão Financeira e Comissões', 'Pacotes de Procedimentos', 'Relatórios Estratégicos'],
    status: currentUser.subscriptionStatus || 'trial',
    formaPagamento: 'Pix',
    dataInicio: '11/03/2026',
    dataVencimento: currentUser.trialEndsAt ? new Date(currentUser.trialEndsAt).toLocaleDateString('pt-BR') : '10/04/2026',
    proximaCobranca: currentUser.trialEndsAt ? new Date(currentUser.trialEndsAt).toLocaleDateString('pt-BR') : '10/04/2026'
  };

  const historico = [
    { data: '11/03/2026', valor: 197.00, plano: 'Pro', formaPagamento: 'Pix', status: 'Pago' },
    { data: '11/02/2026', valor: 197.00, plano: 'Pro', formaPagamento: 'Pix', status: 'Pago' },
    { data: '11/01/2026', valor: 97.00, plano: 'Basic', formaPagamento: 'Cartão', status: 'Pago' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white px-6 py-10 border-b border-slate-100 mb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Minha Assinatura</h1>
             <p className="text-slate-500 mt-2 text-sm max-w-lg leading-relaxed">Gerencie seu plano, pagamentos e status da sua clínica na plataforma.</p>
           </div>
           <div className="hidden md:flex size-16 bg-primary/10 text-primary rounded-[24px] items-center justify-center -rotate-6 shadow-sm border border-primary/20">
             <CreditCard size={32} />
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* BANNER DE STATUS */}
        {clinicaState.status === 'active' && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-5 rounded-[24px] flex items-center gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="size-10 bg-emerald-100 flex items-center justify-center rounded-2xl shrink-0 z-10">
              <Check className="text-emerald-600" size={20} />
            </div>
            <div className="z-10">
               <h4 className="font-bold text-lg leading-tight">Sua assinatura está ativa</h4>
               <p className="text-sm opacity-90 mt-0.5">Seu acesso permanece liberado até a próxima cobrança.</p>
            </div>
          </div>
        )}
        {clinicaState.status === 'trial' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-[24px] flex items-center gap-4 shadow-sm relative overflow-hidden">
             <div className="size-10 bg-blue-100 flex items-center justify-center rounded-2xl shrink-0 z-10">
               <Clock className="text-blue-600" size={20} />
             </div>
             <div className="z-10">
                <h4 className="font-bold text-lg leading-tight">Você está no Período de Teste</h4>
                <p className="text-sm opacity-90 mt-0.5">Aproveite todos os recursos. Seu teste expira em {clinicaState.dataVencimento}.</p>
             </div>
          </div>
        )}
        {clinicaState.status === 'vencida' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-5 rounded-[24px] flex items-center gap-4 shadow-sm relative overflow-hidden">
             <div className="size-10 bg-yellow-100 flex items-center justify-center rounded-2xl shrink-0 z-10">
               <Clock className="text-yellow-600" size={20} />
             </div>
             <div className="z-10">
                <h4 className="font-bold text-lg leading-tight">Sua assinatura venceu</h4>
                <p className="text-sm opacity-90 mt-0.5">Regularize o pagamento para continuar usando a plataforma.</p>
             </div>
          </div>
        )}
        {clinicaState.status === 'inadimplente' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-[24px] flex items-center gap-4 shadow-sm relative overflow-hidden">
             <div className="size-10 bg-red-100 flex items-center justify-center rounded-2xl shrink-0 z-10">
               <ShieldAlert className="text-red-600" size={20} />
             </div>
             <div className="z-10">
                <h4 className="font-bold text-lg leading-tight">Clínica com Pendências Financeiras</h4>
                <p className="text-sm opacity-90 mt-0.5 font-medium">Realize o pagamento imediatamente para evitar bloqueio total do sistema.</p>
             </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
           {/* PLANO ATUAL CARD */}
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <CreditCard size={120} />
             </div>
             <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Plano Atual</div>
             
             <h3 className="text-2xl font-black text-slate-800 tracking-tight">{clinicaState.plano}</h3>
             
             <div className="mt-4 mb-6">
               <span className="text-5xl font-black text-slate-900 relative">
                 <span className="text-xl absolute -top-1 -left-4 text-slate-400">R$</span>
                 {clinicaState.valor}
               </span>
               <span className="text-slate-500 font-medium ml-1">/ mês</span>
             </div>

             <ul className="space-y-3 mb-8">
               <li className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                 <div className="size-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><Check size={12} strokeWidth={3} /></div> 
                 Limite de {clinicaState.usuariosPermitidos} usuários
               </li>
               <li className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                 <div className="size-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><Check size={12} strokeWidth={3} /></div> 
                 {clinicaState.pacientesPermitidos} pacientes
               </li>
               {clinicaState.recursos.map((r, i) => (
                 <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                   <div className="size-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><Check size={12} strokeWidth={3} /></div> 
                   {r}
                 </li>
               ))}
             </ul>

             <div className="flex gap-3">
               <button className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors hover:bg-slate-200">Alterar Plano</button>
             </div>
           </div>

           {/* INFOS DE COBRANCA E ACOES */}
           <div className="space-y-6">
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center justify-between">
                  Informações de Cobrança
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    clinicaState.status === 'active' && "bg-emerald-100 text-emerald-700",
                    clinicaState.status === 'trial' && "bg-blue-100 text-blue-700",
                    clinicaState.status === 'vencida' && "bg-yellow-100 text-yellow-700",
                    clinicaState.status === 'expired' && "bg-yellow-100 text-yellow-700",
                    clinicaState.status === 'inadimplente' && "bg-red-100 text-red-700"
                  )}>
                    {clinicaState.status === 'active' ? 'Ativa' : clinicaState.status === 'trial' ? 'Teste' : clinicaState.status === 'expired' ? 'Expirada' : clinicaState.status}
                  </span>
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-500">Forma de pagamento</span>
                    <span className="text-sm font-bold text-slate-800">{clinicaState.formaPagamento}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-500">Início da assinatura</span>
                    <span className="text-sm font-bold text-slate-800">{clinicaState.dataInicio}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-500">Vencimento Atual</span>
                    <span className="text-sm font-bold text-slate-800">{clinicaState.dataVencimento}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-500">Próxima Cobrança</span>
                    <span className="text-sm font-bold text-slate-800">{clinicaState.proximaCobranca}</span>
                  </div>
                </div>

                <div className="mt-8">
                  {clinicaState.status !== 'active' ? (
                    <button 
                      onClick={() => setShowPayment(true)}
                      className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                    >
                      Regularizar Pagamento <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowPayment(true)}
                      className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                    >
                      Pagar Mensalidade Agora <ArrowRight size={18} />
                    </button>
                  )}
                  <div className="flex gap-2 mt-3">
                     <button className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors">Atualizar Pagamento</button>
                     <button className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl text-xs hover:bg-red-100 transition-colors">Cancelar Assinatura</button>
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* HISTORICO */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
           <h3 className="text-lg font-black text-slate-800 mb-6">Histórico de Pagamentos</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="text-slate-400 border-b border-slate-100">
                 <tr>
                   <th className="pb-3 font-semibold px-4">Data</th>
                   <th className="pb-3 font-semibold px-4">Plano</th>
                   <th className="pb-3 font-semibold px-4">Método</th>
                   <th className="pb-3 font-semibold px-4 text-right">Valor</th>
                   <th className="pb-3 font-semibold px-4">Status</th>
                   <th className="pb-3 font-semibold px-4"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {historico.map((h, i) => (
                   <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                     <td className="py-4 px-4 font-medium text-slate-800">{h.data}</td>
                     <td className="py-4 px-4 text-slate-600">{h.plano}</td>
                     <td className="py-4 px-4 text-slate-600">{h.formaPagamento}</td>
                     <td className="py-4 px-4 font-bold text-slate-800 text-right">R$ {h.valor.toFixed(2)}</td>
                     <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-md text-[10px] uppercase tracking-wider">{h.status}</span>
                     </td>
                     <td className="py-4 px-4 text-right">
                       <button className="text-primary hover:text-emerald-500 transition-colors p-2 hover:bg-primary/5 rounded-xl"><Download size={18}/></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* MODAL PAGAMENTO */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPayment(false)} />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden relative z-10"
             >
                <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-xl font-black">Pagamento do Plano</h3>
                    <p className="text-slate-400 text-sm">Renovação automática do seu acesso</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-400">R$ {clinicaState.valor}</p>
                </div>
                
                <div className="p-8">
                  <div className="flex gap-4 mb-6">
                    <button 
                      onClick={() => setPaymentMethod('pix')}
                      className={cn("flex-1 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all font-bold", paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400')}
                    >
                      <QrCode size={24} /> Pix
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('cartao')}
                      className={cn("flex-1 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all font-bold", paymentMethod === 'cartao' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-100 text-slate-400')}
                    >
                      <CreditCard size={24} /> Cartão
                    </button>
                  </div>

                  {paymentMethod === 'pix' && (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-emerald-200 rounded-[24px] bg-emerald-50 mb-6">
                      <div className="w-40 h-40 bg-white border-4 border-white shadow-sm rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                        {/* Placeholder QR Code visual */}
                        <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,#10b981,#10b981_10px,#fff_10px,#fff_20px)]" />
                      </div>
                      <p className="font-bold text-center text-emerald-800 text-sm mb-4">Escaneie o QR Code ou copie a chave Pix. Liberação automática após o pagamento (em segundos).</p>
                      <button className="w-full py-3 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors">Copiar Código Pix copia-e-cola</button>
                    </div>
                  )}

                  {paymentMethod === 'cartao' && (
                    <div className="space-y-4 mb-6">
                       <input type="text" placeholder="Nome impresso no cartão" className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400" />
                       <div className="relative">
                         <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-4 pl-12 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400" />
                         <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                       </div>
                       <div className="flex gap-4">
                         <input type="text" placeholder="MM/AA" className="w-1/2 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center font-medium text-slate-800 placeholder:text-slate-400" />
                         <input type="text" placeholder="CVC" className="w-1/2 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center font-medium text-slate-800 placeholder:text-slate-400" />
                       </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button onClick={() => setShowPayment(false)} className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Voltar</button>
                    <button onClick={() => {
                        alert("Em uma integração real, isso processaria a renovação."); 
                        setShowPayment(false);
                      }} 
                      className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {paymentMethod === 'pix' ? 'Simular Confirmação Pix' : 'Confirmar e Renovar'}
                    </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
