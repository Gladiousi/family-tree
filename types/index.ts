export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
}

export interface Family {
    id: string;
    name: string;
    description?: string;
    owner: User;
    members: User[];
    created_at: string;
}

export interface TreeNode {
    id: string;
    name: string;
    birth_date?: string;
    death_date?: string;
    bio?: string;
    photo_url?: string;
    x: number;
    y: number;
}

export interface FamilyTree {
    nodes: TreeNode[];
    edges: { source: string; target: string }[];
}