/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutGrid,
  Calendar,
  Users,
  MessageSquare,
  Package,
  BarChart3,
  Settings,
  ArrowLeft,
  Check,
  BriefcaseMedical,
  Edit3,
  Clipboard,
  Camera,
  Search,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Wallet,
  Bell,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Video,
  MoreVertical,
  Smile,
  Send,
  FileText,
  Fingerprint,
  Eye,
  Lock,
  User,
  Stethoscope,
  Footprints,
  Bandage,
  Activity,
  MoreHorizontal,
  Shield,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// New architecture imports
import { AppUser, Agendamento, AgendamentoStatus, Paciente, Anamnese, Atendimento, FinanceiroMovimentacao } from './types';
import { can, ROLE_LABELS, ROLE_COLORS } from './permissions';
import {
  INITIAL_USERS, INITIAL_SERVICOS, INITIAL_PACIENTES,
  INITIAL_ANAMNESES, INITIAL_AGENDAMENTOS, INITIAL_ATENDIMENTOS, INITIAL_FINANCEIRO,
} from './data';
import { AgendaPage } from './pages/AgendaPage';
import { PatientsPage as PatientModule } from './pages/PatientsPages';
import { supabase } from './lib/supabase';
import { chatService } from './chatService';
import { ChatConversation, ChatMessage, ChatType } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Legacy Page type (expanded) ---
type Page =
  | 'login'
  | 'agenda'
  | 'dashboard'
  | 'inventory'
  | 'patients'
  | 'service-record'
  | 'chat-list'
  | 'chat-detail'
  | 'reports'
  | 'settings'
  | 'clinic-data'
  | 'manage-services'
  | 'manage-users'
  | 'agenda-settings'
  | 'backup-data';

// --- Components ---

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: LayoutGrid },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'patients', label: 'Pacientes', icon: Users },
  { id: 'inventory', label: 'Estoque', icon: Package },
  { id: 'chat-list', label: 'Chat', icon: MessageSquare },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

const BottomNav = ({ currentPage, onNavigate }: { currentPage: Page, onNavigate: (page: Page) => void }) => {
  const isActive = (id: string) => {
    if (id === 'patients' && currentPage === 'service-record') return true;
    return currentPage === id;
  };

  return (
    <nav className="lg:hidden sticky bottom-0 bg-white border-t border-slate-100 px-1 pb-6 pt-2 z-50 flex justify-around items-center w-full">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id as Page)}
          className={cn(
            'flex flex-col items-center justify-center min-w-[52px] gap-1 transition-colors',
            isActive(item.id) ? 'text-primary' : 'text-slate-400'
          )}
        >
          <item.icon size={22} fill={isActive(item.id) ? 'currentColor' : 'none'} />
          <p className="text-[9px] font-medium leading-none">{item.label}</p>
        </button>
      ))}
    </nav>
  );
};

const Sidebar = ({ currentPage, onNavigate, currentUser, onLogout }: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  currentUser: AppUser;
  onLogout: () => void;
}) => {
  const isActive = (id: string) => {
    if (id === 'patients' && currentPage === 'service-record') return true;
    return currentPage === id;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-full shrink-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
          <Stethoscope size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm leading-tight">Podology Pro</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Sistema Clínico</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Page)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive(item.id)
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            )}
          >
            <item.icon size={19} fill={isActive(item.id) ? 'currentColor' : 'none'} className="shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate leading-tight">{currentUser.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ title, onBack, rightAction }: { title: string, onBack?: () => void, rightAction?: React.ReactNode }) => (
  <header className="flex items-center bg-white p-4 border-b border-slate-100 justify-between sticky top-0 z-40">
    <div className="flex items-center gap-3 flex-1">
      {onBack && (
        <button onClick={onBack} className="text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
      )}
      <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
        {title}
      </h2>
    </div>
    <div className="flex w-10 items-center justify-end">
      {rightAction}
    </div>
  </header>
);

// --- Pages ---

const LoginPage = ({ onLogin }: { onLogin: (user: AppUser) => void }) => {
  // When Supabase is active, the credential is an e-mail.
  // When using mock fallback, it's a username.
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (supabase) {
        // ── Supabase Auth ───────────────────────────────────────────────────
        let emailToLogin = credential.trim();
        // Permite logar usando apenas o nome de usuário (ex: admin)
        if (!emailToLogin.includes('@')) {
          emailToLogin = `${emailToLogin}@podologypro.com`;
        }

        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: emailToLogin,
          password,
        });

        if (authError || !data.user) {
          setError(authError?.message ?? 'Credenciais inválidas.');
          setLoading(false);
          return;
        }

        // Try to fetch the profile from a `profiles` table (role, name, avatar)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const appUser: AppUser = profileData
          ? {
              id: data.user.id,
              name: profileData.name ?? data.user.email ?? 'Usuário',
              username: profileData.username ?? data.user.email ?? data.user.id,
              password: '',
              role: profileData.role ?? 'RECEPCIONISTA',
              avatar: profileData.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name ?? 'U')}&background=25a1e4&color=fff`,
              active: true,
              createdAt: data.user.created_at,
            }
          : {
              id: data.user.id,
              name: data.user.email ?? 'Usuário',
              username: data.user.email ?? data.user.id,
              password: '',
              role: 'RECEPCIONISTA' as const,
              avatar: `https://ui-avatars.com/api/?name=U&background=25a1e4&color=fff`,
              active: true,
              createdAt: data.user.created_at,
            };

        onLogin(appUser);
      } else {
        // ── Mock fallback (no Supabase configured) ──────────────────────────
        const found = INITIAL_USERS.find(
          (u) => u.username === credential.trim() && u.password === password
        );
        if (found) {
          onLogin(found);
        } else {
          setError('Usuário ou senha incorretos.');
        }
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isSupabase = !!supabase;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background-light">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <Stethoscope size={48} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Podology Pro</h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Sistema de Podologia</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Usuário ou E-mail
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                placeholder="Ex: admin ou admin@podologypro.com"
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-semibold text-slate-700">Senha</label>
              <a className="text-xs font-semibold text-primary hover:underline transition-all" href="#">Esqueci minha senha</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                className="w-full pl-12 pr-12 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                placeholder="Sua senha secreta" 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" 
                type="button"
                onClick={() => setShowPassword((v) => !v)}
              >
                <Eye size={20} />
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg px-4 py-3"
            >
              <Lock size={16} />
              {error}
            </motion.div>
          )}

          <button
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Activity size={20} className="animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <LogOut size={20} className="rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="space-y-6 pt-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-500 font-medium">Ou acesse com</span>
            </div>
          </div>
          <button className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-all w-full" type="button">
            <Fingerprint size={40} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-600">Usar Biometria</span>
          </button>
        </div>
      </motion.div>
      <footer className="mt-8 text-center space-y-1">
        <p className="text-xs text-slate-400">© 2024 Podology Pro. Todos os direitos reservados.</p>
        <p className="text-[10px] text-slate-400/60 uppercase tracking-widest">Tecnologia para Saúde dos Pés</p>
      </footer>
    </div>
  );
};

