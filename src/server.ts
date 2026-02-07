// src/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes'; // <-- 1. IMPORTE AS ROTAS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API do Sistema de Projetos está no ar!');
});

// 2. INFORME AO EXPRESS PARA USAR AS ROTAS DE USUÁRIO
// Todas as rotas definidas em userRoutes terão o prefixo /api
app.use('/api', userRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});