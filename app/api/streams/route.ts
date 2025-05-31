import { prismaClient } from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";

const YouTube_RegEx = /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/;
const Spotify_RegEx = /^https:\/\/open\.spotify\.com\/track\/[\w\d]+/;

const CreateStreamSchema = z.object({
  url: z.string(),
});

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) throw new Error("Spotify token fetch failed");
  return data.access_token;
}

async function getSpotifyTrackDetails(spotifyUrl: string) {
  const match = spotifyUrl.match(/track\/([\w\d]+)/);
  if (!match) throw new Error("Invalid Spotify track URL");
  const trackId = match[1];

  const token = await getSpotifyAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Spotify track fetch failed");

  const data = await res.json();

  return {
    title: data.name,
    artist: data.artists.map((a: any) => a.name).join(", ") ?? null,
    album: data.album.name ?? null,
    image: data.album.images[0]?.url ?? null,
    preview_url: data.preview_url, // 30-sec preview (optional)
    extractedId: trackId,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ 
        message: "You must be logged in to add songs",
        code: "unauthorized"
      }, { status: 401 });
    }

    const user = await prismaClient.user.findFirst({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ 
        message: "User not found",
        code: "user_not_found"
      }, { status: 404 });
    }

    const { url } = CreateStreamSchema.parse(await req.json());

    let platform: "YouTube" | "Spotify" | null = null;

    if (YouTube_RegEx.test(url)) {
      platform = "YouTube";
    } else if (Spotify_RegEx.test(url)) {
      platform = "Spotify";
    } else {
      return NextResponse.json(
        { 
          message: "Please provide a valid YouTube or Spotify URL",
          code: "invalid_url"
        },
        { status: 400 }
      );
    }

    if (platform === "YouTube") {
      const extractedId = url.split("v=")[1];

      const res = await youtubesearchapi.GetVideoDetails(extractedId);

      if (!res || !res.title) {
        return NextResponse.json(
          { message: "Failed to fetch YouTube video details" },
          { status: 500 }
        );
      }

      const thumbnails = res.thumbnail.thumbnails;
      thumbnails.sort(
        (a: { width: number }, b: { width: number }) => a.width - b.width
      );

      const stream = await prismaClient.stream.create({
        data: {
          userId: user.id,
          url: url,
          extractedId,
          type: "YouTube",
          title: res.title,
          smallImg: thumbnails[0]?.url || "",
          bigImg: thumbnails[thumbnails.length - 1]?.url || "",
          artist: res.author || "",
          durationMs: res.lengthSeconds ? res.lengthSeconds * 1000 : null,
        },
      });

      return NextResponse.json({
        id: stream.id,
        title: stream.title,
        artist: stream.artist || "",
        album: "",
        duration: formatDuration(stream.durationMs || 0),
        durationSeconds: Math.floor((stream.durationMs || 0) / 1000),
        smallThumbnail: stream.smallImg,
        largeThumbnail: stream.bigImg,
      });
    } else if (platform === "Spotify") {
      const trackDetails = await getSpotifyTrackDetails(url);

      const stream = await prismaClient.stream.create({
        data: {
          userId: user.id,
          url: url,
          extractedId: trackDetails.extractedId,
          type: "Spotify",
          title: trackDetails.title,
          smallImg: trackDetails.image ?? "no image",
          bigImg: trackDetails.image ?? "no image",
          // You can optionally store artist/album or preview_url if you want
        },
      });

      return NextResponse.json({ stream });
    }
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: e.message || "Error while adding a stream" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId") ?? "";
  const streams = await prismaClient.stream.findMany({
    where: { userId: creatorId },
  });
  return NextResponse.json({ streams });
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}