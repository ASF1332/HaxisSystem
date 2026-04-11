// src/controllers/projectController.ts

import { Request, Response } from 'express';
import fs from 'fs';
import {
    Project,
    ProjectScheduleItem,
    ProjectSector,
    ProjectStatus,
    ScheduleItemStatus
} from '../models/Project';

const projects: Project[] = [];

const removeProjectCover = (project: Project) => {
    if (project.coverImageFileKey && fs.existsSync(project.coverImageFileKey)) {
        fs.unlinkSync(project.coverImageFileKey);
    }
};

const findProject = (id: string) => projects.find(project => project.id === id);

const parseProgress = (value: unknown) => {
    const progress = Number(value);
    if (Number.isNaN(progress)) return 0;
    return Math.max(0, Math.min(100, progress));
};

const buildScheduleItem = (data: Partial<ProjectScheduleItem>): ProjectScheduleItem => {
    const now = new Date().toISOString();

    return {
        id: data.id || `sched-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: data.title || '',
        responsible: data.responsible || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        status: (data.status as ScheduleItemStatus) || ScheduleItemStatus.NAO_INICIADO,
        progress: parseProgress(data.progress),
        notes: data.notes || '',
        dependencyId: data.dependencyId || null,
        createdAt: data.createdAt || now,
        updatedAt: now
    };
};

const validateScheduleItem = (
    body: Partial<ProjectScheduleItem>,
    schedule: ProjectScheduleItem[],
    currentItemId?: string
) => {
    if (!body.title || !body.startDate || !body.endDate) {
        return 'Título, data de início e data de fim são obrigatórios.';
    }

    if (!Object.values(ScheduleItemStatus).includes(body.status as ScheduleItemStatus)) {
        return 'Status do cronograma inválido.';
    }

    if (body.dependencyId) {
        if (body.dependencyId === currentItemId) {
            return 'Uma etapa não pode depender dela mesma.';
        }

        const dependency = schedule.find(item => item.id === body.dependencyId);
        if (!dependency) {
            return 'A etapa selecionada em "Depende de" não foi encontrada.';
        }
    }

    return null;
};

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
            schedule: [],
            createdAt: now,
            updatedAt: now
        };

        projects.push(newProject);
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const { sector, status, responsibleId } = req.query;
        let filtered = [...projects];

        if (sector) filtered = filtered.filter(project => project.sector === sector);
        if (status) filtered = filtered.filter(project => project.status === status);
        if (responsibleId) filtered = filtered.filter(project => project.responsibleId === responsibleId);

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const project = findProject(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const projectIndex = projects.findIndex(project => project.id === req.params.id);

        if (projectIndex === -1) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        const updatedProject: Project = {
            ...projects[projectIndex],
            ...req.body,
            id: projects[projectIndex].id,
            schedule: projects[projectIndex].schedule,
            createdAt: projects[projectIndex].createdAt,
            updatedAt: new Date().toISOString()
        };

        projects[projectIndex] = updatedProject;
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const projectIndex = projects.findIndex(project => project.id === req.params.id);

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

export const getProjectsBySector = async (req: Request, res: Response) => {
    try {
        const filtered = projects.filter(project => project.sector === req.params.sector);
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

export const updateProjectStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status é obrigatório.' });
        }

        const project = findProject(req.params.id);
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

export const uploadProjectCover = async (req: Request, res: Response) => {
    try {
        const project = findProject(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Arquivo de capa é obrigatório.' });
        }

        removeProjectCover(project);

        project.coverImageFileKey = req.file.path;
        project.coverImageUrl = `/uploads/project-covers/${req.file.filename}`;
        project.updatedAt = new Date().toISOString();

        return res.json(project);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao fazer upload da capa do projeto.' });
    }
};

export const getProjectSchedule = async (req: Request, res: Response) => {
    try {
        const project = findProject(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        res.json(project.schedule);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao carregar cronograma.' });
    }
};

export const createScheduleItem = async (req: Request, res: Response) => {
    try {
        const project = findProject(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        const validationError = validateScheduleItem(req.body, project.schedule);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const newItem = buildScheduleItem(req.body);
        project.schedule.push(newItem);
        project.updatedAt = new Date().toISOString();

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar etapa do cronograma.' });
    }
};

export const updateScheduleItem = async (req: Request, res: Response) => {
    try {
        const project = findProject(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        const itemIndex = project.schedule.findIndex(item => item.id === req.params.itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Etapa do cronograma não encontrada.' });
        }

        const validationError = validateScheduleItem(req.body, project.schedule, req.params.itemId);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const currentItem = project.schedule[itemIndex];
        project.schedule[itemIndex] = {
            ...currentItem,
            ...req.body,
            id: currentItem.id,
            progress: parseProgress(req.body.progress),
            updatedAt: new Date().toISOString()
        };
        project.updatedAt = new Date().toISOString();

        res.json(project.schedule[itemIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar etapa do cronograma.' });
    }
};

export const deleteScheduleItem = async (req: Request, res: Response) => {
    try {
        const project = findProject(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado.' });
        }

        const itemIndex = project.schedule.findIndex(item => item.id === req.params.itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Etapa do cronograma não encontrada.' });
        }

        project.schedule.splice(itemIndex, 1);
        project.schedule = project.schedule.map(item => ({
            ...item,
            dependencyId: item.dependencyId === req.params.itemId ? null : item.dependencyId
        }));
        project.updatedAt = new Date().toISOString();

        res.json({ message: 'Etapa do cronograma excluída com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir etapa do cronograma.' });
    }
};

export const getAllProjectsData = (): Project[] => {
    return [...projects];
};
