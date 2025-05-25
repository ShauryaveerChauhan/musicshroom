import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";

const YouTube_RegEx = /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/;
const Spotify_RegEx = /^https:\/\/open\.spotify\.com\/track\/[\w\d]+/;

const CreateStreamSchema = z.object({
  creatorId: z.string(),
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
    const data = CreateStreamSchema.parse(await req.json());

    let platform: "YouTube" | "Spotify" | null = null;

    if (YouTube_RegEx.test(data.url)) {
      platform = "YouTube";
    } else if (Spotify_RegEx.test(data.url)) {
      platform = "Spotify";
    } else {
      return NextResponse.json(
        { message: "Unsupported URL format" },
        { status: 411 }
      );
    }

    if (platform === "YouTube") {
      const extractedId = data.url.split("v=")[1]; // fixed split

      const res = await youtubesearchapi.GetVideoDetails(extractedId);

      if (!res || !res.title) {
        return NextResponse.json(
          { message: "Failed to fetch YouTube video details" },
          { status: 500 }
        );
      }

      const thumbnails = res.thumbnail.thumbnails;
      thumbnails.sort(
        (a: { width: number }, b: { width: number }) =>
          a.width - b.width
      );

      const stream = await prismaClient.stream.create({
        data: {
          userId: data.creatorId,
          url: data.url,
          extractedId,
          type: "YouTube",
          title: res.title,
          smallImg:
            thumbnails.length > 1
              ? thumbnails[thumbnails.length - 2].url
              : thumbnails[thumbnails.length - 1].url,
          bigImg: thumbnails[thumbnails.length - 1].url,
        },
      });

      return NextResponse.json({ stream });
    } else if (platform === "Spotify") {
      const trackDetails = await getSpotifyTrackDetails(data.url);

      const stream = await prismaClient.stream.create({
        data: {
          userId: data.creatorId,
          url: data.url,
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