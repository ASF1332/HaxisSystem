// src/controllers/projectController.ts

import { Request, Response } from 'express';
import fs from 'fs';
import { Project, ProjectSector, ProjectStatus } from '../models/Project';

// Em memória - substituir por banco de dados real
const projects: Project[] = [];

const removeProjectCover = (project: Project) => {
    if (project.coverImageFileKey && fs.existsSync(project.coverImageFileKey)) {
        fs.unlinkSync(project.coverImageFileKey);
    }
};

// --- CREATE ---
export const createProject = async (req: Request, res: Response) => {
    try {
        const { title, description, sector, status, startDate, endDate, responsibleId } = req.body;

        if (!title || !sector || !startDate) {
            return res.status(400).json({ message: 'Título, setor e data de início são obrigatórios.' });
        }

        const now = new Date().toISOString();

        const newProject: Project = {
            id: `proj-${Date.now()}`,
            title,
            description: description || '',
            sector,
            status: status || ProjectStatus.PLANEJAMENTO,
            startDate,
            endDate: endDate || null,
            responsibleId,
            coverImageUrl: null,
            coverImageFileKey: null,
            createdAt: now,
            updatedAt: now
        };

        projects.push(newProject);

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- LIST ALL ---
export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const { sector, status, responsibleId } = req.query;

        let filtered = [...projects];

        if (sector) {
            filtered = filtered.filter(p => p.sector === sector);
        }
        if (status) {
            filtered = filtered.filter(p => p.status === status);
        }
        if (responsibleId) {
            filtered = filtered.filter(p => p.responsibleId === responsibleId);
        }

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- GET BY ID ---
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = projects.find(p => p.id === id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- UPDATE ---
export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const projectIndex = projects.findIndex(p => p.id === id);

        if (projectIndex === -1) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        const updatedFields = {
            ...projects[projectIndex],
            ...req.body,
            id: projects[projectIndex].id, // Não permitir alterar o ID
            createdAt: projects[projectIndex].createdAt, // Não permitir alterar createdAt
            updatedAt: new Date().toISOString()
        };

        projects[projectIndex] = updatedFields;

        res.json(updatedFields);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- DELETE ---
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const projectIndex = projects.findIndex(p => p.id === id);

        if (projectIndex === -1) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        removeProjectCover(projects[projectIndex]);
        projects.splice(projectIndex, 1);

        res.json({ message: 'Projeto excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- LIST BY SECTOR ---
export const getProjectsBySector = async (req: Request, res: Response) => {
    try {
        const { sector } = req.params;
        const filtered = projects.filter(p => p.sector === sector);
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- UPDATE STATUS ---
export const updateProjectStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status é obrigatório.' });
        }

        const project = projects.find(p => p.id === id);
        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        project.status = status;
        project.updatedAt = new Date().toISOString();

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- UPLOAD DE CAPA ---
export const uploadProjectCover = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = projects.find(p => p.id === id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Arquivo de capa é obrigatório.' });
        }

        removeProjectCover(project);

        const fileName = req.file.filename;
        project.coverImageFileKey = req.file.path;
        project.coverImageUrl = `/uploads/project-covers/${fileName}`;
        project.updatedAt = new Date().toISOString();

        return res.json(project);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao fazer upload da capa do projeto.' });
    }
};

// --- GET ALL DATA (para dashboard) ---
export const getAllProjectsData = (): Project[] => {
    return [...projects];
};
