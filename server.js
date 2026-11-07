import { MercadoPagoConfig, Payment } from 'mercadopago';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const client = new MercadoPagoConfig({ accessToken: 'TEST-seu-access-token-aqui' });
const payment = new Payment(client);

app.post('/api/pix/cobrar', async (req, res) => {
    try {
        const { amount, description } = req.body;

        const body = {
            transaction_amount: Number(amount),
            description: description || 'SuperBank Pro - Pix',
            payment_method_id: 'pix',
            payer: {
                email: 'cliente_teste@superbank.com',
                first_name: 'Correntista',
                last_name: 'SuperBank',
                identification: {
                    type: 'CPF',
                    number: '19119119100'
                }
            }
        };

        const response = await payment.create({ body });

        res.json({
            success: true,
            id: response.id,
            status: response.status,
            qr_code: response.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
