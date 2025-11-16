import { Server, Socket } from "socket.io";
import type { NextRequest } from "next/server";

interface JoinRoomPayload {
  email: string;
  room: string;
}

interface CallPayload {
  to: string;
  offer: RTCSessionDescriptionInit;
}

interface AnswerPayload {
  to: string;
  answer: RTCSessionDescriptionInit;
}

const emailToSocketIdMap = new Map<string, string>();
const socketIdToEmailMap = new Map<string, string>();

export async function GET(req: NextRequest) {
  if (!(global as any).io) {
    console.log("Initializing Socket.IO...");

    const io = new Server((global as any).server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket: Socket) => {
      console.log("a user connected:", socket.id);

      socket.on("joinRoom", (data: JoinRoomPayload) => {
        console.log("joining request from", data);

        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);

        io.to(room).emit("newUserJoined", { email, id: socket.id });

        socket.join(room);

        io.to(socket.id).emit("joinRoom", data);
      });

      socket.on("User:call", ({ to, offer }: CallPayload) => {
        io.to(to).emit("incomming:call", { from: socket.id, offer });
      });

      socket.on("call:accepted", ({ to, answer }: AnswerPayload) => {
        io.to(to).emit("call:accepted", { from: socket.id, answer });
      });

      socket.on("peer:nego:needed", ({ to, offer }: CallPayload) => {
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
      });

      socket.on("peer:nego:done", ({ to, answer }: AnswerPayload) => {
        io.to(to).emit("peer:nego:final", { from: socket.id, answer });
      });
    });

    (global as any).io = io;
  } else {
    console.log("Socket.IO already running");
  }

  return new Response("Socket.IO server running");
}
