const http = require('http');
const port = 8080
const rooms = {}

const server = http.createServer((req , res) => {
    res.writeHead(200 , {'Content-Type' : 'text/plain'});

    res.end()
})

server.listen(port , () => {
    console.log(`Server is listening at port: ${port}`)
})

const {WebSocketServer} = require('ws');
const wss = new WebSocketServer({server})


let counter = 1;
wss.on('connection' , (ws) => {
    console.log(`user${counter} Connected`)
    ws.username = 'user' + counter
    counter += 1 
    ws.on('message' ,(data) => {

        if(String(data).startsWith('join')){
            let roomName = String(data).split(':')[1]
            ws.room = roomName

            if(!rooms[roomName]){
                rooms[roomName] = []
            }
            rooms[roomName].push(ws)
            ws.send(`You joined ${roomName}`)
            return // stop here
        }

        // if in a room, broadcast to room only
        if(ws.room){                                //ws.room is either a room name string or undefined.If it's a string — it's truthy
            for(let client of rooms[ws.room]){
                client.send(ws.username + ': ' + data)
        }
            return

    }

        // otherwise global broadcast
        for(let client of wss.clients){
            client.send(ws.username + ': ' + data)
        }
    })

    ws.on('close', () => {
    console.log(`${ws.username} disconnected`)

    ws.on('err' , (err) => {
        console.log(`${ws.username} error : ${err.message}`)
    })
})
})