import React from 'react';
import { Sparkles, CheckCircle2, ChevronRight, User, MousePointerClick, ShieldCheck, PlayCircle, BarChart3, Calendar, FileText, Users, DollarSign, PieChart, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC<{ onNavigate: (page: 'login' | 'onboarding') => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center">
          <img src="/kraf-logo.png" alt="KRAF Logo" className="h-16 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'flex'; }} />
          <div className="hidden items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Sparkles size={24} className="text-primary" />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tight">KRAF</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onNavigate('login')}
            className="px-6 py-2.5 text-slate-600 font-bold hover:text-primary transition-colors"
          >
            Entrar
          </button>
          <button 
            onClick={() => onNavigate('onboarding')}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Criar minha clínica
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary-dark font-black uppercase tracking-widest text-xs rounded-full mb-6">
              O futuro da gestão de clínicas
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Plataforma Definitiva para <span className="text-secondary">Clínicas e Consultórios</span>.
            </h1>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-xl">
              Sistema completo para gestão de pacientes, agenda inteligente, prontuários avançados e controle financeiro integrado em um único lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                 onClick={() => onNavigate('onboarding')}
                 className="px-8 py-4 bg-secondary text-white text-lg font-black rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-secondary/30 transition-all flex items-center justify-center gap-2"
               >
                 Criar minha clínica <ChevronRight size={20} />
               </button>
               <button 
                 onClick={() => onNavigate('login')}
                 className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 text-lg font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
               >
                 <PlayCircle size={20} className="text-primary" /> Ver demonstração
               </button>
            </div>
            <div className="flex items-center gap-4 mt-8 text-sm font-semibold text-slate-400">
               <div className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-500" /> Sem taxa de adesão</div>
               <div className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-500" /> Cancele quando quiser</div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/30 blur-3xl rounded-full" />
            <div className="relative bg-white p-2 rounded-[24px] shadow-2xl border border-slate-200 transform hover:rotate-0 transition-transform duration-500">
               <div className="rounded-[16px] overflow-hidden border border-slate-100 bg-slate-50 aspect-[16/10] flex items-center justify-center relative">
                  {/* Mockup image placeholder for real dashboard */}
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" alt="Dashboard Preview" className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center">
            <div className="pt-4 md:pt-0">
              <p className="text-4xl font-black text-slate-900 mb-2">+500</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Clínicas Utilizando</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-4xl font-black text-slate-900 mb-2">+50 mil</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Atendimentos Gerenciados</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-4xl font-black text-slate-900 mb-2">99.9%</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Disponibilidade do Sistema</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto text-center">
           <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-16">Por que escolher a KRAF?</h2>
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: User, title: 'Prontuários Personalizáveis', desc: 'Mapeamentos, evoluções diárias e histórico completo acessível de qualquer lugar.' },
                { icon: MousePointerClick, title: 'Fácil de Usar', desc: 'Interface moderna, rápida e intuitiva. Sem treinamentos longos.' },
                { icon: ShieldCheck, title: 'Segurança Total', desc: 'Seus dados isolados e protegidos pela melhor tecnologia em nuvem.' }
              ].map((f, i) => (
                <div key={i} className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm text-center hover:-translate-y-2 transition-transform duration-300">
                   <div className="size-20 bg-primary/5 rounded-[24px] flex items-center justify-center text-primary mx-auto mb-8 shadow-inner">
                     <f.icon size={36} strokeWidth={2.5} />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800 mb-4">{f.title}</h3>
                   <p className="text-slate-500 leading-relaxed text-lg">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Tudo que sua clínica precisa</h2>
             <p className="text-xl text-slate-500 max-w-2xl mx-auto">Recursos projetados para otimizar o tempo e aumentar o faturamento do seu negócio.</p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Calendar, title: 'Agenda Inteligente', desc: 'Gerencie horários, profissionais e salas de forma visual e rápida.' },
                { icon: FileText, title: 'Prontuário Digital Completo', desc: 'Anamneses, termos de consentimento e evolução fotográfica.' },
                { icon: Users, title: 'Gestão de Pacientes', desc: 'Histórico completo, pacotes contratados e alertas automáticos.' },
                { icon: DollarSign, title: 'Controle Financeiro', desc: 'Caixa, repasses de profissionais, despesas e emissão de recibos.' },
                { icon: PieChart, title: 'Relatórios Gerenciais', desc: 'Métricas de conversão, tratamentos mais feitos e faturamento.' },
                { icon: Activity, title: 'Multi Usuários e Perfis', desc: 'Acessos separados para recepção, profissionais e administradores.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-8 rounded-3xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
                  <div className="shrink-0 mt-1 size-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-secondary">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-black mb-4">Como funciona?</h2>
             <p className="text-xl text-slate-400 max-w-2xl mx-auto">Comece a usar a KRAF em menos de 5 minutos.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-12 text-center relative">
             {/* Line connecting steps */}
             <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-slate-800 -z-10" />
             
             <div className="relative">
               <div className="size-16 bg-primary text-white text-2xl font-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">1</div>
               <h3 className="text-xl font-bold mb-3">Criar sua clínica</h3>
               <p className="text-slate-400">Cadastre sua clínica, adicione seus dados e escolha o seu plano ideal.</p>
             </div>
             
             <div className="relative">
               <div className="size-16 bg-primary text-white text-2xl font-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">2</div>
               <h3 className="text-xl font-bold mb-3">Configure seu sistema</h3>
               <p className="text-slate-400">Adicione usuários (equipe), pacientes e personalize seus procedimentos.</p>
             </div>

             <div className="relative">
               <div className="size-16 bg-secondary text-white text-2xl font-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-secondary/20">3</div>
               <h3 className="text-xl font-bold mb-3">Comece a atender</h3>
               <p className="text-slate-400">Gerencie a agenda, registre prontuários e acompanhe o fluxo financeiro na mesma tela.</p>
             </div>
           </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Planos sem surpresas</h2>
             <p className="text-xl text-slate-500 max-w-2xl mx-auto">Preço transparente para acompanhar o crescimento da sua clínica.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { name: 'Basic', price: '97', users: '1 Usuário', limit: 'Até 100 pacientes', popular: false },
                { name: 'Pro', price: '197', users: '5 Usuários', limit: 'Pacientes Ilimitados', popular: true },
                { name: 'Enterprise', price: '397', users: 'Usuários Ilimitados', limit: 'Pacientes Ilimitados', popular: false }
              ].map((p, i) => (
                <div key={i} className={`bg-white rounded-[32px] p-8 border-2 relative transition-transform hover:-translate-y-2 ${p.popular ? 'border-primary shadow-xl shadow-primary/10' : 'border-slate-100 shadow-sm'}`}>
                  {p.popular && (
                    <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full">
                      Mais Escolhido
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-sm font-bold text-slate-500">R$</span>
                    <span className="text-5xl font-black text-slate-900">{p.price}</span>
                    <span className="text-sm font-bold text-slate-500">/mês</span>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-700">{p.users}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-700">{p.limit}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-700">Agenda Interativa</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-700">Prontuário Completo</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onNavigate('onboarding')}
                    className={`w-full py-4 rounded-xl font-black transition-all ${p.popular ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                  >
                    Assinar {p.name}
                  </button>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto bg-gradient-to-tr from-slate-900 to-primary-dark rounded-[40px] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200')] opacity-[0.05] object-cover" />
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">Comece agora a modernizar a gestão da sua clínica.</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Pare de perder dados em planilhas ou sistemas antigos. Tenha o controle total do seu negócio na palma da mão.</p>
            <button 
              onClick={() => onNavigate('onboarding')}
              className="px-8 py-5 bg-secondary text-white text-xl font-black rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-secondary/30 transition-all inline-flex items-center justify-center gap-2"
            >
              Criar minha clínica <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
