import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard,
  TrendingUp, 
  Users, 
  Activity, 
  ShieldAlert, 
  Headset, 
  Tag, 
  BarChart,
  Settings,
  MoreVertical,
  Check,
  X,
  Search,
  Filter,
  LayoutDashboard,
  Edit,
  Lock,
  Unlock,
  History,
  Archive,
  Trash2,
  EyeOff,
  ExternalLink,
  ArrowLeft,
  Key,
  Globe,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../utils';

// Types for Mock Data
type SuperAdminTab = 'DASHBOARD' | 'CLINICAS' | 'PLANOS' | 'VOUCHERS' | 'ASSINATURAS' | 'COBRANCAS' | 'METRICAS' | 'AUDITORIA' | 'SUPORTE';

export const SuperAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('DASHBOARD');

  const tabs: { id: SuperAdminTab, label: string, icon: React.ElementType }[] = [
    { id: 'DASHBOARD', label: 'SaaS', icon: Activity },
    { id: 'CLINICAS', label: 'Clínicas', icon: Building2 },
    { id: 'PLANOS', label: 'Planos', icon: Tag },
    { id: 'VOUCHERS', label: 'Vouchers', icon: Ticket },
    { id: 'ASSINATURAS', label: 'Assinaturas', icon: Users },
    { id: 'COBRANCAS', label: 'Cobranças', icon: CreditCard },
    { id: 'METRICAS', label: 'Métricas', icon: TrendingUp },
    { id: 'AUDITORIA', label: 'Auditoria', icon: ShieldAlert },
    { id: 'SUPORTE', label: 'Suporte', icon: Headset },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD': return <SaaSDashboard />;
      case 'CLINICAS': return <ClinicasTab />;
      case 'PLANOS': return <PlanosTab />;
      case 'VOUCHERS': return <VouchersTab />;
      case 'ASSINATURAS': return <AssinaturasTab />;
      case 'COBRANCAS': return <CobrancasTab />;
      case 'METRICAS': return <MetricasTab />;
      case 'AUDITORIA': return <AuditoriaTab />;
      case 'SUPORTE': return <SuporteTab />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header Premium: Branding & User Info */}
      <header className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between shadow-2xl z-30 relative overflow-hidden">
        {/* Background Glows for Premium Look */}
        <div className="absolute top-[-50%] left-[-10%] w-[300px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-50%] right-[-10%] w-[300px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-6 relative z-10">
          <div className="size-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain brightness-0 invert" 
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.className = 'flex'; }}
            />
            <div className="hidden items-center justify-center font-black text-xl tracking-tighter italic text-white">KRAF</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-md">Master System</span>
              <h1 className="text-2xl font-black tracking-tight leading-none">Painel <span className="text-primary italic">Super Admin</span></h1>
            </div>
            <p className="text-slate-400 text-xs mt-1 font-medium italic opacity-80">Orquestração Central da Plataforma SaaS</p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-xs font-black text-white uppercase tracking-wider">Status do Sistema</span>
             <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <div className="size-1.5 bg-emerald-400 rounded-full" /> Todos os clusters ativos
             </span>
          </div>
          <div className="size-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer border border-white/5">
             <Settings size={18} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* Navigation Bar - Separated for better space management */}
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-start overflow-x-auto scrollbar-hide gap-1 py-1 z-20">
         {tabs.map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "flex items-center gap-2 px-5 py-3.5 rounded-none text-xs font-black uppercase tracking-widest transition-all relative group shrink-0",
               activeTab === tab.id 
                 ? "text-primary border-b-2 border-primary" 
                 : "text-slate-500 hover:text-slate-300"
             )}
           >
             <tab.icon size={14} className={cn("transition-transform group-hover:scale-110", activeTab === tab.id ? "text-primary" : "text-slate-500")} />
             <span>{tab.label}</span>
             {activeTab === tab.id && (
                <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-primary/5 -z-10" />
             )}
           </button>
         ))}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto p-6 md:p-10">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -15 }}
               transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
             >
               {renderContent()}
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ─── TELA 1: DASHBOARD SAAS ──────────────────────────────────────────────────

