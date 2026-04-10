// src/models/ProjectMedia.ts

export enum MediaType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO'
}

export interface ProjectMedia {
    id: string;
    projectId: string;
    fileName: string; // Nome original do arquivo
    fileKey: string; // Caminho/chave no servidor
    mediaType: MediaType;
    mimeType: string; // ex: "image/jpeg", "video/mp4"
    size: number; // Em bytes
    description?: string;
    uploadedAt: string;
    uploadedBy?: string; // ID do usuário
}
