// src/controllers/dashboardController.ts

import { Request, Response } from 'express';
import { Project, ProjectStatus, ProjectSector } from '../models/Project';
import { InventoryItem, InventoryCategory } from '../models/InventoryItem';

// --- MÉTRICAS GERAIS DO DASHBOARD ---
export const getDashboardMetrics = async (req: Request, res: Response) => {
    try {
        const projectCtrl = require('./projectController');
        const inventoryCtrl = require('./inventoryController');

        const projects: Project[] = projectCtrl.getAllProjectsData ? projectCtrl.getAllProjectsData() : [];
        const items: InventoryItem[] = inventoryCtrl.getAllItemsData ? inventoryCtrl.getAllItemsData() : [];

        const now = new Date();

        // --- PROJETOS ---
        const totalProjects = projects.length;

        // Projetos por status
        const projectsByStatus = {
            planejamento: projects.filter((p: Project) => p.status === ProjectStatus.PLANEJAMENTO).length,
            em_andamento: projects.filter((p: Project) => p.status === ProjectStatus.EM_ANDAMENTO).length,
            aguardando_material: projects.filter((p: Project) => p.status === ProjectStatus.AGUARDANDO_MATERIAL).length,
            em_revisao: projects.filter((p: Project) => p.status === ProjectStatus.EM_REVISAO).length,
            concluido: projects.filter((p: Project) => p.status === ProjectStatus.CONCLUIDO).length,
            cancelado: projects.filter((p: Project) => p.status === ProjectStatus.CANCELADO).length
        };

        // Projetos por setor
        const projectsBySector = {
            serralheria: projects.filter((p: Project) => p.sector === ProjectSector.SERRALHERIA).length,
            automacao: projects.filter((p: Project) => p.sector === ProjectSector.AUTOMACAO).length,
            engenharia_mecanica: projects.filter((p: Project) => p.sector === ProjectSector.ENGENHARIA_MECANICA).length
        };

        // Projetos atrasados
        const overdueProjects = projects.filter((p: Project) => {
            if (!p.endDate) return false;
            if (p.status === ProjectStatus.CONCLUIDO || p.status === ProjectStatus.CANCELADO) return false;
            return new Date(p.endDate) < now;
        });

        // Projetos iniciados este mês
        const thisMonthProjects = projects.filter((p: Project) => {
            const startDate = new Date(p.startDate);
            return startDate.getMonth() === now.getMonth() &&
                   startDate.getFullYear() === now.getFullYear();
        });

        // --- ESTOQUE (simplificado, sem alerta de mínimo) ---
        const totalItems = items.length;

        // --- RESUMO ---
        const metrics = {
            projetos: {
                total: totalProjects,
                porStatus: projectsByStatus,
                porSetor: projectsBySector,
                atrasados: overdueProjects.length,
                projetosAtrasados: overdueProjects,
                esteMes: thisMonthProjects.length
            },
            estoque: {
                totalItens: totalItems
            },
            geradoEm: now.toISOString()
        };

        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- MÉTRICAS DE PROJETOS ---
export const getProjectMetrics = async (req: Request, res: Response) => {
    try {
        const projectCtrl = require('./projectController');
        const projects: Project[] = projectCtrl.getAllProjectsData ? projectCtrl.getAllProjectsData() : [];
        const now = new Date();

        const totalProjects = projects.length;
        const activeProjects = projects.filter((p: Project) =>
            p.status === ProjectStatus.EM_ANDAMENTO ||
            p.status === ProjectStatus.PLANEJAMENTO ||
            p.status === ProjectStatus.AGUARDANDO_MATERIAL ||
            p.status === ProjectStatus.EM_REVISAO
        ).length;

        const completedProjects = projects.filter((p: Project) => p.status === ProjectStatus.CONCLUIDO).length;
        const overdueProjects = projects.filter((p: Project) => {
            if (!p.endDate) return false;
            if (p.status === ProjectStatus.CONCLUIDO || p.status === ProjectStatus.CANCELADO) return false;
            return new Date(p.endDate) < now;
        }).length;

        res.json({
            total: totalProjects,
            ativos: activeProjects,
            concluidos: completedProjects,
            atrasados: overdueProjects
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// --- MÉTRICAS DE ESTOQUE ---
export const getInventoryMetrics = async (req: Request, res: Response) => {
    try {
        const inventoryCtrl = require('./inventoryController');
        const items: InventoryItem[] = inventoryCtrl.getAllItemsData ? inventoryCtrl.getAllItemsData() : [];

        const totalItems = items.length;

        // Por categoria
        const byCategory = items.reduce((acc: Record<string, number>, item: InventoryItem) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        res.json({
            totalItens: totalItems,
            porCategoria: byCategory
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
