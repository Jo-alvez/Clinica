import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Utilize ambiente sandbox se não houver PROD key configurada
    const accessToken = process.env.MP_ACCESS_TOKEN || 'TEST-YOUR-SANDBOX-ACCESS-TOKEN';
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const { plano, preco, clinicaId, email } = req.body;

    const result = await preference.create({
      body: {
        items: [
          {
            id: plano.trim(),
            title: `Assinatura ProClin - Plano ${plano}`,
            quantity: 1,
            unit_price: Number(preco),
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: email
        },
        back_urls: {
          success: `${req.headers.origin}/?status=success`,
          failure: `${req.headers.origin}/?status=failure`,
          pending: `${req.headers.origin}/?status=pending`
        },
        auto_return: 'approved',
        // O webhook deverá estar exposto e configurado no painel do MP ou via varável de ambiente
        notification_url: process.env.MP_WEBHOOK_URL || 'https://seu-dominio-vercel.app/api/webhook/mercadopago', 
        external_reference: clinicaId, // Esse ID será o identificador para atualizar no Webhook
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [{ id: 'ticket' }], // Bloqueia boletos. Deixa Pix e Cartão (Credit/Debit) abertos.
          installments: 1
        }
      }
    });

    res.status(200).json({ 
      id: result.id, 
      init_point: result.init_point, 
      sandbox_init_point: result.sandbox_init_point 
    });
  } catch (error: any) {
    console.error('Error creating preference:', error);
    res.status(500).json({ error: error.message });
  }
}
