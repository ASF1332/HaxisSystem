// src/controllers/mediaController.ts

import { Request, Response } from 'express';
import fs from 'fs';
import { ProjectMedia, MediaType } from '../models/ProjectMedia';

// Em memória - substituir por banco de dados real
const mediaFiles: ProjectMedia[] = [];

// --- UPLOAD DE MÍDIA ---
export const uploadMedia = async (req: Request, res: Response) => {
    try {
        const { description, uploadedBy } = req.body;
        const projectId = req.params.projectId || req.body.projectId;

        if (!projectId || !req.file) {
            return res.status(400).json({ message: 'projectId e arquivo são obrigatórios.' });
        }

        const file = req.file;
        const isVideo = file.mimetype.startsWith('video/');
        const isImage = file.mimetype.startsWith('image/');

        if (!isVideo && !isImage) {
            return res.status(400).json({
                message: 'Apenas imagens e vídeos são permitidos.'
            });
        }

        const now = new Date().toISOString();

        const newMedia: ProjectMedia = {
            id: `media-${Date.now()}`,
            projectId,
            fileName: file.originalname,
            fileKey: file.path, // Caminho do arquivo salvo
            mediaType: isVideo ? MediaType.VIDEO : MediaType.IMAGE,
            mimeType: file.mimetype,
            size: file.size,
            description,
            uploadedAt: now,
            uploadedBy
        };

        mediaFiles.push(newMedia);

        res.status(201).json(newMedia);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer upload da mídia.' });
    }
};

// --- LISTAR MÍDIAS DE UM PROJETO ---
export const getProjectMedia = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const projectMedia = mediaFiles.filter(m => m.projectId === projectId);
        res.json(projectMedia);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- LISTAR TODAS AS MÍDIAS ---
export const getAllMedia = async (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        let filtered = [...mediaFiles];

        if (type) {
            filtered = filtered.filter(m => m.mediaType === type);
        }

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- GET MEDIA BY ID ---
export const getMediaById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const media = mediaFiles.find(m => m.id === id);

        if (!media) {
            return res.status(404).json({ message: 'Mídia não encontrada.' });
        }

        res.json(media);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- DELETE MEDIA ---
export const deleteMedia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const mediaIndex = mediaFiles.findIndex(m => m.id === id);

        if (mediaIndex === -1) {
            return res.status(404).json({ message: 'Mídia não encontrada.' });
        }

        const [media] = mediaFiles.splice(mediaIndex, 1);

        if (media?.fileKey && fs.existsSync(media.fileKey)) {
            fs.unlinkSync(media.fileKey);
        }

        res.json({ message: 'Mídia excluída com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
