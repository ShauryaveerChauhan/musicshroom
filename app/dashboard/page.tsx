"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Music,
  Users,
  ThumbsUp,
  ThumbsDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Plus,
  Search,
  Settings,
  Share,
  Clock,
  Maximize,
  Minimize,
  History,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Song {
  id: number
  title: string
  artist: string
  album: string
  duration: string
  thumbnail: string
  upvotes: number
  downvotes: number
  addedBy: string
  userVote?: "up" | "down" | null
  youtubeId: string
  durationSeconds: number
}

export default function Dashboard() {
  const [currentSong, setCurrentSong] = React.useState<Song | null>({
    id: 0,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    thumbnail: "/placeholder.svg?height=300&width=300",
    upvotes: 12,
    downvotes: 2,
    youtubeId: "4NRXx6U8ABQ",
    addedBy: "Host",
    durationSeconds: 200,
  })

  const [isPlaying, setIsPlaying] = React.useState(true)
  const [currentTime, setCurrentTime] = React.useState(105) // 1:45 in seconds
  const [isVideoExpanded, setIsVideoExpanded] = React.useState(false)
  const [volume, setVolume] = React.useState(70)

  const [queueSongs, setQueueSongs] = React.useState<Song[]>([
    {
      id: 1,
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: "2:58",
      thumbnail: "/placeholder.svg?height=60&width=60",
      upvotes: 8,
      downvotes: 1,
      addedBy: "Sarah",
      userVote: null,
      youtubeId: "gNi_6U5Pm_o",
      durationSeconds: 178,
    },
    {
      id: 2,
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: "3:23",
      thumbnail: "/placeholder.svg?height=60&width=60",
      upvotes: 6,
      downvotes: 0,
      addedBy: "Mike",
      userVote: null,
      youtubeId: "TUVcZfQe-Kw",
      durationSeconds: 203,
    },
    {
      id: 3,
      title: "Stay",
      artist: "The Kid LAROI, Justin Bieber",
      album: "F*CK LOVE 3",
      duration: "2:21",
      thumbnail: "/placeholder.svg?height=60&width=60",
      upvotes: 4,
      downvotes: 2,
      addedBy: "Alex",
      userVote: null,
      youtubeId: "kTJczUoc26U",
      durationSeconds: 141,
    },
    {
      id: 4,
      title: "Heat Waves",
      artist: "Glass Animals",
      album: "Dreamland",
      duration: "3:58",
      thumbnail: "/placeholder.svg?height=60&width=60",
      upvotes: 7,
      downvotes: 0,
      addedBy: "Emma",
      userVote: null,
      youtubeId: "mRD0-GxqHVo",
      durationSeconds: 238,
    },
    {
      id: 5,
      title: "As It Was",
      artist: "Harry Styles",
      album: "Harry's House",
      duration: "2:47",
      thumbnail: "/placeholder.svg?height=60&width=60",
      upvotes: 9,
      downvotes: 1,
      addedBy: "Jordan",
      userVote: null,
      youtubeId: "H5v3kku4y6Q",
      durationSeconds: 167,
    },
  ])

  const [previouslyPlayed, setPreviouslyPlayed] = React.useState<Song[]>([
    {
      id: 99,
      title: "Anti-Hero",
      artist: "Taylor Swift",
      album: "Midnights",
      duration: "3:20",
      thumbnail: "/placeholder.svg?height=60&width=60",
      upvotes: 15,
      downvotes: 2,
      addedBy: "Emma",
      userVote: null,
      youtubeId: "b1kbLWvqugk",
      durationSeconds: 200,
    },
    {
      id: 98,
      title: "Flowers",
      artist: "Miley Cyrus",
      album: "Endless Summer Vacation",
      duration: "3:20",
      thumbnail: "/placeholder.svg?height=60&width=60",
      upvotes: 11,
      downvotes: 3,
      addedBy: "Mike",
      userVote: null,
      youtubeId: "G7KNmW9a75Y",
      durationSeconds: 200,
    },
  ])

  const sessionUsers = [
    { name: "You", avatar: "/placeholder.svg?height=32&width=32", isHost: true },
    { name: "Sarah", avatar: "/placeholder.svg?height=32&width=32", isHost: false },
    { name: "Mike", avatar: "/placeholder.svg?height=32&width=32", isHost: false },
    { name: "Alex", avatar: "/placeholder.svg?height=32&width=32", isHost: false },
    { name: "Emma", avatar: "/placeholder.svg?height=32&width=32", isHost: false },
  ]

  // Calculate net score for sorting (upvotes - downvotes)
  const getNetScore = (song: Song) => song.upvotes - song.downvotes

  // Sort songs by net score (highest first)
  const sortedQueueSongs = React.useMemo(() => {
    return [...queueSongs].sort((a, b) => {
      const scoreA = getNetScore(a)
      const scoreB = getNetScore(b)

      if (scoreA === scoreB) {
        return a.id - b.id
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
  const progressPercentage = currentSong ? (currentTime / currentSong.durationSeconds) * 100 : 0

  // Auto-advance to next song when current song ends
  React.useEffect(() => {
    if (currentSong && currentTime >= currentSong.durationSeconds) {
      handleNextSong()
    }
  }, [currentTime, currentSong])

  // Update current time every second when playing
  // React.useEffect(() => {
  //   let interval: NodeJS.Timeout
  //   if (isPlaying && currentSong) {
  //     interval = setInterval(() => {
  //       setCurrentTime((prev) => {
  //         if (prev >= currentSong.durationSeconds) {
  //           return currentSong.durationSeconds
  //         }
  //         return prev + 1
  //       })
  //     }, 1000)
  //   }
  //   return () => clearInterval(interval)
  // }, [isPlaying, currentSong])

  // Handle voting logic
  const handleVote = (songId: number, voteType: "up" | "down") => {
    setQueueSongs((prevSongs) =>
      prevSongs.map((song) => {
        if (song.id !== songId) return song

        const currentVote = song.userVote
        let newUpvotes = song.upvotes
        let newDownvotes = song.downvotes
        let newUserVote: "up" | "down" | null = voteType

        if (currentVote === "up") {
          newUpvotes -= 1
        } else if (currentVote === "down") {
          newDownvotes -= 1
        }

        if (currentVote === voteType) {
          newUserVote = null
        } else {
          if (voteType === "up") {
            newUpvotes += 1
          } else {
            newDownvotes += 1
          }
        }

        return {
          ...song,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote,
        }
      }),
    )
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
            <h2 className="font-semibold text-white">Friday Night Vibes</h2>
            <p className="text-sm text-gray-400">Room: FNV2024</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">{sessionUsers.length} listeners</span>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
            <Settings className="h-4 w-4" />
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
                          <h1 className="text-2xl font-bold text-white">{currentSong.title}</h1>
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
                          <Button variant="ghost" className="text-green-400 hover:bg-green-400/20">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {currentSong.upvotes}
                          </Button>
                          <Button variant="ghost" className="text-red-400 hover:bg-red-400/20">
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            {currentSong.downvotes}
                          </Button>
                        </div>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>{formatTime(currentTime)}</span>
                          <span>Select the section of the song you want to play</span>
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
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
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
                      placeholder="Play Your desired song through the youtube url :)"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pl-10"
                    />
                  </div>
                  <Button className="bg-green-500 hover:bg-green-600 text-black">
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
                          <div className="text-gray-400 text-sm w-6 text-center">{index + 1}</div>

                          <Image
                            src={song.thumbnail || "/placeholder.svg"}
                            alt={`${song.title} album cover`}
                            width={48}
                            height={48}
                            className="rounded-lg"
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
                              onClick={() => handleVote(song.id, "up")}
                              className={`h-8 w-8 p-0 ${
                                song.userVote === "up"
                                  ? "text-green-400 bg-green-400/20"
                                  : "text-green-400 hover:bg-green-400/20"
                              }`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <span className="text-green-400 text-sm w-4 text-center">{song.upvotes}</span>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVote(song.id, "down")}
                              className={`h-8 w-8 p-0 ${
                                song.userVote === "down"
                                  ? "text-red-400 bg-red-400/20"
                                  : "text-red-400 hover:bg-red-400/20"
                              }`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                            <span className="text-red-400 text-sm w-4 text-center">{song.downvotes}</span>
                          </div>

                          <div className="text-gray-500 text-xs">by {song.addedBy}</div>
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
                          src={song.thumbnail || "/placeholder.svg"}
                          alt={`${song.title} album cover`}
                          width={48}
                          height={48}
                          className="rounded-lg opacity-75"
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
                            Final: +{song.upvotes - song.downvotes}
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
