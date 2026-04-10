// src/routes/inventoryRoutes.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
    createInventoryItem,
    getAllItems,
    getItemByNumero,
    updateItem,
    deleteItem,
    moveInventory,
    getMovementHistory,
    getAllMovements
} from '../controllers/inventoryController';

const router = Router();

router.use(authMiddleware);

// CRUD de itens
router.post('/inventory', createInventoryItem);
router.get('/inventory', getAllItems);
router.get('/inventory/movements', getAllMovements);
router.get('/inventory/:numero', getItemByNumero);
router.put('/inventory/:numero', updateItem);
router.delete('/inventory/:numero', deleteItem);

// Movimentação
router.post('/inventory/:numero/move', moveInventory);
router.get('/inventory/:numero/movements', getMovementHistory);

export default router;
