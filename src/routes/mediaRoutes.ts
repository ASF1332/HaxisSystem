// src/routes/mediaRoutes.ts

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';
import {
    uploadMedia,
    getProjectMedia,
    getAllMedia,
    getMediaById,
    deleteMedia
} from '../controllers/mediaController';

const router = Router();

router.use(authMiddleware);

// Configurar storage do multer
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

// Criar pasta uploads se não existir
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Gera nome único: timestamp + nome original
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

// Filtro de arquivos
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Use imagens ou vídeos.'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    },
    fileFilter
});

// Rotas
router.post('/projects/:projectId/media', upload.single('file'), uploadMedia);
router.get('/projects/:projectId/media', getProjectMedia);
router.get('/media', getAllMedia);
router.get('/media/:id', getMediaById);
router.delete('/media/:id', deleteMedia);

export default router;
