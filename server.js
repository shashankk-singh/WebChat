const http = require('http');
const port = 8080

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
    console.log(`Client${counter} Connected`)
    ws.username = 'user' + counter
    counter += 1
    ws.on('message' ,(data) => {
        for(let client of wss.clients){
            client.send(ws.username + ': ' + data)
            console.log(`${ws.username} says: ${String(data)}`)
        }
    })

    ws.on('close', () => {
    console.log(`${ws.username} disconnected`)

    ws.on('errr' , (err) => {
        console.log(`${ws.username} error : ${err.message}`)
    })
})
})