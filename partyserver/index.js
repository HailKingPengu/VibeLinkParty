const crypto = require('crypto');

const mytools = require('./tools');
const express = require('express')
const mockupData = require('./site/mockup.json');


function debugGetLikelist(dictionary) {
  Object.keys(dictionary).forEach(function(key) {
    var val = dictionary[key];
    if(key=="general" || key=="base") {
      
    } else {

    }
  });
}
const peoplelikes = debugGetLikelist(mockupData.tags);

const port = 11100;
const WebSocket = require('ws');
const { Console } = require('console');

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
  ws.data = {}
  ws.data.id ='';
  console.log('New client connected!')


  ws.send(newobj("connected",{likes:mockupData.likes}))
  ws.on('close', () => console.log('Client has disconnected!'))
  ws.on('message', data => {
    var obj = JSON.parse(data);
    console.log(`Incoming message: ${JSON.stringify(obj)}`)
    switch(obj.type){
      case "login":
        loginuser(ws,obj);
      break;
      case "playerconnect":
        playerConnects(ws,obj);
      break;
    }
    //sockserver.broadcast("message",obj);
  })
  ws.onerror = function () {
    console.log('websocket error')
  }
 })


 function loginuser(ws,obj){
  ws.data = {}
    ws.data.name = obj.name;
    ws.data.likes = obj.likes;
    ws.data.color = choose(['red','green','blue','purple'])
    ws.data.id = generatePlayerID();
    console.log(ws.data)




    sockserver.clients.forEach(client => {
      client.send(newobj("playerlist",{list:playerlist(),myid:client.data.id}))
    })

 }

 function playerlist(){
  var list = []
  sockserver.clients.forEach(client => {
    var obj = {
      name: client.data.name,
      color: client.data.color,
      id: client.data.id
    }
    list.push(obj);
  })

  return(list)
 }

const playerIdLength = 4;
 function generatePlayerID() {
  var genId = function () {
    var str = ''
    for (let index = 0; index < playerIdLength; index++) {
      str = str +choose(['0','1','2','3','4','5','6','7','8','9'])
    }
    return(str)
  }
  var _id = genId();
  while(getplayerbyID(_id)!=undefined){
    var _id = genId();
  }
  return(_id)
 }
 function getplayerbyID(theid) {
  var val = undefined;
  sockserver.clients.forEach(client => {
    
    var trueness = client.data.id === theid;
    console.log(trueness)
    if(trueness){
      val = client
    }
  });
  return(val)
 }

 function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function playerConnects(ws,obj) {
  var search = getplayerbyID(obj.search);
  if(search!=undefined){
    var issame = ws === search;
    if(!issame){

      // do actions when connecting to players
      console.log("ACTION")

    }
  }
}