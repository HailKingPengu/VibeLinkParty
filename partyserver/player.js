class player {
    constructor() {

    }
}
// player functions
const savedPlayerData = {
  
}


function playerGetData(uid) {
    if(savedPlayerData.hasOwnProperty(uid)){
      return(savedPlayerData[uid])
    }
  }
  
  function playerSetData(uid,obj) {
    if(savedPlayerData.hasOwnProperty(uid)){
      Object.assign(savedPlayerData[uid],savedPlayerData[uid],obj)
    }else{
      savedPlayerData[uid] = JSON.parse(JSON.stringify(obj));
      console.log(savedPlayerData)
    }
  }
  
  function playerDataExists(uid) {
    return(savedPlayerData.hasOwnProperty(uid));
  }

  function playerAddScore(uid,scoreAddition) {
    var d = playerGetData(uid);
    var newscore = d.score + scoreAddition;
    playerSetData(uid,{score:newscore})
  }

module.exports = {
    savedPlayerData , playerGetData, playerSetData, playerDataExists, playerAddScore
}