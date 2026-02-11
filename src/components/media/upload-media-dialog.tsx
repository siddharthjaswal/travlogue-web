'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { MediaItem } from './media-view';

const formSchema = z.object({
    file: z.instanceof(FileList).refine((files) => files?.length > 0, "File is required"),
    caption: z.string().optional(),
});

interface UploadMediaDialogProps {
    tripId: number;
    trigger?: React.ReactNode;
    onUpload?: (media: MediaItem) => void;
}

export function UploadMediaDialog({ tripId, trigger, onUpload }: UploadMediaDialogProps) {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            caption: '',
        },
    });

    const fileRef = form.register("file");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsUploading(true);
        
        // Simulate upload delay
        setTimeout(() => {
            const file = values.file[0];
            const newMedia: MediaItem = {
                id: Date.now(),
                tripId,
                url: preview || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80", // Fallback if preview fails
                type: 'image',
                caption: values.caption,
                uploadedAt: new Date().toISOString(),
                uploadedBy: "You",
                likes: 0
            };

            if (onUpload) {
                onUpload(newMedia);
            }

            toast.success("Photo uploaded successfully!");
            setIsUploading(false);
            setOpen(false);
            setPreview(null);
            form.reset();
        }, 1500);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Media</DialogTitle>
                    <DialogDescription>
                        Add photos or videos to your trip gallery.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* File Upload Area */}
                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Photo</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors border-muted-foreground/20 hover:border-primary/50">
                                                {preview ? (
                                                    <div className="relative w-full h-full p-2">
                                                        <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                                            <p className="text-white text-sm font-medium">Click to change</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                                    </div>
                                                )}
                                                <Input 
                                                    id="dropzone-file" 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    {...fileRef}
                                                    onChange={(e) => {
                                                        fileRef.onChange(e);
                                                        handleFileChange(e);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="caption"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Caption (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe this moment..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isUploading}>
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Upload
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
