export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

export interface Family {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    members: User[];
    ownerId: string;
}

export interface TreeNode {
    id: string;
    name: string;
    birthDate?: string;
    deathDate?: string;
    bio?: string;
    photoUrl?: string;
    position: { x: number; y: number };
    parentIds: string[];
}

export interface FamilyTree {
    id: string;
    familyId: string;
    nodes: TreeNode[];
    edges: { source: string; target: string }[];
}