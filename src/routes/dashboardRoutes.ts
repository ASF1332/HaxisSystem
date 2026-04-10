// src/routes/dashboardRoutes.ts

import { Router } from 'express';
import {
    getDashboardMetrics,
    getProjectMetrics,
    getInventoryMetrics
} from '../controllers/dashboardController';

const router = Router();

router.get('/dashboard', getDashboardMetrics);
router.get('/dashboard/projects', getProjectMetrics);
router.get('/dashboard/inventory', getInventoryMetrics);

export default router;
