import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  UserPlus, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  Package, 
  ClipboardList, 
  History,
  AlertCircle,
  Clock,
  ChevronRight,
  X,
  Wallet,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { Produto, Venda, VendaItem, TipoCliente, AppUser, Paciente } from '../types';
import { vendasService } from '../lib/vendasService';

interface SalesPageProps {
  currentUser: AppUser;
  onBack?: () => void;
}

type SaleView = 'NEW_SALE' | 'HISTORY' | 'SUCCESS';

interface CartItem {
  id: string;
  produto: Produto;
  quantidade: number;
  valorUnitario: number;
}

export const SalesPage: React.FC<SalesPageProps> = ({ currentUser, onBack }) => {
  const [view, setView] = useState<SaleView>('NEW_SALE');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<{id: string, name: string, phone: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [desconto, setDesconto] = useState(0);
  
  // Client State
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('NAO_IDENTIFICADO');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientNomeAvulso, setClientNomeAvulso] = useState('');
  const [clientTelefoneAvulso, setClientTelefoneAvulso] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  
  // Payment State
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [valorRecebido, setValorRecebido] = useState<number>(0);
  
  // History State
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prods, clis, hist] = await Promise.all([
        vendasService.getProducts(),
        vendasService.getClientes(),
        vendasService.getSalesHistory()
      ]);
      setProducts(prods || []);
      setClientes(clis || []);
      setHistory(hist || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.codigo_interno?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const addToCart = (product: Produto) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantidade: item.quantidade + 1 } 
            : item
        );
      }
      return [...prev, { id: product.id, produto: product, quantidade: 1, valorUnitario: product.preco_venda }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantidade + delta);
        return { ...item, quantidade: newQty };
      }
      return item;
    }));
  };

  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantidade, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0), [cart]);
  const total = useMemo(() => Math.max(0, subtotal - desconto), [subtotal, desconto]);
  const troco = useMemo(() => {
    if (formaPagamento === 'Dinheiro' && valorRecebido > total) {
      return valorRecebido - total;
    }
    return 0;
  }, [formaPagamento, valorRecebido, total]);

  const handleFinishSale = async () => {
    if (cart.length === 0) {
      alert('Adicione pelo menos um produto ao carrinho.');
      return;
    }

    if (formaPagamento === 'Dinheiro' && valorRecebido < total) {
      alert('Valor recebido é insuficiente.');
      return;
    }

    try {
      setLoading(true);
      const venda: Partial<Venda> = {
        clienteId: tipoCliente === 'CADASTRADO' ? selectedClientId! : undefined,
        clienteNomeAvulso: tipoCliente === 'AVULSO' ? clientNomeAvulso : undefined,
        clienteTelefoneAvulso: tipoCliente === 'AVULSO' ? clientTelefoneAvulso : undefined,
        tipoCliente,
        subtotal,
        desconto,
        total,
        formaPagamento,
        valorRecebido: formaPagamento === 'Dinheiro' ? valorRecebido : total,
        troco,
        vendidoPorUserId: currentUser.id,
        status: 'FINALIZADA'
      };

      const items: Partial<VendaItem>[] = cart.map(item => ({
        produtoId: item.id,
        nomeProdutoSnapshot: item.produto.nome,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: item.quantidade * item.valorUnitario
      }));

      await vendasService.createVenda(venda, items);
      
      // Reset State
      setCart([]);
      setDesconto(0);
      setTipoCliente('NAO_IDENTIFICADO');
      setSelectedClientId(null);
      setClientNomeAvulso('');
      setClientTelefoneAvulso('');
      setFormaPagamento('PIX');
      setValorRecebido(0);
      
      setView('SUCCESS');
      fetchInitialData(); // Refresh history
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Erro ao processar venda. Verifique o estoque.');
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
              <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Módulo Loja</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Vendas e PDV</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setView('NEW_SALE')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                view === 'NEW_SALE' || view === 'SUCCESS' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ShoppingBag size={18} />
              Nova Venda
            </button>
            <button 
              onClick={() => setView('HISTORY')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                view === 'HISTORY' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <History size={18} />
              Histórico
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full h-full p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {view === 'NEW_SALE' && (
              <motion.div 
                key="new-sale"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"
              >
                {/* Left Column: Product Selection */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                      <div className="relative w-full sm:max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                          type="text" 
                          placeholder="Buscar produto por nome ou código..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                        <Package size={14} />
                        {products.length} PRODUTOS ATIVOS
                      </div>
                    </div>

                    <div className="p-4 overflow-y-auto max-h-[calc(100vh-320px)] lg:max-h-[600px] min-h-[400px]">
                      {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredProducts.map(product => (
                            <div 
                              key={product.id}
                              className={cn(
                                "group p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between",
                                product.estoque_atual <= 0 
                                  ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed" 
                                  : "bg-white border-slate-100 hover:border-primary hover:shadow-md hover:shadow-primary/5 shadow-sm"
                              )}
                              onClick={() => product.estoque_atual > 0 && addToCart(product)}
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-primary">
                                    <Package size={20} />
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">{formatCurrency(product.preco_venda)}</p>
                                    <p className={cn(
                                      "text-[10px] font-bold uppercase",
                                      product.estoque_atual <= product.estoque_minimo ? "text-red-500" : "text-emerald-500"
                                    )}>
                                      {product.estoque_atual} {product.unidade_medida}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                    {product.nome}
                                  </h3>
                                  <p className="text-[10px] text-slate-400 mt-1 font-medium bg-slate-50 px-1.5 py-0.5 rounded inline-block">
                                    COD: {product.codigo_interno || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <button 
                                className={cn(
                                  "w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                                  product.estoque_atual <= 0
                                    ? "bg-slate-200 text-slate-400"
                                    : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                                )}
                                disabled={product.estoque_atual <= 0}
                              >
                                {product.estoque_atual <= 0 ? 'SEM ESTOQUE' : 'ADICIONAR'}
                                <Plus size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                          <Package size={48} className="mb-4 opacity-20" />
                          <p className="font-medium">Nenhum produto encontrado</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Checkout */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                  {/* Cart Summary */}
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[calc(100vh-140px)]">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-primary/5">
                      <div className="flex items-center gap-2 text-primary">
                        <ShoppingBag size={20} />
                        <h2 className="font-bold">Carrinho</h2>
                        <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{totalItems}</span>
                      </div>
                      <button 
                        onClick={() => setCart([])}
                        className="text-xs font-bold text-red-500 hover:underline px-2 py-1"
                      >
                        Limpar
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px]">
                      {cart.length > 0 ? (
                        cart.map(item => (
                          <div key={item.id} className="flex gap-3 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-slate-800 leading-tight">{item.produto.nome}</h4>
                              <p className="text-xs text-slate-400 font-medium">{formatCurrency(item.valorUnitario)} / {item.produto.unidade_medida}</p>
                              
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                  <button 
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="p-1 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantidade}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="p-1 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"
                                    disabled={item.quantidade >= item.produto.estoque_atual}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-primary">{formatCurrency(item.quantidade * item.valorUnitario)}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="self-start p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center py-8 text-slate-300">
                          <ShoppingBag size={40} className="mb-2 opacity-10" />
                          <p className="text-sm font-medium">Carrinho vazio</p>
                        </div>
                      )}
                    </div>

                    {/* Customer Selection */}
                    <div className="p-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identificação do Cliente</label>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button 
                            onClick={() => setTipoCliente('NAO_IDENTIFICADO')}
                            className={cn("px-2 py-1 text-[10px] font-bold rounded-md transition-all", 
                              tipoCliente === 'NAO_IDENTIFICADO' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                          >NÃO IDENT.</button>
                          <button 
                            onClick={() => setTipoCliente('CADASTRADO')}
                            className={cn("px-2 py-1 text-[10px] font-bold rounded-md transition-all", 
                              tipoCliente === 'CADASTRADO' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                          >CADASTRADO</button>
                          <button 
                            onClick={() => setTipoCliente('AVULSO')}
                            className={cn("px-2 py-1 text-[10px] font-bold rounded-md transition-all", 
                              tipoCliente === 'AVULSO' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                          >AVULSO</button>
                        </div>
                      </div>

                      {tipoCliente === 'CADASTRADO' && (
                        <div className="relative">
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={selectedClientId || ''}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                          >
                            <option value="">Selecione um cliente...</option>
                            {clientes.map(cli => (
                              <option key={cli.id} value={cli.id}>{cli.name}</option>
                            ))}
                          </select>
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                      )}

                      {tipoCliente === 'AVULSO' && (
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            placeholder="Nome Completo"
                            value={clientNomeAvulso}
                            onChange={(e) => setClientNomeAvulso(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Telefone"
                            value={clientTelefoneAvulso}
                            onChange={(e) => setClientTelefoneAvulso(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        </div>
                      )}

                      {tipoCliente === 'NAO_IDENTIFICADO' && (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 flex items-center gap-2 text-slate-400">
                          <AlertCircle size={16} />
                          <span className="text-[11px] font-medium">Venda de balcão sem identificação.</span>
                        </div>
                      )}
                    </div>

                    {/* Totals and Payment */}
                    <div className="bg-slate-900 text-white p-5 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-slate-400 text-sm">
                          <span>Subtotal</span>
                          <span className="font-bold">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Desconto</span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 font-bold">-{formatCurrency(desconto)}</span>
                            <button 
                              onClick={() => {
                                const d = prompt("Valor do desconto (R$):", "0");
                                if (d !== null) setDesconto(Math.min(subtotal, parseFloat(d) || 0));
                              }}
                              className="bg-white/10 hover:bg-white/20 p-1 rounded transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-end pt-2">
                          <span className="text-xs uppercase font-bold tracking-widest text-primary">Total a Pagar</span>
                          <span className="text-3xl font-black text-white">{formatCurrency(total)}</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">FORMA DE PAGAMENTO</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['PIX', 'Cartão', 'Dinheiro'].map(method => (
                            <button 
                              key={method}
                              onClick={() => setFormaPagamento(method)}
                              className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl border transition-all gap-1",
                                formaPagamento === method 
                                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                              )}
                            >
                              {method === 'PIX' && <Wallet size={16} />}
                              {method === 'Cartão' && <CreditCard size={16} />}
                              {method === 'Dinheiro' && <Coins size={16} />}
                              <span className="text-[10px] font-bold">{method.toUpperCase()}</span>
                            </button>
                          ))}
                        </div>
                        
                        {formaPagamento === 'Dinheiro' && (
                          <div className="space-y-2 mt-2 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="text-[10px] text-slate-400 font-bold">VALOR RECEBIDO</label>
                                <input 
                                  type="number" 
                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                                  placeholder="0,00"
                                  value={valorRecebido || ''}
                                  onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] text-slate-400 font-bold">TROCO</label>
                                <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-sm font-bold text-emerald-400">
                                  {formatCurrency(troco)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={handleFinishSale}
                        disabled={loading || cart.length === 0}
                        className={cn(
                          "w-full py-4 rounded-xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2",
                          loading || cart.length === 0 
                            ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
                            : "bg-primary hover:bg-primary/90 text-white active:scale-[0.98]"
                        )}
                      >
                        {loading ? 'PROCESSANDO...' : 'FINALIZAR VENDA'}
                        {!loading && <CheckCircle2 size={24} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'HISTORY' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Histórico de Vendas</h2>
                    <p className="text-sm text-slate-500">Acompanhe todas as transações realizadas.</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase translate-y-1">Volume Total</p>
                      <p className="text-lg font-black text-slate-900">
                        {formatCurrency(history.reduce((acc, sale) => sale.status === 'FINALIZADA' ? acc + sale.total : acc, 0))}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-slate-200 mx-1"></div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase translate-y-1">Vendas</p>
                      <p className="text-lg font-black text-slate-900">{history.length}</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Nº Venda</th>
                        <th className="px-6 py-4">Data / Hora</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Vendedor</th>
                        <th className="px-6 py-4">Pagamento</th>
                        <th className="px-6 py-4 text-right">Total</th>
                        <th className="px-6 py-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.length > 0 ? history.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded-full",
                              sale.status === 'FINALIZADA' ? "bg-emerald-100 text-emerald-600" :
                              sale.status === 'CANCELADA' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                            )}>
                              {sale.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700">{sale.numero_venda}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock size={12} />
                              <span className="text-xs font-medium">
                                {new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-800">
                              {sale.tipo_cliente === 'CADASTRADO' ? sale.clientes?.name : (sale.cliente_nome_avulso || 'Consumidor')}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">{sale.tipo_cliente.replace('_', ' ')}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {sale.profiles?.name?.charAt(0) || 'V'}
                              </div>
                              <span className="text-xs font-medium text-slate-600">{sale.profiles?.name || 'Vendedor'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded-lg">{sale.forma_pagamento}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-black text-slate-900">{formatCurrency(sale.total)}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {sale.status === 'FINALIZADA' && (
                              <button 
                                onClick={async () => {
                                  if (confirm(`Deseja realmente cancelar a venda ${sale.numero_venda}?`)) {
                                    const motivo = prompt("Motivo do cancelamento:");
                                    if (motivo) {
                                      await vendasService.cancelVenda(sale.id, motivo, currentUser.id);
                                      fetchInitialData();
                                    }
                                  }
                                }}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Cancelar Venda"
                              >
                                <X size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-20 text-center">
                            <History size={48} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-400 font-medium">Nenhuma venda registrada ainda.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {view === 'SUCCESS' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={56} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Venda Realizada!</h2>
                <p className="text-slate-500 max-w-sm mb-8 font-medium">
                  A venda foi processada com sucesso. O estoque foi atualizado e a transação registrada no financeiro.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button 
                    onClick={() => setView('NEW_SALE')}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    Nova Venda
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => setView('HISTORY')}
                    className="flex-1 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Ver Histórico
                    <History size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
