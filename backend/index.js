
import { WebSocketServer, WebSocket  } from 'ws'


const wss = new WebSocketServer({ port: 8081})

wss.on('connection', (socket, request) =>{
  const ip = request.socket.remoteAddress;

  socket.on('message', (rawMessage)=>{
    const message = rawMessage.toString();
    console.log({ message });

    wss.clients.forEach((client) => {
      if(client.readyState == WebSocket.OPEN ) client.send(`server Broadcast: ${message}`)
    })
  })
  socket.on('error', (err)=>{
   console.log(`eror: ${err.message}: ${ip}`)
  })
  socket.on('close', ()=>{
   console.log(`close`)
  })

})

console.log("websocket server is live on ws://localhost:8081")
