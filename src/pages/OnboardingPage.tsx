import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, User, Mail, Phone, Lock, 
  ArrowRight, ShieldCheck, CreditCard,
  QrCode, Check, Loader2, Sparkles, ChevronLeft
} from 'lucide-react';
import { cn } from '../utils';
import { AppUser } from '../types';

export const OnboardingPage: React.FC<{ 
  onNavigateLogin: () => void, 
  onComplete: (user: AppUser) => void 
}> = ({ onNavigateLogin, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Hooking the callback check in useEffect for after-payment return
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
       const pending = sessionStorage.getItem('mp_pending_registration');
       if (pending) {
         setLoading(true);
         const { form, clinicaId } = JSON.parse(pending);
         
         const newAdmin: AppUser = {
           id: `u_${Date.now()}`,
           clinicaId: clinicaId,
           username: form.email,
           password: form.senha,
           name: form.responsavel,
           role: 'ADMIN',
           avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.responsavel)}&background=10b981&color=fff`,
           active: true,
           email: form.email,
           phone: form.telefone,
           createdAt: new Date().toISOString()
         };

         sessionStorage.removeItem('mp_pending_registration');
         
         setTimeout(() => {
           window.history.replaceState({}, document.title, window.location.pathname);
           onComplete(newAdmin);
         }, 1500);
       }
    }
  }, [onComplete]);

  const [form, setForm] = useState({
    clinica: '',
    responsavel: '',
    email: '',
    senha: '',
    plano: 'Pro',
    pagamento: 'pix' as 'pix' | 'cartao'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.clinica || !form.responsavel || !form.email || !form.senha) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleFinalize();
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const clinicaId = `c_${Date.now()}`;
      
      // Salva dados na sessão temporariamente para o callback após o checkout
      sessionStorage.setItem('mp_pending_registration', JSON.stringify({ form, clinicaId }));

      // Chamada para a Vercel Function de checkout
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plano: form.plano,
          preco: planos.find(p => p.nome === form.plano)?.preco,
          clinicaId,
          email: form.email
        })
      });

      const data = await response.json();

      if (data.sandbox_init_point && !data.error) {
        // Redirecionar para ambiente de Sandbox de pagamento do Mercado Pago
        window.location.href = data.sandbox_init_point;
      } else {
        alert(data.error || "Erro ao conectar com Mercado Pago.");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao iniciar pagamento.");
      setLoading(false);
    }
  };

  const handleStartFreeTrial = () => {
    setLoading(true);
    const clinicaId = `c_${Date.now()}`;
    const newAdmin: AppUser = {
      id: `u_${Date.now()}`,
      clinicaId: clinicaId,
      username: form.email,
      password: form.senha,
      name: form.responsavel,
      role: 'ADMIN',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.responsavel)}&background=10b981&color=fff`,
      active: true,
      email: form.email,
      phone: form.telefone,
      createdAt: new Date().toISOString(),
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    setTimeout(() => {
      setLoading(false);
      onComplete(newAdmin);
    }, 1500);
  };

  const planos = [
    { nome: 'Basic', preco: 97, desc: 'Ideal para profissionais autônomos.', users: 1, limit: 100 },
    { nome: 'Pro', preco: 197, desc: 'A melhor escolha para clínicas em crescimento.', users: 5, limit: 'Ilimitado', popular: true },
    { nome: 'Enterprise', preco: 497, desc: 'Gestão robusta para grandes volumes.', users: 'Ilimitado', limit: 'Ilimitado' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-primary/20">
      
      {/* Lado Esquerdo - Info da Marca */}
      <div className="hidden md:flex md:w-1/3 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
         <div className="z-10">
            <div className="flex items-center mb-12 cursor-pointer" onClick={() => onNavigateLogin()}>
              <img src="/logo.png" alt="ProClin" className="h-16 w-auto object-contain brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'flex'; }} />
              <div className="hidden items-center gap-2">
                <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Sparkles size={24} className="text-primary" />
                </div>
                <span className="font-black text-2xl tracking-tight">ProClin</span>
              </div>
            </div>
            <h2 className="text-4xl font-black mb-6 leading-tight max-w-sm">Junte-se às melhores clínicas e consultórios.</h2>
            <ul className="space-y-6 text-slate-400 font-medium">
              <li className="flex items-center gap-3"><Check className="text-emerald-500" /> Prontuários avançados</li>
              <li className="flex items-center gap-3"><Check className="text-emerald-500" /> Gestão financeira e comissões</li>
              <li className="flex items-center gap-3"><Check className="text-emerald-500" /> Controle de procedimentos e pacotes</li>
              <li className="flex items-center gap-3"><Check className="text-emerald-500" /> Suporte dedicado</li>
            </ul>
         </div>

         <div className="z-10 mt-12 bg-slate-800/50 p-6 rounded-[24px] border border-slate-700/50 backdrop-blur-sm">
           <p className="text-sm leading-relaxed text-slate-300 italic">"Depois do ProClin, nossa clínica dobrou o faturamento através do controle exato de pacientes e procedimentos."</p>
           <div className="mt-4 font-bold text-white">— Dra. Camila R., RJ</div>
         </div>

         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20" />
      </div>

      {/* Lado Direito - Fluxo de Etapas */}
      <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center">
         <div className="w-full max-w-xl">
           
           <button onClick={() => step === 1 ? onNavigateLogin() : setStep(prev => (prev - 1) as any)} className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors">
              <ChevronLeft size={16} /> Voltar
           </button>

           <div className="flex items-center justify-between mb-12 relative">
             <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
                  className="h-full bg-primary"
                  transition={{ duration: 0.3 }}
                />
             </div>
             {[1, 2, 3].map(i => (
               <div key={i} className={cn("size-10 rounded-full flex items-center justify-center font-black transition-colors shadow-sm", step >= i ? 'bg-primary text-white' : 'bg-white border-2 border-slate-200 text-slate-400')}>
                 {step > i ? <Check size={18} /> : i}
               </div>
             ))}
           </div>

           <AnimatePresence mode="wait">
             
             {step === 1 && (
               <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-8">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Configure sua clínica</h2>
                     <p className="text-slate-500">Crie seu acesso administrativo em segundos.</p>
                  </div>
                  <form onSubmit={handleNext} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nome da Clínica</label>
                       <div className="relative">
                         <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                         <input required name="clinica" value={form.clinica} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium placeholder:text-slate-300" placeholder="Ex: Clínica Bem Estar" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Responsável (Admin)</label>
                       <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                         <input required name="responsavel" value={form.responsavel} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium placeholder:text-slate-300" placeholder="Seu nome completo" />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">E-mail de Acesso</label>
                         <div className="relative">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                           <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium placeholder:text-slate-300" placeholder="seu@email.com" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Whatsapp</label>
                         <div className="relative">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                           <input required name="telefone" value={form.telefone} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium placeholder:text-slate-300" placeholder="(11) 90000-0000" />
                         </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Crie sua Senha</label>
                       <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                         <input required type="password" name="senha" value={form.senha} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium placeholder:text-slate-300" placeholder="Mínimo 6 caracteres" />
                       </div>
                    </div>

                    <button type="submit" className="w-full py-4 mt-8 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl shadow-slate-900/20 hover:-translate-y-1 flex items-center justify-center gap-2">
                       Continuar <ArrowRight size={20} />
                    </button>
                  </form>
               </motion.div>
             )}

             {step === 2 && (
               <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-8">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Escolha seu plano</h2>
                     <p className="text-slate-500">Mude ou cancele no painel a qualquer momento.</p>
                  </div>
                  <div className="grid gap-4">
                     {planos.map(plano => (
                       <div 
                         key={plano.nome}
                         onClick={() => setForm(p => ({ ...p, plano: plano.nome }))}
                         className={cn("p-6 rounded-[24px] border-2 cursor-pointer transition-all relative overflow-hidden", form.plano === plano.nome ? "border-primary bg-primary/5 shadow-md" : "border-slate-100 bg-white hover:border-slate-200")}
                       >
                          {plano.popular && form.plano !== plano.nome && <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Mais Vendido</div>}
                          {form.plano === plano.nome && (
                            <div className="absolute top-4 right-4 size-6 bg-primary rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={3} /></div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="text-xl font-bold text-slate-800">{plano.nome}</h3>
                             <div className="text-right">
                                <span className="text-2xl font-black text-slate-900 tracking-tight">R${plano.preco}</span>
                                <span className="text-xs text-slate-500 font-bold block">/mês</span>
                             </div>
                          </div>
                          <p className="text-sm text-slate-500 mb-4">{plano.desc}</p>
                          <div className="flex gap-4 border-t border-slate-100 pt-4">
                             <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-widest"><User size={14} className="text-primary"/> {plano.users} Usuário(s)</div>
                             <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-widest"><Building2 size={14} className="text-primary"/> {plano.limit} Pacientes</div>
                          </div>
                       </div>
                     ))}
                  </div>

                  <button onClick={handleNext} className="w-full py-4 mt-8 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl shadow-slate-900/20 hover:-translate-y-1 flex items-center justify-center gap-2">
                       Ir para Pagamento <ArrowRight size={20} />
                  </button>
               </motion.div>
             )}

             {step === 3 && (
               <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-8">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Ativar Clínica</h2>
                     <p className="text-slate-500">Realize o pagamento seguro para liberar sua plataforma.</p>
                  </div>
                  
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[20px] flex items-center gap-4 mb-8">
                    <ShieldCheck size={32} className="text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-900">Pagamento Seguro</h4>
                      <p className="text-xs text-emerald-700 font-medium">Sua clínica será liberada automaticamente após a confirmação.</p>
                    </div>
                  </div>

                  <div className="bg-white border text-center border-slate-200 rounded-[28px] overflow-hidden mb-8">
                     <div className="bg-slate-50 p-6 flex items-center justify-between border-b border-slate-200">
                        <span className="font-bold text-slate-600">Total a pagar:</span>
                        <span className="text-2xl font-black text-slate-900">R$ {planos.find(p => p.nome === form.plano)?.preco},00</span>
                     </div>
                     <div className="p-6">
                       <p className="text-sm font-medium text-slate-500 mb-6 text-center">Seremos redirecionados para o ambiente seguro do <span className="text-[#009EE3] font-black">Mercado Pago</span> para finalizar o Pix ou Cartão.</p>

                     </div>
                  </div>

                  <button 
                    onClick={handleNext} 
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                       {loading ? <><Loader2 size={20} className="animate-spin" /> Conectando Checkout Seguro...</> : <><ShieldCheck size={20} /> Ir para Pagamento Seguro</>}
                  </button>

                  <div className="mt-6 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">OU</p>
                    <button 
                      onClick={handleStartFreeTrial} 
                      disabled={loading}
                      className="w-full py-4 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 font-black rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                         <Check size={20} /> Começar Teste Grátis de 30 Dias
                    </button>
                    <p className="text-xs font-medium text-slate-400 mt-4 leading-relaxed max-w-sm mx-auto">Sem compromisso. Após 30 dias, nós solicitaremos a contratação do plano para você continuar acessando e crescendo conosco.</p>
                  </div>
               </motion.div>
             )}

           </AnimatePresence>
         </div>
      </div>
    </div>
  );
};
