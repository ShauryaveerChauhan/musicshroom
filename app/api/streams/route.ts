import { prismaClient } from "@/app/lib/db";
import { url } from "inspector";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// @ts-ignore
import youtubesearchapi from "youtube-search-api"

const YouTube_RegEx = new RegExp("^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$")

const CreateStreamSchema = z.object({
    creatorId : z.string(),
    url : z.string()

})

export async function POST(req: NextRequest){
    try{
            const data = CreateStreamSchema.parse(await req.json());
            const isYoutube = data.url.match(YouTube_RegEx)

            if (!isYoutube){ 
                return NextResponse.json({
                    message: "Incorrect url format"
                },{status: 411})
            }

            const extractedId = data.url.split("v=?")[1]
            
           const res =  youtubesearchapi.GetVideoDetails(extractedId)

            console.log(res.title);
            console.log(res.thumbnail)
            console.log(JSON.stringify(res.thumbnail.thumbnails))
            const thumbnails = res.thumbnail.thumbnails
            thumbnails.sort((a: {width : number}, b : {width : number}) => a.width < b.width ? -1 : 1)

          const stream =   await prismaClient.stream.create({
            data: {
            userId: data.creatorId,
            url: data.url,
            extractedId,
            type: "Youtube",
            title: res.title,
            // @ts-ignore
            smallImg : (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? "no thumbnail found :(" ,
            bigImg : thumbnails[thumbnails.length].url
            }}) ?? "no thumbnail found :("
    }
catch(e){
      return NextResponse.json({
        message:"error while adding a stream"
      },{
        status: 411
      }
        )
        }
}

export async function GET(req : NextRequest){
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const streams = await prismaClient.user.findMany({
        where : {
            id : creatorId ?? ""

        }
    })
    return NextResponse.json({
        streams
    })
}