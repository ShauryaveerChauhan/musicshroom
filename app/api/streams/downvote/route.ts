import { prismaClient } from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const DownvoteSchema = z.object({
    streamId : z.string(),
})
export  async function POST(req: NextRequest){
    const session = await auth();

    
    
    const user = await prismaClient.user.findFirst({
        where: {
            email : session?.user?.email as string
        }
    })

    if(!session?.user?.email){
        return NextResponse.json({
            message: "Unauthenticated"
        },{
            status: 403
        })
    }

    try{
            const data = DownvoteSchema.parse(await req.json())
            await prismaClient.upvote.delete({
                where : {
                    userId_streamId : {
                    userId : user?.id! ,
                    streamId : data.streamId
                }
            }
            })
        }
    catch(e){
        return NextResponse.json({
            message: "error while downvoting"
        }, {status : 403})
        
    }

}        