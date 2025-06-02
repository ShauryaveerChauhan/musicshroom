"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Music,
  Users,
  ThumbsUp,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Search,
  Settings,
  Share,
  Clock,
  Maximize,
  Minimize,
  History,
  Plus
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Song } from "../types/song"
import axios from "axios"
import { prismaClient } from "../lib/db"
import Stream from "stream"
import { useEffect, useState, useMemo } from "react"
import { useSession } from 'next-auth/react';

const PLACEHOLDER_IMAGE = "/placeholder.svg"

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface RoomInfo {
  roomName: string;
  roomCode: string;
  hostId: string | null;
}

interface WebSocketMessage {
  type: 'USER_JOINED' | 'USER_LEFT' | 'ROOM_UPDATED' | 'SONG_ADDED';
  user?: User;
  userId?: string;
  room?: Partial<RoomInfo>;
  song?: Song;
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('code')

  const { data: session } = useSession();
  
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({})
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({
    roomName: "",
    roomCode: roomCode || "",
    hostId: null
  })

  const [sessionUsers, setSessionUsers] = useState<Array<User & { isHost: boolean }>>([]);

  const [currentSong, setCurrentSong] = React.useState<Song | null>({} as Song | null)

  const [isPlaying, setIsPlaying] = React.useState(true)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [isVideoExpanded, setIsVideoExpanded] = React.useState(false)
  const [volume, setVolume] = React.useState(70)

  const [queueSongs, setQueueSongs] = React.useState<Song[]>([
   
  ])

  const [previouslyPlayed, setPreviouslyPlayed] = React.useState<Song[]>([
   
  ])

  // Calculate net score for sorting (just use upvotes since we don't track downvotes)
  const getNetScore = (song: Song) => song.upvotes

  // Sort songs by upvotes
  const sortedQueueSongs = React.useMemo(() => {
    return [...queueSongs].sort((a, b) => {
      const scoreA = getNetScore(a)
      const scoreB = getNetScore(b)

      if (scoreA === scoreB) {
        // When scores are equal, sort by ID (converted to numbers for comparison)
        return parseInt(a.id) - parseInt(b.id)
      }

      return scoreB - scoreA
    })
  }, [queueSongs])

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Progress bar percentage
  const progressPercentage = currentSong ? (currentTime / currentSong.durationSeconds) * 100 : 0;

