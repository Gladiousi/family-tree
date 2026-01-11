'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { format } from 'date-fns';
import Image from 'next/image';
import type { CustomNodeData } from '@/types';

function CustomNode({ data }: NodeProps<CustomNodeData>) {
    const { label, birthDate, deathDate, photoUrl, age_display } = data;

    return (
        <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-gray-200 bg-white min-w-[180px] hover:border-primary transition-colors">
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            
            <div className="flex flex-col items-center gap-2">
                {photoUrl ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
                        <Image 
                            src={photoUrl} 
                            alt={label} 
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 border-2 border-gray-300 shadow-md flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-600">
                            {label.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                
                <div className="text-center">
                    <div className="font-semibold text-gray-800 text-sm mb-1">{label}</div>
                    {(birthDate || deathDate) && (
                        <div className="text-xs text-gray-500">
                            {birthDate && format(new Date(birthDate), 'dd.MM.yyyy')}
                            {deathDate && ` - ${format(new Date(deathDate), 'dd.MM.yyyy')}`}
                            {age_display ? ` (${age_display})` : ''}
                        </div>
                    )}
                </div>
            </div>
            
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}

export default memo(CustomNode);

