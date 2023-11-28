
const gamedata = require('./data.json');

class game {
    constructor(C) {
      this.socket = C;
      this.scores = {};
    }
    onStart () {
      this.socket.clients.forEach((client)=>{
        client.sendGame({list:[{type:"txt",txt:"Your color is:"},{type:"block",color:gamedata.colors[2].color,txt:gamedata.colors[2].name}]});
      })
    }

    onJoin (client,obj) {
      client.sendGame({list:[{type:"txt",txt:"Your color is:"},{type:"block",color:gamedata.colors[2].color,txt:gamedata.colors[2].name}]});
    }
    onPlayerConnect (client,obj,searched) {

    }
    onLeave (client,obj) {

    }
  }
module.exports = game;