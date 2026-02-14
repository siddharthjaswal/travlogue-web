'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon, Video, Trash2, Heart, Download } from "lucide-react";
import { Trip } from "@/services/trip-service";
import { UploadMediaDialog } from "./upload-media-dialog";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Mock Media Type
export interface MediaItem {
    id: number;
    tripId: number;
    url: string;
    type: 'image' | 'video';
    caption?: string;
    uploadedAt: string;
    uploadedBy: string;
    likes: number;
}

// Mock Data
const MOCK_MEDIA: MediaItem[] = [
    {
        id: 1,
        tripId: 1,
        url: "https://images.unsplash.com/photo-1499856871940-a09627c6d7db?auto=format&fit=crop&w=800&q=80",
        type: 'image',
        caption: "Sunset at the Eiffel Tower",
        uploadedAt: "2026-03-10T18:30:00Z",
        uploadedBy: "Siddharth",
        likes: 12
    },
    {
        id: 2,
        tripId: 1,
        url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
        type: 'image',
        caption: "Coffee in Montmartre",
        uploadedAt: "2026-03-11T09:15:00Z",
        uploadedBy: "Siddharth",
        likes: 8
    },
    {
        id: 3,
        tripId: 1,
        url: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?auto=format&fit=crop&w=800&q=80",
        type: 'image',
        caption: "Notre Dame details",
        uploadedAt: "2026-03-11T14:20:00Z",
        uploadedBy: "Siddharth",
        likes: 5
    },
    {
        id: 4,
        tripId: 1,
        url: "https://images.unsplash.com/photo-1478391679964-b80a25367b1b?auto=format&fit=crop&w=800&q=80",
        type: 'image',
        caption: "Walking along the Seine",
        uploadedAt: "2026-03-12T11:00:00Z",
        uploadedBy: "Siddharth",
        likes: 15
    },
    {
        id: 5,
        tripId: 1,
        url: "https://images.unsplash.com/photo-1549144511-6099e7dab944?auto=format&fit=crop&w=800&q=80",
        type: 'image',
        caption: "Louvre Pyramid at night",
        uploadedAt: "2026-03-12T20:45:00Z",
        uploadedBy: "Siddharth",
        likes: 22
    }
];

interface MediaViewProps {
    tripId: number;
    trip?: Trip;
}

export function MediaView({ tripId, trip }: MediaViewProps) {
    const [media, setMedia] = useState<MediaItem[]>(MOCK_MEDIA);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

    const handleUpload = (newMedia: MediaItem) => {
        setMedia([newMedia, ...media]);
    };

    if (isLoading) {
        return <MediaSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Trip Gallery</h2>
                    <p className="text-muted-foreground">Relive your memories with photos and videos.</p>
                </div>
                <UploadMediaDialog tripId={tripId} onUpload={handleUpload} trigger={
                    <Button className="gap-2 shadow-lg shadow-primary/20 w-full md:w-auto">
                        <Plus className="h-4 w-4" /> Upload Media
                    </Button>
                } />
            </div>

            {media.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {media.map((item) => (
                        <div key={item.id} className="break-inside-avoid relative group">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="cursor-zoom-in overflow-hidden rounded-xl bg-muted relative aspect-auto">
                                        <Image
                                            src={item.url}
                                            alt={item.caption || "Trip photo"}
                                            width={500}
                                            height={500}
                                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                            <p className="text-white font-medium text-sm truncate">{item.caption}</p>
                                            <div className="flex items-center justify-between mt-2 text-white/80 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Heart className="h-3 w-3 fill-white/80" />
                                                    <span>{item.likes}</span>
                                                </div>
                                                <span>{format(new Date(item.uploadedAt), 'MMM d')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none">
                                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                                        <Image
                                            src={item.url}
                                            alt={item.caption || "Full size"}
                                            fill
                                            className="object-contain"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                            <h3 className="text-lg font-semibold">{item.caption}</h3>
                                            <p className="text-sm opacity-80">Uploaded by {item.uploadedBy} on {format(new Date(item.uploadedAt), 'PPP')}</p>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl border-muted bg-muted/5 p-8 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4 animate-pulse">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Your gallery is empty. Upload photos to start building your visual travel diary.
                    </p>
                    <UploadMediaDialog tripId={tripId} onUpload={handleUpload} trigger={
                        <Button variant="outline" size="lg">Upload First Photo</Button>
                    } />
                </div>
            )}
        </div>
    );
}

function MediaSkeleton() {
    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className={`rounded-xl w-full ${i % 2 === 0 ? 'h-64' : 'h-48'}`} />
                ))}
            </div>
        </div>
    );
}
