// src/models/InventoryItem.ts

export enum InventoryCategory {
    SERRALHERIA = 'SERRALHERIA',
    MECANICA = 'MECANICA',
    ELETRICA = 'ELETRICA',
    PNEUMATICA = 'PNEUMATICA',
    OUTROS = 'OUTROS'
}

export enum InventoryUnit {
    UNIDADE = 'UNIDADE',
    METRO = 'METRO',
    KG = 'KG',
    LITRO = 'LITRO',
    CAIXA = 'CAIXA',
    PAR = 'PAR',
    ROLON = 'ROLO'
}

export interface InventoryItem {
    numero: number; // Número sequencial do item
    description: string; // Descrição do material
    fabricante: string; // Fabricante
    codigo: string; // Código do produto
    quantity: number; // Quantidade atual
    unit: InventoryUnit; // Unidade de medida
    category: InventoryCategory; // Categoria
    createdAt: string;
    updatedAt: string;
}

// Histórico de movimentação
export interface InventoryMovement {
    id: string;
    itemNumero: number; // Referência ao numero do item
    type: 'IN' | 'OUT'; // Entrada ou Saída
    quantity: number;
    reason: string; // Motivo (ex: "Projeto X", "Compra fornecedor Y")
    date: string;
    userId?: string; // Quem fez a movimentação
}
