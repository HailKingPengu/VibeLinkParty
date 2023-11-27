
const gamedata = require('./data.json');
const { choose } = require('../../tools')

class game {
    constructor(C) {
      this.socket = C;
      this.scores = {};
      
    }

    onStart () {
      this.alllikes = this.socket.getAllInterests()
      this.socket.clients.forEach((client)=>{
        client.data.quest = givePersonQuest(this.alllikes);
        client.sendGame({list:[{type:"txt",txt:client.data.quest}]});
      })
    }

    onJoin (client,obj) {
      this.alllikes = this.socket.getAllInterests()
      client.data.quest = givePersonQuest(this.alllikes);
      client.sendGame({list:[{type:"txt",txt:client.data.quest}]});
    }
    onPlayerConnect (client,obj,searched) {
      client.data.score++;
      searched.data.score++;


      this.socket.updateGame();
    }
    onLeave (client,obj) {

    }
  }

function givePersonQuest(alllikes){
  var quest = choose(gamedata.questions);

  var like = choose(alllikes);
  var subject = choose(gamedata.subjects);

  var queststring = quest.replace("[interest]", like);
  queststring = queststring.replace("[subject]",subject);


  return(queststring);
}
module.exports = game;