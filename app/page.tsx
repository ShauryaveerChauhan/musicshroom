import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Users, ThumbsUp, ThumbsDown, Play, Radio } from "lucide-react"
import Link from "next/link"
import { Appbar } from "@/components/appbar"
import DesignDialog from "@/components/design-dialog"
import { CreateRoom } from "@/components/createroom"
import { JoinRoom } from "@/components/joinroom"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
     <Appbar/>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <Badge variant="secondary" className="bg-gray-800 text-green-400 border-gray-700">
                🎵 Social Music Streaming
              </Badge>
              <div className="space-y-6 max-w-4xl">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                  Listen Together,
                  <br />
                  <span className="text-green-400">Vote Together</span>
                </h1>
                <p className="mx-auto max-w-[600px] text-gray-400 text-lg md:text-xl">
                  Create collaborative music sessions where everyone controls the playlist. Upvote favorites, skip the
                  rest.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                    <DesignDialog></DesignDialog>
              </div>

              {/* Hero Visual */}
              <div className="relative mt-16 w-full max-w-3xl">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Music className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Friday Night Vibes</h3>
                        <p className="text-gray-400 text-sm">5 listeners</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>5</span>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Music className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Blinding Lights</p>
                          <p className="text-gray-400 text-sm">The Weeknd</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-green-400 hover:bg-green-400/20">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="ml-1">12</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/20">
                          <ThumbsDown className="h-4 w-4" />
                          <span className="ml-1">2</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { song: "Good 4 U", artist: "Olivia Rodrigo", votes: 8 },
                      { song: "Levitating", artist: "Dua Lipa", votes: 6 },
                      { song: "Stay", artist: "The Kid LAROI", votes: 4 },
                    ].map((track, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-700 rounded flex items-center justify-center">
                            <Music className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{track.song}</p>
                            <p className="text-gray-400 text-xs">{track.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-green-400" />
                          <span className="text-green-400 text-sm">{track.votes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl mb-4">Simple. Social. Synchronized.</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Everything you need for collaborative music listening
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Collaborative Sessions</h3>
                  <p className="text-gray-400">
                    Create rooms and invite friends. Everyone can add songs and vote together.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ThumbsUp className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Democratic Voting</h3>
                  <p className="text-gray-400">
                    Upvote songs you love, downvote ones you don't. The crowd decides what plays.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Radio className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Real-time Sync</h3>
                  <p className="text-gray-400">
                    Perfect synchronization. Everyone hears the same song at the exact same time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl mb-4">Get Started in Seconds</h2>
            </div>

            <div className="grid gap-12 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-black font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Create or Join</h3>
                <p className="text-gray-400">Start a new session or join with a room code.</p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-black font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Add & Vote</h3>
                <p className="text-gray-400">Queue up songs and vote on what plays next.</p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-black font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Listen Together</h3>
                <p className="text-gray-400">Enjoy synchronized music with friends.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold sm:text-4xl mb-4">Join the MusicShroom Family</h2>
              <p className="text-gray-400 text-lg mb-8">Subscribe to our monthly newsletter for more insights on your listening</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                <Button className="bg-green-500 hover:bg-green-600 text-black font-medium whitespace-nowrap">
                  Get Started
                </Button>
              </div>
              <p className="text-gray-500 text-sm mt-4">Free to start • No credit card required</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="container px-4 md:px-6 py-12 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Music className="h-5 w-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">MusicShroom</span>
              </Link>
              <p className="text-gray-400 text-sm">Social music streaming platform.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-white">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} MusicShroom. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
