// src/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import mediaRoutes from './routes/mediaRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Rotas da API
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', mediaRoutes);
app.use('/api', dashboardRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});