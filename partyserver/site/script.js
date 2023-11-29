$(document).ready(onStart)





webSocket = undefined
allgamestoplay = [];
allrecommendedlikes = []
recommendedlikes = ["games","movies","anime","baking"];
keyobject = {};
window.mylikes = [];
likeonline = []
//var likeonline = localStorage.getItem('window.mylikes').split(",")
console.log(likeonline)
if(likeonline.length>2){
    likeonline.forEach((element)=>{
        window.mylikes.push(element)
    })
}
myname = "";
myid = "";
isadmin = false;
isplayinggame = false;

port = 8081;
protocol = 'ws'

window.myUID = undefined

// SERVER STUFF

function goServer () {
    if(webSocket != undefined){return("You are already connected")}
    if(window.mylikes.length<3){return("Choose more likes")}
        var wport = `:${window.location.port}`; if(protocol=="wss"){wport = ""}
        var wsip = `${protocol}://${window.location.hostname}${wport}`

        console.log(wsip);
        webSocket = new WebSocket(wsip);
        webSocket.onmessage = onMessage;
        webSocket.onclose = (event) => {
            console.log("DISCONNected");
          };
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
    localStorage.setItem('window.mylikes', window.mylikes);
    sendMessage({
        type : "login",
        likes : window.mylikes,
        name : myname
    })
}


function onStart() {
    writelikes()
    console.log("started")

    $.getJSON("./temp.json",function(obj){

        port = obj.port;
        protocol = obj.protocol;
        console.log(`port: ${obj.port}`)
    })

    $.getJSON("./mockup.json",function(obj){
        allrecommendedlikes = obj.tags.general;
        recommendedlikes = allrecommendedlikes;
        keyobject = obj.tags;
        recommendedlikes.sort();
        recommendedlikes = excludeArrays(recommendedlikes,window.mylikes);
        recommendedlikes.forEach((element)=> {
            createlikeButton(element)
        })
    })
    CreateGameBar()
    overlayActivate();
    $(document).on('keypress',function(e) {
        if(e.which == 13 && webSocket) {
            sendConnectPlayers();
        }
    });
    $('#joinaserver').on('click',()=>{
        goServer()
    })

}
function writelikes(){
    var txtlist = `<div id="likecontainer">`
    window.mylikes.forEach((element)=>{
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
        window.mylikes.push(thelike)
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
            }else
            if(element.type =="block"){
                $('#gamebar').append(`<div class="funblock" style="background-color: ${element.color};"><h3>${element.txt}</h3></div>`)
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


function mergeArrays (arrayOld) { // returns an array without duplicates
    let arraynew = [];
    arrayOld.forEach((element) => {
    if (!arraynew.includes(element)) {
        arraynew.push(element);
    }
});
return(arraynew)
}

function excludeArrays (arrayOld,exclude) { // returns an array without duplicates and excludes
    let arraynew = [];
    arrayOld.forEach((element) => {
    if (!arraynew.includes(element) && !exclude.includes(element)) {
        arraynew.push(element);
    }
});
return(arraynew)
}


function clearLikes() {
    window.mylikes.length = 0;
    writelikes();
    recommendedlikes = allrecommendedlikes;
    recommendedlikes.sort();
    $('.likeslistitem').remove();
    recommendedlikes.forEach((element)=> {
        createlikeButton(element)
    })
}

function addCustomLike(){
    var newlike = $('#mylikecustominput').val();
    $('#mylikecustominput').val("");
    newlike = newlike.toLowerCase();

    if(newlike===""){return;}
    if(window.mylikes.includes(newlike)){return;}

    window.mylikes.push(newlike)
    writelikes();

}

