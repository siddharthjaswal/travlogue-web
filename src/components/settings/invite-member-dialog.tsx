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
import { Loader2, Mail } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
    email: z.string().min(3, "Please enter at least one email"),
    role: z.enum(['owner', 'editor', 'viewer']),
    message: z.string().optional(),
}).refine((data) => {
    const emails = data.email
        .split(/[,\s]+/)
        .map((e) => e.trim())
        .filter(Boolean);
    return emails.every((e) => /.+@.+\..+/.test(e));
}, {
    message: "Please enter valid email(s)",
    path: ["email"],
});

interface InviteMemberDialogProps {
    trigger?: React.ReactNode;
    onInvite?: (email: string, role: 'owner' | 'editor' | 'viewer') => void;
    inviteLink?: string;
}

export function InviteMemberDialog({ trigger, onInvite, inviteLink }: InviteMemberDialogProps) {
    const [open, setOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            role: 'editor',
            message: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsInviting(true);

        const emails = values.email
            .split(/[,\s]+/)
            .map((e) => e.trim())
            .filter(Boolean);
        
        // Simulate invite delay
        setTimeout(() => {
            if (onInvite) {
                emails.forEach((email) => onInvite(email, values.role));
            }

            toast.success(`Invitation sent to ${emails.length} collaborator${emails.length > 1 ? 's' : ''}!`);
            setIsInviting(false);
            setOpen(false);
            form.reset();
        }, 1000);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Collaborator</DialogTitle>
                    <DialogDescription>
                        Send an invitation to plan this trip together.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input className="pl-9" placeholder="friend@example.com, friend2@example.com" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="editor">Editor (Can edit trip)</SelectItem>
                                            <SelectItem value="viewer">Viewer (Read only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Hey! Join me on this trip..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {inviteLink && (
                            <div className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs">
                                <div className="font-medium text-foreground mb-1">Invite link</div>
                                <div className="flex items-center gap-2">
                                    <Input value={inviteLink} readOnly className="h-8 text-xs" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(inviteLink);
                                            toast.success('Invite link copied');
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isInviting}>
                                {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Invite
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
