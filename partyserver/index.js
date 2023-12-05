const crypto = require('crypto');
const fs = require('fs');

const { choose } = require('./tools')

const mytools = require('./tools');
const express = require('express')
const mockupData = require('./site/mockup.json');

const allgames = require('./games');

const {savedPlayerData , playerGetData, playerSetData, playerDataExists} = require('./player')

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

const appPort = process.env.PORT || 3000;
const websockPort = process.env.SOCKPORT || 8081;

const protocoltype = process.env.PROTOCOLTYPE || "ws"
console.log(protocoltype)


fs.writeFile('./site/temp.json', JSON.stringify({port:appPort,protocol:protocoltype}), 'utf8',function(err, data) {
  if(err){
    console.log(err)
  }else{
    console.log('success temp.json')
  }
});

const app = express()
app.use(express.static('site'));
const server = app.listen(appPort, () => console.log(`Listening on http://localhost:${appPort}`));

 const sockserver = new WebSocket.WebSocketServer({ server })



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
    allarr = allarr.concat(playerGetData(client.gUID).likes.filter((item) => allarr.indexOf(item) < 0)); 
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
        var findccorrectgame = function(gam){
          return(gam.name===obj.game)
        }
        var correctgames = allgames.games.filter(findccorrectgame)
          playingGame = new correctgames[0].game(sockserver); // CHANGE THIS LATER
          playingGame.socket = sockserver;
          var obj = {
            list : playerlist(),
            gamename: correctgames[0].name
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

    ws.gUID = obj.uid;
    var isfirst = sockserver.clients.size<=1;
    if(!playerDataExists(ws.gUID)){
      var canbeadmin = isfirst;
      playerSetData(ws.gUID,{
        name : obj.name,
        likes : obj.likes,
        color : choose(['#E6AF3F','#DE476F','#3D80DF','#D9D9D9']),
        id : generatePlayerID(),
        score: 0,
        isadmin : canbeadmin
        
      })
    }




    sockserver.clients.forEach(client => {
      var getobj = playerGetData(client.gUID);

      var obj = {list:playerlist(),myid:getobj.id,isadmin:getobj.isadmin,playingGame:(playingGame!==undefined)};
      if(getobj.isadmin){
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
    var getobj = playerGetData(client.gUID);

      var obj = {
        name: getobj.name,
        color: getobj.color,
        id: getobj.id,
        score: getobj.score
      }
      list.push(obj);

  })

  list.sort(function(a, b) {
    if (a.score > b.score){return -1;}
    if (a.score < b.score){return 1;}
    return(0)
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
    
    var dta = playerGetData(client.gUID);
    
    var trueness = (dta!=undefined) && dta.id === theid;
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
      if(playingGame){
        playingGame.onPlayerConnect(ws,obj,search)
      }
    }
  }
}

