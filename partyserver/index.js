const crypto = require('crypto');

const mytools = require('./tools');
const express = require('express')

const port = 11100;
const WebSocket = require('ws')

const app = express()
app.use(express.static('site'));
app.listen(3000, () => console.log(`Listening on http://localhost:${3000}`));

 const sockserver = new WebSocket.WebSocketServer({ port: 443 })



 function newobj(_type,_eobj) {
  var obj = {
    type : _type,
    date : Date.now()
  };
  Object.assign(obj,_eobj)
  var str = JSON.stringify(obj);
  return(str)
 }

 sockserver.broadcast = function(_type,obj) {
  sockserver.clients.forEach(client => {
    client.send(newobj(_type,obj))
  })
 }

 sockserver.on('connection', ws => {
  console.log('New client connected!')


  ws.send(newobj("connected",{}))
  ws.on('close', () => console.log('Client has disconnected!'))
  ws.on('message', data => {
    var obj = JSON.parse(data);
    console.log(`Incoming message: ${JSON.stringify(obj)}`)

    sockserver.broadcast("message",obj);
  })
  ws.onerror = function () {
    console.log('websocket error')
  }
 })

