// src/controllers/inventoryController.ts

import { Request, Response } from 'express';
import { InventoryItem, InventoryCategory, InventoryUnit, InventoryMovement } from '../models/InventoryItem';

// Em memória - substituir por banco de dados real
const items: InventoryItem[] = [];
const movements: InventoryMovement[] = [];
let nextNumero = 1;

// --- CREATE ITEM ---
export const createInventoryItem = async (req: Request, res: Response) => {
    try {
        const { description, fabricante, codigo, quantity, unit, category } = req.body;

        if (!description || !fabricante || !codigo || !unit) {
            return res.status(400).json({ message: 'Descrição, fabricante, código e unidade são obrigatórios.' });
        }

        const now = new Date().toISOString();
        const numero = nextNumero++;

        const newItem: InventoryItem = {
            numero,
            description,
            fabricante,
            codigo,
            quantity: quantity || 0,
            unit,
            category: category || InventoryCategory.OUTROS,
            createdAt: now,
            updatedAt: now
        };

        items.push(newItem);

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- GET ALL ITEMS ---
export const getAllItems = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        let filtered = [...items];

        if (category) {
            filtered = filtered.filter(item => item.category === category);
        }

        // Ordenar por numero sequencial
        filtered.sort((a, b) => a.numero - b.numero);

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- GET ITEM BY NUMERO ---
export const getItemByNumero = async (req: Request, res: Response) => {
    try {
        const numero = parseInt(req.params.numero);
        const item = items.find(i => i.numero === numero);

        if (!item) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- UPDATE ITEM ---
export const updateItem = async (req: Request, res: Response) => {
    try {
        const numero = parseInt(req.params.numero);
        const itemIndex = items.findIndex(i => i.numero === numero);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        }

        items[itemIndex] = {
            ...items[itemIndex],
            ...req.body,
            numero: items[itemIndex].numero, // Não alterar numero sequencial
            createdAt: items[itemIndex].createdAt,
            updatedAt: new Date().toISOString()
        };

        res.json(items[itemIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- DELETE ITEM ---
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const numero = parseInt(req.params.numero);
        const itemIndex = items.findIndex(i => i.numero === numero);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        }

        items.splice(itemIndex, 1);

        res.json({ message: 'Item excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- MOVIMENTAÇÃO: ENTRADA/SAÍDA ---
export const moveInventory = async (req: Request, res: Response) => {
    try {
        const numero = parseInt(req.params.numero);
        const { type, quantity, reason, userId } = req.body;

        if (!type || !quantity || !reason) {
            return res.status(400).json({ message: 'Tipo, quantidade e motivo são obrigatórios.' });
        }

        if (type !== 'IN' && type !== 'OUT') {
            return res.status(400).json({ message: 'Tipo deve ser IN ou OUT.' });
        }

        const item = items.find(i => i.numero === numero);
        if (!item) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        }

        if (type === 'OUT' && item.quantity < quantity) {
            return res.status(400).json({
                message: `Estoque insuficiente. Disponível: ${item.quantity} ${item.unit}`
            });
        }

        // Atualiza quantidade
        if (type === 'IN') {
            item.quantity += quantity;
        } else {
            item.quantity -= quantity;
        }

        item.updatedAt = new Date().toISOString();

        // Registra movimentação
        const movement: InventoryMovement = {
            id: `mov-${Date.now()}`,
            itemNumero: numero,
            type,
            quantity,
            reason,
            date: new Date().toISOString(),
            userId
        };

        movements.push(movement);

        res.json({
            item,
            movement
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- HISTÓRICO DE MOVIMENTAÇÃO ---
export const getMovementHistory = async (req: Request, res: Response) => {
    try {
        const numero = parseInt(req.params.numero);
        const itemMovements = movements.filter(m => m.itemNumero === numero);
        res.json(itemMovements);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- GET ALL MOVEMENTS ---
export const getAllMovements = async (req: Request, res: Response) => {
    try {
        res.json(movements);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- GET ALL DATA (para dashboard) ---
export const getAllItemsData = (): InventoryItem[] => {
    return [...items];
};
