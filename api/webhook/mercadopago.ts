import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Vercel serverless function (Node.js) configuration
export const config = {
  api: {
    bodyParser: true, // Let vercel unwrap body
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Mercado Pago uses POST.' });
  }

  try {
    // 1. O MercadoPago envia no queryString "?data.id" ou no body
    const paymentId = req.query['data.id'] || req.query.id || req.body?.data?.id;
    const type = req.query.type || req.body?.type;

    // Apenas pagamentos
    if (type === 'payment' && paymentId) {
      const accessToken = process.env.MP_ACCESS_TOKEN || 'TEST-YOUR-SANDBOX-ACCESS-TOKEN';
      const client = new MercadoPagoConfig({ accessToken });
      
      const paymentSDK = new Payment(client);
      const paymentData = await paymentSDK.get({ id: paymentId });

      // Se for aprovado, atualizar banco da clínica principal
      if (paymentData.status === 'approved') {
        const clinicaId = paymentData.external_reference;

        if (clinicaId && process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          
          const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          );

          console.log(`[Webhook MP] Pagamento aprovado para clinica: ${clinicaId}`);
          
          // - localizar cobrança/assinatura
          // - confirmar pagamento
          // - atualizar assinatura
          // - renovar validade por 30 dias
          
          const validadeRenovada = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          
          // Exemplo de como salvar no DB com as chaves exigidas (payment_id, payment_status, payment_method, date_approved, gateway_reference)
          const { error } = await supabase.from('assinaturas').upsert({
            clinica_id: clinicaId,
            status: 'ativa',
            validade: validadeRenovada,
            payment_id: String(paymentData.id),
            payment_status: paymentData.status,
            payment_method: paymentData.payment_method_id,
            date_approved: paymentData.date_approved,
            gateway_reference: 'mercadopago',
            updated_at: new Date().toISOString()
          }, { onConflict: 'clinica_id' });

          if (error) {
            console.error('[Webhook MP] Erro ao atualizar assinatura no Supabase:', error.message);
            // Poderia re-lançar o erro, mas o MP faria retentativas (dependendo da sua política).
          } else {
            console.log(`[Webhook MP] Assinatura da clinica ${clinicaId} atualizada com sucesso até ${validadeRenovada}`);
          }
        } else {
          console.warn('[Webhook MP] Falta clinicaId, VITE_SUPABASE_URL ou SERVICE_ROLE_KEY.');
        }
      } else {
        console.log(`[Webhook MP] Ignorando status de pagamento: ${paymentData.status}`);
      }
    }

    return res.status(200).send('OK');
  } catch (error: any) {
    console.error('[Webhook MP] Erro catastrofico:', error);
    return res.status(500).json({ error: error.message });
  }
}
