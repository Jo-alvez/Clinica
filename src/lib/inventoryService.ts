import { supabase } from './supabase';
import { Produto, LojaMovimentacao } from '../types';

export const inventoryService = {
  async getProducts() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    return data;
  },

  async addStock(productId: string, quantity: number, cost: number, userId: string, motivo?: string) {
    // 1. Get current stock and cost
    const { data: prodData, error: fetchError } = await supabase
      .from('produtos')
      .select('estoque_atual, custo_medio')
      .eq('id', productId)
      .single();
    
    if (fetchError) throw fetchError;

    const currentStock = prodData.estoque_atual || 0;
    const currentCost = prodData.custo_medio || 0;
    const newStock = currentStock + quantity;

    // 2. Calculate new average cost (simplified)
    const totalValue = (currentStock * currentCost) + (quantity * cost);
    const newAverageCost = newStock > 0 ? totalValue / newStock : cost;

    // 3. Update Product
    const { error: upError } = await supabase
      .from('produtos')
      .update({ 
        estoque_atual: newStock,
        custo_medio: newAverageCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (upError) throw upError;

    // 4. Record Movement
    const { error: movError } = await supabase
      .from('loja_movimentacoes')
      .insert({
        produto_id: productId,
        tipo: 'ENTRADA',
        quantidade: quantity,
        motivo: motivo || 'Entrada / Compra de Fornecedor',
        user_id: userId
      });

    if (movError) throw movError;

    return true;
  },

  async removeStock(productId: string, quantity: number, type: 'SAIDA' | 'AJUSTE', motivo: string, userId: string) {
    // 1. Get current stock
    const { data: prodData, error: fetchError } = await supabase
      .from('produtos')
      .select('estoque_atual')
      .eq('id', productId)
      .single();
    
    if (fetchError) throw fetchError;

    const newStock = Math.max(0, (prodData.estoque_atual || 0) - quantity);

    // 2. Update Product
    const { error: upError } = await supabase
      .from('produtos')
      .update({ 
        estoque_atual: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (upError) throw upError;

    // 3. Record Movement
    const { error: movError } = await supabase
      .from('loja_movimentacoes')
      .insert({
        produto_id: productId,
        tipo: type,
        quantidade: -quantity,
        motivo: motivo,
        user_id: userId
      });

    if (movError) throw movError;

    return true;
  },

  async getMovements() {
    const { data, error } = await supabase
      .from('loja_movimentacoes')
      .select(`
        *,
        produtos (nome, unidade_medida),
        profiles (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
