import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Define the types for our room and user interfaces
interface RoomType {
    id: string;
    code: string;
    name: string;
    hostId: string;
    active: boolean;
}

interface RoomUserType {
    id: string;
    name: string | null;
    avatar: string | null;
    isHost: boolean;
}

export async function GET(req: NextRequest) {
    // Get origin for CORS
    const origin = req.headers.get('origin') || '*';
    const corsHeaders = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        Vary: 'Origin',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: corsHeaders,
        });
    }

    const session = await auth();

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: session.user.email
        }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 403, headers: corsHeaders });
    }
    
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: user.id
        },
        include: {
            _count: {
                select: {
                    upvotes: true
                }
            },
            upvotes: {
                where: {
                    userId: user.id
                },
            }
        }
    });

    let room: RoomType | null = null;
    let users: RoomUserType[] = [];

    // Find the user's active room membership by looking up their RoomUser record
    const roomMember = await prismaClient.roomUser.findFirst({
        where: {
            userId: user.id
        },
        include: {
            room: {
                include: {
                    host: true,
                    members: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    if (roomMember?.room) {
        const currentRoom = roomMember.room;
        room = {
            id: currentRoom.id,
            code: currentRoom.code,
            name: currentRoom.name,
            hostId: currentRoom.host.id, // Use host's ID from the included relation
            active: currentRoom.active
        };

        // Map all room members to user objects
        users = currentRoom.members.map(member => ({
            id: member.user.id,
            name: member.user.name || 'Anonymous',
            avatar: member.user.image,
            isHost: member.user.id === currentRoom.host.id
        }));

        // Debug log
        console.log('API /streams/me users:', users);
    }
    
    return NextResponse.json({ 
        streams: streams.map(({_count, ...rest}) => ({
            ...rest,
            upvotes: _count.upvotes
        })),
        room,
        users
    }, { headers: corsHeaders });
}
