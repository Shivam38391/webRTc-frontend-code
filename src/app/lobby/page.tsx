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


<Button onClick={() => {

           const email =         form.getValues("email")
            const room =         form.getValues("room")
            
                    socket.emit("joinRoom", { email, room  })  // Emit joinRoom event with email and room

    const query = new URLSearchParams({ email })
    router.push(`/lobby/new/${room}?${query.toString()}`);


          }}>
 direct link share join

</Button>


        </Field>




      </CardFooter>
        Powered by <span className="font-semibold text-blue-600">TalkNow</span>
    </Card>
      </div>


  )
}


export default LobbyPage
