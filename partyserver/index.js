const crypto = require('crypto');

const { choose } = require('./tools')

const mytools = require('./tools');
const express = require('express')
const mockupData = require('./site/mockup.json');

const allgames = require('./games');

playingGame = undefined;



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

const appPort = 3000;
const websockPort = 3001;

const app = express()
app.use(express.static('site'));
app.listen(appPort, () => console.log(`Listening on http://localhost:${appPort}`));

 const sockserver = new WebSocket.WebSocketServer({ port: websockPort })



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
 sockserver.updateGame = function() {
  sockserver.broadcast("update",{
    list: playerlist()
  })
 }

 sockserver.getAllInterests = function(){
  var allarr = []
  sockserver.clients.forEach(client => {
    allarr = allarr.concat(client.data.likes.filter((item) => allarr.indexOf(item) < 0)); 
  })
  return(allarr)
 }

 sockserver.on('connection', ws => {
  ws.data = {}
  ws.data.id ='';
  ws.data.score = 0; 
  ws.data.isadmin = false;
  ws.data.likes = [];
  console.log('New client connected!')
  ws.sendGame = function(obj){
    ws.send(newobj("game",obj))
  }

  ws.send(newobj("connected",{likes:mockupData.likes}))
  ws.on('close', () => console.log('Client has disconnected!'))
  ws.on('message', data => {
    var obj = JSON.parse(data);
    console.log(`Incoming message: ${JSON.stringify(obj)}`)
    switch(obj.type){
      case "login":
        loginuser(ws,obj);
        if(playingGame){
          playingGame.onJoin(ws,obj)
        }

      break;
      case "playerconnect":
        playerConnects(ws,obj);
      break;
      case "startgame":
        playingGame = new allgames.games[0].game(sockserver); // CHANGE THIS LATER
        playingGame.socket = sockserver;
        var obj = {
          list : playerlist(),
          gamename: allgames.games[0].name
        };
        playingGame.onStart();
        sockserver.broadcast("startgame",obj)

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
    ws.data.score = 0;
    var isfirst = sockserver.clients.size<=1;
    ws.data.isadmin = isfirst;


    sockserver.clients.forEach(client => {
      var obj = {list:playerlist(),myid:client.data.id,isadmin:client.data.isadmin,playingGame:(playingGame!==undefined)};
      if(client.data.isadmin){
        obj.games = [];
        allgames.games.forEach((elem)=>{
          obj.games.push(elem.name)
        })
      }
      client.send(newobj("playerlist",obj))
    })

 }

 function playerlist(){
  var list = []
  sockserver.clients.forEach(client => {
    var obj = {
      name: client.data.name,
      color: client.data.color,
      id: client.data.id,
      score: client.data.score
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



function playerConnects(ws,obj) {
  var search = getplayerbyID(obj.search);
  if(search!=undefined){
    var issame = ws === search;
    if(!issame){

      // do actions when connecting to players
      console.log("ACTION")
      if(playingGame){
        playingGame.onPlayerConnect(ws,obj,search)
      }
    }
  }
}