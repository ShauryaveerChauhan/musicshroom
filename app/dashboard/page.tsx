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
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Plus,
  Search,
  Settings,
  Share,
  Clock,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Dashboard() {
  const currentSong = {
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    currentTime: "1:45",
    thumbnail: "/placeholder.svg?height=300&width=300",
    upvotes: 12,
    downvotes: 2,
  }

  const queueSongs = [
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
    },
  ]

  const sessionUsers = [
    { name: "You", avatar: "/placeholder.svg?height=32&width=32", isHost: true },
    { name: "Sarah", avatar: "/placeholder.svg?height=32&width=32", isHost: false },
    { name: "Mike", avatar: "/placeholder.svg?height=32&width=32", isHost: false },
    { name: "Alex", avatar: "/placeholder.svg?height=32&width=32", isHost: false },
    { name: "Emma", avatar: "/placeholder.svg?height=32&width=32", isHost: false },
  ]

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
            {/* Currently Playing - Large Section */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Image
                        src={currentSong.thumbnail || "/placeholder.svg"}
                        alt={`${currentSong.title} album cover`}
                        width={200}
                        height={200}
                        className="rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-lg" />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-2">Now Playing</Badge>
                        <h1 className="text-3xl font-bold text-white mb-2">{currentSong.title}</h1>
                        <p className="text-xl text-gray-400 mb-1">{currentSong.artist}</p>
                        <p className="text-gray-500">{currentSong.album}</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>{currentSong.currentTime}</span>
                          <span>{currentSong.duration}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "52%" }} />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <SkipBack className="h-5 w-5" />
                        </Button>
                        <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black rounded-full h-12 w-12">
                          <Pause className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <SkipForward className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2 ml-4">
                          <Volume2 className="h-4 w-4 text-gray-400" />
                          <div className="w-20 bg-gray-700 rounded-full h-1">
                            <div className="bg-white h-1 rounded-full" style={{ width: "70%" }} />
                          </div>
                        </div>
                      </div>

                      {/* Voting */}
                      <div className="flex items-center gap-4 pt-2">
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
                  </div>
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
                      placeholder=" Add your desired song's link here..."
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
                  <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                    {queueSongs.length} songs
                  </Badge>
                </div>

                <div className="space-y-3">
                  {queueSongs.map((song, index) => (
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
                        <Button size="sm" variant="ghost" className="text-green-400 hover:bg-green-400/20 h-8 w-8 p-0">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <span className="text-green-400 text-sm w-4 text-center">{song.upvotes}</span>

                        <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/20 h-8 w-8 p-0">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                        <span className="text-red-400 text-sm w-4 text-center">{song.downvotes}</span>
                      </div>

                      <div className="text-gray-500 text-xs">by {song.addedBy}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