const SaaSDashboard = () => {
  const metrics = [
    { label: 'Total de Clínicas', value: '142', icon: Building2, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%' },
    { label: 'Mensalidade Total', value: 'R$ 48.900', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+8%' },
    { label: 'Em Teste (Trial)', value: '14', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50', trend: '+3%' },
    { label: 'Vouchers Ativos', value: '56', icon: Ticket, color: 'text-amber-500', bg: 'bg-amber-50', trend: '+24%' },
  ];

  const recentActivity = [
    { type: 'SIGNUP', user: 'Clínica Belleza', date: 'Hoje, 14:20', detail: 'Iniciou Trial (Plano Pro)' },
    { type: 'PAYMENT', user: 'Life Care SP', date: 'Hoje, 13:10', detail: 'Fatura Paga - R$ 297,00' },
    { type: 'SUPPORT', user: 'Dr. Roberto', date: 'Ontem, 16:45', detail: 'Novo chamado: Erro de API' },
    { type: 'VOUCHER', user: 'Admin', date: 'Ontem, 11:20', detail: 'Gerou voucher para WhatsApp' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Visão <span className="text-primary">Geral</span></h1>
          <p className="text-slate-500 font-medium ml-0.5">Métricas de saúde e crescimento do ecossistema.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex gap-1">
          {['Dia', 'Semana', 'Mês', 'Ano'].map(p => (
            <button key={p} className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", p === 'Mês' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="relative z-10 flex flex-col items-start gap-4">
               <div className={cn("size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}>
                  <m.icon size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-800 tracking-tighter">{m.value}</p>
                    <span className="text-xs font-black text-emerald-500">{m.trend}</span>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Crescimento de Receita (MRR)</h3>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-slate-400">R$ RECORRENTE</span>
                </div>
             </div>
             
             <div className="h-64 w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center group overflow-hidden relative">
                <svg className="w-full h-full px-8" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <path d="M0,80 Q50,60 100,70 T200,40 T300,50 T400,20" fill="none" stroke="#2563eb" strokeWidth="4" className="drop-shadow-lg" />
                  <path d="M0,80 Q50,60 100,70 T200,40 T300,50 T400,20 V100 H0 Z" fill="url(#grad_dashboard_v2)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad_dashboard_v2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm">
                  <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">Ver Relatório Completo</button>
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden group">
               <Activity className="absolute bottom-0 right-0 text-white/5 -mb-6 -mr-6 transition-transform group-hover:scale-110" size={140} />
               <h3 className="text-primary font-black uppercase tracking-widest text-xs mb-4">Saúde do Sistema</h3>
               <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end"><span className="text-2xl font-black">99.9%</span><span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Uptime Mensal</span></div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-400 h-full w-[99.9%]" /></div>
                  <p className="text-slate-400 text-xs leading-relaxed">Todos os clusters da AWS São Paulo estão operando em latência ideal.</p>
               </div>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
               <h3 className="text-slate-800 font-black uppercase tracking-widest text-xs mb-6">Planos Ativos</h3>
               <div className="space-y-5">
                 {[
                   { label: 'Pro (Padrão)', value: 65, color: 'bg-primary' },
                   { label: 'Enterprise', value: 20, color: 'bg-purple-500' },
                   { label: 'Basic', value: 15, color: 'bg-slate-300' },
                 ].map((p, i) => (
                   <div key={i} className="space-y-1.5">
                     <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight text-slate-500">
                        <span>{p.label}</span>
                        <span>{p.value}%</span>
                     </div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={cn("h-full", p.color)} style={{ width: `${p.value}%` }} />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <div className="p-8 border-b border-slate-50">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Atividade Recente</h3>
            <p className="text-xs text-slate-400 font-medium">Log global de eventos do sistema.</p>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px] no-scrollbar">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                <div className={cn(
                  "size-10 rounded-xl shrink-0 flex items-center justify-center transition-colors",
                  act.type === 'PAYMENT' ? "bg-emerald-100 text-emerald-600" :
                  act.type === 'SIGNUP' ? "bg-primary/10 text-primary" :
                  act.type === 'SUPPORT' ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"
                )}>
                  {act.type === 'PAYMENT' ? <CreditCard size={18} /> :
                   act.type === 'SIGNUP' ? <Building2 size={18} /> :
                   act.type === 'SUPPORT' ? <Headset size={18} /> : <Ticket size={18} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-800">{act.user}</span>
                  <span className="text-xs text-slate-500 font-medium">{act.detail}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{act.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 border-t border-slate-50">
            <button className="w-full py-4 bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-colors">Ver Todo o Histórico</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TELA 2: CLÍNICAS ────────────────────────────────────────────────────────

const ClinicasTab = () => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(false);
  const [activeClinic, setActiveClinic] = useState<any>(null);
  const [clinicas, setClinicas] = useState([
    { 
      id: 1, 
      nome: 'Clínica Vida SP', 
      responsavel: 'Dra. Ana Silva', 
      plano: 'Pro', 
      status: 'Ativo', 
      data: '2025-10-15', 
      usuarios: 4, 
      oculto: false,
      cnpj: '12.345.678/0001-90',
      endereco: 'Av. Paulista, 1000 - São Paulo, SP',
      telefone: '(11) 98888-7777',
      email: 'contato@vidasp.com.br',
      usuarios_lista: [
        { nome: 'Dra. Ana Silva', email: 'ana.silva@vidasp.com.br', login: 'ana_silva', senha: 'VidaSP@2025', cargo: 'Proprietário' },
        { nome: 'Maria Souza', email: 'maria@vidasp.com.br', login: 'maria_recepcao', senha: 'Maria#123', cargo: 'Recepcionista' },
        { nome: 'Dr. João Pedro', email: 'joao@vidasp.com.br', login: 'joaopedro_med', senha: 'JP@Med2025', cargo: 'Médico' },
      ]
    },
    { 
      id: 2, 
      nome: 'Consultório Saúde RJ', 
      responsavel: 'Dr. Roberto Costa', 
      plano: 'Basic', 
      status: 'Trial', 
      data: '2026-03-01', 
      usuarios: 1, 
      oculto: false,
      cnpj: '98.765.432/0001-10',
      endereco: 'Rua Lauro Müller, 116 - Rio de Janeiro, RJ',
      telefone: '(21) 97777-6666',
      email: 'roberto@sauderj.com',
      usuarios_lista: [
        { nome: 'Dr. Roberto Costa', email: 'roberto@sauderj.com', login: 'roberto_admin', senha: 'SaudeRJ!2026', cargo: 'Proprietário' },
      ]
    },
    { 
      id: 3, 
      nome: 'Centro Médico Sul', 
      responsavel: 'Dra. Camila Santos', 
      plano: 'Enterprise', 
      status: 'Bloqueado', 
      data: '2025-05-20', 
      usuarios: 12, 
      oculto: false,
      cnpj: '45.678.901/0001-55',
      endereco: 'Rua das Flores, 500 - Curitiba, PR',
      telefone: '(41) 96666-5555',
      email: 'admin@centromedicosul.com.br',
      usuarios_lista: [
        { nome: 'Dra. Camila Santos', email: 'camila@centromedicosul.com.br', login: 'camila_santos', senha: 'Sul@Camila25', cargo: 'Proprietário' },
        { nome: 'Ricardo Alves', email: 'ricardo@centromedicosul.com.br', login: 'ricardo_ti', senha: 'TI#Admin#Sul', cargo: 'TI/Suporte' },
      ]
    },
  ]);

  const toggleStatus = (id: number) => {
    setClinicas(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'Bloqueado' ? 'Ativo' : 'Bloqueado';
        return { ...c, status: newStatus };
      }
      return c;
    }));
    setOpenMenuId(null);
  };

  const toggleOcultar = (id: number) => {
    setClinicas(prev => prev.map(c => c.id === id ? { ...c, oculto: !c.oculto } : c));
    setOpenMenuId(null);
  };

  const deletarClinica = (id: number) => {
    if (confirm('Tem certeza que deseja excluir permanentemente esta clínica? Esta ação não pode ser desfeita.')) {
      setClinicas(prev => prev.filter(c => c.id !== id));
      setOpenMenuId(null);
    }
  };

  const openPlanChange = (clinic: any) => {
    setActiveClinic(clinic);
    setIsPlanChangeModalOpen(true);
    setOpenMenuId(null);
  };

  const openLogs = (clinic: any) => {
    setActiveClinic(clinic);
    setIsLogsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleAdminister = (clinic: any) => {
    // Salvamos a clínica no "contexto" de administração
    localStorage.setItem('admin_context_clinic', JSON.stringify({
      id: clinic.id,
      nome: clinic.nome,
      role: 'SUPER_ADMIN_ACTING_AS_OWNER',
      timestamp: new Date().toISOString()
    }));
    
    // Feedback visual e redirecionamento
    setOpenMenuId(null);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0f172a; color:white; font-family:sans-serif; transition: opacity 0.5s;';
    overlay.innerHTML = `
      <div style="text-align:center;">
        <h1 style="font-size:2.5rem; font-weight:900; margin-bottom:1rem; letter-spacing:-0.05em;">Acessando Clínica...</h1>
        <p style="color:#94a3b8; font-size:1.1rem; max-width:400px; margin:0 auto; padding:0 20px;">Você está entrando no painel de <b style="color:white;">${clinic.nome}</b> com plenos poderes de administrador.</p>
        <div style="margin-top:2.5rem; width:240px; height:6px; background:rgba(255,255,255,0.1); border-radius:10px; margin:2.5rem auto; overflow:hidden; position:relative;">
          <div style="position:absolute; inset:0; width:60%; height:100%; background:#2563eb; border-radius:10px; animation: load 1.5s infinite ease-in-out;"></div>
        </div>
      </div>
      <style>
        @keyframes load { 0% { left: -60%; } 100% { left: 100%; } }
      </style>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const changeClinicPlan = (newPlan: string) => {
    if (activeClinic) {
      setClinicas(prev => prev.map(c => c.id === activeClinic.id ? { ...c, plano: newPlan } : c));
      setIsPlanChangeModalOpen(false);
    }
  };

  const selectedClinic = clinicas.find(c => c.id === selectedClinicId);

  if (selectedClinicId && selectedClinic) {
    return (
      <ClinicDetailView 
        clinic={selectedClinic} 
        onBack={() => setSelectedClinicId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestão de Clínicas</h2>
          <p className="text-slate-500 text-sm mt-1">Visualize e gerencie todas as unidades da plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar clínica..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all w-64 shadow-sm" 
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-visible">
        <table className="w-full text-left text-sm border-separate border-spacing-0">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-black">
            <tr>
              <th className="px-6 py-5">Clínica</th>
              <th className="px-6 py-5">Responsável</th>
              <th className="px-6 py-5">Plano</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Criada Em</th>
              <th className="px-6 py-5 text-center">Usuários</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clinicas.filter(c => !c.oculto).map((c) => (
              <tr 
                key={c.id} 
                onClick={() => setSelectedClinicId(c.id)}
                className="group hover:bg-slate-50/80 transition-all duration-200 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {c.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-800">{c.nome}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{c.responsavel}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-black text-slate-600">
                    {c.plano.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("px-2.5 py-1 rounded-lg text-[11px] font-black tracking-wide uppercase", 
                    c.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' :
                    c.status === 'Trial' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  )}>{c.status}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">{formatDate(c.data)}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-black text-slate-800">{c.usuarios}</span>
                    <span className="text-[10px] text-slate-400 font-bold">MEMBROS</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      openMenuId === c.id ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "text-slate-400 hover:text-slate-800 hover:bg-slate-200/50"
                    )}
                  >
                    <MoreVertical size={20} />
                  </button>

                  <AnimatePresence>
                    {openMenuId === c.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-6 top-16 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-40 text-left overflow-hidden ring-4 ring-slate-900/5"
                        >
                          <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opções de Gestão</span>
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <div className="p-1">
                            <button 
                              onClick={() => handleAdminister(c)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group/item"
                            >
                              <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover/item:bg-primary/10"><LayoutDashboard size={16} /></div>
                              <div className="flex flex-col"><span className="text-sm font-bold">Administrar Clínica</span><span className="text-[10px] text-slate-400 group-hover/item:text-primary/70">Entrar como proprietário</span></div>
                            </button>
                            <button 
                              onClick={() => openPlanChange(c)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all group/item"
                            >
                              <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover/item:bg-purple-100"><CreditCard size={16} /></div>
                              <div className="flex flex-col"><span className="text-sm font-bold">Alterar Plano</span><span className="text-[10px] text-slate-400 group-hover/item:text-purple-400">Upgrade ou Downgrade</span></div>
                            </button>
                            <button 
                              onClick={() => toggleStatus(c.id)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all group/item"
                            >
                              <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover/item:bg-amber-100">{c.status === 'Bloqueado' ? <Unlock size={16} /> : <Lock size={16} />}</div>
                              <div className="flex flex-col"><span className="text-sm font-bold">{c.status === 'Bloqueado' ? 'Desbloquear' : 'Bloquear Clínica'}</span><span className="text-[10px] text-slate-400 group-hover/item:text-amber-400">Restrição de uso</span></div>
                            </button>
                            <button 
                              onClick={() => openLogs(c)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all group/item"
                            >
                              <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover/item:bg-slate-200"><History size={16} /></div>
                              <div className="flex flex-col"><span className="text-sm font-bold">Ver Logs</span><span className="text-[10px] text-slate-400 group-hover/item:text-slate-600">Histórico de atividade</span></div>
                            </button>
                          </div>
                          <div className="p-1 border-t border-slate-50 mt-1">
                            <button onClick={() => toggleOcultar(c.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all group/item">
                              <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover/item:bg-slate-200"><EyeOff size={16} /></div>
                              <div className="flex flex-col"><span className="text-sm font-bold">Ocultar Clínica</span><span className="text-[10px] text-slate-400 group-hover/item:text-slate-600">Remover da visão principal</span></div>
                            </button>
                            <button onClick={() => deletarClinica(c.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all group/item">
                              <div className="size-8 rounded-lg bg-red-100 flex items-center justify-center group-hover/item:bg-red-200/50 text-red-500"><Trash2 size={16} /></div>
                              <div className="flex flex-col"><span className="text-sm font-bold">Excluir Permanente</span><span className="text-[10px] text-red-400 group-hover/item:text-red-500">Remoção de dados</span></div>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal de Logs */}
        <AnimatePresence>
          {isLogsModalOpen && activeClinic && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Logs de Atividade</h3>
                    <p className="text-sm text-slate-500">{activeClinic.nome}</p>
                  </div>
                  <button onClick={() => setIsLogsModalOpen(false)} className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto">
                  {[
                    { date: 'Hoje, 10:45', user: 'Dra. Ana Silva', action: 'Alterou status do paciente João Rocha' },
                    { date: 'Hoje, 09:12', user: 'Maria Souza', action: 'Realizou agendamento (Nova Consulta)' },
                    { date: 'Ontem, 16:30', user: 'Sistema', action: 'Fatura mensal processada com sucesso' },
                    { date: '11 Mar, 11:20', user: 'Maria Souza', action: 'Excluiu prontuário (Ação Auditada)' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm">
                      <div className="flex flex-col min-w-[100px] shrink-0"><span className="font-bold text-slate-800">{log.date}</span><span className="text-[10px] text-slate-400 font-black uppercase">{log.user}</span></div>
                      <div className="text-slate-600 font-medium">{log.action}</div>
                    </div>
                  ))}
                </div>
                <div className="p-8 border-t border-slate-100 text-center"><button onClick={() => setIsLogsModalOpen(false)} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl text-sm">Fechar Logs</button></div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de Alterar Plano */}
        <AnimatePresence>
          {isPlanChangeModalOpen && activeClinic && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPlanChangeModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-800 text-center uppercase tracking-tighter">Alterar Plano</h3>
                  <p className="text-sm text-slate-500 text-center">{activeClinic.nome}</p>
                </div>
                <div className="p-8 space-y-3">
                  {['Basic', 'Pro', 'Enterprise'].map((plan) => (
                    <button 
                      key={plan}
                      onClick={() => changeClinicPlan(plan)}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 flex items-center justify-between group transition-all",
                        activeClinic.plano === plan ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex flex-col items-start">
                        <span className={cn("text-lg font-black", activeClinic.plano === plan ? "text-primary" : "text-slate-800")}>{plan}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Upgrade Instantâneo</span>
                      </div>
                      {activeClinic.plano === plan ? <div className="size-6 rounded-full bg-primary flex items-center justify-center text-white"><Check size={14} /></div> : <div className="size-6 rounded-full border-2 border-slate-200" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {clinicas.filter(c => !c.oculto).length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="size-16 bg-slate-50 flex items-center justify-center rounded-2xl mb-4"><Building2 className="text-slate-300" size={32} /></div>
            <h3 className="text-slate-800 font-bold uppercase tracking-widest text-xs">Nenhuma clínica ativa</h3>
            <button onClick={() => setClinicas(prev => prev.map(c => ({ ...c, oculto: false })))} className="mt-4 text-primary font-bold text-sm hover:underline">Restaurar clínicas ocultas</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── COMPONENTE: DETALHES DA CLÍNICA ───────────────────────────────────────

const ClinicDetailView = ({ clinic, onBack }: { clinic: any; onBack: () => void }) => {
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  const togglePassword = (email: string) => {
    setShowPasswords(prev => ({ ...prev, [email]: !prev[email] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="size-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{clinic.nome}</h2>
            <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", 
              clinic.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' :
              clinic.status === 'Trial' ? 'bg-purple-100 text-purple-700' :
              'bg-red-100 text-red-700'
            )}>{clinic.status}</span>
          </div>
          <p className="text-slate-500 font-medium ml-0.5">Responsável: <span className="text-slate-800 font-bold">{clinic.responsavel}</span></p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card: Dados Corporativos */}
        <div className="lg:col-span-1 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Building2 size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Dados da Empresa</h3>
          </div>
          
          <div className="space-y-4">
            <InfoItem icon={ClipboardList} label="CNPJ" value={clinic.cnpj} />
            <InfoItem icon={MapPin} label="Endereço" value={clinic.endereco} />
            <InfoItem icon={Phone} label="Telefone" value={clinic.telefone} />
            <InfoItem icon={Mail} label="E-mail" value={clinic.email} />
            <InfoItem icon={Tag} label="Plano Atual" value={clinic.plano} isBadge />
          </div>
        </div>

        {/* Card: Usuários e Credenciais */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Usuários & Credenciais</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">
              {clinic.usuarios_lista.length} Usuários Ativos
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-8 py-4">Usuário</th>
                  <th className="px-8 py-4">Login</th>
                  <th className="px-8 py-4">Senha</th>
                  <th className="px-8 py-4 text-right">Cargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinic.usuarios_lista.map((user: any) => (
                  <tr key={user.email} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{user.nome}</span>
                        <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono text-xs">{user.login}</code>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="relative group">
                          <input 
                            type={showPasswords[user.email] ? "text" : "password"} 
                            readOnly 
                            value={user.senha} 
                            className="bg-transparent border-none outline-none font-mono text-slate-600 w-24 text-sm"
                          />
                        </div>
                        <button 
                          onClick={() => togglePassword(user.email)}
                          className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Key size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                        {user.cargo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value, isBadge = false }: { icon: any, label: string, value: string, isBadge?: boolean }) => (
  <div className="flex items-start gap-3">
    <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
      <Icon size={16} />
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</span>
      {isBadge ? (
        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase w-fit tracking-tighter">
          {value.toUpperCase()}
        </span>
      ) : (
        <span className="text-sm font-bold text-slate-700 leading-tight">{value}</span>
      )}
    </div>
  </div>
);

// ─── TELA 3: PLANOS ──────────────────────────────────────────────────────────

interface Plan {
  id: number;
  name: string;
  price: string;
  users: string | number;
  patients: string | number;
  popular?: boolean;
  features: string[];
}

const PlanosTab = () => {
  const [plans, setPlans] = useState<Plan[]>([
    { id: 1, name: 'Basic', price: '97', users: 1, patients: 50, features: ['Limite de 1 usuário(s)', '50 pacientes', 'Agendamento online'] },
    { id: 2, name: 'Pro', price: '297', users: 5, patients: 'Ilimitado', popular: true, features: ['Limite de 5 usuário(s)', 'Ilimitado pacientes', 'Agendamento online', 'Relatórios Avançados'] },
    { id: 3, name: 'Enterprise', price: '497', users: 'Ilimitado', patients: 'Ilimitado', features: ['Limite Ilimitado usuário(s)', 'Ilimitado pacientes', 'Agendamento online', 'API Personalizada', 'Suporte 24/7'] }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Plan>>({});

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      users: '',
      patients: '',
      features: ['Agendamento online'],
      popular: false
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...formData } as Plan : p));
    } else {
      const newPlan = {
        ...formData,
        id: Math.max(...plans.map(p => p.id)) + 1,
        features: formData.features || ['Agendamento online']
      } as Plan;
      setPlans(prev => [...prev, newPlan]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Planos de Assinatura</h2>
          <p className="text-slate-500 text-sm">Configure os pacotes e preços da plataforma</p>
        </div>
        <button 
          onClick={handleAdd}
          className="px-6 py-3 bg-primary text-white font-bold rounded-2xl text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Tag size={18} />
          Criar Novo Plano
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <motion.div 
            layout
            key={p.id} 
            className={cn(
              "bg-white rounded-[40px] p-8 border-2 shadow-sm relative flex flex-col transition-all group",
              p.popular ? "border-primary shadow-primary/5 shadow-2xl" : "border-slate-100 hover:border-slate-200"
            )}
          >
            {p.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Mais Vendido
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800">{p.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plano Mensal</p>
              </div>
              <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Tag size={20} />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">R$</span>
                <span className="text-5xl font-black text-slate-900 tracking-tight">{p.price}</span>
                <span className="text-slate-400 font-bold ml-1">/mês</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {p.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <div className="size-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check size={12} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleEdit(p)}
              className={cn(
                "w-full py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2",
                p.popular 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <Edit size={16} />
              Editar Plano
            </button>
          </motion.div>
        ))}
      </div>

      {/* Modal de Edição/Criação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
            >
              <form onSubmit={handleSave}>
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">
                      {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
                    </h3>
                    <p className="text-sm text-slate-500">Preencha os dados do pacote</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Plano</label>
                      <input 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary outline-none transition-all font-bold"
                        placeholder="Ex: Diamond"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Mensal (R$)</label>
                      <input 
                        required
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary outline-none transition-all font-bold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuários</label>
                      <input 
                        value={formData.users}
                        onChange={e => setFormData({...formData, users: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary outline-none transition-all font-bold"
                        placeholder="Ex: 10 ou Ilimitado"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pacientes</label>
                      <input 
                        value={formData.patients}
                        onChange={e => setFormData({...formData, patients: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary outline-none transition-all font-bold"
                        placeholder="Ex: 500 ou Ilimitado"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <input 
                      type="checkbox" 
                      id="isPopular"
                      checked={formData.popular}
                      onChange={e => setFormData({...formData, popular: e.target.checked})}
                      className="size-5 rounded-lg border-2 border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <label htmlFor="isPopular" className="text-sm font-bold text-slate-700 cursor-pointer flex-1">
                      Destacar como plano popular (Mais Vendido)
                    </label>
                  </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    {editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Outras telas podem ser expandidas conforme a necessidade, por enquanto coloquei placeholders.
const VouchersTab = () => {
  const [vouchers, setVouchers] = useState([
    { id: 1, code: 'TRIAL24-XXXX-AB1', status: 'Ativo', expires: '24h', used: false, created: '2026-03-12' },
    { id: 2, code: 'TRIAL24-XXXX-CD2', status: 'Expirado', expires: '0h', used: false, created: '2026-03-10' },
    { id: 3, code: 'TRIAL24-XXXX-EF3', status: 'Usado', expires: '-', used: true, created: '2026-03-11' },
  ]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const generateVoucher = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newVoucher = {
      id: Date.now(),
      code: `TRIAL24-PRO-${random}`,
      status: 'Ativo',
      expires: '24h',
      used: false,
      created: new Date().toISOString().split('T')[0]
    };
    setVouchers(prev => [newVoucher, ...prev]);
  };

  const shareWhatsApp = (code: string) => {
    const message = encodeURIComponent(`Olá! Aqui está o seu link de acesso exclusivo de 24 horas para o ProClin: http://proclin.com.br/trial?code=${code}. Aproveite!`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = () => {
    if (confirmDeleteId !== null) {
      setVouchers(prev => prev.filter(v => v.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="size-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center tracking-tight">Deletar Voucher?</h3>
              <p className="text-slate-500 text-sm text-center mt-2 font-medium">
                Esta ação é <span className="font-black text-red-500">permanente</span> e não pode ser desfeita. O voucher será removido imediatamente.
              </p>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Sim, Deletar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Ticket className="text-primary" size={28} />
            Gerador de Vouchers (24h)
          </h2>
          <p className="text-slate-500 font-medium mt-1">Gere códigos temporários para facilitar vendas pelo WhatsApp.</p>
        </div>
        <button
          onClick={generateVoucher}
          className="px-6 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Ticket size={20} />
          GERAR NOVO VOUCHER
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Código do Voucher</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Criado em</th>
              <th className="px-8 py-5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {vouchers.map((v) => (
                <motion.tr
                  key={v.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                        <Key size={16} />
                      </div>
                      <code className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-mono font-bold">{v.code}</code>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      v.status === 'Ativo' ? "bg-emerald-100 text-emerald-600" :
                      v.status === 'Usado' ? "bg-slate-100 text-slate-500" : "bg-red-100 text-red-600"
                    )}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-500 text-xs">
                    {v.created}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => shareWhatsApp(v.code)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <Phone size={14} />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => copyCode(v.id, v.code)}
                        className={cn("p-2 transition-all rounded-lg", copiedId === v.id ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-primary hover:bg-primary/5")}
                        title="Copiar Código"
                      >
                        {copiedId === v.id ? <Check size={18} /> : <ClipboardList size={18} />}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(v.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                        title="Excluir Voucher"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {vouchers.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <Ticket size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum voucher gerado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
};
