import { createServer } from "node:http";
import { Server } from "socket.io";
import type { NextRequest } from "next/server";

import next from "next";

const dev = process.env.NODE_ENV !== "production";

console.log("dev", dev)
const hostname = 'localhost';
const port = 3000;

const app = next({ dev , hostname, port });
const handle = app.getRequestHandler(); 


app.prepare().then(() => {

    const httpServer = createServer(handle);

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });




    const emailToSocketIdMap = new Map();

const socketIdToEmailMap = new Map();   // reverse map

io.on("connection", (socket) => {
  console.log("a user connected, socket connected" , socket.id);

  socket.on("joinRoom" , data => {
    console.log("joining request from " , data);

    const {email , room} = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);  // store reverse mapping


    io.to(room).emit("newUserJoined", {email , id : socket.id});

    socket.join(room);


    //user that sent the request data emit the same data back to him
    io.to((socket.id)).emit("joinRoom", data);
    // socket.join(data);
  })





  socket.on("User:call" , ({to , offer }) => {


    io.to(to).emit("incomming:call" , {from : socket.id , offer});
  })


  socket.on("call:accepted" , ({to , answer}) => {
    io.to(to).emit("call:accepted" , {from : socket.id , answer});
  } 
  );

  


  socket.on("peer:nego:needed", ({to , offer}) => {
    io.to(to).emit("peer:nego:needed", {from: socket.id, offer});
  });



  socket.on("peer:nego:done", ({to , answer}) => {
    io.to(to).emit("peer:nego:final", {from: socket.id, answer});
  }
  );


});


httpServer.listen(8000, () => {
    console.log("Socket.IO server running at http://localhost:8000/");          
    });
    
})