require('dotenv').config();
const http = require('http');
const port = 8080
const rooms = {}
const message = require('./message')
const mongoose = require('mongoose')

const server = http.createServer((req , res) => {
    res.writeHead(200 , {'Content-Type' : 'text/plain'});

    res.end()
})

server.listen(port , () => {
    console.log(`Server is listening at port: ${port}`)
})

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('Connection failed' , err))

const {WebSocketServer} = require('ws');
const wss = new WebSocketServer({server})


let counter = 1;
wss.on('connection' , (ws) => {
    console.log(`user${counter} Connected`)
    ws.username = 'user' + counter
    counter += 1 
    ws.on('message' ,async(data) => {

        //handling the join request
        if(String(data).startsWith('join')){
            let roomName = String(data).split(':')[1]
            ws.room = roomName

            if(!rooms[roomName]){
                rooms[roomName] = []
            }
            rooms[roomName].push(ws)
            ws.send(`You joined ${roomName}`)

            //getting previous chat of this room
            let cursor = await message.find({room: ws.room} , {sender:1 , content: 1 , _id:0})
            .sort({time: 1}).limit(10)
            ws.send(JSON.stringify(cursor))

            return // stop here
        }

        // if in a room, broadcast to room only
        if(ws.room){                                //ws.room is either a room name string or undefined.If it's a string — it's truthy
            for(let client of rooms[ws.room]){
                client.send(ws.username + ': ' + data)
        }
        const newMessage = new message({ sender: ws.username, room: ws.room, content: String(data) })
        await newMessage.save()
            return

    }

        // otherwise global broadcast
        for(let client of wss.clients){
            client.send(ws.username + ': ' + data)
        }
        const newMessage = new message({ sender: ws.username, room: "Global", content: String(data) })
        await newMessage.save()
        
    })

    ws.on('close', () => {
    console.log(`${ws.username} disconnected`)})

    ws.on('error' , (err) => {
        console.log(`${ws.username} error : ${err.message}`)
    })
})