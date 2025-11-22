'use client';


import { useSocket } from '@/components/context/SocketProvider'
import { Button } from '@/components/ui/button'
import { Copy, PhoneCall } from 'lucide-react'
import { use, useCallback, useEffect, useRef, useState } from 'react'
import peer from '@/helper/Peer'

import Reactplayer from "react-player";
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {


  const [open, setopen] = useState(true)


  const { id } = use(params)
  const [remoteSocketId, setremoteSocketId] = useState<string | null>(null)
  const [myStream, setStream] = useState<MediaStream | null>(null)
  const [remoteStream, setremoteStream] = useState(null)

  const localVideoRef = useRef<HTMLVideoElement | null>(null)

  const socket = useSocket()

  const handleUserJoined = useCallback(
    ({ email, id }: { email: string; id: string }) => {
      console.log("new user joined : email, id joined the room", email, id)
      setremoteSocketId(id)
    },
    [],
  )









  const handlecallUser = useCallback(async (id?: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      console.log('got stream', stream)


      const offer = await peer.getOffer()
      console.group("offer:", offer, "remotedid", id)

      socket.emit("User:call", {
        offer,
        to: id // remoteSocketId
      })


      setStream(stream)
    } catch (err) {
      console.error('getUserMedia error', err)
    }


    // console.log("call user with id:", id)
    // socket.emit("callUser", { id })
  }, [])



  const handleIncomingCall = useCallback(async ({ from, offer }) => {


    console.log("incomming call data:", from, offer)

    setremoteSocketId(from)
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    console.log('got stream', stream)
    setStream(stream)

    // you can set remote description here using peer connection
    const ans = await peer.getAnswer(offer)
    console.log("answer:", ans)

    socket.emit("call:accepted", {
      answer: ans,
      to: from
    })

  }, [])


  const sendStream = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream)
    }
    console.log("myStream in sendStream:", myStream)

  }, [myStream])


  const handleCallAccepted = useCallback(({ from, answer }: { from: any, answer: RTCSessionDescriptionInit }) => {

    // you can set Local description here using peer connection
    peer.setLocalDescription(answer)

    console.log("call accepted:", answer)

    sendStream()
  }, [sendStream])


  const handleNegoNeeded = useCallback(
    async () => {
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", { offer, to: remoteSocketId })
    },
    [remoteSocketId, socket],
  )



  useEffect(() => {

    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded)
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded)
    }


  }, [handleNegoNeeded])


  const handleNegoNeededIncomming = useCallback(async ({ from, offer }) => {

    console.log("handleNegoNeededIncomming", from, offer)
    if (peer.peer) {
      const ans = await peer.getAnswer(offer)
      console.log("answer:", ans)
      socket.emit("peer:nego:done", {
        answer: ans,
        to: from
      })
    }
  }, [socket])


  const handleNegoFinal = useCallback(async ({ answer }) => {

    console.log("handleNegoFinal", answer)
    if (peer.peer) {
      await peer.setLocalDescription(answer)
    }
  }, [])


  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remot = ev.streams
      console.log("GotTracks from remote stream", remot)
      console.log("remoteStream", remot[0])
      setremoteStream(remot[0])

    })

  }, [])



  useEffect(() => {

    socket.on('newUserJoined', handleUserJoined)
    socket.on("incomming:call", handleIncomingCall)
    socket.on("call:accepted", handleCallAccepted)

    socket.on("peer:nego:needed", handleNegoNeededIncomming)

    socket.on("peer:nego:final", handleNegoFinal)


    return () => {
      socket.off('newUserJoined', handleUserJoined)
      socket.off("incomming:call", handleIncomingCall)
      socket.off("call:accepted", handleCallAccepted)

      socket.off("peer:nego:needed", handleNegoNeededIncomming)
      socket.off("peer:nego:final", handleNegoFinal)
    }

  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeededIncomming, handleNegoFinal])


  // attach local stream to the video element
  useEffect(() => {
    const video = localVideoRef.current
    if (video && myStream) {
      video.srcObject = myStream
      video.play().catch(() => {
        // autoplay might be blocked until user interaction
      })
    }

    return () => {
      if (myStream) {
        myStream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [myStream])



  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  return (
    <div className=' p-10 bg-green-800 min-h-screen text-white'>
      <h2 className=' text-2xl  text-center font-medium'>Room</h2>
      <p className=''>{id}</p>
      <h4 className=' text-center text-2xl font-bold'>{remoteSocketId ? "connected" : "no one in the room"}</h4>


      {

        remoteSocketId &&

        <Button onClick={() => handlecallUser(remoteSocketId ?? undefined)} className=' mx-auto mt-10 flex items-center gap-2' >
          <PhoneCall />
          call
        </Button>

      }



      {

        myStream &&

        <Button  onClick={sendStream} className=' mx-auto mt-10 flex items-center gap-2' variant="default">
          <PhoneCall />
          Send stream
        </Button>

      }


<section className=' grid gap-2 grid-cols-2'>


<div>


      {
        myStream &&

        <div className="mt-4">
          <h2>My stream</h2>
          <video
            ref={localVideoRef}
            playsInline
            autoPlay
            className="rounded-md border"
            width={300}
            height={240}
          />
        </div>
      }
</div>


      {
        remoteStream &&

        <div className="mt-4">

          <h2>Remote stream</h2>

          {/* <video
            // ref={remoteVideoRef}
            src={remoteStream}
            playsInline
            autoPlay
            className="rounded-md  border-amber-200 border-4"

                 width={320}
            height={240}
          /> */}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="rounded-md  border-amber-200 border-4"

            width={300}
            height={240}
          />

        </div>
      }

</section>


      <Popover open={open}>
        <PopoverTrigger
        
        onClick={() => setopen((prev) => !prev)}
        className=' absolute bottom-10 left-20'>Open</PopoverTrigger>
        <PopoverContent>

          <Card>
            <CardHeader>
              <CardTitle>Your meeting is ready</CardTitle>

              <CardContent>

                <div>

                  <Label>Share this meeting link</Label>

                  <div className=' flex gap-2 items-center'>

                    <Input className=' mt-2 w-full' readOnly value={window.location.href} />


                    <Button size={"icon"} className='' onClick={() => {
                      navigator.clipboard.writeText(window.location.href)

                      toast.success("Meeting link copied to clipboard!", {
                        duration: 3000
                      }
                      )
                    }}>

                      <Copy className=' ' />
                    </Button>

                  </div>


                </div>



              </CardContent>

              <CardDescription>
                Share the meeting link with others to join.
              </CardDescription>
            </CardHeader>
          </Card>


        </PopoverContent>
      </Popover>

    </div>
  )
}