
const gamedata = require('./data.json');

class game {
    constructor(C) {
      this.socket = C;
      this.scores = {};
    }

    onJoin (client,obj) {

    }
    onPlayerConnect (client,obj,searched) {

    }
    onLeave (client,obj) {

    }
  }
module.exports = game;