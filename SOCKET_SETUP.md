# Socket.io Server Implementation in Next.js

## Overview
This implementation mirrors your Express.js Socket.io server logic within a Next.js application. The socket server runs as a separate process on port 8000 while the Next.js app runs on port 3000.

## Files Created

### 1. `src/lib/socketServer.ts`
Main socket.io server logic with all event handlers:
- `joinRoom` - handles user joining a room
- `User:call` - initiates a WebRTC call
- `call:accepted` - accepts an incoming call
- `peer:nego:needed` - handles peer negotiation
- `peer:nego:done` - completes peer negotiation
- `disconnect` - cleans up on user disconnect

Maps for tracking:
- `emailToSocketIdMap` - maps email to socket ID
- `socketIdToEmailMap` - maps socket ID to email

### 2. `src/server.ts`
Standalone HTTP server that initializes socket.io on port 8000

### 3. `src/pages/api/socket.ts`
API route for socket initialization (optional, used with Next.js internal server)

### 4. `.env.local`
Environment configuration:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_PORT=8000
```

### 5. Updated `src/components/context/SocketProvider.tsx`
- Updated to use environment variable for socket URL
- Added reconnection options
- Proper error handling

### 6. Updated `src/app/lobby/[id]/page.tsx`
- Added `joinRoom` event emission when component mounts
- Extracts email from URL query parameter
- Sends email and room ID to server

## Setup Instructions

### 1. Install Dependencies
```powershell
pnpm install
```

This will install:
- `concurrently` - run multiple processes
- `tsx` - TypeScript executor for running `src/server.ts`

### 2. Start Development (Two Options)

**Option A: Run both servers with one command**
```powershell
pnpm run dev:all
```
This will start:
- Next.js on http://localhost:3000
- Socket.io server on http://localhost:8000

**Option B: Run servers separately (in different terminals)**

Terminal 1 - Next.js:
```powershell
pnpm run dev
```

Terminal 2 - Socket.io server:
```powershell
pnpm run dev:socket
```

### 3. Test the Flow

1. Navigate to the lobby page:
   ```
   http://localhost:3000/lobby
   ```

2. Fill in the form with:
   - Email: `user@example.com`
   - Room: `room123`

3. Click "Join"

4. This will navigate to:
   ```
   http://localhost:3000/lobby/room123?email=user@example.com
   ```

5. Check the socket server console - you should see:
   ```
   a user connected, socket connected <socket-id>
   joining request from { email: 'user@example.com', room: 'room123' }
   ```

## Event Flow

### User Joins Room
```
Client → socket.emit("joinRoom", {email, room})
Server → io.to(room).emit("newUserJoined", {email, id})
Server → io.to(socket.id).emit("joinRoom", data)
```

### WebRTC Call Initiation
```
User A → socket.emit("User:call", {to: userB_id, offer})
Server → io.to(userB_id).emit("incomming:call", {from: userA_id, offer})
```

### Call Acceptance
```
User B → socket.emit("call:accepted", {to: userA_id, answer})
Server → io.to(userA_id).emit("call:accepted", {from: userB_id, answer})
```

### Peer Negotiation
```
User A → socket.emit("peer:nego:needed", {to: userB_id, offer})
Server → io.to(userB_id).emit("peer:nego:needed", {from: userA_id, offer})

User B → socket.emit("peer:nego:done", {to: userA_id, answer})
Server → io.to(userA_id).emit("peer:nego:final", {from: userB_id, answer})
```

## Troubleshooting

### "Cannot connect to socket server"
- Ensure socket server is running on port 8000
- Check if port 8000 is in use: `netstat -ano | findstr :8000`
- Update `.env.local` if using a different port

### "Socket connection keeps disconnecting"
- The SocketProvider has reconnection options configured
- Check browser console for connection errors
- Verify socket server is still running

### "Events not being received"
- Add console.log in socket event handlers to debug
- Ensure client and server event names match exactly
- Check that email is properly passed from lobby form

## Production Deployment

For production, you have two options:

**Option 1: Deploy socket server separately**
- Deploy `src/server.ts` to a separate server/container
- Update `NEXT_PUBLIC_SOCKET_URL` to point to your deployed server
- Deploy Next.js app to Vercel/your hosting

**Option 2: Use Next.js built-in server**
- Use the API route pattern in `src/pages/api/socket.ts`
- Requires running on a Node.js server, not Vercel Edge

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:8000` | Socket server URL (public, accessible from browser) |
| `NEXT_PUBLIC_SOCKET_PORT` | `8000` | Socket server port |

## Next Steps

1. Test the connection with `pnpm run dev:all`
2. Try joining rooms from different browser tabs/windows
3. Implement WebRTC peer connection for video streaming
4. Add error handling for edge cases
5. Set up proper logging/monitoring
