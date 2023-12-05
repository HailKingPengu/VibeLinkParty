
const gamedata = require('./data.json');
const {savedPlayerData , playerGetData, playerSetData, playerDataExists, playerAddScore} = require('../../player')
const {choose} = require('../../tools');

class game {
    constructor(C) {
      this.socket = C;
      this.scores = {};
      this.colors = [];
      this.coloramount = 3;
      this.createColorArray();
      this.countdown = 0;
      this.countdownLength = 60 // in seconds
      this.SetCountdownDate();
      this.self = this;
      this.pointmultiplier = 4;
    }
    createColorArray() {
      this.colors = [];
      for (let index = 0; index < this.coloramount; index++) {
        const element = gamedata.colors[index];
        this.colors[index] = element;
      }
    }
    setupColorForClient(client){
      var c = choose(this.colors);
      var colorCopy = JSON.parse(JSON.stringify(c));
      playerSetData(client.gUID,{colorgame:colorCopy,hasConnectedGameround:false})
    }
    SetCountdownDate(){
      this.countdown = Date.now() + (1000 * this.countdownLength);
    }
    newColorRound(){
      this.pointmultiplier = 4;
      setTimeout(this.newColorRound.bind(this.self), this.countdownLength*1000);
      this.SetCountdownDate();
      this.socket.clients.forEach((client)=>{
        this.setupColorForClient(client)
        client.sendGame(this.MakeColorGameComponent(client));
      })

    }
    MakeColorGameComponent(client){
      var gd = playerGetData(client.gUID); 
      var cg = gd.colorgame;

      var countdown;

      return({list:[{type:"txt",txt:"Your color is:"},{type:"block",color:cg.color,txt:cg.name},{type:"countdown",time:this.countdown}]})
    }
    CompareColors(client,otherclient){
      var gd = playerGetData(client.gUID);
      var gd2 = playerGetData(otherclient.gUID);
      return(gd.colorgame.name === gd2.colorgame.name)
    }

    onStart () {
      this.socket.clients.forEach((client)=>{
        this.setupColorForClient(client)
        client.sendGame(this.MakeColorGameComponent(client));
      })
      setTimeout(this.newColorRound.bind(this.self), this.countdownLength*1000);
    }

    onJoin (client,obj) {
      this.setupColorForClient(client)
      client.sendGame(this.MakeColorGameComponent(client));
    }
    onPlayerConnect (client,obj,searched) {
      var changeMultiplier = false;
      if(this.CompareColors(client,searched)){
        var gd = playerGetData(client.gUID); 
        if(!gd.hasConnectedGameround){
          changeMultiplier = true;
          playerAddScore(client.gUID,this.pointmultiplier)
          playerSetData(client.gUID,{hasConnectedGameround:true})
        }
        var gd = playerGetData(searched.gUID);
        if(!gd.hasConnectedGameround){
          changeMultiplier = true;
          playerAddScore(searched.gUID,this.pointmultiplier)
          playerSetData(searched.gUID,{hasConnectedGameround:true})
        }
      }
      if(changeMultiplier){
        this.pointmultiplier = Math.max(this.pointmultiplier-1,1);
        this.socket.updateGame();
      }

    }
    onLeave (client,obj) {

    }
  }
module.exports = game;