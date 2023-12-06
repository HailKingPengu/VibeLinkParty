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

wannaconnect = false;

window.myUID = undefined

countdownTimer = 0;

// SERVER STUFF

function goServer () {
    if(webSocket != undefined){return("You are already connected")}
    if(window.mylikes.length<3){return("Choose more likes")}
    wannaconnect = true;
    
        var wport = `:${window.location.port}`; if(protocol=="wss"){wport = ""}
        var wsip = `${protocol}://${window.location.hostname}${wport}`

        console.log(wsip);
        webSocket = new WebSocket(wsip);
        webSocket.onmessage = onMessage;
        webSocket.onclose = (event) => {
            console.log("DISCONNected");
            reconnect();
          };
        console.log(webSocket)
        overlayDeactivate()
        return("")

}

function reconnect() {
    if(wannaconnect){
        webSocket = undefined;
        console.log('RECONNECT');
        goServer(); 
    }  
}
setInterval((()=>{
    if(!webSocket){
            reconnect();
    }
}),1000)

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
            $('.admingame').remove();
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
        name : myname,
        uid: window.myUID
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
        console.log("HELLO 2")
        
        var ret = goServer();
        if(ret!==""){
            console.log(`ERROR: ${ret}`)
        }
    })
    //createPlayerlistfake()

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
        if(showscores){score = `[ ${element.score} ]`
        if (element.id == myid) {$('#myscoredisplay').text(`your score: ${element.score}`)}
        }
        createplayer({img:element.profile,name:element.name,score:element.score,role:""})
    })
}
function createPlayerlistfake(){
    var list = []
    for (let index = 0; index < 100; index++) {
        list.push({
            score: Math.floor(Math.random()*100),
            color:"green",
            name: "namerandom"+Math.floor(Math.random()*100).toString()
        })
        
    }
    createPlayerlist(list,true)
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
                str = str+`<button class="admintools admingame"onClick="startGame('${elem}')">
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
            }else
            if(element.type =="countdown"){
                countdownTimer = element.time;
                $('#gamebar').append(`<h4 class="countdown">${countdownTimer}</h4>`);
                var func = function(){
                    var date1 = countdownTimer;
                    var date2 = Date.now();
                    diffTime = Math.floor(Math.abs(date2 - date1)/1000);
                    if(date2>date1){diffTime = 0;}
                    $('.countdown').text(`${diffTime} seconds`)
                }
                func();
                setInterval(func,1000)
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
    if(newlike.length>25){return;}
    if(window.mylikes.includes(newlike)){return;}

    window.mylikes.push(newlike)
    writelikes();

}


window.updatelikes = function() {
    writelikes();

    $('.likeslistitem').remove();
    recommendedlikes = allrecommendedlikes;
    recommendedlikes.sort();
    recommendedlikes = excludeArrays(recommendedlikes,window.mylikes);
    recommendedlikes.forEach((element)=> {
        createlikeButton(element)
    })
}
