$(document).ready(onStart)





webSocket = undefined
allgamestoplay = [];
recommendedlikes = ["games","movies","anime","baking"];
keyobject = {};
const mylikes = [];
var likeonline = localStorage.getItem('mylikes').split(",")
console.log(likeonline)
if(likeonline.length>2){
    likeonline.forEach((element)=>{
        mylikes.push(element)
    })
}
myname = "";
myid = "";
isadmin = false;
isplayinggame = false;

// SERVER STUFF
function goServer () {
    if(webSocket != undefined){return("You are already connected")}
    if(mylikes.length<3){return("Choose more likes")}

        webSocket = new WebSocket(`ws://${window.location.hostname}:3001/`);
        webSocket.onmessage = onMessage;
        console.log(webSocket)
        overlayDeactivate()
        return("")

}

function onMessage(event) {
    console.log(event)
    $('#messages').append(`<p>${event.data}</p>`)
    var obj = JSON.parse(event.data);
    switch(obj.type){
        case "connected":
            sendLoginData();
        break;
        case "playerlist":
            myid = obj.myid;
            allgamestoplay = obj.games;
            playingGame = obj.playingGame;
            isplayinggame = obj.playingGame;
            toggleAdmin(obj.isadmin)
            $('#mywritenumber').text(myid);
            createPlayerlist(obj.list,isplayinggame);
        break;
        case "startgame":
            createPlayerlist(obj.list,isplayinggame);
        break;
        case "update":
            createPlayerlist(obj.list,isplayinggame);
        break;
        case "game":
            CreateGameBar(obj)
        break;
    }
}

function sendLoginData () {

    myname = $('#myname').val();
    localStorage.setItem('mylikes', mylikes);
    sendMessage({
        type : "login",
        likes : mylikes,
        name : myname
    })
}


function onStart() {
    writelikes()
    console.log("started")

    $.getJSON("./mockup.json",function(obj){
        recommendedlikes = obj.tags.general;
        keyobject = obj.tags;
        recommendedlikes.sort();
        recommendedlikes.forEach((element)=> {
            createlikeButton(element)
        })
    })
    CreateGameBar()
    overlayActivate();
    
    

}
function writelikes(){
    var txtlist = `<div id="likecontainer">`
    mylikes.forEach((element)=>{
        txtlist = txtlist+`<div class="like">${element}</div>`
    })
    txtlist = txtlist+'</div>'

    $('#mylistlikes').html(txtlist)
}
function createlikeButton(thelike){
    var obj = $('#mylikeslist').append(
        `<button class="likeslistitem">${thelike}</button>`
    )
    $(`.likeslistitem:contains('${thelike}')`).on( "click",(eventData) =>{
        mylikes.push(thelike)
        $(eventData.currentTarget).remove()

        writelikes();

        // if its a category
        if(keyobject.hasOwnProperty(thelike)){

            keyobject[thelike].forEach((element)=> {
                createlikeButton(element)
            })    
        }
    })
}

function sendMessage(obj) {
    obj.date = Date.now();
    webSocket.send(JSON.stringify(obj));
}

function createPlayerlist(list,showscores = false){
    $('#players').empty();

    list.forEach((element)=>{

        var score = ""
        if(showscores){score = `[ ${element.score} ]`}
        $('#players').append(
            `<div class='player' style="background-color:${element.color};">
                <h2>${element.name} ${score}</h2>
            </div>
            `
        )
    })
}

function sendConnectPlayers() {
    var enteredvalue = $('#connecttext').val();
    console.log(enteredvalue);
    $('#connecttext').val('');
    sendMessage({type:"playerconnect",search:enteredvalue})
}


function overlayActivate() {
    document.getElementById("overlay").style.display = "block";
  }
  
  function overlayDeactivate() {
    document.getElementById("overlay").style.display = "none";
  } 

  function toggleAdmin(admin = !isadmin) {
    isadmin = admin;

    $('.admin').remove();
    if(isadmin){
        // is admin

        
        var str = ``;
        if(!playingGame){
            allgamestoplay.forEach((elem)=>{
                str = str+`<button onClick="startGame('${elem}')">
                <h3>${elem}</h3>
            </button>`
            })
        }
        var admincontainer = `
        <div class="admin">
            ${str}
        </div>
        `
        $('main').prepend(admincontainer);
    }
  }

function startGame (gamename) {
    sendMessage({type:"startgame",game:gamename})
}


function CreateGameBar (boxinfo = {}) {
    var createbarfrominfo = function (info) {
        console.log(info.list);
        for (let index = 0; index < info.list.length; index++) {
            const element = info.list[index];
            if(element.type =="txt"){
                $('#gamebar').append(`<h3>${element.txt}</h3>`)
            }
        }
    }

    $('#gamebar').empty();
    if(Object.keys(boxinfo).length===0)
    {
        $('#gamebar').append('<h3>No game information</h3>')
    }else{
        createbarfrominfo(boxinfo)
    }
}