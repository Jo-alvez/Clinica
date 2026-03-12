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
  Pin,
  BellOff,
  Archive,
  Sparkles,
  HelpCircle,
  BookOpen,
  DollarSign,
  Syringe,
  UserPlus,
  RefreshCw,
  TrendingUp,
  CreditCard,
  PackageOpen,
  CheckCircle2,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, Cell, AreaChart, Area, Tooltip as RechartsTooltip
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// New architecture imports
import { AppUser, Agendamento, AgendamentoStatus, Paciente, AnamneseEstetica, Sessao, FinanceiroMovimentacao, Procedimento, FotoClinica, Consentimento, Pacote, PacotePaciente, AplicacaoToxina, Modulo, ClinicaModulo } from './types';
import { can, ROLE_LABELS, ROLE_COLORS } from './permissions';
import {
  INITIAL_USERS, INITIAL_PROCEDIMENTOS, INITIAL_PACIENTES,
  INITIAL_ANAMNESES, INITIAL_AGENDAMENTOS, INITIAL_SESSAO, INITIAL_FINANCEIRO,
  INITIAL_PACOTES, INITIAL_PACOTES_PACIENTE, INITIAL_TOXINA
} from './data';
import { AgendaPage } from './pages/AgendaPage';
import { PatientsPage as PatientModule } from './pages/PatientsPages';
import { supabase } from './lib/supabase';
import { chatService } from './chatService';
import { ChatConversation, ChatMessage, ChatType } from './types';
import { SalesPage } from './pages/SalesPage';
import { InventoryPage } from './pages/InventoryPage';
import { HelpPage } from './pages/HelpPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';

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
  | 'sales'
  | 'reports'
  | 'chat-list'
  | 'chat-detail'
  | 'help'
  | 'settings'
  | 'subscription'
  | 'superadmin' // ADDED
  | 'clinic-data'
  | 'manage-services'
  | 'manage-users'
  | 'agenda-settings'
  | 'backup-data'
  | 'store-modules';

// --- Components ---

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: LayoutGrid, adminOnly: false },
  { id: 'agenda', label: 'Agenda', icon: Calendar, adminOnly: false },
  { id: 'patients', label: 'Pacientes', icon: Users, adminOnly: false },
  { id: 'inventory', label: 'Estoque', icon: Package, adminOnly: false },
  { id: 'sales', label: 'Loja', icon: ShoppingBag, adminOnly: false },
  { id: 'chat-list', label: 'Chat', icon: MessageSquare, adminOnly: false },
  { id: 'help', label: 'Ajuda', icon: HelpCircle, adminOnly: false },
  { id: 'settings', label: 'Ajustes', icon: Settings, adminOnly: false },
  { id: 'store-modules', label: 'Módulos', icon: PackageOpen, clinicAdminOnly: true },
  { id: 'subscription', label: 'Minha Assinatura', icon: CreditCard, clinicAdminOnly: true },
  { id: 'superadmin', label: 'SaaS Admin', icon: Shield, adminOnly: true },
];

