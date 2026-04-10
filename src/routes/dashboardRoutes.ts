// src/routes/dashboardRoutes.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
    getDashboardMetrics,
    getProjectMetrics,
    getInventoryMetrics
} from '../controllers/dashboardController';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboardMetrics);
router.get('/dashboard/projects', getProjectMetrics);
router.get('/dashboard/inventory', getInventoryMetrics);

export default router;