  async function refreshStreams() {
  try {
    // Use window.location.origin to ensure we have the correct protocol and host
    const baseUrl = window.location.origin;
    const res = await axios.get(`${baseUrl}/api/streams/me`, {
      withCredentials: true
    });

    // Update room info if available
    if (res.data.room) {
      setRoomInfo({
        roomName: res.data.room.name,
        roomCode: res.data.room.code,
        hostId: res.data.room.hostId
      });
    }

    // Update session users if available
    if (res.data.users) {
      setSessionUsers(res.data.users.map((user: User) => ({
        id: user.id,
        name: user.name || "Anonymous",
        avatar: user.avatar || "/placeholder.svg?height=32&width=32",
        isHost: user.id === res.data.room?.hostId
      })));
    } else {
      setSessionUsers([]); // Clear if no users
    }
  } catch (error) {
    console.error("Error refreshing streams:", error);
  }
}
  
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000; // 3 seconds

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!session || !session.user?.id) return;
    console.log('Calling /api/streams/me');
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setRetryCount(0);
        // Send room join message
        if (roomCode && session?.user?.id && ws) {
          ws.send(JSON.stringify({
            type: 'JOIN_ROOM',
            roomCode,
            userId: session.user.id
          }));
        }
        (window as any).ws = ws;
      };

      ws.onmessage = (event) => {
        const data: WebSocketMessage = JSON.parse(event.data);

        if (data.type === 'SONG_ADDED' && data.song) {
          setQueueSongs((prev) => {
            if (!data.song) return prev;
            return [...prev, data.song];
          });
        }

        if (data.type === 'USER_JOINED' && data.user) {
          setSessionUsers((prev) => {
            const isAlreadyListed = prev.some((user) => user.id === data.user?.id);
            if (isAlreadyListed || !data.user) return prev;

            const newUser: User & { isHost: boolean } = {
              id: data.user.id,
              name: data.user.name || 'Anonymous',
              avatar: data.user.avatar || PLACEHOLDER_IMAGE,
              isHost: false,
            };

            return [...prev, newUser];
          });
        }

        if (data.type === 'USER_LEFT' && data.userId) {
          setSessionUsers((prev) => prev.filter((user) => user.id !== data.userId));
        }

        if (data.type === 'ROOM_UPDATED' && data.room) {
          setRoomInfo((prev) => ({ ...prev, ...data.room }));
        }
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        reconnectTimeout = setTimeout(connectWebSocket, RETRY_DELAY);
      };
    };

    // Initial load
    refreshStreams();
    connectWebSocket();

    // Clean up WebSocket connection on unmount
    return () => {
      if (ws) {
        ws.close();
        delete (window as any).ws;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [roomCode, session?.user?.id]) 

  // Auto-advance to next song when current song ends
  React.useEffect(() => {
    if (currentSong && currentTime >= currentSong.durationSeconds) {
      handleNextSong()
    }
  }, [currentTime, currentSong])

  const handleVote = async (songId: string) => {
    try {
      const song = queueSongs.find(s => s.id === songId) || (currentSong?.id === songId ? currentSong : null);
      if (!song) {
        console.error("Song not found:", songId);
        return;
      }

      console.log("Voting for song:", song);
      const endpoint = song.hasUserUpvoted ? "/api/streams/downvote" : "/api/streams/upvote";
      
      // Find the stream by extractedId first
      console.log("Finding stream for youtubeId:", song.youtubeId);
      const streamResponse = await fetch(`/api/streams/find?extractedId=${song.youtubeId}`);
      
      if (!streamResponse.ok) {
        console.error("Stream search failed:", await streamResponse.text());
        throw new Error('Failed to find stream');
      }
      
      const data = await streamResponse.json();
      console.log("Stream search response:", data);
      
      if (!data.stream) {
        // Create the stream if it doesn't exist
        console.log("Stream not found, need to create it first");
        // For now, we'll just show an error
        throw new Error('Please add the song to the queue first');
      }
      
      // Send request to server with the stream's database ID
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId: data.stream.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Vote update failed:", errorText);
        throw new Error('Failed to update vote');
      }

      const result = await response.json();
      console.log("Vote result:", result);
      
      // Helper function to update vote counts using server response
      const updateVoteCounts = (song: Song) => {
        if (song.id !== songId) return song;
        
        return {
          ...song,
          upvotes: result.upvotes,
          hasUserUpvoted: result.hasUserUpvoted,
        };
      };

      // Update queue songs if the voted song is in queue
      setQueueSongs(prevSongs => prevSongs.map(song => updateVoteCounts(song)));

      // Update current song if it's the one being voted on
      if (currentSong && currentSong.id === songId) {
        setCurrentSong(updateVoteCounts(currentSong));
      }

    } catch (error) {
      console.error("Error updating vote:", error);
      // TODO: Add a toast notification here to show the error to the user
    }
  }

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Handle next song
  const handleNextSong = () => {
    if (sortedQueueSongs.length === 0) return

    const nextSong = sortedQueueSongs[0]

    // Move current song to previously played
    if (currentSong) {
      setPreviouslyPlayed((prev) => [currentSong, ...prev])
    }

    // Remove next song from queue and set as current
    setQueueSongs((prev) => prev.filter((song) => song.id !== nextSong.id))
    setCurrentSong(nextSong)
    setCurrentTime(0)
    setIsPlaying(true)
  }

  // Handle previous song
  const handlePreviousSong = () => {
    if (previouslyPlayed.length === 0) return

    const prevSong = previouslyPlayed[0]

    // Move current song back to queue
    if (currentSong) {
      setQueueSongs((prev) => [currentSong, ...prev])
    }

    // Remove from previously played and set as current
    setPreviouslyPlayed((prev) => prev.slice(1))
    setCurrentSong(prevSong)
    setCurrentTime(0)
    setIsPlaying(true)
  }

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentSong) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = Math.floor(percentage * currentSong.durationSeconds)

    setCurrentTime(Math.max(0, Math.min(newTime, currentSong.durationSeconds)))
  }

  // Add state for URL input
  const [songUrl, setSongUrl] = React.useState("")

  // Function to extract YouTube ID from URL
  const extractYoutubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Function to add song to queue
  const handleAddSong = async () => {
    try {
      const youtubeId = extractYoutubeId(songUrl);
      if (!youtubeId) {
        console.error("Invalid YouTube URL");
        return;
      }

      const url = `https://www.youtube.com/watch?v=${youtubeId}`;
      
      // Create the stream in the database
      const response = await fetch("/api/streams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create stream:", errorText);
        throw new Error("Failed to create stream");
      }

      const data = await response.json();
      console.log("Stream created:", data);
      
      // Create a new song object
      const newSong: Song = {
        id: data.id,
        title: data.title,
        artist: data.artist,
        album: data.album,
        duration: data.duration,
        thumbnail: data.smallThumbnail,
        upvotes: 0,
        hasUserUpvoted: false,
        addedBy: "You",
        youtubeId,
        durationSeconds: data.durationSeconds,
      };

      // Add to queue
      setQueueSongs(prev => [...prev, newSong]);
      
      // Clear the input
      setSongUrl("");

    } catch (error) {
      console.error("Error adding song:", error);
      // TODO: Add a toast notification here to show the error to the user
    }
  }

  // Helper functions for image handling
  const handleImageError = (id: string) => {
    setImageError(prev => ({...prev, [id]: true}));
  };

  const getThumbnail = (image: string | undefined, id: string) => {
    if (imageError[id]) return PLACEHOLDER_IMAGE;
    return image || PLACEHOLDER_IMAGE;
  };

  // Clean up effect for WebSocket connections and error state
  useEffect(() => {
    return () => {
      // Cleanup any active WebSocket connections
      const ws = (window as any).ws;
      if (ws) {
        ws.close();
        delete (window as any).ws;
      }
      // Clear error state when component unmounts
      setImageError({});
    };
  }, []);

  // Load room data when component mounts or room code changes
  useEffect(() => {
    const loadRoomData = async () => {
      if (!roomCode) {
        router.push('/') // Redirect to home if no room code
        return
      }

      try {
        const response = await fetch(`/api/room?code=${roomCode}`)
        if (!response.ok) {
          throw new Error('Room not found')
        }

        const data = await response.json()
        setRoomInfo(prev => ({
          ...prev,
          roomName: data.room.name,
          roomCode: data.room.code,
          hostId: data.room.hostId
        }))
      } catch (error) {
        console.error('Error loading room:', error)
        router.push('/') // Redirect to home on error
      }
    }

    loadRoomData()
  }, [roomCode, router])

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Music className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">MusicShroom</span>
        </Link>

        <div className="ml-8 flex items-center gap-4">
          <div>
            <h2 className="font-semibold text-white">{roomInfo.roomName}</h2>
            <p className="text-sm text-gray-400">Code: {roomInfo.roomCode}</p>
          </div> 
        </div>

        <div className="ml-auto flex items-center gap-4">
         
         
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Currently Playing Video - Large Section */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-8">
                  {currentSong ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-2">Now Playing</Badge>
                          <h1 className="text-2xl font-bold text-white">{currentSong.title ?? "Choose a Song"} </h1>
                          <p className="text-lg text-gray-400">{currentSong.artist}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                          className="text-gray-400 hover:text-white"
                        >
                          {isVideoExpanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                      </div>

                      {/* YouTube Video Player */}
                      <div
                        className={`relative bg-black rounded-lg overflow-hidden ${isVideoExpanded ? "aspect-video" : "aspect-video max-h-80"}`}
                      >
                        <iframe
                          src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=${isPlaying ? 1 : 0}&controls=1&rel=0&modestbranding=1&start=${currentTime}`}
                          title={`${currentSong.title} - ${currentSong.artist}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>

                      {/* Video Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePreviousSong}
                            disabled={previouslyPlayed.length === 0}
                            className="text-gray-400 hover:text-white disabled:opacity-50"
                          >
                            <SkipBack className="h-5 w-5" />
                          </Button>
                          <Button
                            size="lg"
                            onClick={handlePlayPause}
                            className="bg-green-500 hover:bg-green-600 text-black rounded-full h-12 w-12"
                          >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNextSong}
                            disabled={sortedQueueSongs.length === 0}
                            className="text-gray-400 hover:text-white disabled:opacity-50"
                          >
                            <SkipForward className="h-5 w-5" />
                          </Button>

                        </div>

                        {/* Voting for Video */}
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="ghost" 
                            onClick={() => currentSong && handleVote(currentSong.id)}
                            className={`text-green-400 hover:bg-green-400/20 ${
                              currentSong?.hasUserUpvoted ? "bg-green-400/20" : ""
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {currentSong.upvotes}
                          </Button>
                        </div>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>{formatTime(currentTime)}</span>
                          <span>Select song starting time:</span>
                          <span>{currentSong.duration}</span>
                        </div>
                        <div
                          className="w-full bg-gray-700 rounded-full h-2 cursor-pointer"
                          onClick={handleProgressClick}
                        >
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-gray-400 mb-2">No song playing</h2>
                      <p className="text-gray-500">Add songs to the queue to start listening</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Session Users */}
            <div>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Listeners</h3>
                  <div className="space-y-3">
                    {sessionUsers.map((user, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getThumbnail(user.avatar, user.name)} alt={user.name} onError={() => handleImageError(user.name)} />
                          <AvatarFallback className="bg-gray-700 text-white">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-white">{user.name}</span>
                        {user.isHost && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Host</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Add Song Section */}
          <div className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Add a Song</h3>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Paste a YouTube URL here"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-10"
                      value={songUrl}
                      onChange={(e) => setSongUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSong();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-black"
                    onClick={handleAddSong}
                    disabled={!songUrl}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Queue Section */}
          <div className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Queue</h3>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                      {queueSongs.length} songs
                    </Badge>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Sorted by votes
                    </Badge>
                  </div>
                </div>

                {sortedQueueSongs.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No songs in queue</p>
                    <p className="text-gray-500 text-sm">Add some songs to get the party started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedQueueSongs.map((song, index) => {
                      const netScore = getNetScore(song)
                      return (
                        <div
                          key={song.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                        >
                          <div className="text-gray-400 text-sm w-6 text-center">{index + 1}</div>                          <Image
                        src={getThumbnail(song.thumbnail, song.id)}
                        alt={`${song.title} album cover`}
                        width={48}
                        height={48}
                        className="rounded-lg"
                        onError={() => handleImageError(song.id)}
                      />

                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{song.title}</p>
                            <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{song.duration}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className={`text-sm font-medium px-2 py-1 rounded ${
                                netScore > 0
                                  ? "bg-green-500/20 text-green-400"
                                  : netScore < 0
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-gray-700 text-gray-400"
                              }`}
                            >
                              {netScore > 0 ? "+" : ""}
                              {netScore}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVote(song.id)}
                              className={`h-8 w-8 p-0 ${
                                song.hasUserUpvoted
                                  ? "text-green-400 bg-green-400/20"
                                  : "text-green-400 hover:bg-green-400/20"
                              }`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <span className="text-green-400 text-sm w-8 text-center">{song.upvotes}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-500 px-2 py-1 rounded bg-gray-700/50">
                              Added by {song.addedBy}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Previously Played Section */}
          <div className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-white">Previously Played</h3>
                  </div>
                  <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                    {previouslyPlayed.length} songs
                  </Badge>
                </div>

                {previouslyPlayed.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No songs played yet</p>
                    <p className="text-gray-500 text-sm">Songs will appear here after they finish playing</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {previouslyPlayed.map((song, index) => (
                      <div
                        key={`${song.id}-${index}`}
                        className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="text-gray-500 text-sm w-6 text-center">{index + 1}</div>

                        <Image
                          src={getThumbnail(song.thumbnail, song.id)}
                          alt={`${song.title} album cover`}
                          width={48}
                          height={48}
                          className="rounded-lg opacity-75"
                          onError={() => handleImageError(song.id)}
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-gray-300 font-medium truncate">{song.title}</p>
                          <p className="text-gray-500 text-sm truncate">{song.artist}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{song.duration}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-500 px-2 py-1 rounded bg-gray-700/50">
                            Final: +{song.upvotes}
                          </div>
                        </div>

                        <div className="text-gray-600 text-xs">by {song.addedBy}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
