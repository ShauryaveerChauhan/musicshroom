'use client'
import { useState } from "react"
import { CreateRoom } from "./createroom"
import { JoinRoom } from "./joinroom"
import { Button } from "./ui/button"
export default function DesignDialog(){
    const [openCreateRoomDialog,setOpenCreateRoomDialog]=useState(false)
    const [openJoinRoomDialog,setOpenJoinRoomDialog]=useState(false)

    return <div>
                            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-medium px-1 py-1">
                                <CreateRoom openCreateRoomDialog={openCreateRoomDialog} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-1 py-1"
                >
                  <JoinRoom setOpenCreateRoomDialog={setOpenCreateRoomDialog}/>
                </Button>   
    </div>
}