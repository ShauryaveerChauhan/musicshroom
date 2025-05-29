import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: session.user.email
        }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 403 });
    }
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: user.id
        }
    })
    
    return NextResponse.json({ streams });
}


