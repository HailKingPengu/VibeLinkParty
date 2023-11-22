const crypto = require('crypto');


const port = 11100;
const io = require('socket.io')();
io.use((socket, next) => {
    if (socket.handshake.query.token === "UNITY") {
        next();
    } else {
        next(new Error("Authentication error"));
    }
});

const socketArray = [];
function findSocketindex(searchID) {
  var _index = socketArray.find(
    (element)=>{
      return element.custom.gameID === searchID;
    }
  )
  return(_index)
}

io.on('connection', socket => {
  socket.emit('connection', {date: new Date().getTime(), data: "Hello Unity"})
  socket.custom.gameID = crypto.randomUUID();
  socketArray.push(socket);
  console.log(`[CONNECTED] ${JSON.stringify(socketArray)}`)

  socket.on('hello', (data) => {
    socket.emit('hello', {date: new Date().getTime(), data: data});
  });

  socket.on('spin', (data) => {
    socket.emit('spin', {date: new Date().getTime()});
  });

  socket.on('class', (data) => {
    socket.emit('class', {date: new Date().getTime(), data: data});
  });

  socket.on("disconnect", () => {
    console.log(socket.id); // undefined
    socketArray.splice(findSocketindex(socket.custom.gameID), 1);
    console.log(`[DISCONNECTED] ${JSON.stringify(socketArray)}`)
  });
});

io.listen(port);
console.log('listening on localhost:' + port);