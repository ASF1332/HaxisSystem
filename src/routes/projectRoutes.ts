// src/routes/projectRoutes.ts

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';
import {
    createProject,
    createScheduleItem,
    getAllProjects,
    getProjectById,
    getProjectSchedule,
    updateProject,
    deleteProject,
    deleteScheduleItem,
    getProjectsBySector,
    updateProjectStatus,
    updateScheduleItem,
    uploadProjectCover
} from '../controllers/projectController';

const router = Router();

const coverUploadDir = path.join(__dirname, '..', '..', 'uploads', 'project-covers');

if (!fs.existsSync(coverUploadDir)) {
    fs.mkdirSync(coverUploadDir, { recursive: true });
}

const coverStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, coverUploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const coverUpload = multer({
    storage: coverStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('A capa do projeto deve ser uma imagem.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.use(authMiddleware);

// CRUD principal
router.post('/projects', createProject);
router.get('/projects', getAllProjects);
router.get('/projects/sector/:sector', getProjectsBySector);
router.post('/projects/:id/cover', coverUpload.single('coverImage'), uploadProjectCover);
router.get('/projects/:id/schedule', getProjectSchedule);
router.post('/projects/:id/schedule', createScheduleItem);
router.put('/projects/:id/schedule/:itemId', updateScheduleItem);
router.delete('/projects/:id/schedule/:itemId', deleteScheduleItem);
router.get('/projects/:id', getProjectById);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Rotas extras
router.patch('/projects/:id/status', updateProjectStatus);

export default router;
