import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const extractedId = req.nextUrl.searchParams.get("extractedId");
        console.log("Looking for stream with extractedId:", extractedId);
        
        if (!extractedId) {
            console.error("No extractedId provided");
            return NextResponse.json({ error: "extractedId is required" }, { status: 400 });
        }

        const stream = await prismaClient.stream.findFirst({
            where: {
                extractedId: extractedId
            }
        });

        console.log("Found stream:", stream);

        return NextResponse.json({ stream });
    } catch (error) {
        console.error("Error finding stream:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
