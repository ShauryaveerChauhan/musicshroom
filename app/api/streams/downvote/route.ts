import { prismaClient } from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const DownvoteSchema = z.object({
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
            const { streamId } = DownvoteSchema.parse(await req.json());

            // Remove the upvote
            await prismaClient.upvote.delete({
                where: {
                    userId_streamId: {
                        userId: user.id,
                        streamId: streamId
                    }
                }
            });

            // Get updated upvote count
            const upvoteCount = await prismaClient.upvote.count({
                where: {
                    streamId: streamId
                }
            });

            return NextResponse.json({ 
                message: "Downvoted successfully",
                upvotes: upvoteCount,
                hasUserUpvoted: false
            });
        }
    catch(e){
        console.error("Error in downvote:", e);
        return NextResponse.json({
            message: e instanceof Error ? e.message : "Error while downvoting"
        }, { status: 403 })
        
    }

}