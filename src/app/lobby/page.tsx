"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/components/context/SocketProvider"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

// const LobbyPage = () => {
//   const router = useRouter()

//   const socket = useSocket()  // Use the socket from context

//   // console.log("Socket in LobbyPage:", socket)

//   const [email, setEmail] = useState("")
//   const [room, setRoom] = useState("")
//   const [errors, setErrors] = useState<{ email?: string; room?: string }>({})

//   const validate = () => {
//     const e: { email?: string; room?: string } = {}
//     if (!email) e.email = "Email is required"
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email"
//     if (!room) e.room = "Room code is required"
//     setErrors(e)
//     return Object.keys(e).length === 0
//   }


 
 


//   const onSubmit =  useCallback(
//    (ev: React.FormEvent) => {
//     ev.preventDefault()
//     if (!validate()) return
//     socket.emit("joinRoom", { email, room })  // Emit joinRoom event with email and room

//     // // Navigate to a room route passing email as a query param
//     const query = new URLSearchParams({ email })
//     router.push(`/lobby/${room}?${query.toString()}`)
//   },
//     [ email , room , socket],
//   )
  

//   const handleJoinRoom = useCallback((data : any) => {    
//     console.log("data: from backend==>", data)

//   }, [])


//   useEffect(() => {

//     socket.on("joinRoom", handleJoinRoom)

//     return () =>{
//         socket.off("joinRoom")
//     }

//   }, [socket , handleJoinRoom ])
  



//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
//       <div className="bg-white/90 rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center">
//       <div className="flex flex-col items-center mb-8">
//         <div className="bg-gradient-to-tr from-blue-400 to-pink-400 rounded-full p-4 mb-4 shadow-lg">
//         <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
//           <rect width="24" height="24" rx="12" fill="#fff" />
//           <path d="M7 10V8a3 3 0 0 1 6 0v2" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
//           <rect x="5" y="10" width="10" height="8" rx="2" stroke="#6366f1" strokeWidth="1.5"/>
//           <path d="M19 13v2a2 2 0 0 1-2 2h-1" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"/>
//           <path d="M19 13l-2-2v6l2-2" stroke="#ec4899" strokeWidth="1.5" strokeLinejoin="round"/>
//         </svg>
//         </div>
//         <h1 className="text-3xl font-bold text-gray-800 mb-1">Start an Instant Meeting</h1>
//         <p className="text-gray-500 text-center">Enter your email and a room code to join or create a video call instantly.</p>
//       </div>
//       <form onSubmit={onSubmit} className="w-full flex flex-col gap-5">
//         <div>
//         <label htmlFor="email" className="block mb-1 text-sm font-semibold text-gray-700">
//           Email
//         </label>
//         <Input
//           id="email"
//           name="email"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="you@example.com"
//           aria-invalid={errors.email ? "true" : "false"}
//           className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//         />
//         {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
//         </div>
//         <div>
//         <label htmlFor="room" className="block mb-1 text-sm font-semibold text-gray-700">
//           Room Code
//         </label>
//         <Input
//           id="room"
//           name="room"
//           type="text"
//           value={room}
//           onChange={(e) => setRoom(e.target.value)}
//           placeholder="Enter room code"
//           aria-invalid={errors.room ? "true" : "false"}
//           className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
//         />
//         {errors.room && <p className="text-xs text-red-500 mt-1">{errors.room}</p>}
//         </div>
//         <div className=" items-center gap-3 pt-2">
//         <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold shadow-lg hover:from-pink-500 hover:to-blue-500 transition">
//           Start Meeting
//         </Button>
//         <Button
//           type="button"
//           variant="ghost"
//           className=""
//           onClick={() => { setEmail(""); setRoom(""); setErrors({}) }}
//         >
//           Clear
//         </Button>
//         </div>
//       </form>
//       <div className="mt-8 text-center text-xs text-gray-400">
//         Powered by <span className="font-semibold text-blue-600">TalkNow</span>
//       </div>
//       </div>
//     </div>
//   )
// }

// export default LobbyPage












const LobbyPage = () =>  {


  const formSchema = z.object({


  
    firstName : z.string().min(2, "First name must be at least 2 characters.").max(30, "First name must be at most 30 characters."),
    room : z.string().min(2, "Last name must be at least 2 characters.").max(30, "Last name must be at most 30 characters."),

    email : z.email("Enter a valid email address.")


})


  const router = useRouter()

  const socket = useSocket()  // Use the socket from context


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",

      room: "",

      email: "",
    },
  })


    const handleJoinRoom = useCallback((data : any) => {    
    console.log("data: from backend==>", data)

  }, [])


  useEffect(() => {

    socket.on("joinRoom", handleJoinRoom)

    return () =>{
        socket.off("joinRoom")
    }

  }, [socket , handleJoinRoom ])
  


  function onSubmit(data: z.infer<typeof formSchema>) {


    const { email , firstName , room } = data

        socket.emit("joinRoom", { email, room  })  // Emit joinRoom event with email and room

    // // Navigate to a room route passing email as a query param
    const query = new URLSearchParams({ email })
    router.push(`/lobby/${room}?${query.toString()}`)




    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    })
  }

  return (


      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">

    <Card className="w-full sm:max-w-md">

      
      <CardHeader>
        <CardTitle>Start an Instant Meeting</CardTitle>
        <CardDescription>
      Enter your email and a room code to join or create a video call instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    first Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Login button not working on mobile"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />



                        <Controller
              name="room"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    room
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Login button not working on mobile"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />



                        <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Login button not working on mobile"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />



          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-rhf-demo">
                      Start Meeting

          </Button>
        </Field>



        Powered by <span className="font-semibold text-blue-600">TalkNow</span>

      </CardFooter>
    </Card>
      </div>


  )
}


export default LobbyPage
