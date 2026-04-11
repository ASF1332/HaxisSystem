// src/models/Project.ts

// Setores da empresa
export enum ProjectSector {
    AUTOMACAO = 'AUTOMACAO',
    MECANICA = 'MECANICA',
    DEV = 'DEV'
}

// Etapas/status de um projeto
export enum ProjectStatus {
    PLANEJAMENTO = 'PLANEJAMENTO',
    EM_ANDAMENTO = 'EM_ANDAMENTO',
    AGUARDANDO_MATERIAL = 'AGUARDANDO_MATERIAL',
    EM_REVISAO = 'EM_REVISAO',
    CONCLUIDO = 'CONCLUIDO',
    CANCELADO = 'CANCELADO'
}

export enum ScheduleItemStatus {
    NAO_INICIADO = 'NAO_INICIADO',
    EM_ANDAMENTO = 'EM_ANDAMENTO',
    CONCLUIDO = 'CONCLUIDO',
    ATRASADO = 'ATRASADO'
}

export interface ProjectScheduleItem {
    id: string;
    title: string;
    responsible: string;
    startDate: string;
    endDate: string;
    status: ScheduleItemStatus;
    progress: number;
    notes: string;
    dependencyId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    sector: ProjectSector;
    status: ProjectStatus;
    startDate: string; // ISO date string
    endDate: string | null; // null = sem data definida
    responsibleId?: string; // ID do usuário responsável
    coverImageUrl?: string | null;
    coverImageFileKey?: string | null;
    schedule: ProjectScheduleItem[];
    createdAt: string;
    updatedAt: string;
}
