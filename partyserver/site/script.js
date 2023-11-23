$(document).ready(onStart)





webSocket = undefined

recommendedlikes = ["games","movies","anime","baking"];
keyobject = {};
const mylikes = [];
myname = "";
myid = "";


// SERVER STUFF
function goServer () {
    if(webSocket != undefined){return("You are already connected")}
    if(mylikes.length<3){return("Choose more likes")}

        webSocket = new WebSocket('ws://localhost:443/');
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
            $('#mywritenumber').text(myid);
            createPlayerlist(obj.list);
        break;
    }
}

function sendLoginData () {

    myname = $('#myname').val();
    sendMessage({
        type : "login",
        likes : mylikes,
        name : myname
    })
}


function onStart() {
    console.log("started")

    $.getJSON("./mockup.json",function(obj){
        recommendedlikes = obj.tags.general;
        keyobject = obj.tags;
        recommendedlikes.sort();
        recommendedlikes.forEach((element)=> {
            createlikeButton(element)
        })
    })

    overlayActivate();
    
    

}

function createlikeButton(thelike){
    var obj = $('#mylikeslist').append(
        `<button class="likeslistitem">${thelike}</button>`
    )
    $(`.likeslistitem:contains('${thelike}')`).on( "click",(eventData) =>{
        mylikes.push(thelike)


        $(eventData.currentTarget).remove()
        var txtlist = ""
        mylikes.forEach((element)=>{
            txtlist = txtlist+element+", "
        })

        $('#mylistlikes').text(txtlist)

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

function createPlayerlist(list){
    $('#players').empty();

    list.forEach((element)=>{
        console.log(element)
        $('#players').append(
            `<div class='player' style="background-color:${element.color};">
                <h2>${element.name}</h2>
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