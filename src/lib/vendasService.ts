import { supabase } from './supabase';
import { Venda, VendaItem, TipoCliente, VendaStatus } from '../types';

export const vendasService = {
  async getProducts() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    
    if (error) throw error;
    return data;
  },

  async getClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('id, name, phone')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async createVenda(venda: Partial<Venda>, items: Partial<VendaItem>[]) {
    // We should ideally use a transaction here, but Supabase JS doesn't support them easily without RPC.
    // We'll perform operations in order.
    
    // 1. Generate numero_venda if not provided
    const numeroVenda = venda.numeroVenda || `VEN-${Date.now()}`;
    
    // 2. Insert Venda
    const { data: vendaData, error: vendaError } = await supabase
      .from('vendas')
      .insert([{
        numero_venda: numeroVenda,
        cliente_id: venda.clienteId,
        cliente_nome_avulso: venda.clienteNomeAvulso,
        cliente_telefone_avulso: venda.clienteTelefoneAvulso,
        tipo_cliente: venda.tipoCliente,
        subtotal: venda.subtotal,
        desconto: venda.desconto,
        total: venda.total,
        forma_pagamento: venda.formaPagamento,
        valor_recebido: venda.valorRecebido,
        troco: venda.troco,
        status: 'FINALIZADA',
        observacoes: venda.observacoes,
        vendido_por_user_id: venda.vendidoPorUserId,
        atendimento_id: venda.atendimentoId
      }])
      .select()
      .single();

    if (vendaError) throw vendaError;

    // 3. Insert Items
    const itemsToInsert = items.map(item => ({
      venda_id: vendaData.id,
      produto_id: item.produtoId,
      nome_produto_snapshot: item.nomeProdutoSnapshot,
      quantidade: item.quantidade,
      valor_unitario: item.valorUnitario,
      valor_total: item.valorTotal
    }));

    const { error: itemsError } = await supabase
      .from('venda_itens')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // 4. Update Stock and Create Movimentacoes
    for (const item of items) {
      // Get current stock
      const { data: prodData } = await supabase
        .from('produtos')
        .select('estoque_atual')
        .eq('id', item.produtoId)
        .single();
      
      const newStock = (prodData?.estoque_atual || 0) - (item.quantidade || 0);
      
      await supabase
        .from('produtos')
        .update({ estoque_atual: newStock })
        .eq('id', item.produtoId);

      // Create Loja Movimentacao
      await supabase
        .from('loja_movimentacoes')
        .insert({
          produto_id: item.produtoId,
          tipo: 'VENDA',
          quantidade: -(item.quantidade || 0),
          motivo: `Venda ${numeroVenda}`,
          venda_id: vendaData.id,
          user_id: venda.vendidoPorUserId
        });
    }

    // 5. Create Financeiro Entry
    const { error: finError } = await supabase
      .from('financeiro_movimentacoes')
      .insert({
        tipo: 'ENTRADA',
        categoria_principal: 'PRODUTO',
        descricao: `Venda de Produtos - ${numeroVenda}`,
        valor: venda.total,
        forma_pagamento: venda.formaPagamento,
        data_movimentacao: new Date().toISOString().split('T')[0],
        cliente_id: venda.clienteId,
        venda_id: vendaData.id,
        criado_por_user_id: venda.vendidoPorUserId,
        observacoes: venda.observacoes
      });

    if (finError) console.error('Error creating financial entry:', finError);

    return vendaData;
  },

  async getSalesHistory() {
    const { data, error } = await supabase
      .from('vendas')
      .select(`
        *,
        clientes (name),
        profiles (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async cancelVenda(vendaId: string, motivo: string, userId: string) {
    // 1. Fetch venda and items
    const { data: venda, error: vError } = await supabase
      .from('vendas')
      .select('*, venda_itens(*)')
      .eq('id', vendaId)
      .single();
    
    if (vError) throw vError;
    if (venda.status === 'CANCELADA') throw new Error('Venda já cancelada');

    // 2. Update Status
    const { error: upError } = await supabase
        .from('vendas')
        .update({ status: 'CANCELADA', observacoes: `${venda.observacoes || ''}\nMotivo Cancelamento: ${motivo}` })
        .eq('id', vendaId);
    
    if (upError) throw upError;

    // 3. Revert Stock
    for (const item of venda.venda_itens) {
        const { data: prodData } = await supabase
            .from('produtos')
            .select('estoque_atual')
            .eq('id', item.produto_id)
            .single();
        
        const newStock = (prodData?.estoque_atual || 0) + item.quantidade;

        await supabase
            .from('produtos')
            .update({ estoque_atual: newStock })
            .eq('id', item.produto_id);

        await supabase
            .from('loja_movimentacoes')
            .insert({
                produto_id: item.produto_id,
                tipo: 'SAIDA', // Reversal is essentially a "negative sale" or manual adjustment, but here we add back.
                quantidade: item.quantidade,
                motivo: `Cancelamento Venda ${venda.numero_venda}: ${motivo}`,
                venda_id: vendaId,
                user_id: userId
            });
    }

    // 4. Revert Finance (Create a SAIDA with same value or mark as cancelled)
    // For simplicity, we'll create a compensative SAIDA
    await supabase
        .from('financeiro_movimentacoes')
        .insert({
            tipo: 'SAIDA',
            categoria_principal: 'AJUSTE',
            descricao: `Estorno Venda - ${venda.numero_venda}`,
            valor: venda.total,
            forma_pagamento: venda.forma_pagamento,
            data_movimentacao: new Date().toISOString().split('T')[0],
            venda_id: vendaId,
            criado_por_user_id: userId,
            observacoes: `Estorno referente ao cancelamento da venda ${venda.numero_venda}. Motivo: ${motivo}`
        });

    return true;
  }
};
