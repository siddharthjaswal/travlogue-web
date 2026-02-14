'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Shield, User, Trash2 } from "lucide-react";
import { Trip } from "@/services/trip-service";
import { InviteMemberDialog } from "./invite-member-dialog";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock User Type
export interface TripMember {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'editor' | 'viewer';
    status: 'active' | 'pending';
}

// Mock Data
const MOCK_MEMBERS: TripMember[] = [
    {
        id: 1,
        name: "Siddharth Jaswal",
        email: "sid@example.com",
        role: "owner",
        status: "active",
        avatar: "https://github.com/shadcn.png"
    },
    {
        id: 2,
        name: "Luffy Bot",
        email: "luffy@example.com",
        role: "editor",
        status: "active",
        avatar: ""
    },
    {
        id: 3,
        name: "Pending User",
        email: "friend@example.com",
        role: "viewer",
        status: "pending",
        avatar: ""
    }
];

interface TripSettingsProps {
    tripId: number;
    trip?: Trip;
}

export function TripSettings({ tripId, trip }: TripSettingsProps) {
    const [members, setMembers] = useState<TripMember[]>(MOCK_MEMBERS);

    // Explicitly type the arguments
    const handleInvite = (email: string, role: string) => {
        const newMember: TripMember = {
            id: Date.now(),
            name: email.split('@')[0], 
            email,
            role: role as 'owner' | 'editor' | 'viewer', // Cast string to union type
            status: 'pending',
            avatar: ''
        };
        setMembers([...members, newMember]);
        toast.success(`Invitation sent to ${email}`);
    };

    const handleRemoveMember = (memberId: number) => {
        setMembers(members.filter(m => m.id !== memberId));
        toast.success("Member removed");
    };

    const handleRoleChange = (memberId: number, newRole: 'owner' | 'editor' | 'viewer') => {
        setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        toast.success("Role updated");
    };

    return (
        <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Trip Settings</h2>
                <p className="text-muted-foreground">Manage trip details, collaborators, and permissions.</p>
            </div>

            {/* General Settings */}
            <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Update basic details about your trip.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="tripName">Trip Name</Label>
                        <Input id="tripName" defaultValue={trip?.name || "My Trip"} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Add a description..." defaultValue={trip?.description || ""} />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => toast.success("Changes saved")}>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Collaboration Settings */}
            <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle>Collaborators</CardTitle>
                        <CardDescription>Invite friends to plan this trip with you.</CardDescription>
                    </div>
                    <InviteMemberDialog onInvite={handleInvite} trigger={
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Invite
                        </Button>
                    } />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {members.map((member) => (
                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">{member.name}</p>
                                            {member.status === 'pending' && (
                                                <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground">Pending</Badge>
                                            )}
                                            {member.id === 1 && ( 
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1">You</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-muted-foreground">
                                                {member.role === 'owner' && <Shield className="h-3 w-3 mr-1" />}
                                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                                <MoreHorizontal className="h-3 w-3 ml-1" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'owner')}>
                                                Owner
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'editor')}>
                                                Editor
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'viewer')}>
                                                Viewer
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="rounded-2xl border-destructive/20 bg-destructive/5">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for this trip.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="font-medium">Delete Trip</p>
                            <p className="text-sm text-muted-foreground">Permanently delete this trip and all its data.</p>
                        </div>
                        <Button variant="destructive" className="w-full sm:w-auto">Delete Trip</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
