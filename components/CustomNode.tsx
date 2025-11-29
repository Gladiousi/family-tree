'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { format } from 'date-fns';

interface CustomNodeData {
    label: string;
    name: string;
    birthDate?: string;
    deathDate?: string;
    bio?: string;
    photoUrl?: string;
}

function CustomNode({ data }: NodeProps<CustomNodeData>) {
    const { label, birthDate, deathDate, photoUrl } = data;

    return (
        <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-gray-200 bg-white min-w-[180px] hover:border-primary transition-colors">
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            
            <div className="flex flex-col items-center gap-2">
                {photoUrl ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
                        <img 
                            src={photoUrl} 
                            alt={label} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-gray-300 shadow-md flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-600">
                            {label.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                
                <div className="text-center">
                    <div className="font-semibold text-gray-800 text-sm mb-1">{label}</div>
                    {birthDate && (
                        <div className="text-xs text-gray-500">
                            {format(new Date(birthDate), 'dd.MM.yyyy')}
                            {deathDate && ` - ${format(new Date(deathDate), 'dd.MM.yyyy')}`}
                        </div>
                    )}
                </div>
            </div>
            
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}

export default memo(CustomNode);

