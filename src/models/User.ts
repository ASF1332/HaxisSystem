// src/models/User.ts

// Usamos um 'enum' para garantir que os cargos sejam sempre os mesmos
// e evitar erros de digitação.
export enum UserRole {
    PROGRAMADOR = 'PROGRAMADOR',
    ENGENHEIRO_MECANICO = 'ENGENHEIRO_MECANICO',
    ENGENHEIRO_ELETRICO = 'ENGENHEIRO_ELETRICO',
    GESTOR = 'GESTOR',
    DESENVOLVEDOR = 'DESENVOLVEDOR' // O cargo especial com permissão para editar horas
}

// A 'interface' define o formato de um objeto de usuário.
export interface User {
    id: string; // Identificador único, ex: "1", "2", "abc-123"
    name: string;
    email: string;
    passwordHash: string; // NUNCA salvaremos a senha real, apenas uma versão criptografada.
    role: UserRole; // O cargo do usuário, que deve ser um dos definidos acima.
}