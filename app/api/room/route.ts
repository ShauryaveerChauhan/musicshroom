import { prismaClient } from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateRoomSchema = z.object({
  name: z.string().min(1),
  code: z.string().length(6)
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prismaClient.user.findFirst({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, code } = CreateRoomSchema.parse(body);

    // Check if room code already exists
    const existingRoom = await prismaClient.room.findUnique({
      where: { code }
    });

    if (existingRoom) {
      return NextResponse.json(
        { message: "Room code already exists" },
        { status: 400 }
      );
    }

    // Create the room
    const room = await prismaClient.room.create({
      data: {
        name,
        code,
        hostId: user.id
      }
    });

    return NextResponse.json({ room });
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message || "Error creating room" },
      { status: 500 }
    );
  }
}

// Add endpoint to join a room
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prismaClient.user.findFirst({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const code = req.nextUrl.searchParams.get("code");
    
    if (!code) {
      return NextResponse.json(
        { message: "Room code is required" },
        { status: 400 }
      );
    }

    const room = await prismaClient.room.findUnique({
      where: { code }
    });

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ room });
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message || "Error joining room" },
      { status: 500 }
    );
  }
}
