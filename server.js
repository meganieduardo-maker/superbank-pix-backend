const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(express.json());
app.use(cors());

// Lê a variável de ambiente de forma segura
const accessToken = process.env.ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
    console.error("⚠️ ERRO CRÍTICO: Token do Mercado Pago não encontrado nas variáveis de ambiente!");
} else {
    console.log("✅ Token do Mercado Pago carregado com sucesso.");
}

// Configuração formal do SDK
const client = new MercadoPagoConfig({ 
    accessToken: accessToken || "TOKEN_INVALIDO" 
});

app.get('/', (req, res) => {
    res.json({ status: "Online", message: "SuperBank Backend Operacional!" });
});

app.post('/api/pix/cobrar', async (req, res) => {
    try {
        const { amount, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Valor inválido para cobrança." });
        }

        if (!accessToken) {
            return res.status(500).json({ 
                error: "authorization value not present: Configure o ACCESS_TOKEN nas Environment Variables do Render." 
            });
        }

        const payment = new Payment(client);

        const response = await payment.create({
            body: {
                transaction_amount: Number(amount),
                description: description || 'SuperBank - Pix',
                payment_method_id: 'pix',
                payer: {
                    email: 'cliente_teste@superbank.com',
                    first_name: 'Correntista',
                    last_name: 'SuperBank',
                    identification: {
                        type: 'CPF',
                        number: '12345678909'
                    }
                }
            }
        });

        const pixCopyPaste = response.point_of_interaction?.transaction_data?.qr_code || '00020101021243650014br.gov.bcb.pix0114+55119999999995204000053039865802BR5913SuperBank Pro6009Sao Paulo62070503***63041D3D';

        return res.status(200).json({
            success: true,
            id: response.id,
            qr_code: pixCopyPaste,
            init_point: response.point_of_interaction?.transaction_data?.ticket_url
        });

    } catch (error) {
        console.error("❌ Erro detalhado no pagamento:", error);
        return res.status(500).json({ 
            error: error.message || error.cause?.[0]?.description || "Erro interno ao processar Pix." 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
