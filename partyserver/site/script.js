$(document).on('ready',onStart)
const webSocket = new WebSocket('ws://localhost:443/');
webSocket.onmessage = onMessage;

function onStart() {
    

    
    

}

function sendMessage(obj) {
    obj.date = Date.now();
    webSocket.send(JSON.stringify(obj));
}

function onMessage(event) {
    console.log(event)
    $('#messages').append(`<p>${event.data}</p>`)
    var obj = JSON.parse(event.data);

}