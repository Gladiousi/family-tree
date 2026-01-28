export type User = {
    id: string;
    username: string;
    email: string;
    first_name: string;
};

export type Family = {
    id: string;
    name: string;
    description?: string;
    description_html?: string;
    photo?: string;
    photo_url?: string;
    media?: MediaFile[];
    owner: User;
    members: User[];
    created_at: string;
};

export type TreeNode = {
    id: string;
    name: string;
    birth_date?: string;
    death_date?: string;
    bio?: string;
    bio_html?: string;
    photo_url?: string;
    photo?: string;
    media?: MediaFile[];
    age?: number | null;
    age_display?: string | null;
    x: number;
    y: number;
};

export type MediaFile = {
    id: string;
    url: string;
    type: 'photo' | 'video';
    uploaded_at?: string;
};

export type Memory = {
    id: string;
    title: string;
    description?: string;
    description_html?: string;
    date?: string;
    participants?: User[];
    nodes?: TreeNode[];
    media?: MediaFile[];
    created_at: string;
};

export type FamilyTree = {
    nodes: TreeNode[];
    edges: { source: string; target: string }[];
};

//что-то странное, на мушке
export type TreeEdgeData = {
    id: string;
    source_id: string;
    target_id: string;
    source: string;
    target: string;
    family: string;
};


export type TreeNodeData = {
    id: string;
    name: string;
    birth_date?: string;
    death_date?: string;
    bio?: string;
    photo_url?: string;
    x: number;
    y: number;
};

export type UserData = {
    id: string;
    username: string;
    email: string;
    first_name: string;
    birth_date?: string | null;
    death_date?: string | null;
    age?: number | null;
    age_display?: string | null;
};

