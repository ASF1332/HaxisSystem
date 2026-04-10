// src/routes/projectRoutes.ts

import { Router } from 'express';
import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    getProjectsBySector,
    updateProjectStatus
} from '../controllers/projectController';

const router = Router();

// CRUD principal
router.post('/projects', createProject);
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Rotas extras
router.get('/projects/sector/:sector', getProjectsBySector);
router.patch('/projects/:id/status', updateProjectStatus);

export default router;
