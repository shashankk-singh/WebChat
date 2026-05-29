const http = require('http');
const port = 8080

const server = http.createServer((req , res) => {
    res.writeHead(200 , {'Content-Type' : 'text/plain'});

    res.end('hello!')
})

server.listen(port , () => {
    console.log(`Server is listening at port: ${port}`)
})

const {WebSocketServer} = require('ws');
const wss = new WebSocketServer({server})

wss.on('connection' , (ws) => {
    console.log('Client Connected')
    ws.on('message' ,(data) => {
        for(let client of wss.clients){
            client.send(data)
            console.log(String(data))
        }
    })

    ws.on('close', () => {
    console.log('Client disconnected')
})
})