const BottomNav = ({ currentPage, onNavigate, currentUser, installedModules = [] }: { currentPage: Page, onNavigate: (page: Page) => void, currentUser: AppUser, installedModules?: ClinicaModulo[] }) => {
  const visibleNav = NAV_ITEMS.filter(item => {
    if ((item as any).adminOnly && currentUser.role !== 'SUPER_ADMIN') return false;
    if ((item as any).clinicAdminOnly && currentUser.role !== 'ADMIN') return false;
    if ((item as any).moduleId && !installedModules.some(m => m.moduloId === (item as any).moduleId && m.status === 'ativo')) return false;
    return true;
  });

  const isActive = (id: string) => {
    if (id === 'patients' && currentPage === 'service-record') return true;
    return currentPage === id;
  };

  return (
    <nav className="lg:hidden sticky bottom-0 bg-white border-t border-slate-100 px-1 pb-6 pt-2 z-50 flex justify-around items-center w-full overflow-x-auto">
      {visibleNav.map((item) => (
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

const Sidebar = ({ currentPage, onNavigate, currentUser, onLogout, installedModules = [] }: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  currentUser: AppUser;
  onLogout: () => void;
  installedModules?: ClinicaModulo[];
}) => {
  const isActive = (id: string) => {
    if (id === 'patients' && currentPage === 'service-record') return true;
    return currentPage === id;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-full shrink-0 z-40">
      {/* Logo */}
      <div className="flex items-center px-6 py-8">
        <img src="/logo.png" alt="ProClin" className="h-12 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'flex'; }} />
        <div className="hidden items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Sparkles size={22} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-base leading-tight">ProClin</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.1em]">Gestão Inteligente</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter(item => {
          if ((item as any).adminOnly && currentUser.role !== 'SUPER_ADMIN') return false;
          if ((item as any).clinicAdminOnly && currentUser.role !== 'ADMIN') return false;
          if ((item as any).moduleId && !installedModules.some(m => m.moduloId === (item as any).moduleId && m.status === 'ativo')) return false;
          // Hide regular nav items for SUPER_ADMIN so they only see SaaS items
          if (currentUser.role === 'SUPER_ADMIN' && !['superadmin', 'help', 'settings'].includes(item.id)) return false;
          return true;
        }).map((item) => (
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
  <header className="flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-50">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="p-2 transition-all hover:bg-slate-100 rounded-2xl text-slate-600">
          <ArrowLeft size={24} />
        </button>
      )}
      <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
    <div className="flex items-center gap-3">
      {rightAction}
    </div>
  </header>
);

// --- Pages ---

const LoginPage = ({ onLogin, onBack }: { onLogin: (user: AppUser) => void, onBack?: () => void }) => {
  // When Supabase is active, the credential is an e-mail.
  // When using mock fallback, it's a username.
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [voucher, setVoucher] = useState('');
  const [isVoucherMode, setIsVoucherMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVoucherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucher.trim()) {
      setError('Insira um código de voucher válido.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulating validation for 24h access
    setTimeout(() => {
      const trialUser: AppUser = {
        id: `trial_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Clínica Trial (WhatsApp)',
        username: `trial_${voucher.trim().toUpperCase()}`,
        role: 'ADMIN',
        avatar: 'https://ui-avatars.com/api/?name=Trial+Clinic&background=7B61FF&color=fff',
        active: true,
        createdAt: new Date().toISOString(),
        subscriptionPlan: 'Pro',
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      onLogin(trialUser);
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. FIRST check the mock credentials since the user is explicitly testing a mock user "dono" on localhost.
      const mockUser = INITIAL_USERS.find(
        (u) => u.username === credential.trim() && u.password === password
      );

      if (mockUser) {
         // Found local mock user. Skip supabase auth.
         onLogin(mockUser);
         setLoading(false);
         return;
      }

      if (supabase) {
        // ── Supabase Auth (Fallback for real DB users) ──────────────────────
        let emailToLogin = credential.trim();
        // Permite logar usando apenas o nome de usuário (ex: admin)
        if (!emailToLogin.includes('@')) {
          emailToLogin = `${emailToLogin}@podologypro.com`; // Retaining original domain format for existing users
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
         setError('Usuário ou senha incorretos.');
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
          <img src="/logo.png" alt="ProClin" className="h-32 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'block'; }} />
          <div className="hidden space-y-1 relative">
            {onBack && (
              <button onClick={onBack} className="absolute -left-16 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-800 transition-colors" title="Voltar para Início">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-2">
              <Stethoscope size={48} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">ProClin</h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Gestão Estética Avançada</p>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-8">
          <button 
            onClick={() => setIsVoucherMode(false)}
            className={cn("flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", !isVoucherMode ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
          >
            Login Comum
          </button>
          <button 
            onClick={() => setIsVoucherMode(true)}
            className={cn("flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", isVoucherMode ? "bg-white text-[#7B61FF] shadow-sm" : "text-slate-400 hover:text-slate-600")}
          >
            Tenho Voucher
          </button>
        </div>

        {!isVoucherMode ? (
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl flex items-center gap-2 border border-red-100"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleVoucherLogin}>
            <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 text-center space-y-4">
              <div className="size-14 bg-[#7B61FF]/10 text-[#7B61FF] rounded-full flex items-center justify-center mx-auto">
                <Ticket size={28} />
              </div>
              <h3 className="font-black text-slate-800 tracking-tight">Acesso 24h Liberado</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Insira o código que você recebeu para ganhar acesso imediato a todas as funções por um dia.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Código do Voucher</label>
              <div className="relative group">
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7B61FF] transition-colors" size={20} />
                <input 
                  className="w-full pl-12 pr-4 py-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#7B61FF]/20 focus:border-[#7B61FF] outline-none transition-all placeholder:text-slate-400 font-mono text-lg tracking-widest uppercase" 
                  placeholder="EX: TRIAL24-9X2..."
                  type="text"
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl flex items-center gap-2 border border-red-100"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#7B61FF] to-[#9C8CFF] text-white rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? 'Validando...' : 'Liberar Meu Acesso'}
            </button>
          </form>
        )}

        <div className="space-y-6 pt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Acesso Rápido</span>
            </div>
          </div>
          <button className="group flex items-center justify-center gap-3 p-4 rounded-2xl border border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all w-full" type="button">
            <Fingerprint size={24} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-slate-600">Usar Biometria</span>
          </button>
        </div>
      </motion.div>
      <footer className="mt-8 text-center space-y-1">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Esteta Pro © 2026</p>
        <p className="text-[9px] text-slate-300 uppercase tracking-widest">Tecnologia para Estética de Resultados</p>
      </footer>
    </div>
  );
};

// Aesthetic Dashboard Components and Metrics

const DashboardPage = ({ 
  agendamentos, 
  pacientes, 
  sessoes = [], // We'll need some mock sessions or use existing
  onNavigate, 
  onSelectPatient 
}: { 
  agendamentos: Agendamento[], 
  pacientes: Paciente[], 
  sessoes?: any[],
  onNavigate: (p: Page) => void,
  onSelectPatient: (id: string) => void
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = agendamentos.filter(a => a.dataAgendada === today);
  
  // Mock data for new aesthetic metrics since we might not have real data yet
  const metrics = [
    { label: 'Faturamento do Dia', value: 'R$ 4.500', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Agendados Hoje', value: todayAppointments.length.toString(), icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pacientes Atendidos', value: '12', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Procedimentos Hoje', value: '18', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Toxina Utilizada (U)', value: '150U', icon: Syringe, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Novos Pacientes (Mês)', value: '24', icon: UserPlus, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Retornos Agendados', value: '8', icon: RefreshCw, color: 'text-teal-500', bg: 'bg-teal-50' },
    { label: 'Faltas/Cancelados', value: todayAppointments.filter(a => ['FALTOU', 'CANCELADO'].includes(a.status)).length.toString(), icon: X, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  // Mock chart data
  const revenueData = [
    { name: '1', value: 1200 }, { name: '5', value: 3000 }, { name: '10', value: 2500 },
    { name: '15', value: 4500 }, { name: '20', value: 3800 }, { name: '25', value: 5200 }, { name: '30', value: 4800 }
  ];

  const topProcedures = [
    { name: 'Toxina Botulínica', count: 45, color: 'bg-rose-100 text-rose-600' },
    { name: 'Preenchimento Labial', count: 32, color: 'bg-purple-100 text-purple-600' },
    { name: 'Bioestimulador de Colágeno', count: 28, color: 'bg-blue-100 text-blue-600' },
    { name: 'Fios de Sustentação', count: 15, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Peeling Químico', count: 12, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="flex-1 pb-10 bg-slate-50 overflow-y-auto">
      <div className="px-6 py-10 bg-white border-b border-slate-100">
         <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Comando <span className="text-primary">Geral</span></h1>
               <p className="text-slate-500 font-medium mt-1">Bem-vindo, veja o resumo operacional da sua clínica.</p>
            </div>
            <button 
              onClick={() => onNavigate('agenda')}
              className="px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
               <Calendar size={18} /> Ver Agenda Completa
            </button>
         </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 -translate-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white flex flex-col gap-4"
            >
              <div className={cn("size-12 rounded-2xl flex items-center justify-center", m.bg)}>
                 <m.icon size={24} className={m.color} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-2">{m.label}</p>
                <p className="text-3xl font-black text-slate-900 leading-tight">{m.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
         {/* Charts & Lists Column */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Faturamento (30 Dias)</h3>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1">
                     <TrendingUp size={14} /> +15% vs mês anterior
                  </div>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `R$${val/1000}k`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`R$ ${value}`, 'Faturamento']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Procedimentos Mais Realizados</h3>
               <div className="space-y-4">
                 {topProcedures.map((proc, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm", proc.color)}>
                           #{i + 1}
                         </div>
                         <span className="font-bold text-slate-800">{proc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-xl font-black text-slate-900">{proc.count}</span>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sessões</span>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
         </div>

         {/* Today's Queue Column */}
         <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Próximos do Dia</h3>
               <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {todayAppointments.length} Pacientes
               </span>
            </div>

            <div className="space-y-4">
               {todayAppointments.length > 0 ? todayAppointments.sort((a,b) => a.horaInicio.localeCompare(b.horaInicio)).map((app, i) => {
                 const pac = pacientes.find(p => p.id === app.pacienteId);
                 if (!pac) return null;
                 return (
                   <motion.div 
                     key={app.id} 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
                   >
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-slate-100 rounded-[22px] flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                              <img src={`https://picsum.photos/seed/${pac.id}/100/100`} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{pac.nomeCompleto}</h4>
                                 {app.status === 'EM_ATENDIMENTO' && (
                                   <span className="size-2 bg-primary rounded-full animate-ping" />
                                 )}
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                                    <Clock size={12} /> {app.horaInicio}
                                 </span>
                                 <span className="text-xs font-bold text-slate-400">Procedimento Pendente</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                           <button 
                             onClick={() => {
                               onSelectPatient(pac.id);
                               onNavigate('patients');
                             }}
                             className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary transition-all shadow-lg"
                           >
                              Atender Agora
                           </button>
                        </div>
                     </div>
                   </motion.div>
                 );
               }) : (
                 <div className="bg-white rounded-[32px] p-12 text-center border-2 border-dashed border-slate-200">
                    <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Nenhum agendamento para hoje.</p>
                 </div>
               )}
            </div>
         </div>

      </div>
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
        title="Registro de Sessao" 
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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
                  <div className="flex items-center gap-2">
                    <p className={cn("text-slate-900 text-base", (chat.unreadCount || 0) > 0 ? "font-bold" : "font-semibold")}>
                      {chat.nomeGroup || "Conversa"}
                    </p>
                    {chat.isPinned && <Pin size={12} className="text-primary fill-primary" />}
                  </div>
                  <p className="text-xs text-slate-400">{chat.lastMessageTime}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-slate-500 line-clamp-1 flex-1 mr-2">{chat.lastMessagePreview || "Sem mensagens ainda"}</p>
                  <div className="flex items-center gap-2">
                    {(chat.unreadCount || 0) > 0 && (
                      <div className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {chat.unreadCount}
                      </div>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const action = confirm(chat.isArchived ? "Desarquivar conversa?" : "Arquivar conversa?");
                        if (action) {
                          chatService.updateConversationSettings(currentUser.id, chat.id, { isArchived: !chat.isArchived });
                        }
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
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
  const [mode, setMode] = useState<'SELECT' | 'GROUP_INFO'>('SELECT');
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AppUser[]>([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!supabase) {
        setAvailableUsers(INITIAL_USERS.filter(u => u.id !== currentUser.id));
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('active', true)
        .neq('id', currentUser.id);

      if (data) {
        setAvailableUsers(data.map(p => ({
          id: p.id,
          name: p.name,
          username: p.username,
          password: '',
          role: p.role,
          avatar: p.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=25a1e4&color=fff`,
          active: true,
          createdAt: p.created_at
        })));
      } else {
        setAvailableUsers(INITIAL_USERS.filter(u => u.id !== currentUser.id));
      }
    };
    fetchUsers();
  }, [currentUser.id]);
  
  const users = availableUsers;

  const toggleUser = (u: AppUser) => {
    if (selectedUsers.find(su => su.id === u.id)) {
      setSelectedUsers(prev => prev.filter(su => su.id !== u.id));
    } else {
      setSelectedUsers(prev => [...prev, u]);
    }
  };

  const handleAction = async (u: AppUser) => {
    if (isGroupMode) {
      toggleUser(u);
    } else {
      setLoading(true);
      try {
        const conv = await chatService.createPrivateChat(currentUser.id, u.id);
        if (conv) {
          onChatCreated({ ...conv, nomeGroup: u.name, avatarUrl: u.avatar });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      const conv = await chatService.createGroupChat({
        nomeGroup: groupName.trim(),
        myUserId: currentUser.id,
        participantIds: selectedUsers.map(u => u.id),
      });
      if (conv) {
        onChatCreated(conv);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'GROUP_INFO' && (
              <button 
                onClick={() => setMode('SELECT')}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h3 className="text-lg font-bold">
              {mode === 'SELECT' ? (isGroupMode ? 'Novos Participantes' : 'Nova Conversa') : 'Dados do Grupo'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        {mode === 'SELECT' ? (
          <>
            <div className="p-3 border-b border-slate-50">
              <button 
                onClick={() => setIsGroupMode(!isGroupMode)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm",
                  isGroupMode ? "bg-primary/10 text-primary border border-primary/20" : "bg-slate-50 text-slate-600 border border-transparent"
                )}
              >
                <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", isGroupMode ? "bg-primary text-white" : "bg-slate-200 text-slate-500")}>
                  <Users size={20} />
                </div>
                {isGroupMode ? "Desativar Modo Grupo" : "Criar Novo Grupo"}
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contatos</p>
              {users.map(u => {
                const isSelected = !!selectedUsers.find(su => su.id === u.id);
                return (
                  <button 
                    key={u.id}
                    onClick={() => handleAction(u)}
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                      isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="relative">
                      <img src={u.avatar} className="size-11 rounded-full border border-slate-200 shrink-0" alt="" />
                      {isGroupMode && isSelected && (
                        <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-white">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{u.role.toLowerCase()}</p>
                    </div>
                    {!isGroupMode && <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />}
                  </button>
                );
              })}
            </div>

            {isGroupMode && (
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button 
                  disabled={selectedUsers.length < 1 || loading}
                  onClick={() => setMode('GROUP_INFO')}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continuar ({selectedUsers.length})
                  <ArrowUp size={18} className="rotate-90" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-4">
              <div className="size-24 bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary cursor-pointer transition-all">
                <Camera size={28} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Foto do Grupo (Opcional)</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Nome do Grupo</label>
              <input 
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ex: Agenda do Dia, Equipe Administrativa..."
                className="w-full bg-slate-50 border-slate-200 border rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Participantes ({selectedUsers.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-2 bg-slate-100 pl-1 pr-3 py-1 rounded-full border border-slate-200">
                    <img src={u.avatar} className="size-6 rounded-full" alt="" />
                    <span className="text-xs font-bold text-slate-700">{u.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={!groupName.trim() || loading}
                onClick={handleCreateGroup}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? <Activity className="animate-spin" /> : <Check size={22} strokeWidth={3} />}
                {loading ? 'Criando Grupo...' : 'Confirmar e Criar'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ChatDetailPage = ({ onBack, conversation, currentUser }: { onBack: () => void, conversation: ChatConversation, currentUser: AppUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to Storage
      const publicUrl = await chatService.uploadChatFile(file, conversation.id);
      
      if (publicUrl) {
        // 2. Send Message
        const type = file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT';
        await chatService.sendMessage({
          conversationId: conversation.id,
          senderId: currentUser.id,
          type,
          fileUrl: publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        });
      } else {
        alert('Erro ao fazer upload do arquivo.');
      }
    } catch (error) {
      console.error('Erro no arquivo:', error);
      alert('Falha ao processar arquivo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        <div 
          onClick={() => conversation.type === 'GROUP' && setShowGroupDetails(true)}
          className={cn("flex items-center gap-3 flex-1", conversation.type === 'GROUP' ? "cursor-pointer" : "")}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); onBack(); }} 
            className="text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
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
                      {msg.messageType === 'IMAGE' ? (
                        <div className="flex flex-col gap-2">
                          <img 
                            src={msg.fileUrl} 
                            alt="Mídia" 
                            className="max-w-full rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => msg.fileUrl && window.open(msg.fileUrl, '_blank')}
                          />
                          {msg.textContent && <p className="text-sm">{msg.textContent}</p>}
                        </div>
                      ) : msg.messageType === 'DOCUMENT' ? (
                        <div 
                          className="flex items-center gap-3 cursor-pointer py-1"
                          onClick={() => msg.fileUrl && window.open(msg.fileUrl, '_blank')}
                        >
                          <div className={cn("p-2 rounded-lg", isMe ? "bg-white/20" : "bg-slate-100")}>
                            <FileText size={24} className={isMe ? "text-white" : "text-primary"} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-bold truncate">{msg.fileName || 'Documento'}</p>
                            <p className={cn("text-[10px]", isMe ? "text-white/70" : "text-slate-400")}>
                              {(msg.fileSize ? (msg.fileSize / 1024 / 1024).toFixed(2) : '0')} MB • PDF
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.textContent}</p>
                      )}
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

      <footer className="p-4 bg-white border-t border-slate-100 relative">
        {uploading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-1/3 h-full bg-primary"
            />
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />

        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="text-slate-400 hover:text-primary p-2 transition-colors relative"
            disabled={uploading}
          >
            <Plus size={24} />
          </button>
          <div className="flex-1 relative">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={uploading}
              className="w-full bg-slate-100 border-none rounded-full py-3 px-5 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 placeholder-slate-500 transition-all disabled:opacity-50" 
              placeholder={uploading ? "Enviando arquivo..." : "Sua mensagem..." }
              type="text"
            />
            <button 
              onClick={() => alert('Emoji picker... 🤩')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
            >
              <Smile size={20} />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || uploading}
            className="bg-primary text-white w-11 h-11 flex items-center justify-center rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>

      {showGroupDetails && (
        <GroupDetailsModal 
          conversation={conversation} 
          onClose={() => setShowGroupDetails(false)} 
        />
      )}
    </div>
  );
};

const GroupDetailsModal = ({ conversation, onClose }: { conversation: ChatConversation, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="relative h-48 bg-slate-100 flex items-center justify-center">
          {conversation.avatarUrl ? (
            <img src={conversation.avatarUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <Users size={80} className="text-slate-300" />
          )}
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition-colors">
            <X size={20} className="text-slate-900" />
          </button>
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
            <h3 className="text-xl font-bold">{conversation.nomeGroup || 'Grupo'}</h3>
            <p className="text-sm opacity-80">{conversation.type === 'GROUP' ? 'Grupo da Clínica' : 'Privado'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ações</h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-primary/5 hover:border-primary/20 transition-all text-primary">
                <Bell size={20} />
                <span className="text-xs font-bold">Silenciar</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-primary/5 hover:border-primary/20 transition-all text-primary">
                <Search size={20} />
                <span className="text-xs font-bold">Pesquisar</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Participantes</h4>
            <div className="space-y-3">
              {INITIAL_USERS.slice(0, 3).map((u, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={u.avatar} className="size-10 rounded-full border border-slate-100" alt="" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{u.role.toLowerCase()}</p>
                  </div>
                  {i === 0 && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">Admin</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors">
            Sair do Grupo
          </button>
        </div>
      </motion.div>
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
          <h3 className="text-sm font-bold text-slate-700">Horário de Sessao</h3>
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
            <label className="text-xs font-semibold text-slate-500">Duração do Sessao (min)</label>
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

const StoreModulesPage = ({
  availableModules,
  installedModules,
  onInstallModule,
  onUninstallModule,
  userPlan = 'Basic'
}: {
  availableModules: Modulo[];
  installedModules: ClinicaModulo[];
  onInstallModule: (slug: string) => void;
  onUninstallModule: (slug: string) => void;
  userPlan?: 'Basic' | 'Pro' | 'Enterprise';
}) => {
  const [confirmUninstall, setConfirmUninstall] = useState<string | null>(null);

  return (
    <div className="flex-1 pb-4 bg-slate-50 flex flex-col h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8 md:p-12">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">🛒 Loja de Módulos</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Ative recursos especializados para elevar o nível do seu atendimento.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableModules.map(m => {
            const installed = installedModules.find(cm => cm.moduloId === m.id && cm.status === 'ativo');
            const isInstalled = !!installed;
            const planValue = { 'Basic': 1, 'Pro': 2, 'Enterprise': 3 };
            const requiredPlan = m.planoMinimo || 'Basic';
            const userPlanValue = planValue[userPlan as keyof typeof planValue];
            const requiredPlanValue = planValue[requiredPlan as keyof typeof planValue];
            const hasPlan = userPlanValue >= requiredPlanValue;

            return (
              <motion.div
                key={m.id}
                whileHover={{ y: -5 }}
                className={cn(
                  "group bg-white rounded-[40px] p-10 border shadow-sm flex flex-col items-center text-center transition-all duration-500",
                  isInstalled ? "border-emerald-500 bg-emerald-50/20 shadow-xl shadow-emerald-500/10" : "border-slate-100 hover:shadow-2xl hover:shadow-primary/5",
                  !hasPlan && !isInstalled && "opacity-80 grayscale-[0.5]"
                )}
              >
                <div className={cn(
                  "size-24 rounded-[32px] flex items-center justify-center mb-8 text-4xl shadow-2xl transition-all duration-500 group-hover:scale-110",
                  isInstalled ? "bg-emerald-500 text-white animate-pulse-slow" : "bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white"
                )}>
                  {m.icone === 'sparkles' && <Sparkles size={40} />}
                  {m.icone === 'footprints' && <Footprints size={40} />}
                  {m.icone === 'stethoscope' && <Stethoscope size={40} />}
                  {!['sparkles', 'footprints', 'stethoscope'].includes(m.icone) && <PackageOpen size={40} />}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3">{m.nome}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">{m.descricao}</p>

                {!hasPlan && !isInstalled && (
                   <div className="mb-8 px-5 py-2 bg-amber-100 text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-amber-200">
                      <Lock size={14} /> Exclusivo Plano {requiredPlan}
                   </div>
                )}

                {isInstalled ? (
                  <div className="w-full space-y-4">
                    <div className="w-full flex items-center justify-center gap-2 py-5 bg-emerald-100 text-emerald-600 rounded-3xl text-sm font-black border border-emerald-200 shadow-inner">
                      <CheckCircle2 size={22} /> Módulo Ativo
                    </div>
                    {confirmUninstall === m.slug ? (
                      <div className="w-full flex gap-2 animate-in fade-in">
                        <button
                          onClick={() => setConfirmUninstall(null)}
                          className="flex-1 py-4 text-slate-500 hover:bg-slate-100 rounded-2xl text-xs font-black transition-all uppercase tracking-widest"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            onUninstallModule(m.slug);
                            setConfirmUninstall(null);
                          }}
                          className="flex-1 py-4 bg-red-500 text-white hover:bg-red-600 rounded-2xl text-xs font-black transition-all uppercase tracking-widest shadow-lg shadow-red-500/20"
                        >
                          Confirmar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmUninstall(m.slug)}
                        className="w-full py-4 text-red-500 hover:bg-red-50 rounded-2xl text-xs font-black transition-all uppercase tracking-widest"
                      >
                        Remover Módulo
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => hasPlan && onInstallModule(m.slug)}
                    disabled={!hasPlan}
                    className={cn(
                      "w-full py-5 rounded-3xl text-sm font-black shadow-2xl transition-all",
                      hasPlan
                        ? "bg-primary text-white shadow-primary/30 hover:scale-[1.05] hover:rotate-1 active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    )}
                  >
                   {hasPlan ? '✨ Instalar Agora' : `Upgrade para ${requiredPlan}`}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
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
        <div className="relative cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
          <img 
            alt="Foto de perfil" 
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm bg-slate-100" 
            src={currentUser.avatar}
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Desenho bem simples de uma pessoa caso a imagem falhe / não exista
              e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
            }}
          />
          <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={(e) => {
             // Future hook: Upload para o Supabase Storage e atualização do AppUser.
             // currentUser.avatar = novo_link;
             alert('A foto será atualizada no sistema (Faltando integração com Storage)!');
          }} />
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110">
            <Edit3 size={14} />
          </div>
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
        <p className="text-center text-slate-400 text-[10px] pb-4">ProClin v3.0.0 • Gestão Clínica de Excelência</p>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(!!supabase);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'onboarding'>('landing');

  // ── Global state ──────────────────────────────────────────
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [anamneses, setAnamneseEsteticas] = useState<AnamneseEstetica[]>([]);
  const [atendimentos, setAtendimentos] = useState<Sessao[]>([]);
  
  // ── Modular Architecture State ─────────────────────────────
  const [availableModules] = useState<Modulo[]>([
    { id: 'm1', nome: 'Estética Avançada', slug: 'estetica', descricao: 'Prontuários para Toxina Botulínica, Preenchimentos, Fios e Mapeamentos Faciais.', icone: 'sparkles', categoria: 'Estética', ativo: true, planoMinimo: 'Pro' },
    { id: 'm2', nome: 'Podologia', slug: 'podologia', descricao: 'Prontuário podológico completo, mapeamento dos pés, ficha de órteses e controle micológico.', icone: 'footprints', categoria: 'Podologia', ativo: true, planoMinimo: 'Basic' },
    { id: 'm3', nome: 'Clínica Médica', slug: 'odontologia', descricao: 'Prescrições, receituários especiais, CID-10 e evoluções clínicas gerais.', icone: 'stethoscope', categoria: 'Medicina', ativo: true, planoMinimo: 'Enterprise' },
  ]);
  
  const [installedModules, setInstalledModules] = useState<ClinicaModulo[]>(() => {
    const saved = localStorage.getItem('proclin_installed_modules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    // Default to 'estetica' active for initial experience
    return [{
       id: 'default_estetica',
       clinicaId: 'c1',
       moduloId: 'm1',
       status: 'ativo',
       instaladoEm: new Date().toISOString(),
       moduloDetails: { id: 'm1', nome: 'Estética Avançada', slug: 'estetica', descricao: '', icone: 'sparkles', categoria: 'Estética', ativo: true, planoMinimo: 'Pro' }
    }];
  });

  useEffect(() => {
    localStorage.setItem('proclin_installed_modules', JSON.stringify(installedModules));
  }, [installedModules]);

  const handleInstallModule = (slug: string) => {
    const mod = availableModules.find(m => m.slug === slug);
    if (!mod) return;
    
    // Check plan (redundant but safe)
    const planValue = { 'Basic': 1, 'Pro': 2, 'Enterprise': 3 };
    const requiredPlan = mod.planoMinimo || 'Basic';
    const userPlan = currentUser?.subscriptionPlan || 'Basic';
    if (planValue[userPlan] < planValue[requiredPlan]) {
      alert(`Este módulo requer o plano ${requiredPlan}. Faça upgrade da sua assinatura.`);
      return;
    }

    const newInstalled: ClinicaModulo = {
      id: `inst_${Date.now()}`,
      clinicaId: 'c1',
      moduloId: mod.id,
      status: 'ativo',
      instaladoEm: new Date().toISOString(),
      moduloDetails: mod
    };
    setInstalledModules([...installedModules, newInstalled]);
  };

  const handleUninstallModule = (slug: string) => {
    const mod = availableModules.find(m => m.slug === slug);
    if (!mod) return;
    
    // Custom UI confirm is used directly on StoreModulesPage,
    // so we can safely perform the state update here.
    setInstalledModules(prev => prev.filter(m => m.moduloId !== mod.id));
  };
  const [fotos, setFotos] = useState<FotoClinica[]>([]);
  const [consentimentos, setConsentimentos] = useState<Consentimento[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [servicos, setProcedimentos] = useState<Procedimento[]>(INITIAL_PROCEDIMENTOS);
  const [pacotes, setPacotes] = useState<Pacote[]>(INITIAL_PACOTES);
  const [pacotesPaciente, setPacotesPaciente] = useState<PacotePaciente[]>(INITIAL_PACOTES_PACIENTE);
  const [aplicacoesToxina, setAplicacoesToxina] = useState<AplicacaoToxina[]>(INITIAL_TOXINA);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);

  // ── Actions ──
  const handleAddFoto = (f: FotoClinica) => setFotos(prev => [...prev, f]);
  const handleRemoveFoto = (id: string) => setFotos(prev => prev.filter(f => f.id !== id));
  const handleUpdateSessao = (s: Sessao) => setAtendimentos(prev => prev.map(x => x.id === s.id ? s : x));
  const handleAddSessao = (s: Sessao) => setAtendimentos(prev => [...prev, s]);
  const handleAddConsentimento = (c: Consentimento) => setConsentimentos(prev => [...prev, c]);
  const handleUseSessaoPacote = (ppId: string) => {
    setPacotesPaciente(prev => prev.map(p => p.id === ppId ? { ...p, sessoesUtilizadas: Math.min(p.sessoesContratadas, p.sessoesUtilizadas + 1) } : p));
  };
  const handleSaveToxina = (novas: AplicacaoToxina[]) => setAplicacoesToxina(prev => [...prev, ...novas]);

  // ── Fetch Global Data from Supabase ──
  const fetchData = useCallback(async () => {
    if (!supabase) return;
    
    // Fetch Procedimentos
    const { data: sData } = await supabase.from('servicos').select('*').eq('ativo', true);
    if (sData) {
      setProcedimentos(sData.map(s => ({
        id: s.id,
        nome: s.nome,
        descricao: s.descricao,
        valorPadrao: Number(s.valor_padrao),
        duracaoMinutos: s.duracao_minutos,
        ativo: s.ativo,
        corAgenda: s.cor_agenda
      })));
    }

    // Fetch Pacientes (Clientes)
    const { data: pData } = await supabase.from('clientes').select('*');
    if (pData) {
      setPacientes(pData.map(p => ({
        id: p.id,
        nomeCompleto: p.name,
        cpf: p.cpf,
        dataNascimento: p.birth_date,
        telefone: p.phone,
        email: p.email,
        endereco: p.address,
        ativo: true,
        criadoEm: p.created_at,
        atualizadoEm: p.created_at
      })));
    }

    // Fetch Agendamentos
    const { data: aData } = await supabase.from('agendamentos').select('*');
    if (aData) {
      setAgendamentos(aData.map(a => ({
        id: a.id,
        pacienteId: a.paciente_id,
        servicoId: a.servico_id,
        criadoPorUserId: a.criado_por_user_id,
        dataAgendada: a.data_agendada,
        horaInicio: a.hora_inicio,
        horaFim: a.hora_fim,
        status: a.status as AgendamentoStatus,
        observacoes: a.observacoes,
        criadoEm: a.created_at,
        atualizadoEm: a.updated_at
      })));
    }
  }, []);

  // ── Restore Supabase session and fetch data on mount ────────────────────────
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
              subscriptionPlan: profileData.subscription_plan || 'Basic', // Assuming subscription_plan exists in profileData
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
              subscriptionPlan: 'Basic',
            };

        setCurrentUser(appUser);
        fetchData();
        setCurrentPage('dashboard');
      }
      setSessionLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        setPacientes([]);
        setProcedimentos([]);
        setCurrentPage('login');
      } else if (event === 'SIGNED_IN') {
        fetchData();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchData]);

  const handleNavigate = (page: Page) => setCurrentPage(page);

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'SUPER_ADMIN') {
      setCurrentPage('superadmin');
    } else {
      fetchData();
      setCurrentPage('dashboard');
    }
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
    if (authView === 'landing') {
      return <LandingPage onNavigate={setAuthView} />;
    }
    if (authView === 'onboarding') {
      return <OnboardingPage onNavigateLogin={() => setAuthView('login')} onComplete={handleLogin} />;
    }
    return <LoginPage onLogin={handleLogin} onBack={() => setAuthView('landing')} />;
  }

  const handleAddAgendamento = async (a: Agendamento) => {
    // Optimistic update
    setAgendamentos(prev => [...prev, a]);
    
    if (supabase) {
      const { error } = await supabase.from('agendamentos').insert({
        paciente_id: a.pacienteId,
        servico_id: a.servicoId,
        criado_por_user_id: a.criadoPorUserId,
        data_agendada: a.dataAgendada,
        hora_inicio: a.horaInicio,
        hora_fim: a.horaFim,
        status: a.status,
        observacoes: a.observacoes
      });

      if (error) {
        console.error('Erro ao salvar agendamento:', error);
        alert('Erro ao salvar no banco de dados. Tente novamente.');
        fetchData(); // Sync back if error
      }
    }
  };


  const handleUpdateAgendamentoStatus = async (id: string, status: AgendamentoStatus) => {
    // Optimistic update
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status, atualizadoEm: new Date().toISOString() } : a));

    if (supabase) {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        fetchData(); // Sync back if error
      }
    }
  };

  const handleAddPaciente = async (p: Paciente) => {
    setPacientes(prev => [...prev, p]);
    if (supabase) {
      await supabase.from('clientes').insert({
        name: p.nomeCompleto,
        cpf: p.cpf,
        phone: p.telefone,
        email: p.email,
        address: p.endereco,
        birth_date: p.dataNascimento
      });
    }
  };

  const handleUpdatePaciente = async (p: Paciente) => {
    setPacientes(prev => prev.map(x => x.id === p.id ? p : x));
    if (supabase) {
      await supabase.from('clientes').update({
        name: p.nomeCompleto,
        cpf: p.cpf,
        phone: p.telefone,
        email: p.email,
        address: p.endereco,
        birth_date: p.dataNascimento
      }).eq('id', p.id);
    }
  };

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
        installedModules={installedModules}
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
              {currentPage === 'dashboard' && (
                <DashboardPage 
                  agendamentos={agendamentos} 
                  pacientes={pacientes} 
                  onNavigate={handleNavigate}
                  onSelectPatient={setSelectedPacienteId}
                />
              )}
              {currentPage === 'agenda' && (
                <AgendaPage
                  currentUser={currentUser}
                  agendamentos={agendamentos}
                  pacientes={pacientes}
                  servicos={servicos}
                  onAddAgendamento={handleAddAgendamento}
                  onUpdateStatus={handleUpdateAgendamentoStatus}
                />
              )}
              {currentPage === 'patients' && (
                <PatientModule
                  currentUser={currentUser}
                  pacientes={pacientes}
                  anamneses={anamneses}
                  atendimentos={atendimentos}
                  fotos={fotos}
                  agendamentos={agendamentos}
                  servicos={servicos}
                  profissionais={INITIAL_USERS}
                  onAddPaciente={handleAddPaciente}
                  onUpdatePaciente={handleUpdatePaciente}
                  onAddAnamneseEstetica={(a) => setAnamneseEsteticas(prev => [...prev, a])}
                  onUpdateAnamneseEstetica={(a) => setAnamneseEsteticas(prev => prev.map(x => x.id === a.id ? a : x))}
                  onUpdateSessao={handleUpdateSessao}
                  onAddSessao={handleAddSessao}
                  onAddConsentimento={handleAddConsentimento}
                  onAddFoto={handleAddFoto}
                  onRemoveFoto={handleRemoveFoto}
                  pacotesContratados={[]}
                  pacotesDisponiveis={[]}
                  installedModules={installedModules}
                  aplicacoesToxina={aplicacoesToxina}
                  onUseSessaoPacote={handleUseSessaoPacote}
                  onSaveToxina={handleSaveToxina}
                  consentimentos={consentimentos}
                  selectedPacienteId={selectedPacienteId}
                  onSelectPacienteId={setSelectedPacienteId}
                />
              )}
              {currentPage === 'service-record' && <ServiceRecordPage />}
              {currentPage === 'inventory' && currentUser && (
                <InventoryPage 
                  currentUser={currentUser} 
                  onBack={() => setCurrentPage('dashboard')} 
                />
              )}
              {currentPage === 'sales' && currentUser && (
                <SalesPage 
                  currentUser={currentUser} 
                  onBack={() => setCurrentPage('dashboard')} 
                />
              )}
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
              {currentPage === 'help' && <HelpPage />}
              {currentPage === 'settings' && (
                <SettingsPage
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                  currentUser={currentUser}
                />
              )}
              {currentPage === 'superadmin' && currentUser?.role === 'SUPER_ADMIN' && (
                <SuperAdminPage />
              )}
              {currentPage === 'subscription' && currentUser?.role === 'ADMIN' && (
                <SubscriptionPage currentUser={currentUser} />
              )}
              {currentPage === 'clinic-data' && <ClinicDataPage onBack={() => setCurrentPage('settings')} />}
              {currentPage === 'manage-services' && <ManageServicesPage onBack={() => setCurrentPage('settings')} />}
              {currentPage === 'manage-users' && <ManageUsersPage onBack={() => setCurrentPage('settings')} />}
              {currentPage === 'agenda-settings' && <AgendaSettingsPage onBack={() => setCurrentPage('settings')} />}
              {currentPage === 'backup-data' && <BackupDataPage onBack={() => setCurrentPage('settings')} />}
              {currentPage === 'store-modules' && (
                <StoreModulesPage 
                  availableModules={availableModules}
                  installedModules={installedModules}
                  onInstallModule={handleInstallModule}
                  onUninstallModule={handleUninstallModule}
                  userPlan={currentUser?.subscriptionPlan}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {!hideNav && (
            <BottomNav currentPage={currentPage} onNavigate={handleNavigate} currentUser={currentUser} installedModules={installedModules} />
          )}
        </div>
      </div>
    </div>
  );
}
