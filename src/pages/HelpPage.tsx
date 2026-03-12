import React, { useState, useMemo } from 'react';
import { 
  Search, BookOpen, ChevronRight, Star, 
  MessageCircle, Headset, ArrowLeft, 
  Settings, Users, Calendar, Sparkles, 
  Wallet, Package, ShoppingCart, BarChart3,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpArticle, HelpCategory } from '../types';
import { INITIAL_HELP_ARTICLES } from '../data';
import { cn } from '../utils';

const CATEGORY_CONFIG: Record<HelpCategory, { label: string; icon: any; color: string; bg: string }> = {
  PRIMEIROS_PASSOS: { label: 'Primeiros Passos', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' },
  PACIENTES:        { label: 'Pacientes', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
  AGENDA:           { label: 'Agenda', icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  PROCEDIMENTOS:    { label: 'Procedimentos', icon: BookOpen, color: 'text-pink-500', bg: 'bg-pink-50' },
  FINANCEIRO:       { label: 'Financeiro', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ESTOQUE:          { label: 'Estoque', icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
  VENDAS:           { label: 'Vendas', icon: ShoppingCart, color: 'text-orange-500', bg: 'bg-orange-50' },
  RELATORIOS:       { label: 'Relatórios', icon: BarChart3, color: 'text-slate-500', bg: 'bg-slate-50' },
};

export const HelpPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredArticles = useMemo(() => {
    if (!search.trim()) return INITIAL_HELP_ARTICLES;
    const lowerSearch = search.toLowerCase();
    return INITIAL_HELP_ARTICLES.filter(a => 
      a.titulo.toLowerCase().includes(lowerSearch) || 
      a.conteudo.toLowerCase().includes(lowerSearch)
    );
  }, [search]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const groupedArticles = useMemo(() => {
    const groups: Record<string, HelpArticle[]> = {};
    filteredArticles.forEach(a => {
      if (!groups[a.categoria]) groups[a.categoria] = [];
      groups[a.categoria]!.push(a);
    });
    return groups;
  }, [filteredArticles]);

  const renderArticle = (article: HelpArticle) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-8 pb-20"
    >
      <button 
        onClick={() => setSelectedArticle(null)}
        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm"
      >
        <ArrowLeft size={18} /> Voltar para Central
      </button>

      <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-6">
           <span className={cn(
             "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
             CATEGORY_CONFIG[article.categoria].bg,
             CATEGORY_CONFIG[article.categoria].color
           )}>
             {CATEGORY_CONFIG[article.categoria].label}
           </span>
           <button 
             onClick={(e) => toggleFavorite(article.id, e)}
             className={cn(
               "p-3 rounded-2xl transition-all",
               favorites.includes(article.id) ? "bg-amber-100 text-amber-500" : "bg-slate-50 text-slate-300"
             )}
           >
             <Star size={20} fill={favorites.includes(article.id) ? "currentColor" : "none"} />
           </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-8">
          {article.titulo}
        </h1>

        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
           {article.conteudo.split('\n').map((line, i) => {
             const trimmedLine = line.trim();
             if (!trimmedLine) return <div key={i} className="h-2" />;
             
             if (trimmedLine.startsWith('###')) {
               return <h3 key={i} className="text-2xl font-black text-slate-800 mt-10 mb-4 tracking-tight">{trimmedLine.replace('###', '').trim()}</h3>;
             }
             
             if (trimmedLine.startsWith('**Passo')) {
               const stepNum = trimmedLine.match(/Passo (\d+)/)?.[1] || '?';
               return (
                 <div key={i} className="flex gap-4 mt-8 mb-4 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-primary/20">
                       {stepNum}
                    </div>
                    <div>
                       <p className="font-extrabold text-slate-900">{trimmedLine.split(':')[0].replace(/\*\*/g, '')}</p>
                       <p className="text-slate-500 text-sm mt-1">{trimmedLine.split(':').slice(1).join(':').trim()}</p>
                    </div>
                 </div>
               );
             }

             if (trimmedLine.match(/^\d+\./)) {
               return (
                 <div key={i} className="flex gap-4 items-start ml-2 py-1">
                    <span className="font-black text-primary min-w-[20px]">{trimmedLine.split('.')[0]}.</span>
                    <p className="font-medium text-slate-600">{trimmedLine.split('.').slice(1).join('.').trim()}</p>
                 </div>
               );
             }

             if (trimmedLine.startsWith('-')) {
               return (
                 <div key={i} className="flex gap-3 items-center ml-4 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                    <p className="font-medium text-slate-600">{trimmedLine.replace('-', '').trim()}</p>
                 </div>
               );
             }

             return (
               <p key={i} className="text-lg leading-relaxed font-medium">
                 {trimmedLine.split('**').map((part, idx) => 
                   idx % 2 === 1 ? <strong key={idx} className="font-black text-slate-800">{part}</strong> : part
                 )}
               </p>
             );
           })}
        </div>

        {/* Placeholder for images/gifs as requested in item 5 */}
        <div className="mt-12 p-1 bg-slate-100 rounded-[32px] overflow-hidden">
           <div className="aspect-video bg-slate-200 rounded-[28px] flex flex-col items-center justify-center text-slate-400 border-4 border-white">
              <BookOpen size={48} className="opacity-20 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">Demonstração Visual</p>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
               <HelpCircle className="text-primary" />
            </div>
            <div>
               <p className="font-bold">Ainda com dúvidas?</p>
               <p className="text-xs text-slate-400">Nossa equipe está pronta para ajudar.</p>
            </div>
         </div>
         <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2">
               <MessageCircle size={18} /> Chat Suporte
            </button>
            <button className="flex-1 sm:flex-none px-6 py-3 bg-primary rounded-2xl text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
               <Headset size={18} /> Falar com Especialista
            </button>
         </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background-light min-h-[100dvh]">
      <AnimatePresence mode="wait">
        {selectedArticle ? (
          <div key="article" className="px-4 py-8 overflow-y-auto h-full">
            {renderArticle(selectedArticle)}
          </div>
        ) : (
          <motion.div 
            key="central"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-y-auto"
          >
            {/* Hero Section */}
            <div className="px-6 py-12 sm:py-20 bg-white border-b border-slate-100">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                 <div className="inline-flex p-3 bg-primary/10 rounded-3xl text-primary mb-2">
                    <BookOpen size={32} />
                 </div>
                 <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    Central de <span className="text-primary">Ajuda</span>
                 </h1>
                 <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto">
                    Aprenda a utilizar todas as funcionalidades do sistema Esteta Pro de forma simples e rápida.
                 </p>

                 {/* Search Bar */}
                 <div className="relative max-w-2xl mx-auto mt-10">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar ajuda (ex: como agendar, como vender...)"
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 shadow-sm"
                    />
                 </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-6 py-12 max-w-6xl mx-auto w-full">
              {favorites.length > 0 && !search && (
                <div className="mb-12">
                   <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Star size={16} className="text-amber-500" /> Seus Favoritos
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {INITIAL_HELP_ARTICLES.filter(a => favorites.includes(a.id)).map(article => (
                        <button
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-left group"
                        >
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            {CATEGORY_CONFIG[article.categoria].label}
                          </p>
                          <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                            {article.titulo}
                          </h3>
                        </button>
                      ))}
                   </div>
                </div>
              )}

              <div className="space-y-16">
                 {(Object.entries(groupedArticles) as [string, HelpArticle[]][]).map(([catId, articles]) => {
                   const config = CATEGORY_CONFIG[catId as HelpCategory];
                   return (
                     <div key={catId} className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className={cn("p-2.5 rounded-2xl", config.bg, config.color)}>
                              <config.icon size={20} />
                           </div>
                           <h2 className="text-lg font-black text-slate-800">{config.label}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                           {articles.map(article => (
                             <button
                               key={article.id}
                               onClick={() => setSelectedArticle(article)}
                               className="bg-white group p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left"
                             >
                                <div className="flex justify-between items-start mb-3">
                                   <div className="flex-1">
                                      <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors leading-snug">
                                        {article.titulo}
                                      </h3>
                                   </div>
                                   <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                   {article.conteudo.replace(/[#*]/g, '').slice(0, 100)}...
                                </p>
                             </button>
                           ))}
                        </div>
                     </div>
                   );
                 })}

                 {filteredArticles.length === 0 && (
                   <div className="text-center py-20 flex flex-col items-center">
                     <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                        <Search size={40} />
                     </div>
                     <p className="text-slate-900 font-bold text-lg">Nenhum artigo encontrado</p>
                     <p className="text-slate-400">Tente buscar por termos diferentes ou navegue nas categorias.</p>
                   </div>
                 )}
              </div>
            </div>

            {/* Footer Support */}
            <div className="bg-white border-t border-slate-100 px-6 py-12">
               <div className="max-w-4xl mx-auto text-center space-y-6">
                  <h2 className="text-2xl font-black text-slate-900">Ainda precisa de ajuda?</h2>
                  <p className="text-slate-500">Se não encontrou o que procurava, nossa central de suporte técnico está disponível via chat ou WhatsApp.</p>
                  <div className="flex flex-wrap justify-center gap-4">
                     <button className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 flex items-center gap-2 hover:scale-[1.05] transition-all">
                        <MessageCircle size={20} /> Iniciar Chat Agora
                     </button>
                     <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-all">
                        <Headset size={20} /> Contato via WhatsApp
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
