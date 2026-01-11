import type { Memory, Family, MediaFile } from './models';

export type EditMemoryModalProps = {
    open: boolean;
    onClose: () => void;
    memoryId: string;
    familyId: string;
};

export type MemoryViewerProps = {
    open: boolean;
    onClose: () => void;
    memory: Memory | null;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
};

export type NodeData = {
    id?: string;
    name: string;
    birthDate?: string;
    deathDate?: string;
    bio?: string;
    photo?: File | null;
    photoUrl?: string;
};

export type NodeEditorProps = {
    open: boolean;
    onClose: () => void;
    node?: any;
    onSave: (data: NodeData) => void;
};

export type NodeViewerProps = {
    open: boolean;
    onClose: () => void;
    node?: any;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
};

export type EditFamilyModalProps = {
    open: boolean;
    onClose: () => void;
    familyId: string;
    family: Family | null;
};

export type CreateFamilyModalProps = {
    open: boolean;
    onClose: () => void;
};

export type AddMemberModalProps = {
    open: boolean;
    onClose: () => void;
    familyId: string;
};

export type InviteModalProps = {
    open: boolean;
    onClose: () => void;
    familyId: string;
};

export type FamilyCardProps = {
    family: Family;
    onEdit?: () => void;
};

export type CustomNodeData = {
    label: string;
    name: string;
    birthDate?: string;
    deathDate?: string;
    bio?: string;
    photoUrl?: string;
    bio_html?: string;
    age_display?: string | null;
    media?: MediaFile[];
};

export type LoadingSpinnerProps = {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
};

export type LoadingPageProps = {
    text?: string;
};

