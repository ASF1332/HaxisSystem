// src/routes/userRoutes.ts

import { Router } from 'express';
// Importamos as DUAS funções do controller
import { createUser, loginUser } from '../controllers/userController';

const router = Router();

// Rota para criar um novo usuário
router.post('/users', createUser);

// --- vvv NOVA ROTA DE LOGIN ADICIONADA AQUI vvv ---
router.post('/login', loginUser);

export default router;