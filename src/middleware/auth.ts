// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido.' });
        }

        // Formato: "Bearer <token>"
        const [, token] = authHeader.split(' ');

        if (!token) {
            return res.status(401).json({ message: 'Token mal formatado.' });
        }

        const secret = process.env.JWT_SECRET || 'seu_segredo_padrao';
        const decoded = jwt.verify(token, secret) as { id: string; role: string };

        req.user = decoded;

        return next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};

// Middleware opcional para verificar role específico
export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
        }

        return next();
    };
};
