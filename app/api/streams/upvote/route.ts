import { prismaClient } from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const UpvoteSchema = z.object({
    streamId : z.string(),
})
export  async function POST(req: NextRequest){
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        });
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: session.user.email
        }
    });

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    try {
        const { streamId } = UpvoteSchema.parse(await req.json());

        // Find the Stream by its database ID
        const stream = await prismaClient.stream.findUnique({
            where: {
                id: streamId
            }
        });

        if (!stream) {
            return NextResponse.json({ message: "Stream not found" }, { status: 404 });
        }

        // Create the upvote
        await prismaClient.upvote.create({
            data: {
                userId: user.id,
                streamId: stream.id
            }
        });

        // Get updated upvote count
        const upvoteCount = await prismaClient.upvote.count({
            where: {
                streamId: stream.id
            }
        });

        return NextResponse.json({ 
            message: "Upvoted successfully",
            upvotes: upvoteCount,
            hasUserUpvoted: true
        });
    } catch (e) {
        console.error("Error in upvote:", e);
        return NextResponse.json({
            message: e instanceof Error ? e.message : "Error while upvoting"
        }, { status: 403 });
    }
}