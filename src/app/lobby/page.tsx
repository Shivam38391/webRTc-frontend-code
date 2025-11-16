"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/components/context/SocketProvider"


const LobbyPage = () => {
  const router = useRouter()

  const socket = useSocket()  // Use the socket from context

  console.log("Socket in LobbyPage:", socket)

  const [email, setEmail] = useState("")
  const [room, setRoom] = useState("")
  const [errors, setErrors] = useState<{ email?: string; room?: string }>({})

  const validate = () => {
    const e: { email?: string; room?: string } = {}
    if (!email) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email"
    if (!room) e.room = "Room code is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }


 
 


  const onSubmit =  useCallback(
   (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    socket.emit("joinRoom", { email, room })  // Emit joinRoom event with email and room

    // // Navigate to a room route passing email as a query param
    const query = new URLSearchParams({ email })
    router.push(`/lobby/${room}?${query.toString()}`)
  },
    [ email , room , socket],
  )
  

  const handleJoinRoom = useCallback((data) => {    
    console.log("data: from backend==>", data)

  }, [])


  useEffect(() => {

    socket.on("joinRoom", handleJoinRoom)

    return () =>{
        socket.off("joinRoom")
    }

  }, [socket , handleJoinRoom ])
  



  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Join a room</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={errors.email ? "true" : "false"}
            className="rounded-md border px-3 py-2"
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="room" className="mb-1 text-sm font-medium">
            Room code
          </label>
          <input
            id="room"
            name="room"
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room code"
            aria-invalid={errors.room ? "true" : "false"}
            className="rounded-md border px-3 py-2"
          />
          {errors.room && <p className="text-sm text-destructive mt-1">{errors.room}</p>}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button type="submit">Join</Button>
          <Button type="button" variant="ghost" onClick={() => { setEmail(""); setRoom(""); setErrors({}) }}>
            Clear
          </Button>
        </div>
      </form>
    </div>
  )
}

export default LobbyPage