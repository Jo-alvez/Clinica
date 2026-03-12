import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  History, 
  AlertCircle, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  X,
  Check,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { Produto, AppUser, LojaMovimentacao } from '../types';
import { inventoryService } from '../lib/inventoryService';

interface InventoryPageProps {
  currentUser: AppUser;
  onBack?: () => void;
}

type InventoryView = 'LIST' | 'HISTORY';

export const InventoryPage: React.FC<InventoryPageProps> = ({ currentUser, onBack }) => {
  const [view, setView] = useState<InventoryView>('LIST');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Produto[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Modais Control
  const [showModal, setShowModal] = useState<'ENTRADA' | 'SAIDA' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  
  // Op Form State
  const [qty, setQty] = useState(0);
  const [cost, setCost] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, movs] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getMovements()
      ]);
      setProducts(prods || []);
      setMovements(movs || []);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.codigo_interno?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || p.categoria === activeCategory || (activeCategory === 'Baixo Estoque' && p.estoque_atual <= p.estoque_minimo);
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const stats = useMemo(() => {
    const totalItems = products.reduce((acc, p) => acc + p.estoque_atual, 0);
    const totalValue = products.reduce((acc, p) => acc + (p.estoque_atual * p.custo_medio), 0);
    const lowStockCount = products.filter(p => p.estoque_atual <= p.estoque_minimo).length;
    return { totalItems, totalValue, lowStockCount };
  }, [products]);

  const handleTransaction = async () => {
    if (!selectedProduct || qty <= 0) return;

    try {
      setLoading(true);
      if (showModal === 'ENTRADA') {
        await inventoryService.addStock(selectedProduct.id, qty, cost || selectedProduct.custo_medio, currentUser.id, reason);
      } else {
        await inventoryService.removeStock(selectedProduct.id, qty, 'SAIDA', reason || 'Uso Profissional', currentUser.id);
      }
      
      // Reset & Reload
      setShowModal(null);
      setSelectedProduct(null);
      setQty(0);
      setCost(0);
      setReason('');
      fetchData();
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Erro ao processar movimentação.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <ArrowLeft size={24} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Escritório do Estoque</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Gestão Operacional de Insumos</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setView('LIST')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                view === 'LIST' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Package size={18} />
              Inventário
            </button>
            <button 
              onClick={() => setView('HISTORY')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                view === 'HISTORY' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <History size={18} />
              Movimentações
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full p-4 lg:p-6 space-y-6">
          
          {view === 'LIST' && (
            <>
              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Itens em Estoque</p>
                    <p className="text-2xl font-black text-slate-900">{stats.totalItems}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Valor Patrimonial</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalValue)}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Baixo Estoque</p>
                    <p className="text-2xl font-black text-orange-600">{stats.lowStockCount}</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome, código ou categoria..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {['Todos', 'Baixo Estoque', 'PRODUTO', 'INSUMO', 'EQUIPAMENTO'].map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                        activeCategory === cat ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-primary"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product List */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Produto / Código</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Estoque Atual</th>
                        <th className="px-6 py-4">Custo Médio</th>
                        <th className="px-6 py-4">Preço Venda</th>
                        <th className="px-6 py-4 text-center">Ações Operacionais</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-primary">
                                <Package size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{p.nome}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{p.codigo_interno || 'SEM CÓDIGO'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{p.categoria}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className={cn("text-sm font-black", p.estoque_atual <= p.estoque_minimo ? "text-orange-600" : "text-slate-900")}>
                                {p.estoque_atual} {p.unidade_medida}
                              </span>
                              {p.estoque_atual <= p.estoque_minimo && (
                                <span className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
                                  <AlertCircle size={10} /> REPOR IMEDIATAMENTE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatCurrency(p.custo_medio)}</td>
                          <td className="px-6 py-4 text-sm font-black text-primary">{formatCurrency(p.preco_venda)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => { setSelectedProduct(p); setShowModal('ENTRADA'); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold"
                              >
                                <Plus size={14} /> Entrada
                              </button>
                              <button 
                                onClick={() => { setSelectedProduct(p); setShowModal('SAIDA'); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all text-xs font-bold"
                              >
                                <Minus size={14} /> Saída
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {view === 'HISTORY' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900">Rastreabilidade de Estoque</h2>
                <p className="text-sm text-slate-500">Log completo de entradas, saídas profissionais e ajustes.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Data / Hora</th>
                      <th className="px-6 py-4">Tipo</th>
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4 text-right">Qtd</th>
                      <th className="px-6 py-4">Responsável</th>
                      <th className="px-6 py-4">Motivo / Detalhe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {movements.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                          {new Date(m.created_at).toLocaleDateString()} {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                            m.tipo === 'ENTRADA' ? "bg-emerald-100 text-emerald-600" :
                            m.tipo === 'VENDA' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                          )}>
                            {m.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{m.produtos?.nome}</td>
                        <td className={cn("px-6 py-4 text-sm font-black text-right", m.quantidade > 0 ? "text-emerald-500" : "text-red-500")}>
                          {m.quantidade > 0 ? `+${m.quantidade}` : m.quantidade} {m.produtos?.unidade_medida}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">{m.profiles?.name}</td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-medium italic">"{m.motivo || 'Sem detalhes'}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className={cn("p-6 flex items-center justify-between text-white", showModal === 'ENTRADA' ? "bg-emerald-600" : "bg-orange-600")}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {showModal === 'ENTRADA' ? <Plus size={24} /> : <Minus size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{showModal === 'ENTRADA' ? 'Registrar Entrada' : 'Registrar Saída'}</h3>
                    <p className="text-xs text-white/80 font-medium">Produto: {selectedProduct.nome}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Quantidade ({selectedProduct.unidade_medida})</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      placeholder="0"
                      value={qty || ''}
                      onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  {showModal === 'ENTRADA' ? (
                    <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Custo Compra (UN)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      placeholder="R$ 0,00"
                      value={cost || ''}
                      onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Estoque Atual</label>
                      <div className="w-full bg-slate-100 rounded-xl px-4 py-3 font-bold text-slate-400">
                        {selectedProduct.estoque_atual} {selectedProduct.unidade_medida}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Motivo / Observação</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[100px]"
                    placeholder={showModal === 'ENTRADA' ? "Ex: Compra do fornecedor X - Nota 123" : "Ex: Uso profissional em atendimento"}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleTransaction}
                    disabled={loading || qty <= 0}
                    className={cn(
                      "w-full py-4 rounded-xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2",
                      loading || qty <= 0 
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                        : showModal === 'ENTRADA' 
                          ? "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700" 
                          : "bg-orange-600 text-white shadow-orange-600/20 hover:bg-orange-700"
                    )}
                  >
                    {loading ? 'PROCESSANDO...' : 'CONFIRMAR MOVIMENTAÇÃO'}
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
