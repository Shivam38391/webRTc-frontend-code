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
import { useRouter } from 'next/navigation';


export default function RoomPage({ params }: { params: Promise<{ id: string , email : string}> }) {


  const [open, setopen] = useState(false)


 const router = useRouter();

  const { id  , email} = use(params)
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


  useEffect(() => {


        socket.emit("joinRoom", { email, id  })  // Emit joinRoom event with email and room

  }, [])
  



  return (
    <div className='p-10 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-white'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold text-center mb-2'>Video Meeting</h1>
        <p className='text-center text-slate-400 mb-8'>Room ID: <span className='font-mono text-cyan-400'>{id}</span></p>

        <div className='flex justify-center mb-8'>
          <div className={`px-4 py-2 rounded-full ${remoteSocketId ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {remoteSocketId ? '🟢 Connected' : '🔴 Waiting for participants'}
          </div>
        </div>

        <section className='grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8'>
          <div>
            {myStream ? (
              <div className='rounded-lg overflow-hidden border-2 border-cyan-500 shadow-lg shadow-cyan-500/20'>
                <h3 className='bg-slate-700 px-4 py-2 font-semibold'>Your Video</h3>
                <video
                  ref={localVideoRef}
                  playsInline
                  autoPlay
                  muted
                  className='w-full h-64 bg-black object-cover'
                />
              </div>
            ) : (
              <div className='h-64 bg-slate-700 rounded-lg border-2 border-dashed border-slate-500 flex items-center justify-center'>
                <p className='text-slate-400'>Camera off</p>
              </div>
            )}
          </div>

          <div>
            {remoteStream ? (
              <div className='rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg shadow-purple-500/20'>
                <h3 className='bg-slate-700 px-4 py-2 font-semibold'>Participant Video</h3>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className='w-full h-64 bg-black object-cover'
                />
              </div>
            ) : (
              <div className='h-64 bg-slate-700 rounded-lg border-2 border-dashed border-slate-500 flex items-center justify-center'>
                <p className='text-slate-400'>Waiting for video...</p>
              </div>
            )}
          </div>
        </section>

        {remoteSocketId && !remoteStream && (
          <div className='flex justify-center gap-4 mb-8'>
            <Button 
              onClick={() => handlecallUser(remoteSocketId ?? undefined)} 
              className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all'
              disabled={!remoteSocketId}
            >
              <PhoneCall size={20} />
              Start Call
            </Button>
          </div>
        )}

        {myStream && remoteSocketId && (
          <div className='flex justify-center gap-4 mb-8'>
            <Button 
              onClick={sendStream} 
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all'
            >
              <PhoneCall size={20} />
              Share Stream
            </Button>
          </div>
        )}

        <Popover open={open}>
          <PopoverTrigger
            onClick={() => setopen((prev) => !prev)}
            className='fixed bottom-8 left-8 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-all'
          >
            📋 Share Meeting
          </PopoverTrigger>
          <PopoverContent className='bg-slate-800 border-slate-700'>
            <Card className='bg-slate-800 border-slate-700'>
              <CardHeader>
                <CardTitle className='text-white'>Share Your Meeting</CardTitle>
                <CardDescription className='text-slate-400'>
                  Send this link to invite others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex gap-2 items-center'>
                  <Input 
                    className='bg-slate-700 border-slate-600 text-white' 
                    readOnly 
                    value={typeof window !== 'undefined' ? window.location.href : ''} 
                  />
                  <Button 
                    size='icon' 
                    onClick={() => {
                      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '')
                      toast.success('Meeting link copied!', { duration: 3000 })
                    }}
                    className='bg-cyan-600 hover:bg-cyan-700'
                  >
                    <Copy size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>



<Button
        onClick={() => {
          // End call logic here
          myStream?.getTracks().forEach((track) => track.stop());
          setStream(null);    
          setremoteStream(null);

          toast.success("Call ended",

            
            
            { duration: 2000 ,


              description: `by ${email}`
            });

    
          router.push('/lobby');


        }}
        className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
      >
        End Call
      </Button> 
      
    </div>
  )
}