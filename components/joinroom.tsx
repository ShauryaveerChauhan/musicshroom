"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, LogIn, AlertCircle } from "lucide-react"



interface inputProps{
  setOpenCreateRoomDialog:(openCreateRoomDialog:boolean)=>void
}

export function JoinRoom({ setOpenCreateRoomDialog }:inputProps) {
  const [roomCode, setRoomCode] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [open,setOpen]=React.useState(false);

  // Format room code as user types (uppercase, max 6 chars)
  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6)
    setRoomCode(value)
    if (error) setError("") // Clear error when user starts typing
  }

  const handleChangeDialog = ()=>{

    setOpenCreateRoomDialog(true)
    setOpen(false)
  }
  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }

    if (roomCode.length !== 6) {
      setError("Room code must be 6 characters")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate API call to join room
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Here you would typically make an API call to join the room
      console.log("Joining room:", roomCode)

      // Simulate different responses
      const random = Math.random()
      if (random < 0.1) {
        throw new Error("Room not found")
      } else if (random < 0.2) {
        throw new Error("Room is full")
      }

      // Success - redirect to dashboard or handle room joining
      console.log("Successfully joined room:", roomCode)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && roomCode.length === 6 && !isLoading) {
      handleJoinRoom()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-6"
        >
          <Users className="mr-2 h-5 w-5" />
          Join Session
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Join Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="join-room-code" className="text-sm font-medium text-gray-300">
              Room Code
            </Label>
            <Input
              id="join-room-code"
              placeholder="Enter 6-character room code"
              value={roomCode}
              onChange={handleRoomCodeChange}
              onKeyPress={handleKeyPress}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 font-mono text-center text-lg tracking-wider"
              maxLength={6}
              autoComplete="off"
            />
            <p className="text-gray-500 text-xs">Room codes are 6 characters long (e.g., ABC123)</p>
          </div>

          {error && (
            <Alert className="bg-red-900/20 border-red-800 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">What happens next:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• You'll join the live music session</li>
              <li>• Add songs and vote on the queue</li>
              <li>• Listen together with other participants</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleJoinRoom}
              disabled={roomCode.length !== 6 || isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Session
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Don't have a room code?{" "}
              <button
                onClick={handleChangeDialog}
                className="text-green-400 hover:text-green-300 underline focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
              >
                Create a new session
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
