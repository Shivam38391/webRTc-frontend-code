"use client"

import React , {createContext, useContext, useMemo} from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = Socket | null;

export const SocketContext = createContext<SocketContextType>(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error("useSocket must be used within a SocketProvider");
    }   
    return socket;
}

interface SocketProviderProps {
//   socket: any;
  children: React.ReactNode;
}
const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {

    // const socket = useMemo(() => io(process.env.NEXT_PUBLIC_SOCKET_URL , {
    //     transports: ["websocket"], // ensures stable connection
    //   }),

    const socket = useMemo(() => io(`https://fllt4050-8000.inc1.devtunnels.ms/` , {
    }),
    
    
    []);

    console.log("socket iod provider", socket)

  return (
    <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>
    );
};

export default SocketProvider;