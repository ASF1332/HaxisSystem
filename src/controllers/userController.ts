import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';

const users: User[] = [];

// --- 1. CRIAÇÃO DO USUÁRIO ADMIN FIXO (André Schenkel) ---
(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("123456", salt); // Senha: 123456

    users.push({
        id: "admin-01",
        name: "André Schenkel", // <--- NOME ALTERADO
        email: "teste@email.com",
        passwordHash: hash,
        role: UserRole.GESTOR
    });

    console.log(">>> ADMIN CRIADO: André Schenkel (teste@email.com / 123456) <<<");
})();

// --- 2. FUNÇÃO DE CRIAR USUÁRIO ---
export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        if (users.find(user => user.email === email)) {
            return res.status(409).json({ message: 'Este email já está em uso.' });
        }

        if (!Object.values(UserRole).includes(role)) {
            return res.status(400).json({ message: 'Role inválida.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            passwordHash,
            role
        };

        users.push(newUser);
        console.log('Novo usuário criado:', newUser.name);

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- 3. FUNÇÃO DE LOGIN (AGORA ACEITA NOME OU EMAIL) ---
export const loginUser = async (req: Request, res: Response) => {
    try {
        // O frontend envia o campo como 'email', mas nós vamos tratar como 'loginInput'
        const { email: loginInput, password } = req.body;

        if (!loginInput || !password) {
            return res.status(400).json({ message: 'Usuário/Email e senha são obrigatórios.' });
        }

        // --- A MÁGICA ACONTECE AQUI ---
        // Procuramos um usuário onde o EMAIL seja igual OU o NOME seja igual
        const user = users.find(u =>
            u.email === loginInput || u.name === loginInput
        );

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const payload = { id: user.id, role: user.role };
        const secret = process.env.JWT_SECRET || 'seu_segredo_padrao';
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        res.status(200).json({
            token,
            user: {
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
