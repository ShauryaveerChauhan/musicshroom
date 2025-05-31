"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Play, Copy, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"


interface inputProps{
  openCreateRoomDialog: boolean;
  setOpenCreateRoomDialog: (openCreateRoomDialog:boolean) => void;
}

export function CreateRoom({openCreateRoomDialog,setOpenCreateRoomDialog}:inputProps) {
  const router = useRouter()
  const [roomName, setRoomName] = React.useState("")
  const [roomCode, setRoomCode] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  // Generate random room code
  const generateRoomCode = React.useCallback(() => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setRoomCode(result)
  }, [])

  // Generate initial room code
  React.useEffect(() => {
    generateRoomCode()
  }, [generateRoomCode])

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy room code:", err)
    }
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError("Please enter a room name")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roomName,
          code: roomCode,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create room")
      }

      // Close dialog and redirect to dashboard with room info
      setOpenCreateRoomDialog(false)
      router.push(`/dashboard?code=${roomCode}`)
    } catch (err) {
      console.error("Error creating room:", err)
      setError(err instanceof Error ? err.message : "Failed to create room")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={openCreateRoomDialog} onOpenChange={setOpenCreateRoomDialog}>
      <DialogTrigger asChild>
        <Button onClick={()=>{
          setOpenCreateRoomDialog(true)
        }} size="lg" className="bg-green-500 hover:bg-green-600 text-black font-medium px-8 py-6">
          <Play className="mr-2 h-5 w-5" />
          Start Session
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name" className="text-sm font-medium text-gray-300">
              Room Name
            </Label>
            <Input
              id="room-name"
              placeholder="Enter room name (e.g., Friday Night Vibes)"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-code" className="text-sm font-medium text-gray-300">
              Room Code
            </Label>
            <div className="flex gap-2">
              <Input
                id="room-code"
                value={roomCode}
                readOnly
                className="bg-gray-800 border-gray-700 text-white font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={generateRoomCode}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomCode}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && <p className="text-green-400 text-sm">Room code copied to clipboard!</p>}
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">How it works:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Share the room code with friends</li>
              <li>• Everyone can add songs and vote</li>
              <li>• Most popular songs play first</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-md">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleCreateRoom}
              disabled={!roomName.trim() || isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
