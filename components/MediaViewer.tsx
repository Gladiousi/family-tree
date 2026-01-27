'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { MediaFile } from '@/types/models';

interface MediaViewerProps {
    open: boolean;
    onClose: () => void;
    media: MediaFile[];
    initialIndex?: number;
}

export default function MediaViewer({ open, onClose, media, initialIndex = 0 }: MediaViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    if (!open || media.length === 0) return null;

    const currentMedia = media[currentIndex];
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < media.length - 1;

    const goToPrevious = () => {
        if (hasPrevious) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goToNext = () => {
        if (hasNext) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // Улучшенная функция скачивания
    const handleDownload = async () => {
        try {
            const response = await fetch(currentMedia.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Определяем расширение файла
            const extension = currentMedia.type === 'video' ? 'mp4' : 'jpg';
            const fileName = `family-media-${currentMedia.id}.${extension}`;
            
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Ошибка скачивания:', error);
            // Фоллбэк метод
            const link = document.createElement('a');
            link.href = currentMedia.url;
            link.download = `media-${currentMedia.id}`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 [&>button]:hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center justify-between">
                        <span>Медиа ({currentIndex + 1} / {media.length})</span>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={handleDownload}
                                title={`Скачать ${currentMedia.type === 'video' ? 'видео' : 'изображение'}`}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="relative aspect-video bg-black group">
                    {currentMedia.type === 'video' ? (
                        <video 
                            controls 
                            className="w-full h-full object-contain"
                            autoPlay
                        >
                            <source src={currentMedia.url} />
                        </video>
                    ) : (
                        <div className="relative w-full h-full">
                            <Image 
                                src={currentMedia.url} 
                                alt="Медиафайл" 
                                fill
                                className="object-contain"
                                unoptimized
                            />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => window.open(currentMedia.url, '_blank')}
                                    title="Открыть в полном размере"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                    {media.length > 1 && (
                        <>
                            {hasPrevious && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                                    onClick={goToPrevious}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                            )}
                            {hasNext && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                                    onClick={goToNext}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            )}
                        </>
                    )}
                </div>
                {media.length > 1 && (
                    <div className="p-4 flex gap-2 overflow-x-auto">
                        {media.map((m, index) => (
                            <button
                                key={m.id}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                                    index === currentIndex ? 'border-primary' : 'border-transparent'
                                }`}
                            >
                                {m.type === 'video' ? (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <span className="text-white text-xs">Видео</span>
                                    </div>
                                ) : (
                                    <Image 
                                        src={m.url} 
                                        alt={`Миниатюра ${index + 1}`} 
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
