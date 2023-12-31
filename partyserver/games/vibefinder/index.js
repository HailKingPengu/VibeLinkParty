
const gamedata = require('./data.json');
const { choose } = require('../../tools')
const {savedPlayerData , playerGetData, playerSetData, playerDataExists, playerAddScore} = require('../../player')

class game {
    constructor(C) {
      this.socket = C;
      this.scores = {};
      
    }

    onStart () {
      this.alllikes = this.socket.getAllInterests()
      this.socket.clients.forEach((client)=>{

        playerSetData(client.gUID,{quest:givePersonQuest(this.alllikes,client)})
        client.sendGame({list:[{type:"txt",txt:playerGetData(client.gUID).quest}]});

      })
    }

    onJoin (client,obj) {
      this.alllikes = this.socket.getAllInterests()
      playerSetData(client.gUID,{quest:givePersonQuest(this.alllikes,client)});
      client.sendGame({list:[{type:"txt",txt:playerGetData(client.gUID).quest}]});
    }
    onPlayerConnect (client,obj,searched) {

      playerAddScore(client.gUID,1)
      playerAddScore(searched.gUID,1)


      this.socket.updateGame();

      playerSetData(searched.gUID,{quest:givePersonQuest(this.alllikes,searched)})
      searched.sendGame({list:[{type:"txt",txt:playerGetData(searched.gUID).quest}]});

      playerSetData(client.gUID,{quest:givePersonQuest(this.alllikes,client)})
      client.sendGame({list:[{type:"txt",txt:playerGetData(client.gUID).quest}]});
    }
    onLeave (client,obj) {

    }
  }

function givePersonQuest(alllikes,client){
  var quest = choose(gamedata.questions);

  var d = playerGetData(client.gUID)
  var plike = choose(d.likes);

  var like = choose(alllikes);
  var subject = choose(gamedata.subjects);

  var queststring = quest.replace("[interest]", like);
  queststring = queststring.replace("[subject]",subject);

  queststring = queststring.replace("[personal]",plike);


  return(queststring);
}
module.exports = game;