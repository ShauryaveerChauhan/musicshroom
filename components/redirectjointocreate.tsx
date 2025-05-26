"use client"
import { useState } from "react";
import { CreateRoom } from "./createroom";
import { JoinRoom } from "./joinroom";

export function CreateSession(){
    const [CreateRoomOpen, setCreateRoomOpen] = useState(false);

    const switchToCreate = () => {
          setCreateRoomOpen(true)
    }

  return (
  <>
    {CreateRoomOpen ? (
      // @ts-ignore
      <CreateRoom open={CreateRoomOpen} onOpenChange={setCreateRoomOpen} />
    ) : (
      <JoinRoom onSwitchToCreate={switchToCreate} />
    )}
  </>
);

}