const DashboardPage = () => {
  const data = [
    { name: 'Seg', value: 40 },
    { name: 'Ter', value: 60 },
    { name: 'Qua', value: 45 },
    { name: 'Qui', value: 85 },
    { name: 'Sex', value: 100 },
    { name: 'Sáb', value: 30 },
    { name: 'Dom', value: 20 },
  ];

  return (
    <div className="flex-1 pb-4">
      <Header 
        title="Financeiro Clínica" 
        rightAction={
          <button className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Bell size={20} />
          </button>
        }
      />
      
      <div className="px-4 pt-6 pb-2">
        <h3 className="text-slate-900 text-lg font-bold mb-4">Resumo do Dia</h3>
        <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 min-w-[160px] flex-1">
            <div className="flex items-center justify-between">
              <ArrowUp size={20} className="text-primary" />
              <span className="text-xs font-semibold text-primary uppercase">Entradas</span>
            </div>
            <div>
              <p className="text-primary text-sm font-medium">Hoje</p>
              <p className="text-slate-900 text-xl font-bold">R$ 1.250,00</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-50 border border-red-100 min-w-[160px] flex-1">
            <div className="flex items-center justify-between">
              <ArrowDown size={20} className="text-red-500" />
              <span className="text-xs font-semibold text-red-500 uppercase">Saídas</span>
            </div>
            <div>
              <p className="text-red-500 text-sm font-medium">Hoje</p>
              <p className="text-slate-900 text-xl font-bold">R$ 450,00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-slate-900 text-lg font-bold mb-4">Desempenho Semanal</h3>
        <div className="w-full h-48 bg-slate-50 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 4 ? '#25a1e4' : '#25a1e433'} />
                ))}
              </Bar>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 text-lg font-bold">Movimentações Recentes</h3>
          <button className="text-primary text-sm font-semibold">Ver todas</button>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { title: 'Consulta Padrão', category: 'Serviços', method: 'PIX', amount: '+ R$ 250,00', color: 'blue', icon: Stethoscope },
            { title: 'Kit Higiene Oral', category: 'Produtos', method: 'Cartão', amount: '+ R$ 85,00', color: 'orange', icon: ShoppingBag },
            { title: 'Energia Elétrica', category: 'Despesas', method: 'Dinheiro', amount: '- R$ 450,00', color: 'red', icon: Wallet },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={cn("size-10 rounded-full flex items-center justify-center", 
                  item.color === 'blue' ? "bg-blue-50 text-blue-600" : 
                  item.color === 'orange' ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                )}>
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                      item.color === 'blue' ? "bg-blue-100 text-blue-700" : 
                      item.color === 'orange' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                    )}>{item.category}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.method}</span>
                  </div>
                </div>
              </div>
              <p className={cn("font-bold", item.amount.startsWith('+') ? "text-emerald-500" : "text-red-500")}>{item.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  return (
    <div className="flex-1 pb-4">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Package size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Estoque</h1>
          </div>
          <button className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold">
            <Plus size={16} />
            Novo Produto
          </button>
        </div>
        <div className="relative group">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input className="block w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-sm placeholder:text-slate-500" placeholder="Buscar por nome ou código..." type="text"/>
        </div>
        <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar">
          {['Todos', 'Baixo Estoque', 'Medicamentos', 'Insumos'].map((filter, i) => (
            <button key={i} className={cn(
              "flex shrink-0 items-center justify-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium",
              i === 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
            )}>
              {filter}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 space-y-4">
        {[
          { name: 'Amoxicilina 500mg', code: '#100234', stock: '124 unidades', price: 'R$ 42,90', status: 'Em dia', color: 'emerald', img: 'https://picsum.photos/seed/med1/100/100' },
          { name: 'Soro Fisiológico 0,9%', code: '#100561', stock: '08 unidades', price: 'R$ 15,50', status: 'Baixo', color: 'orange', img: 'https://picsum.photos/seed/med2/100/100' },
          { name: 'Luvas Nitrílicas (M)', code: '#100889', stock: '45 caixas', price: 'R$ 58,00', status: 'Em dia', color: 'emerald', img: 'https://picsum.photos/seed/med3/100/100' },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
            {item.status === 'Baixo' && <div className="absolute top-0 right-0 w-1 h-full bg-orange-400"></div>}
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-primary overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{item.name}</h3>
                  <p className="text-xs text-slate-500">Cód: {item.code}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded", 
                  item.color === 'emerald' ? "text-emerald-600 bg-emerald-50" : "text-orange-500 bg-orange-100"
                )}>{item.status}</span>
                <p className="text-lg font-bold text-slate-900 mt-1">{item.price}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-y border-slate-50 mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Estoque Atual</span>
                <span className={cn("text-sm font-semibold", item.status === 'Baixo' ? "text-orange-600" : "text-slate-700")}>{item.stock}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className={cn("flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-colors",
                item.status === 'Baixo' ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"
              )}>
                <Plus size={18} />
                {item.status === 'Baixo' ? 'Repor' : 'Entrada'}
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-500 font-semibold text-sm">
                <Minus size={18} />
                Saída
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

const PatientsPage = ({ onSelectPatient }: { onSelectPatient: () => void }) => {
  return (
    <div className="flex-1 pb-4">
      <Header 
        title="Ficha Podológica" 
        rightAction={
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary">
            <Check size={24} />
          </button>
        }
      />
      
      <div className="px-6 py-4">
        <h3 className="text-slate-900 text-xl font-bold mb-1">Mapa de Lesões</h3>
        <p className="text-slate-500 text-sm">Selecione o tipo de ocorrência e toque na área do pé para marcar o local exato.</p>
      </div>

      <div className="px-6 mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">1. Selecione a ocorrência</p>
        <div className="flex flex-wrap gap-2">
          {['Micose', 'Fissura', 'Verruga', 'Calosidade', 'Unha Encravada'].map((chip, i) => (
            <button key={i} className={cn(
              "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
              i === 0 ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:border-primary/50"
            )}>
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 mb-8">
        <div className="relative bg-slate-50 rounded-xl p-8 border border-dashed border-slate-200 flex flex-col items-center">
          <p className="absolute top-4 left-4 text-[10px] font-bold text-slate-400 uppercase">Vista Plantar</p>
          <div className="relative w-48 h-80 flex items-center justify-center">
            <img 
              alt="Mapa anatômico do pé" 
              className="w-full h-full object-contain opacity-80" 
              src="https://picsum.photos/seed/foot/400/600" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-10 w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary/50 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Marcado</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-slate-300"></span> Disponível</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">2. Áreas Predefinidas</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Dedos', icon: Footprints },
            { label: 'Unhas', icon: Bandage },
            { label: 'Planta', icon: Footprints },
            { label: 'Calcanhar', icon: Footprints },
          ].map((area, i) => (
            <div key={i} onClick={onSelectPatient} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-primary transition-colors">
              <area.icon size={20} className="text-primary" />
              <span className="text-sm font-medium">{area.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ServiceRecordPage = () => {
  const [procedimento, setProcedimento] = useState('');
  const [notas, setNotas] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 pb-4">
      <Header 
        title="Registro de Atendimento" 
        rightAction={
          <button 
            onClick={handleSave}
            className={cn("flex items-center justify-center rounded-xl h-10 w-10 transition-colors", 
              saved ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
            )}
          >
            {saved ? <Check size={24} /> : <Check size={24} />}
          </button>
        }
      />
      
      <div className="p-4">
        <div className="bg-clinical-green rounded-xl p-4 flex gap-4 items-center">
          <div className="aspect-square bg-cover rounded-full h-16 w-16 border-2 border-white shadow-sm" style={{ backgroundImage: 'url("https://picsum.photos/seed/sarah/100/100")' }}></div>
          <div className="flex flex-col">
            <p className="text-slate-900 text-xl font-bold leading-tight">Sarah Jenkins</p>
            <div className="flex items-center gap-1 mt-1">
              <BriefcaseMedical size={14} className="text-primary" />
              <p className="text-slate-600 text-sm font-medium">Tratamento de Onicocriptose</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 mt-2">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-slate-800 text-base font-semibold">
            <Edit3 size={20} className="text-primary" />
            Descrição do procedimento
          </label>
          <textarea 
            value={procedimento}
            onChange={(e) => setProcedimento(e.target.value)}
            className="block w-full rounded-xl border-slate-200 bg-white focus:ring-primary focus:border-primary min-h-[120px] placeholder:text-slate-400 text-base p-3 outline-none border" 
            placeholder="Descreva detalhadamente o que foi realizado no atendimento..."
          ></textarea>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-slate-800 text-base font-semibold">
            <Clipboard size={20} className="text-primary" />
            Observações clínicas
          </label>
          <textarea 
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="block w-full rounded-xl border-slate-200 bg-white focus:ring-primary focus:border-primary min-h-[120px] placeholder:text-slate-400 text-base p-3 outline-none border" 
            placeholder="Notas sobre cicatrização, sensibilidade, alergias ou recomendações futuras..."
          ></textarea>
        </div>

        <div className="pt-2">
          <button onClick={() => alert('Abrindo câmera...')} className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            <Camera size={24} />
            Adicionar Foto Clínica
          </button>
          <p className="text-center text-slate-400 text-xs mt-3">Anexe fotos do "antes" e "depois" para o prontuário.</p>
        </div>
      </div>
      {saved && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full shadow-lg font-bold text-sm"
        >
          Registro salvo com sucesso!
        </motion.div>
      )}
    </div>
  );
};

const ChatListPage = ({ onSelectChat, currentUser }: { onSelectChat: (conv: ChatConversation) => void, currentUser: AppUser }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PRIVATE' | 'GROUP' | 'ARCHIVED'>('PRIVATE');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations(currentUser.id);
      setConversations(data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadConversations();
    const unsubscribe = chatService.subscribeToConversations(currentUser.id, loadConversations);
    return () => unsubscribe();
  }, [loadConversations, currentUser.id]);

  const filteredConversations = conversations.filter(conv => {
    const matchesTab = activeTab === 'ARCHIVED' ? conv.isArchived : (conv.type === activeTab && !conv.isArchived);
    if (!matchesTab) return false;
    if (!searchTerm) return true;
    const name = conv.nomeGroup || 'Conversa';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 pb-4 flex flex-col h-full overflow-hidden relative">
      <header className="flex flex-col bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center p-4 justify-between">
          <h2 className="text-slate-900 text-lg font-bold">Chat Interno</h2>
          <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            {currentUser.role}
          </div>
        </div>
        
        <div className="px-4 pb-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-16" size={16} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="flex px-4 gap-6">
          {[
            { id: 'PRIVATE', label: 'Conversas' },
            { id: 'GROUP', label: 'Grupos' },
            { id: 'ARCHIVED', label: 'Arquivadas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "pb-3 pt-2 text-sm font-bold transition-all border-b-2",
                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-slate-400"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
            <Activity className="animate-spin text-primary" size={32} />
            <p className="text-sm font-medium">Carregando chats...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4 opacity-40">
            <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center">
              <MessageSquare size={40} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Nenhuma conversa encontrada</p>
              <p className="text-sm">Inicie um novo papo com a equipe.</p>
            </div>
            <button 
              onClick={() => setShowNewChat(true)}
              className="mt-2 bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg"
            >
              Iniciar Conversa
            </button>
          </div>
        ) : (
          filteredConversations.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => onSelectChat(chat)} 
              className={cn(
                "flex items-center gap-4 px-4 min-h-[80px] py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50",
                (chat.unreadCount || 0) > 0 ? "bg-primary/5" : "bg-white"
              )}
            >
              <div className="relative">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14 border-2 border-slate-100 flex items-center justify-center overflow-hidden bg-slate-50">
                  {chat.avatarUrl ? (
                    <img src={chat.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : chat.type === 'GROUP' ? (
                    <Users size={24} className="text-primary/60" />
                  ) : (
                    <User size={24} className="text-slate-400" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 size-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col justify-center flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={cn("text-slate-900 text-base", (chat.unreadCount || 0) > 0 ? "font-bold" : "font-semibold")}>
                    {chat.nomeGroup || "Conversa"}
                  </p>
                  <p className="text-xs text-slate-400">{chat.lastMessageTime}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-slate-500 line-clamp-1 flex-1 mr-2">{chat.lastMessagePreview || "Sem mensagens ainda"}</p>
                  {(chat.unreadCount || 0) > 0 && (
                    <div className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="absolute bottom-6 right-6 lg:bottom-5 lg:right-5">
        <button 
          onClick={() => setShowNewChat(true)}
          className="bg-primary text-white size-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={30} />
        </button>
      </div>

      {showNewChat && (
        <NewChatModal 
          currentUser={currentUser} 
          onClose={() => setShowNewChat(false)} 
          onChatCreated={(conv) => {
            setShowNewChat(false);
            onSelectChat(conv);
          }}
        />
      )}
    </div>
  );
};

const NewChatModal = ({ currentUser, onClose, onChatCreated }: { 
  currentUser: AppUser, 
  onClose: () => void,
  onChatCreated: (c: ChatConversation) => void 
}) => {
  const [loading, setLoading] = useState(false);
  const users = INITIAL_USERS.filter(u => u.id !== currentUser.id);

  const startPrivateChat = async (otherUser: AppUser) => {
    setLoading(true);
    try {
      const conv = await chatService.createPrivateChat(currentUser.id, otherUser.id);
      if (conv) {
        onChatCreated({ ...conv, nomeGroup: otherUser.name, avatarUrl: otherUser.avatar });
      }
    } catch (error) {
      console.error('Erro ao criar chat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold">Nova Conversa</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {users.map(u => (
            <button 
              key={u.id}
              onClick={() => startPrivateChat(u)}
              disabled={loading}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all text-left"
            >
              <img src={u.avatar} className="size-10 rounded-full border border-slate-200" alt="" />
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                <p className="text-xs text-slate-400 capitalize">{u.role.toLowerCase()}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ChatDetailPage = ({ onBack, conversation, currentUser }: { onBack: () => void, conversation: ChatConversation, currentUser: AppUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatService.getMessages(conversation.id);
      setMessages(data as any);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  useEffect(() => {
    loadMessages();
    const unsubscribe = chatService.subscribeToMessages(conversation.id, (newMsg) => {
      setMessages(prev => {
        // Evita duplicados se já estiver na lista (ex: enviada localmente)
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
    return () => unsubscribe();
  }, [loadMessages, conversation.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const text = inputValue.trim();
    setInputValue('');

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: any = {
      id: tempId,
      conversationId: conversation.id,
      senderUserId: currentUser.id,
      messageType: 'TEXT',
      textContent: text,
      statusEnvio: 'ENVIANDO',
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const sent = await chatService.sendMessage({
        conversationId: conversation.id,
        senderId: currentUser.id,
        type: 'TEXT',
        content: text
      });
      
      if (sent) {
        setMessages(prev => prev.map(m => m.id === tempId ? sent as any : m));
      }
    } catch (error) {
      console.error('Falha ao enviar:', error);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, statusEnvio: 'ERRO' } : m));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <header className="flex items-center bg-white p-4 border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={onBack} className="text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-100">
              {conversation.avatarUrl ? (
                <img src={conversation.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : conversation.type === 'GROUP' ? (
                <Users size={20} className="text-primary/60" />
              ) : (
                <User size={20} className="text-slate-400" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="text-slate-900 text-base font-bold leading-tight truncate">{conversation.nomeGroup || "Conversa"}</h2>
            <span className="text-primary text-[10px] font-bold uppercase tracking-tight">Online • {conversation.type === 'GROUP' ? 'Grupo' : 'Privado'}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="text-slate-600 p-2 rounded-full hover:bg-slate-100 hidden sm:block">
            <Video size={20} />
          </button>
          <button className="text-slate-600 p-2 rounded-full hover:bg-slate-100">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 opacity-50">
            <Activity className="animate-spin text-primary" size={24} />
            <span className="text-sm font-medium">Carregando mensagens...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2">
            <MessageSquare size={48} />
            <p className="text-sm font-bold">Sem mensagens</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full">Hoje</span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.senderUserId === currentUser.id;
              return (
                <div key={msg.id} className={cn("flex flex-col gap-1 max-w-[85%]", isMe ? "ml-auto items-end" : "items-start")}>
                  {!isMe && conversation.type === 'GROUP' && (
                    <span className="text-[10px] font-bold text-slate-400 ml-3 mb-1">Equipe</span>
                  )}
                  <div className="flex items-end gap-2">
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0 mb-1">
                        <User size={14} className="text-slate-400" />
                      </div>
                    )}
                    <div className={cn(
                      "p-3 rounded-2xl shadow-sm border",
                      isMe 
                        ? "bg-primary text-white border-primary rounded-br-none" 
                        : "bg-white text-slate-800 border-slate-100 rounded-bl-none"
                    )}>
                      <p className="text-sm leading-relaxed">{msg.textContent}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-1 py-0.5">
                    <span className="text-[9px] text-slate-400 font-medium">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <div className="flex items-center">
                         {msg.statusEnvio === 'ENVIANDO' ? (
                           <Clock size={10} className="text-slate-300" />
                         ) : msg.statusEnvio === 'ERRO' ? (
                           <AlertCircle size={10} className="text-red-400" />
                         ) : (
                           <Check size={12} className={cn("text-white/80", msg.statusEnvio === 'LIDA' && "text-emerald-300")} />
                         )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      <footer className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button onClick={() => alert('Selecione um arquivo ou foto...')} className="text-slate-400 hover:text-primary p-2 transition-colors">
            <Plus size={24} />
          </button>
          <div className="flex-1 relative">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-100 border-none rounded-full py-3 px-5 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 placeholder-slate-500 transition-all" 
              placeholder="Sua mensagem..." 
              type="text"
            />
            <button onClick={() => alert('Emoji picker... 🤩')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
              <Smile size={20} />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-primary text-white w-11 h-11 flex items-center justify-center rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
};

const ReportsPage = () => {
  const billingData = [
    { name: 'Jan', value: 4000 },
    { name: 'Fev', value: 6500 },
    { name: 'Mar', value: 5000 },
    { name: 'Abr', value: 8500 },
    { name: 'Mai', value: 7000 },
    { name: 'Jun', value: 12450 },
  ];

  const pieData = [
    { name: 'Podologia Preventiva', value: 42 },
    { name: 'Tratamento de Calos', value: 28 },
    { name: 'Outros', value: 30 },
  ];

  const COLORS = ['#25a1e4', '#25a1e499', '#25a1e44d'];

  return (
    <div className="flex-1 pb-4">
      <Header title="Relatórios" />
      <nav className="flex border-b border-slate-100">
        <button className="flex-1 py-4 text-sm font-semibold text-slate-500">Semanal</button>
        <button className="flex-1 py-4 text-sm font-semibold text-primary border-b-2 border-primary">Mensal</button>
        <button className="flex-1 py-4 text-sm font-semibold text-slate-500">Anual</button>
      </nav>

      <main className="p-4 space-y-6">
        <section className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-slate-500 text-sm font-medium">Faturamento Mensal</h2>
              <p className="text-2xl font-bold mt-1">R$ 12.450,00</p>
            </div>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full">+12%</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billingData}>
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {billingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#25a1e4' : '#25a1e433'} />
                  ))}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-primary bg-primary/10 p-2 rounded-lg" size={36} />
            </div>
            <p className="text-slate-500 text-xs font-medium">Pacientes</p>
            <p className="text-xl font-bold">142</p>
            <p className="text-[10px] text-green-500 mt-1 font-medium">↑ 8% vs mês ant.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Package className="text-primary bg-primary/10 p-2 rounded-lg" size={36} />
            </div>
            <p className="text-slate-500 text-xs font-medium">Produtos</p>
            <p className="text-xl font-bold">R$ 2.180</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Vendas diretas</p>
          </div>
        </div>

        <section className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <h2 className="text-slate-500 text-sm font-medium mb-4">Serviços Mais Realizados</h2>
          <div className="h-48 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={billingData}>
                <Line type="monotone" dataKey="value" stroke="#25a1e4" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#25a1e4', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <h2 className="text-slate-500 text-sm font-medium mb-4">Produtos Mais Vendidos</h2>
          <div className="space-y-4">
            {[
              { name: 'Creme Hidratante Urea 10%', sold: '45 unidades vendidas', price: 'R$ 1.350', img: 'https://picsum.photos/seed/prod1/100/100' },
              { name: 'Óleo Fortalecedor Tea Tree', sold: '32 unidades vendidas', price: 'R$ 830', img: 'https://picsum.photos/seed/prod2/100/100' },
            ].map((prod, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{prod.name}</p>
                  <p className="text-xs text-slate-400">{prod.sold}</p>
                </div>
                <p className="text-sm font-bold text-primary">{prod.price}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// --- Settings Sub-Pages ---

interface ClinicService {
  id: number;
  name: string;
  duration: string;
  price: string;
}

const INITIAL_SERVICES: ClinicService[] = [
  { id: 1, name: 'Consulta Padrão', duration: '45 min', price: 'R$ 120,00' },
  { id: 2, name: 'Tratamento de Calos', duration: '30 min', price: 'R$ 80,00' },
  { id: 3, name: 'Onicocriptose', duration: '60 min', price: 'R$ 180,00' },
  { id: 4, name: 'Podologia Preventiva', duration: '50 min', price: 'R$ 150,00' },
];

const ClinicDataPage = ({ onBack }: { onBack: () => void }) => {
  const [form, setForm] = useState({
    name: 'Clínica Podology Pro',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Flores, 123 - Centro',
    city: 'São Paulo - SP',
    phone: '(11) 99999-9999',
    email: 'contato@podologypro.com.br',
    website: 'www.podologypro.com.br',
  });
  const [saved, setSaved] = useState(false);

  const fields = [
    { label: 'Nome da Clínica', key: 'name', placeholder: 'Nome da clínica' },
    { label: 'CNPJ', key: 'cnpj', placeholder: '00.000.000/0001-00' },
    { label: 'Endereço', key: 'address', placeholder: 'Rua, número, bairro' },
    { label: 'Cidade / Estado', key: 'city', placeholder: 'Cidade - UF' },
    { label: 'Telefone', key: 'phone', placeholder: '(00) 00000-0000' },
    { label: 'E-mail', key: 'email', placeholder: 'email@clinica.com' },
    { label: 'Site', key: 'website', placeholder: 'www.clinica.com.br' },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 pb-4">
      <Header title="Dados da Clínica" onBack={onBack} />
      <div className="p-4 space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{field.label}</label>
            <input
              value={form[field.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
        ))}
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2',
            saved ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'
          )}
        >
          {saved ? <><Check size={20} /> Salvo com sucesso!</> : 'Salvar Alterações'}
        </motion.button>
      </div>
    </div>
  );
};

const ManageServicesPage = ({ onBack }: { onBack: () => void }) => {
  const [services, setServices] = useState<ClinicService[]>(INITIAL_SERVICES);
  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState({ name: '', duration: '', price: '' });

  const addService = () => {
    if (!newService.name.trim()) return;
    setServices([...services, { id: Date.now(), ...newService }]);
    setNewService({ name: '', duration: '', price: '' });
    setShowForm(false);
  };

  const removeService = (id: number) => setServices(services.filter(s => s.id !== id));

  return (
    <div className="flex-1 pb-4">
      <Header
        title="Gerenciar Serviços"
        onBack={onBack}
        rightAction={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary"
          >
            <Plus size={20} />
          </button>
        }
      />
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Novo Serviço</h3>
              <input
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="Nome do serviço"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                  placeholder="Duração (ex: 45 min)"
                  className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary"
                />
                <input
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  placeholder="Preço (ex: R$ 150)"
                  className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold">Cancelar</button>
                <button onClick={addService} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold">Adicionar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-4 space-y-3 mt-2">
        <AnimatePresence>
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0, padding: 0 }}
              className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                <Footprints size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{service.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{service.duration}</span>
                  <span className="text-xs font-semibold text-primary">{service.price}</span>
                </div>
              </div>
              <button onClick={() => removeService(service.id)} className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors shrink-0">
                <Minus size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {services.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Footprints size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum serviço cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ManageUsersPage = ({ onBack }: { onBack: () => void }) => {
  const [users, setUsers] = useState<AppUser[]>([...INITIAL_USERS]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'RECEPCIONISTA' as 'ADMIN'|'GERENTE'|'RECEPCIONISTA' });

  const roleColors = {
    'ADMIN': 'bg-purple-100 text-purple-700',
    'GERENTE': 'bg-blue-100 text-blue-700',
    'RECEPCIONISTA': 'bg-emerald-100 text-emerald-700',
    // Legacy
    'Admin Master': 'bg-purple-100 text-purple-700',
    'Podólogo': 'bg-blue-100 text-blue-700',
    'Recepcionista': 'bg-emerald-100 text-emerald-700',
  } as Record<string, string>;

  const addUser = () => {
    if (!newUser.name.trim() || !newUser.username.trim()) return;
    const user: AppUser = {
      id: `u_${Date.now()}`,
      ...newUser,
      avatar: `https://picsum.photos/seed/${newUser.username}/200/200`,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, user]);
    setNewUser({ name: '', username: '', password: '', role: 'RECEPCIONISTA' });
    setShowForm(false);
  };

  const removeUser = (username: string) => {
    if (username === 'admin') return;
    setUsers(users.filter(u => u.username !== username));
  };

  return (
    <div className="flex-1 pb-4">
      <Header
        title="Gerenciar Usuários"
        onBack={onBack}
        rightAction={
          <button onClick={() => setShowForm(!showForm)} className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary">
            <Plus size={20} />
          </button>
        }
      />
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Novo Usuário</h3>
              <input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Nome completo"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Usuário (login)"
                  className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary"
                />
                <input
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Senha inicial"
                  type="password"
                  className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary"
                />
              </div>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'ADMIN'|'GERENTE'|'RECEPCIONISTA' })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary"
              >
        <option value="RECEPCIONISTA">Recepcionista</option>
                <option value="GERENTE">Gerente</option>
                <option value="ADMIN">Admin Master</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold">Cancelar</button>
                <button onClick={addUser} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold">Adicionar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-4 space-y-3 mt-2">
        {users.map((user) => (
          <div key={user.username} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">{user.name}</p>
              <p className="text-xs text-slate-400">@{user.username}</p>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block', roleColors[user.role])}>{user.role}</span>
            </div>
            {user.username !== 'admin' && (
              <button onClick={() => removeUser(user.username)} className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors shrink-0">
                <Minus size={16} />
              </button>
            )}
            {user.username === 'admin' && (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50">
                <Lock size={14} className="text-slate-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AgendaSettingsPage = ({ onBack }: { onBack: () => void }) => {
  const [days, setDays] = useState({ seg: true, ter: true, qua: true, qui: true, sex: true, sab: true, dom: false });
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [interval, setInterval] = useState('45');
  const [breakStart, setBreakStart] = useState('12:00');
  const [breakEnd, setBreakEnd] = useState('13:00');
  const [saved, setSaved] = useState(false);

  const dayLabels: { key: keyof typeof days; label: string }[] = [
    { key: 'seg', label: 'Seg' }, { key: 'ter', label: 'Ter' }, { key: 'qua', label: 'Qua' },
    { key: 'qui', label: 'Qui' }, { key: 'sex', label: 'Sex' }, { key: 'sab', label: 'Sáb' }, { key: 'dom', label: 'Dom' },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 pb-4">
      <Header title="Config. de Agenda" onBack={onBack} />
      <div className="p-4 space-y-6">
        <section className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-700">Dias de Funcionamento</h3>
          <div className="flex gap-2 justify-between">
            {dayLabels.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDays({ ...days, [key]: !days[key] })}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors',
                  days[key] ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Horário de Atendimento</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Abertura</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-primary text-slate-900" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Encerramento</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-primary text-slate-900" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Intervalo / Pausa</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Início da Pausa</label>
              <input type="time" value={breakStart} onChange={(e) => setBreakStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-primary text-slate-900" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Fim da Pausa</label>
              <input type="time" value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-primary text-slate-900" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Duração do Atendimento (min)</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-primary text-slate-900">
              {['30','45','60','90'].map(v => <option key={v} value={v}>{v} min</option>)}
            </select>
          </div>
        </section>

        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2',
            saved ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'
          )}
        >
          {saved ? <><Check size={20} /> Configurações Salvas!</> : 'Salvar Configurações'}
        </motion.button>
      </div>
    </div>
  );
};

const BackupDataPage = ({ onBack }: { onBack: () => void }) => {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const lastBackup = '10/03/2026 às 09:15';

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    }, 3000);
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      clinicName: 'Clínica Podology Pro',
      users: INITIAL_USERS.map(u => ({ username: u.username, name: u.name, role: u.role })),
      services: INITIAL_SERVICES,
      version: '2.4.0',
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `podology_backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 pb-4">
      <Header title="Backup de Dados" onBack={onBack} />
      <div className="p-4 space-y-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Último backup realizado</p>
            <p className="text-xs text-slate-500">{lastBackup}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-700">O que é incluído no backup?</h3>
          {['Dados da clínica e configurações','Lista de serviços e preços','Usuários e permissões','Configurações de agenda'].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check size={14} className="text-primary shrink-0" />
              <span className="text-sm text-slate-600">{item}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleExport}
          className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <FileText size={20} className="text-primary" />
          Exportar como JSON
        </button>

        <motion.button
          onClick={handleSync}
          disabled={syncing}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all',
            synced ? 'bg-emerald-500 text-white' :
            syncing ? 'bg-primary/70 text-white' : 'bg-primary text-white shadow-lg shadow-primary/20'
          )}
        >
          {synced ? (
            <><Check size={20} /> Sincronizado!</>
          ) : syncing ? (
            <><Activity size={20} className="animate-pulse" /> Sincronizando...</>
          ) : (
            <><Activity size={20} /> Sincronizar na Nuvem</>
          )}
        </motion.button>

        <p className="text-center text-xs text-slate-400 px-4">Os dados são criptografados antes de serem enviados para a nuvem.</p>
      </div>
    </div>
  );
};

const SettingsPage = ({ onLogout, onNavigate, currentUser }: { onLogout: () => void; onNavigate: (page: Page) => void; currentUser: AppUser }) => {
  const roleBadgeColor = ROLE_COLORS;

  const clinicItems = [
    { label: 'Dados da Clínica', sub: 'Endereço, CNPJ e contatos', icon: BriefcaseMedical, page: 'clinic-data' as Page },
    { label: 'Gerenciar Serviços', sub: 'Procedimentos e valores', icon: Footprints, page: 'manage-services' as Page },
  ];

  const adminItems = [
    { label: 'Gerenciar Usuários', sub: 'Acessos da secretária e equipe', icon: Users, page: 'manage-users' as Page },
    { label: 'Configurações de Agenda', sub: 'Horários e intervalos', icon: Calendar, page: 'agenda-settings' as Page },
    { label: 'Backup de Dados', sub: 'Exportar e sincronizar na nuvem', icon: Activity, page: 'backup-data' as Page },
  ];

  return (
    <div className="flex-1 pb-4">
      <Header title="Configurações" />
      
      <div className="p-6 flex flex-col items-center text-center">
        <div className="relative">
          <img 
            alt="Foto de perfil" 
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" 
            src={currentUser.avatar}
            referrerPolicy="no-referrer"
          />
          <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white">
            <Edit3 size={14} />
          </button>
        </div>
        <h2 className="mt-4 text-xl font-bold">{currentUser.name}</h2>
        <span className={cn('mt-1 text-xs font-bold px-3 py-1 rounded-full', (roleBadgeColor as Record<string,string>)[currentUser.role] ?? 'bg-slate-100 text-slate-600')}>{ROLE_LABELS[currentUser.role as keyof typeof ROLE_LABELS] ?? currentUser.role}</span>
      </div>

      <div className="space-y-6 px-4">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">Clínica e Serviços</h3>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
            {clinicItems.map((item) => (
              <button key={item.page} onClick={() => onNavigate(item.page)} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 w-full text-left">
                <div className="flex items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 size-10">
                  <item.icon size={20} />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-base font-medium leading-none mb-1">{item.label}</p>
                  <p className="text-slate-500 text-xs">{item.sub}</p>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">Administrativo</h3>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
            {adminItems.map((item) => (
              <button key={item.page} onClick={() => onNavigate(item.page)} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 w-full text-left">
                <div className="flex items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 size-10">
                  <item.icon size={20} />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-base font-medium leading-none mb-1">{item.label}</p>
                  <p className="text-slate-500 text-xs">{item.sub}</p>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            ))}
          </div>
        </section>

        <button 
          onClick={onLogout}
          className="w-full bg-white text-red-500 font-semibold p-4 rounded-xl border border-slate-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <LogOut size={20} />
          Sair da Conta
        </button>
        <p className="text-center text-slate-400 text-[10px] pb-4">Podology Pro v2.4.0 • Desenvolvido com foco no seu cuidado</p>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(!!supabase);

  // ── Global state (in-memory DB) ──────────────────────────────────────────
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(INITIAL_AGENDAMENTOS);
  const [pacientes, setPacientes] = useState<Paciente[]>(INITIAL_PACIENTES);
  const [anamneses, setAnamneses] = useState<Anamnese[]>(INITIAL_ANAMNESES);
  const [atendimentos] = useState<Atendimento[]>(INITIAL_ATENDIMENTOS);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const servicos = INITIAL_SERVICOS;

  // ── Restore Supabase session on mount ────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profileData } = await supabase!
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const appUser: AppUser = profileData
          ? {
              id: session.user.id,
              name: profileData.name ?? session.user.email ?? 'Usuário',
              username: profileData.username ?? session.user.email ?? session.user.id,
              password: '',
              role: profileData.role ?? 'RECEPCIONISTA',
              avatar: profileData.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name ?? 'U')}&background=25a1e4&color=fff`,
              active: true,
              createdAt: session.user.created_at,
            }
          : {
              id: session.user.id,
              name: session.user.email ?? 'Usuário',
              username: session.user.email ?? session.user.id,
              password: '',
              role: 'RECEPCIONISTA' as const,
              avatar: `https://ui-avatars.com/api/?name=U&background=25a1e4&color=fff`,
              active: true,
              createdAt: session.user.created_at,
            };

        setCurrentUser(appUser);
        setCurrentPage('dashboard');
      }
      setSessionLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        setCurrentPage('login');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleNavigate = (page: Page) => setCurrentPage(page);

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setCurrentPage('login');
  };

  if (sessionLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-4 text-primary">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Stethoscope size={32} />
          </div>
          <Activity size={24} className="animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Sub-pages that hide the bottom nav
  const settingsSubPages: Page[] = ['clinic-data', 'manage-services', 'manage-users', 'agenda-settings', 'backup-data'];
  const hideNav = currentPage === 'chat-detail' || settingsSubPages.includes(currentPage);

  return (
    /* Mobile: single column with BottomNav. Desktop: sidebar + content side-by-side */
    <div className="flex h-[100dvh] bg-background-light w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 lg:bg-background-light">
        {/* Mobile: centered card wrapper; Desktop: full width */}
        <div className="flex flex-col flex-1 w-full max-w-md mx-auto lg:max-w-none lg:mx-0 shadow-2xl lg:shadow-none bg-background-light overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-y-auto"
            >
              {currentPage === 'dashboard' && <DashboardPage />}
              {currentPage === 'agenda' && (
                <AgendaPage
                  currentUser={currentUser}
                  agendamentos={agendamentos}
                  pacientes={pacientes}
                  servicos={servicos}
                  onAddAgendamento={(a) => setAgendamentos(prev => [...prev, a])}
                  onUpdateStatus={(id, status) => setAgendamentos(prev =>
                    prev.map(a => a.id === id ? { ...a, status, atualizadoEm: new Date().toISOString() } : a)
                  )}
                />
              )}
              {currentPage === 'patients' && (
                <PatientModule
                  currentUser={currentUser}
                  pacientes={pacientes}
                  anamneses={anamneses}
                  atendimentos={atendimentos}
                  agendamentos={agendamentos}
                  servicos={servicos}
                  onAddPaciente={(p) => setPacientes(prev => [...prev, p])}
                  onUpdatePaciente={(p) => setPacientes(prev => prev.map(x => x.id === p.id ? p : x))}
                  onAddAnamnese={(a) => setAnamneses(prev => [...prev, a])}
                  onUpdateAnamnese={(a) => setAnamneses(prev => prev.map(x => x.id === a.id ? a : x))}
                />
              )}
              {currentPage === 'service-record' && <ServiceRecordPage />}
              {currentPage === 'inventory' && <InventoryPage />}
              {currentPage === 'chat-list' && currentUser && (
                <ChatListPage 
                  currentUser={currentUser}
                  onSelectChat={(conv) => {
                    setSelectedChat(conv);
                    setCurrentPage('chat-detail');
                  }} 
                />
              )}
              {currentPage === 'chat-detail' && currentUser && selectedChat && (
                <ChatDetailPage 
                  currentUser={currentUser}
                  onBack={() => setCurrentPage('chat-list')} 
                  conversation={selectedChat} 
                />
              )}
              {currentPage === 'reports' && <ReportsPage />}
              {currentPage === 'settings' && (
                <SettingsPage
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                  currentUser={currentUser}
                />
              )}
              {currentPage === 'clinic-data' && <ClinicDataPage onBack={() => setCurrentPage('settings')} />}
              {currentPage === 'manage-services' && <ManageServicesPage onBack={() => setCurrentPage('settings')} />}
              {currentPage === 'manage-users' && <ManageUsersPage onBack={() => setCurrentPage('settings')} />}
              {currentPage === 'agenda-settings' && <AgendaSettingsPage onBack={() => setCurrentPage('settings')} />}
              {currentPage === 'backup-data' && <BackupDataPage onBack={() => setCurrentPage('settings')} />}
            </motion.div>
          </AnimatePresence>

          {!hideNav && (
            <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
          )}
        </div>
      </div>
    </div>
  );
}
